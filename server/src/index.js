import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { pool } from './db.js';
import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';

const app = express();
const port = Number(process.env.PORT || 4000);
const jwtSecret = process.env.JWT_SECRET || '';
if (jwtSecret.length < 32) {
  console.warn('WARNING: JWT_SECRET should be at least 32 characters. Admin login will be disabled until configured.');
}
app.disable('x-powered-by');
app.use(helmet());
app.use(cors({ origin: (process.env.CLIENT_ORIGIN || 'http://localhost:5173').split(',').map(s=>s.trim()), credentials: false }));
app.use(express.json({ limit: '1mb' }));

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (_req, file, callback) => {
    if (file.mimetype.startsWith('image/')) {
      callback(null, true);
    } else {
      callback(new Error('Only image files are allowed'));
    }
  },
});

app.post('/api/admin/upload-image', auth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Please select an image' });
    }

    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: 'temple-heritage',
          resource_type: 'image',
        },
        (error, uploadedImage) => {
          if (error) reject(error);
          else resolve(uploadedImage);
        }
      );

      stream.end(req.file.buffer);
    });

    return res.json({
      url: result.secure_url,
      publicId: result.public_id,
    });
  } catch (error) {
    console.error('Image upload failed:', error.message);
    return res.status(500).json({ error: 'Image upload failed' });
  }
});

app.use('/api/admin/login', rateLimit({ windowMs: 15 * 60 * 1000, limit: 10, standardHeaders: 'draft-7', legacyHeaders: false }));

app.get('/api/health', (_req,res)=>res.json({ ok:true, service:'temple-heritage-api' }));

const templeSelect = `SELECT t.id,t.name,t.slug,t.city,t.state,t.address,t.deity,t.category,t.image_url AS image,t.description,t.history,t.darshan_timings AS timings,t.best_time AS "bestTime",t.status,
 COALESCE((SELECT json_agg(json_build_object('title',r.title,'details',r.details,'schedule',r.schedule)) FROM rituals r WHERE r.temple_id=t.id),'[]'::json) AS rituals,
 COALESCE((SELECT json_agg(json_build_object('name',f.name,'description',f.description,'dateNote',f.date_note)) FROM festivals f WHERE f.temple_id=t.id),'[]'::json) AS festivals,
 COALESCE((SELECT json_agg(json_build_object('category',fa.category,'name',fa.name,'details',fa.details)) FROM facilities fa WHERE fa.temple_id=t.id),'[]'::json) AS facilities
 FROM temples t`;
const listSchema = z.object({ q:z.string().trim().max(120).optional(), state:z.string().trim().max(80).optional(), city:z.string().trim().max(80).optional() });
app.get('/api/temples', async (req,res,next)=>{
 try {
  const parsed=listSchema.safeParse(req.query); if(!parsed.success) return res.status(400).json({error:'Invalid search parameters'});
  const {q,state,city}=parsed.data; const vals=[]; const where=["t.status='approved'"];
  if(q){vals.push(`%${q}%`);where.push(`(t.name ILIKE $${vals.length} OR t.city ILIKE $${vals.length} OR t.state ILIKE $${vals.length} OR t.deity ILIKE $${vals.length} OR t.category ILIKE $${vals.length})`);}
  if(state){vals.push(state);where.push(`t.state=$${vals.length}`);}
  if(city){vals.push(city);where.push(`t.city=$${vals.length}`);}
  const result=await pool.query(`${templeSelect} WHERE ${where.join(' AND ')} ORDER BY t.name LIMIT 250`,vals);
  res.json(result.rows.map(formatTemple));
 } catch(e){next(e);}
});
app.get('/api/temples/:slug', async (req,res,next)=>{
 try { const r=await pool.query(`${templeSelect} WHERE t.slug=$1 AND t.status='approved'`,[req.params.slug]); if(!r.rowCount)return res.status(404).json({error:'Temple not found'}); res.json(formatTemple(r.rows[0])); }
 catch(e){next(e);}
});
function formatTemple(t) {
  return {
    ...t,
    image: t.image_url || t.image || '',
    guidance: [],
    facilities: (t.facilities || []).map(
      f => `${f.name}${f.details ? ': ' + f.details : ''}`
    )
  };
}
function auth(req,res,next){
 const header=req.headers.authorization||''; const token=header.startsWith('Bearer ')?header.slice(7):'';
 if(!token || jwtSecret.length<32)return res.status(401).json({error:'Authentication required'});
 try{req.admin=jwt.verify(token,jwtSecret);next();}catch{return res.status(401).json({error:'Invalid or expired session'});}
}
const templeSchema=z.object({
 name:z.string().trim().min(2).max(180),slug:z.string().trim().min(2).max(200).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
 city:z.string().trim().min(2).max(100),state:z.string().trim().min(2).max(100),
 address:z.string().max(300).optional().default(''),deity:z.string().max(180).optional().default(''),
 category:z.string().max(100).optional().default('Heritage Temple'),image_url:z.string().url().max(1000).optional().or(z.literal('')).default(''),
 description:z.string().max(5000).optional().default(''),history:z.string().max(10000).optional().default(''),
 timings:z.string().max(2000).optional().default('Please verify current timings with official sources.'),
 bestTime:z.string().max(1000).optional().default(''),status:z.enum(['draft','pending','approved','rejected']).optional().default('pending')
});
app.post('/api/admin/login',async(req,res,next)=>{
 try{
  if(jwtSecret.length<32)return res.status(503).json({error:'Server admin authentication is not configured. Set JWT_SECRET to a random value of 32+ characters.'});
  const body=z.object({email:z.string().email().max(254),password:z.string().min(1).max(200)}).safeParse(req.body);
  if(!body.success)return res.status(400).json({error:'Enter a valid email and password'});
  const r=await pool.query('SELECT id,email,password_hash,role FROM admin_users WHERE email=$1',[body.data.email.toLowerCase()]);
  if(!r.rowCount || !(await bcrypt.compare(body.data.password,r.rows[0].password_hash)))return res.status(401).json({error:'Email or password is incorrect'});
  const user=r.rows[0]; const token=jwt.sign({sub:String(user.id),email:user.email,role:user.role},jwtSecret,{expiresIn:'8h',issuer:'temple-heritage-api',audience:'temple-heritage-admin'});
  res.json({token,user:{email:user.email,role:user.role},expiresIn:28800});
 }catch(e){next(e);}
});

app.post(
  '/api/admin/upload-image',
  auth,
  upload.single('image'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'Please select an image' });
      }

      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: 'temple-heritage',
            resource_type: 'image',
          },
          (error, uploadedImage) => {
            if (error) reject(error);
            else resolve(uploadedImage);
          }
        );

        stream.end(req.file.buffer);
      });

      return res.json({
        url: result.secure_url,
        publicId: result.public_id,
      });
    } catch (error) {
      console.error('Image upload failed:', error.message);
      return res.status(500).json({ error: 'Image upload failed' });
    }
  }
);

app.get('/api/admin/temples',auth,async(req,res,next)=>{
 try{const r=await pool.query(`${templeSelect} ORDER BY t.updated_at DESC LIMIT 500`);res.json(r.rows.map(formatTemple));}catch(e){next(e);}
});
app.post('/api/admin/temples',auth,async(req,res,next)=>{
 try{
  const parsed=templeSchema.safeParse(req.body);if(!parsed.success)return res.status(400).json({error:'Invalid temple data',details:parsed.error.issues.map(i=>({field:i.path.join('.'),message:i.message}))});
  const t=parsed.data; const status=req.admin.role==='admin' ? t.status : (t.status==='draft'?'draft':'pending');
  const r=await pool.query(`INSERT INTO temples(name,slug,city,state,address,deity,category,image_url,description,history,darshan_timings,best_time,status,created_by)
  VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14) RETURNING id,name,slug,status`,[t.name,t.slug,t.city,t.state,t.address,t.deity,t.category,t.image_url||null,t.description,t.history,t.timings,t.bestTime,status,Number(req.admin.sub)]);
  res.status(201).json(r.rows[0]);
 }catch(e){if(e.code==='23505')return res.status(409).json({error:'A temple with this slug already exists'});next(e);}
});
app.put('/api/admin/temples/:id',auth,async(req,res,next)=>{
 try{
  const parsed=templeSchema.safeParse(req.body);if(!parsed.success)return res.status(400).json({error:'Invalid temple data',details:parsed.error.issues.map(i=>({field:i.path.join('.'),message:i.message}))});
  const t=parsed.data;const status=req.admin.role==='admin'?t.status:(t.status==='draft'?'draft':'pending');
  const r=await pool.query(`UPDATE temples SET name=$1,slug=$2,city=$3,state=$4,address=$5,deity=$6,category=$7,image_url=$8,description=$9,history=$10,darshan_timings=$11,best_time=$12,status=$13,updated_at=NOW(),reviewed_by=NULL,reviewed_at=NULL WHERE id=$14 RETURNING id,name,slug,status`,
  [t.name,t.slug,t.city,t.state,t.address,t.deity,t.category,t.image_url||null,t.description,t.history,t.timings,t.bestTime,status,req.params.id]);
  if(!r.rowCount)return res.status(404).json({error:'Temple not found'});res.json(r.rows[0]);
 }catch(e){if(e.code==='23505')return res.status(409).json({error:'A temple with this slug already exists'});next(e);}
});
app.patch('/api/admin/temples/:id/status',auth,async(req,res,next)=>{
 try{
  if(req.admin.role!=='admin')return res.status(403).json({error:'Only admins can approve or reject content'});
  const parsed=z.object({status:z.enum(['draft','pending','approved','rejected'])}).safeParse(req.body);if(!parsed.success)return res.status(400).json({error:'Invalid status'});
  const r=await pool.query('UPDATE temples SET status=$1,reviewed_by=$2,reviewed_at=NOW(),updated_at=NOW() WHERE id=$3 RETURNING id,name,slug,status',[parsed.data.status,Number(req.admin.sub),req.params.id]);
  if(!r.rowCount)return res.status(404).json({error:'Temple not found'});res.json(r.rows[0]);
 }catch(e){next(e);}
});
app.delete('/api/admin/temples/:id',auth,async(req,res,next)=>{
 try{if(req.admin.role!=='admin')return res.status(403).json({error:'Only admins can delete records'});const r=await pool.query('DELETE FROM temples WHERE id=$1 RETURNING id',[req.params.id]);if(!r.rowCount)return res.status(404).json({error:'Temple not found'});res.status(204).end();}catch(e){next(e);}
});
app.use((err,_req,res,_next)=>{console.error(err);res.status(500).json({error:process.env.NODE_ENV==='production'?'Internal server error':err.message||'Internal server error'});});
app.listen(port,()=>console.log(`Temple Heritage API running on http://localhost:${port}`));