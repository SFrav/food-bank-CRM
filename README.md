
# Food bank CRM 

Full stack infrastructure to support food banks, referrers, volunteers and beneficiaries

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

This project is built with:
- Postgresql
- Vite
- TypeScript
- React
- Shadcn-ui
- Tailwind CSS

Functionality:
- Sign-up with approval process
- Log-in page with full authorisation
- User management
- Role based routing for 'admin', 'head', 'manager', 'account manager' and 'staff'
- Contact list management with multiple minimisable tabs and data edit preservation safeguards
- Calendar management with option for bulk uploads via CSV upload
- Task management
- Notifications in realtime
- Dashboards with data summary
- Listings of support services / external organisations
- Admin and head management role of entities, divisions and other organisation structure elements
- Auth, Activities, contacts, entities, notifications, audit logs and profile: complex queries refactored to run on the back-end for security and efficiency with RLS and role specific policies - accessible through Remote Procedure Calls (RPCs)
- Error handling with relevant info to users
- UI and UX attention to detail, especially on role management, contact/beneficiary management, task management and calendar management


To do:
- Add email notification for sign-up approvals
- Add core business logic of referral process, including email notifications of decision
- Add core business logic of beneficiary visits, with flexibility for discretionary provision of food
- Various refinements to dashboards, contacts/beneficiaries, support services, tasks and calendar
- Add user settings to remove warning alerts and silence notificatins
- Add settings for alternations to business logic - duration of benefits etc.
- Full refactor of remaining complex queries to RPC with RLS and role based policies
- Tests