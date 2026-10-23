# Deployment checklist

- [ ] Verify all temple content against official sources and store source links.
- [ ] Replace demo images with appropriately licensed images.
- [ ] Confirm current temple-specific timings, entry rules and accessibility notes.
- [ ] Run `npm install` and `npm run build`.
- [ ] Create managed PostgreSQL and apply `server/sql/schema.sql`.
- [ ] Set strong `JWT_SECRET`, `DATABASE_URL`, `CLIENT_ORIGIN`, `NODE_ENV=production`.
- [ ] Set `VITE_API_URL` to the public API URL and rebuild frontend.
- [ ] Enforce HTTPS and configure allowed CORS origins.
- [ ] Test admin/editor permissions, expired JWTs, invalid input and public filtering.
- [ ] Run accessibility and real-device mobile checks.
- [ ] Configure database backups, monitoring and error reporting.
- [ ] Add privacy notice and content correction contact before public launch.
