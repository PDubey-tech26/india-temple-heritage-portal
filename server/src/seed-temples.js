
import 'dotenv/config';
import { pool } from './db.js';

const temples = [
  {
    name: 'Kashi Vishwanath Temple',
    slug: 'kashi-vishwanath-temple',
    city: 'Varanasi',
    state: 'Uttar Pradesh',
    deity: 'Lord Shiva',
    category: 'Jyotirlinga',
    description: 'A major Hindu pilgrimage temple dedicated to Lord Shiva in Varanasi.',
    history: 'One of the prominent Shiva temples associated with the sacred city of Varanasi.',
    best_time: 'Verify seasonal conditions and official temple notices before travelling.',
    image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Kashi_Vishwanath_Temple.jpg/800px-Kashi_Vishwanath_Temple.jpg'
  },
  {
    name: 'Shri Ram Janmabhoomi Mandir',
    slug: 'shri-ram-janmabhoomi-mandir',
    city: 'Ayodhya',
    state: 'Uttar Pradesh',
    deity: 'Lord Rama',
    category: 'Hindu Temple',
    description: 'A major temple dedicated to Lord Rama in Ayodhya.',
    history: 'Located in Ayodhya, a city traditionally associated with Lord Rama.',
    best_time: 'Check official notices for darshan timings and visitor arrangements.',
    image_url: ''
  },
  {
    name: 'Banke Bihari Temple',
    slug: 'banke-bihari-temple',
    city: 'Vrindavan',
    state: 'Uttar Pradesh',
    deity: 'Lord Krishna',
    category: 'Krishna Temple',
    description: 'A renowned Krishna temple in the Braj region.',
    history: 'An important centre of Krishna devotion in Vrindavan.',
    best_time: 'Check current official timings before visiting.',
    image_url: ''
  },
  {
    name: 'Prem Mandir',
    slug: 'prem-mandir',
    city: 'Vrindavan',
    state: 'Uttar Pradesh',
    deity: 'Radha Krishna',
    category: 'Hindu Temple',
    description: 'A temple known for its elaborate architecture and devotional displays.',
    history: 'A prominent modern temple in Vrindavan.',
    best_time: 'Check the temple’s current schedule before travelling.',
    image_url: ''
  },
  {
    name: 'Shri Krishna Janmasthan',
    slug: 'shri-krishna-janmasthan',
    city: 'Mathura',
    state: 'Uttar Pradesh',
    deity: 'Lord Krishna',
    category: 'Krishna Temple',
    description: 'A major religious site associated with the birthplace tradition of Lord Krishna.',
    history: 'Located in Mathura, a key city in Krishna devotional traditions.',
    best_time: 'Verify entry rules and visiting hours with official sources.',
    image_url: ''
  },
  {
    name: 'Kedarnath Temple',
    slug: 'kedarnath-temple',
    city: 'Kedarnath',
    state: 'Uttarakhand',
    deity: 'Lord Shiva',
    category: 'Jyotirlinga',
    description: 'A Himalayan pilgrimage temple dedicated to Lord Shiva.',
    history: 'Part of the Char Dham pilgrimage tradition in Uttarakhand.',
    best_time: 'Seasonal opening dates depend on official announcements and weather.',
    image_url: ''
  },
  {
    name: 'Badrinath Temple',
    slug: 'badrinath-temple',
    city: 'Badrinath',
    state: 'Uttarakhand',
    deity: 'Lord Vishnu',
    category: 'Char Dham',
    description: 'A prominent Vishnu temple in the Himalayan region.',
    history: 'One of the important pilgrimage destinations in Uttarakhand.',
    best_time: 'Confirm seasonal access and official opening dates before travel.',
    image_url: ''
  },
  {
    name: 'Jagannath Temple',
    slug: 'jagannath-temple-puri',
    city: 'Puri',
    state: 'Odisha',
    deity: 'Lord Jagannath',
    category: 'Hindu Temple',
    description: 'A major pilgrimage temple in Puri, Odisha.',
    history: 'Widely known for its annual Rath Yatra festival.',
    best_time: 'Check official notices, particularly during major festivals.',
    image_url: ''
  },
  {
    name: 'Meenakshi Amman Temple',
    slug: 'meenakshi-amman-temple',
    city: 'Madurai',
    state: 'Tamil Nadu',
    deity: 'Goddess Meenakshi and Lord Sundareswarar',
    category: 'Hindu Temple',
    description: 'A celebrated historic temple complex in Madurai.',
    history: 'Known for its monumental gopurams and Dravidian architecture.',
    best_time: 'Check official timings and festival schedules before visiting.',
    image_url: ''
  },
  {
    name: 'Somnath Temple',
    slug: 'somnath-temple',
    city: 'Prabhas Patan',
    state: 'Gujarat',
    deity: 'Lord Shiva',
    category: 'Jyotirlinga',
    description: 'A prominent Shiva pilgrimage temple on the Gujarat coast.',
    history: 'Traditionally counted among the twelve Jyotirlinga shrines.',
    best_time: 'Check official visitor guidance before travelling.',
    image_url: ''
  }
];

try {
  await pool.query('BEGIN');

  for (const t of temples) {
    await pool.query(
      `INSERT INTO temples
       (name, slug, city, state, deity, category, image_url,
        description, history, best_time, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,'approved')
       ON CONFLICT (slug) DO NOTHING`,
      [
        t.name, t.slug, t.city, t.state, t.deity, t.category,
        t.image_url || null, t.description, t.history, t.best_time
      ]
    );
  }

  await pool.query('COMMIT');
  console.log(`Seed complete. Processed ${temples.length} temple records.`);
} catch (err) {
  await pool.query('ROLLBACK');
  console.error('Temple seed failed:', err.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}
