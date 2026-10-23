# Product Requirements — India Temple Heritage & Pilgrimage Portal

## 1. Problem statement
Temple information is spread across multiple sources. Visitors may struggle to find reliable information about heritage, deity significance, rituals, darshan schedules, festivals, routes and visitor facilities.

## 2. Objectives
### Primary
- Create a central discovery point for temple heritage information.
- Present visitor-planning information with clear source-verification caveats.
- Help people discover temples by region, city, deity and category.
- Support awareness of India's cultural and architectural heritage.

### Secondary
- Improve preparation before travel.
- Support responsible heritage tourism and preservation awareness.
- Provide a scalable foundation for nationwide content.

## 3. Scope
### In scope
- Responsive web experience for desktop, tablet and mobile.
- Temple listing, search and state filtering.
- Temple detail pages with history, deity, rituals, festivals and visitor guidance.
- Darshan/visiting schedule fields and source verification guidance.
- Saved temple list in the browser.
- Admin sign-in and protected content-management API.
- Draft/pending/approved/rejected content workflow.
- PostgreSQL relational data model.

### Out of scope for phase 1
- Donations and puja bookings.
- Live darshan streaming.
- Native Android/iOS applications.
- Multilingual voice assistant.
- Real-time route, accommodation or transport integrations.

## 4. Roles
- Visitor: browse public approved content and save items locally.
- Editor: create and update records; submissions remain pending/draft.
- Admin: manage records and approve/reject/publish content.

## 5. Functional requirements
1. Temple information: name, location, deity, category, history and significance.
2. Rituals: descriptions and schedule notes.
3. Festivals: description, date note and optional source URL.
4. Visitor information: dress code, entry rules, photography, accessibility and official source.
5. Facilities: category, name, details and verification date.
6. Discovery: text search and region filters; data model supports pilgrimage circuits.
7. Admin management: authenticated CRUD, content status and review metadata.
8. Public API: expose approved temples only.

## 6. Non-functional requirements
- Mobile-first layouts with responsive typography and grids.
- Keep frontend assets light and use lazy-loaded temple images.
- Aim for page-load times under 3 seconds on a typical connection; verify with real-device testing and production hosting.
- Secure admin endpoints with hashed passwords, signed JWTs, rate limiting on login, validation and security headers.
- Clear focus states, semantic headings, accessible labels and reduced-motion support.
- Scale database reads with indexes and managed PostgreSQL.
- Use HTTPS, backups, least-privilege database credentials and secrets management in production.

## 7. Visitor flow
Discover/search → filter results → open temple details → review visit guidance → save temple for later.

## 8. Core entities
- Admin users
- Temples
- Rituals
- Festivals
- Visitor information
- Facilities
- Pilgrimage circuits and circuit stops

## 9. KPIs
- Number of verified and approved temple records
- Monthly active users
- Search-to-detail click-through rate
- Search success rate
- Saved-temple engagement
- Visitor satisfaction

## 10. Assumptions and constraints
- Temple facts and schedules need verification from official trust/government sources.
- Admin/editor users maintain and review content.
- Phase 1 is informational only.
- Initial sample content is demo content and must not be treated as verified official guidance.
- Mobile performance, accessibility and actual load time require testing after deployment.

## 11. Acceptance criteria
- Visitors can browse and search temple records on mobile and desktop.
- Public APIs do not return draft/pending/rejected temple records.
- Admin login is required for protected write endpoints.
- Editors cannot approve or delete content.
- Admins can change content status.
- Main visitor journey works at narrow screen widths without horizontal scrolling.
- Setup instructions and schema are included in the repository.
