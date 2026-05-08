# Food bank CRM to support referrers, volunteers and beneficiaries
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

This project is built with:
- Postgresql
- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

Functionality:
- Sign-up with approval process
- Log-in page with full authorisation
- Sign-ups and user management
- Role based routing for 'admin', 'head', 'manager', 'account manager' and 'staff'
- Contact list management with multiple minimisable tabs and data edit preservation safeguards
- Place-markers for two other external groups, currently named customer and end-user
- Calendar management
- Template role specific dashboards with examples of data summaries
- Admin and head management role of entities, divisions and other organisation structure elements
- Auth, Activities, contacts, entities, notifications, audit logs and profile: complex queries refactored to run on the back-end for security and efficiency with RLS and role specific policies - accessible through Remote Procedure Calls (RPCs)
- Error handling with subtle info to users
- Improved dev debugging experience with a tagger for cleaner and more useful error messages
- UI and UX focus, especially on role management and contact management


To do:
- Add core business logic of referral
- Add core business logic of beneficiary visits, with flexibility for discretionary provisions
- Re-develop summary dashboards with useful usage statistics
- Complete calendar/activities elements to allow users to compile dates and times of all support services for beneficiaries, including soup kitchens. Adding activities currently includes irrelevant information and nested relationship requirements
- Re-purpose the customer element to present summaries of support organisations
- Allow bulk upload of calendar and support organisations via CSV
- Full refactor of complex queries to RPC with RLS and role based restrictions
- Tests


