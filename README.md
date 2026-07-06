# Applicant Tracker System

A simple React-based applicant tracker for managing candidates from first contact through interview scheduling and final hiring decisions.

## Features

- Applicant records for name, email, Calendly link, address, phone, location, job post, interview type, interview location, interview date/time, status, and notes
- Pipeline metrics for total applicants, scheduled interviews, tomorrow reminders, today's schedule, and follow-ups
- Kanban and list views for New Applicant, Contacted, Follow-Up, Scheduled, Confirmed, Passed, Failed, Cancelled, and No Show stages
- Automatic Follow-Up movement for Contacted applicants after 24 hours with no status change and Scheduled applicants after the interview time passes
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
