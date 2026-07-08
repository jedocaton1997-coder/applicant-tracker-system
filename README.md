# Operations Dashboard

A simple React-based operations dashboard for applicant tracking and an internal personal timesheet.

## Features

- Applicant records for name, email, Calendly link, address, phone, location, job post, interview type, interview location, interview date/time, status, and notes
- Main dashboard with cross-module summary cards, quick links, and chart-style visual summaries
- Pipeline metrics for total applicants, scheduled interviews, tomorrow reminders, today's schedule, and follow-ups
- Kanban and list views for New Applicant, Contacted, Follow-Up, Scheduled, Confirmed, Interview Completed, Passed, Failed, Cancelled, and No Show stages
- Shared applicant sync for desktop and iPad through a server-side `/api/applicants` route
- Automatic Follow-Up movement for Contacted applicants after 24 hours with no status change and Scheduled applicants after the interview time passes
- Applicant detail popup opened from each board card
- Search and status filtering
- CSV candidate import for Indeed exports
- Internal Timesheet page with automatic pay-period cycles anchored from June 22, 2026, a 9:00 AM to 1:00 PM daily template, 4 scheduled hours, default $6/hour rate, VL/SL statuses, pay estimates, and CSV export
- Status-aware formal message generator
- Copy, SMS handoff, and email handoff actions
- Browser localStorage cache/fallback for applicants and local persistence for timesheets

## Run Locally

```bash
npm install
npm run dev
```

The app runs at `http://localhost:3000`.

## Shared Applicant Sync

Set these environment variables locally and in Vercel:

```bash
CLICKUP_API_TOKEN=pk_your_clickup_token
CLICKUP_LIST_ID=901327783068
```

The ClickUp token is used only by the server/API route. It is not bundled into the browser.

## Notes

Google Voice does not expose a simple public send API for this static app, so messages are generated for copy, SMS handoff, or email.
