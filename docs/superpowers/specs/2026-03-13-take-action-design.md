# Take Action Feature — Design Spec

**Date:** 2026-03-13
**Status:** Approved

## Overview

A new `/take-action` page connects the existing FindRep (legislator lookup) and BillTracker (bill monitoring) features. Users can select legislators and bills, then generate a personalized letter, email, or phone script to contact their representatives.

---

## Architecture

### New Files

| File | Purpose |
|------|---------|
| `src/react-app/TakeAction.tsx` | New page component |
| `src/react-app/templates.ts` | Pure template functions: `(legislator, bills, userName?) => string` |
| `src/react-app/legislatorCache.ts` | localStorage wrapper with 30-day expiry |

### No new API endpoints

All data comes from existing endpoints:
- `/api/legislators` — called from FindRep (unchanged)
- `/api/bills` — called from TakeAction on mount

### Data Flow

1. **FindRep** saves legislators to `localStorage` after a successful lookup, then navigates to `/take-action` via React Router with legislators in router state.
2. **BillTracker** bill cards each get a "Take Action" button that navigates to `/take-action` with the selected bill in router state.
3. **TakeAction** loads legislators: router state → localStorage fallback. Fetches all bills from `/api/bills`, pre-checking the bill passed via router state.
4. Templates render entirely client-side from current selections — no network call required.

---

## Legislator Cache (`legislatorCache.ts`)

- localStorage key: `popaz:legislators`
- Shape: `{ address: string, legislators: Legislator[], cachedAt: number }`
- Expiry: 30 days from `cachedAt`
- API: `save(address, legislators)`, `load(): cached | null`, `clear()`
- FindRep calls `save()` after every successful API response
- TakeAction calls `load()` when no router state is present

---

## UI Layout

### Page Sections (top to bottom)

**1. Name input (optional)**

A subtle banner near the top:

> **Personalize your messages** *(optional)*
> `[Your name ________________]`
> *Adding your name makes letters and scripts ready to send.*

Controlled input. Value fed into all template functions reactively. If blank, `[Your name]` placeholder remains in output.

**2. Legislator Selector**

- Checkboxes with name, office, and party badge
- All pre-checked when arriving from FindRep
- "Change address" link clears cache and navigates to FindRep
- If no cache and no router state: prompt "Find your legislators first →" (link to FindRep); bill selector still renders

**3. Bill Selector**

- Fetches `/api/bills`
- Each bill shown as checkbox with bill number, title, and POPAZ position badge
- Bill passed via router state from BillTracker is pre-checked; all others unchecked by default
- User can check/uncheck any bills

**4. Generated Content**

Renders reactively when ≥1 legislator and ≥1 bill are selected. If not: gentle prompt "Select at least one legislator and one bill above."

Three tabs: **Letter** | **Email** | **Phone Script**

Within each tab: one collapsible panel per selected legislator, stacked vertically.

Panel header: legislator name + office. Collapsed by default if >2 legislators, expanded otherwise.

Panel actions:
- **Letter**: read-only textarea + "Copy" button
- **Email**: read-only textarea + "Copy" button + "Open in email client →" (mailto: link pre-addressed to legislator)
- **Phone Script**: read-only textarea + "Copy" button + "Call [number]" (tel: link)

If a legislator has no email: replace mailto button with "No email on file — visit their website →"
If a legislator has no phone: replace tel button with "No phone on file."

---

## Templates (`templates.ts`)

All templates are pure functions. Inputs: `legislator: Legislator`, `bills: BillResponse[]`, `userName?: string`.

### Letter

```
Dear [title + last name],

I am your constituent writing to urge your [support/opposition] of the following bill(s).

[Per bill: one paragraph summarizing the POPAZ insight and the ask]

I respectfully ask you to [vote yes on / oppose] [bill number(s)].

Respectfully,
[userName or "[Your name]"]
```

Title derived from `legislator.office`: "Representative" for House, "Senator" for Senate, "Representative" for US House, "Senator" for US Senate.

POPAZ position (`support`/`oppose`/`monitor`) drives the ask language:
- `support` → "urge your support of" / "vote yes on"
- `oppose` → "urge your opposition to" / "vote no on"
- `monitor` → "ask you to closely consider"

### Email

Same body as Letter, slightly condensed. Subject line:
`[Bill numbers] — Please [support/oppose] these bills`

### Phone Script

```
Hi, my name is [userName or "[your name]"] and I'm a constituent calling about [bill number(s)].

I'm calling to ask [title + last name] to [vote yes on / oppose] [bill title(s)].

[One sentence from POPAZ insight per bill.]

Thank you for your time.
```

---

## Cross-Linking Changes

### FindRep.tsx

- Import `legislatorCache.save()`
- After successful `/api/legislators` response, call `save(address, legislators)`
- Add "Take Action →" button in the results section that navigates to `/take-action` with `{ state: { legislators } }`

### BillTracker.tsx / BillCard

- Add "Contact Your Legislators →" button to each `BillCard`
- Navigates to `/take-action` with `{ state: { selectedBillNumber: bill.billNumber } }`

### App.tsx / Router

- Add `/take-action` route pointing to `TakeAction`

### Navigation

- Add "Take Action" link to the nav

---

## Error Handling

| Scenario | Behavior |
|----------|----------|
| No legislators (no cache, no router state) | Prompt with link to FindRep; bill selector still shown |
| `/api/bills` fails | Error message with retry button (matches BillTracker pattern) |
| Legislator has no email | Replace mailto button with "No email on file — visit their website →" |
| Legislator has no phone | Replace tel button with "No phone on file." |
| No bills selected or no legislators selected | Gentle prompt in content area instead of panels |

---

## Out of Scope

- AI-generated content (templates only)
- Sending emails directly from the site
- Saving or sharing generated content
- Bookmarkable/shareable Take Action URLs (router state is not persisted in URL)
