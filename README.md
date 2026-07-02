# Applicant Tracker System

A simple React-based applicant tracker for managing candidates from first contact through final hiring decision.

## Features

- Applicant records for name, email, Calendly link, address, phone, location, job post, interview type, interview location, interview date/time, status, and notes
- Pipeline metrics for total applicants, scheduled interviews, follow-ups, and hires
- Kanban status board for monitoring applicants by stage
- Applicant detail popup opened from each board card
- Search and status filtering
- CSV candidate import for Indeed exports
- Status-aware formal message generator
- Copy, SMS handoff, and email handoff actions
- Browser localStorage persistence

## Run Locally

```bash
npm install
npm run dev
```

The app runs at `http://localhost:3000`.

## Notes

Google Voice does not expose a simple public send API for this static app, so messages are generated for copy, SMS handoff, or email.
