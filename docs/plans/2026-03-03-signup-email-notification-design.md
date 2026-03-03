# Signup Email Notification — Design

**Date:** 2026-03-03
**Status:** Approved

## Overview

When a user submits the signup form, the Cloudflare Worker sends a full-data notification email to a designated inbox using Cloudflare's native `send_email` binding and Email Routing. No third-party services. No data persistence — email only.

## Architecture

```
SignUp.tsx (React)
    → POST /api/signup (Hono Worker)
        → send_email binding
            → Cloudflare Email Routing
                → designated inbox
```

## Components

### wrangler.json
- Add a `send_email` binding named `EMAIL`
- Sender address: `noreply@<domain>` (placeholder until domain is configured)

### src/worker/index.ts
- New `POST /api/signup` route
- Parses JSON body
- Validates required fields: `firstName`, `lastName`, `email` — returns `400` if missing
- Builds HTML email (simple table, one row per field)
- Subject: `New Signup: [firstName] [lastName]`
- Calls `c.env.EMAIL.send(...)` — returns `500` on failure
- Returns `{ success: true }` on success

### src/react-app/SignUp.tsx
- `handleSubmit` posts JSON to `/api/signup`
- Submit button disabled while request is in flight
- On success: show confirmation message in place of submit button
- On error: show generic retry message

## Form Fields Included in Email

| Field | Required |
|-------|----------|
| First Name | Yes |
| Last Name | Yes |
| Email | Yes |
| Phone | No |
| Zip Code | No |
| Volunteer Interest | No |
| How They Heard | No |

## Error Handling

| Scenario | Worker Response | UI Behavior |
|----------|----------------|-------------|
| Missing required fields | 400 | Show validation error |
| Email send failure | 500 | Show "please try again" message |
| Success | 200 `{ success: true }` | Show confirmation |

## Cloudflare Email Routing Setup (Manual — not in code)

1. Enable Email Routing in Cloudflare dashboard for the domain
2. Add a verified destination address (the notification inbox)
3. Configure the sender address (`noreply@<domain>`) in the `send_email` binding
