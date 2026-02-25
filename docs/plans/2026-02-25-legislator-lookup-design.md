# Design: Arizona Legislator Lookup

**Date:** 2026-02-25
**Status:** Approved
**Branch:** dev

## Overview

Add a feature-flagged page at `/resources/find-rep` that lets a user type their Arizona address (with autocomplete suggestions) and see their elected legislators — state senate, state house, US senate, and US house.

---

## Feature Flag

A Vite environment variable `VITE_FF_LEGISLATOR_LOOKUP` gates the feature at build time.

A central module `src/react-app/featureFlags.ts` exports a typed boolean:

```ts
export const FF_LEGISLATOR_LOOKUP = import.meta.env.VITE_FF_LEGISLATOR_LOOKUP === 'true';
```

When `false` (the default):
- The "Find Your Rep" nav link does not render
- The conditional card on the Resources page does not render
- The `/resources/find-rep` route is not registered, returning 404

To enable locally, add `VITE_FF_LEGISLATOR_LOOKUP=true` to `.env.local`.

---

## Routing & Navigation

- New route: `/resources/find-rep` → `<FindRep />` component, rendered inside the existing `<Layout />`
- `Navigation.tsx`: conditionally renders a "Find Your Rep" link when the flag is on
- `Resources.tsx`: conditionally renders a card linking to `/resources/find-rep` when the flag is on

---

## Backend: Hono Worker Endpoint

New route added to `src/worker/index.ts`:

```
GET /api/legislators?address=<url-encoded-address>
```

**Behavior:**
1. Reads `GOOGLE_CIVIC_API_KEY` from Cloudflare Worker secret bindings
2. Calls Google Civic Information API: `https://civicinfo.googleapis.com/civicinfo/v2/representatives?address=<address>&key=<key>`
3. Filters results to relevant offices (AZ state senate, AZ state house, US senate, US house)
4. Returns a simplified JSON array to the client:

```ts
type Legislator = {
  name: string;
  office: string;
  party: string;
  phone?: string;
  website?: string;
  photoUrl?: string;
};
```

**Error responses:**
- `400` — missing or empty address parameter
- `502` — Google API call failed (upstream error forwarded)

### Cloudflare Worker Secret Setup

The Google Civic API key is stored as a Worker secret (never in source code or client bundle).

**Local development:**
```bash
wrangler secret put GOOGLE_CIVIC_API_KEY
# Paste the key when prompted
```

**Production:** Set the same secret in the Cloudflare dashboard under Workers → your worker → Settings → Variables → Secret Variables.

**`wrangler.toml`:** Add a binding declaration so TypeScript knows about the secret:
```toml
[vars]
# GOOGLE_CIVIC_API_KEY is a secret — set via `wrangler secret put`
```

And update the Worker's `Env` type:
```ts
type Env = {
  GOOGLE_CIVIC_API_KEY: string;
};
```

---

## Frontend: `FindRep` Page

`src/react-app/FindRep.tsx` — a new page component.

### Address Input with Autocomplete

Uses the **Google Places Autocomplete** JavaScript SDK (loaded via `<script>` tag, same API key as Civic — just requires enabling the Places API in Google Cloud alongside the Civic API).

Configuration:
- `types: ['address']` — address-level suggestions only
- `componentRestrictions: { country: 'us' }` — US addresses only

The user selects a suggestion, which populates a hidden field with the clean formatted address string. On form submit, that address is sent to `/api/legislators`.

### Page Structure

1. **Hero/intro text** — brief explanation of what the tool does and why contacting your rep matters
2. **Address form** — single autocomplete input + "Find My Legislators" button
3. **Loading state** — spinner while waiting for API response
4. **Results** — a grid of legislator cards, grouped by level (State / Federal)
5. **Error state** — friendly message with guidance

### Legislator Card

Each card displays:
- Name
- Office title (e.g. "Arizona State Senator, District 14")
- Party affiliation
- Phone number (if available)
- "Visit Website" link (if available)
- Photo (if available from Google Civic response)

### Error Handling

| Scenario | Message |
|----------|---------|
| Empty address submitted | Inline validation: "Please enter your address." |
| Non-AZ address | "This tool only looks up Arizona legislators. Please enter an Arizona address." |
| API / network error | "Something went wrong. Please try again in a moment." |

---

## Styling

Uses existing brand CSS variables (`brand-maroon`, `brand-orange`, etc.) and TailwindCSS v4 utility classes to match the visual style of Coalition and Resources pages.

---

## Google Cloud Setup (Required Before Implementation)

1. Create or use an existing Google Cloud project
2. Enable **Civic Information API**
3. Enable **Places API**
4. Create an API key; optionally restrict it to these two APIs and your domain
5. Store the key as a Cloudflare Worker secret (see above)

---

## Out of Scope (Future)

- Displaying committee memberships or voting records
- Email composition tools
- Caching legislator results
- Support for non-Arizona addresses
