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

### Existing Files (already exist, no need to create)

- `src/shared/billTypes.ts` — contains `BillResponse`, `TrackedBill`, etc.

### Shared Type Migration

`Legislator` is currently a module-local type duplicated in `FindRep.tsx` and `worker/index.ts`. Before building the new files, move it to `src/shared/legislatorTypes.ts` and export it. Import it from there in `FindRep.tsx`, `TakeAction.tsx`, `templates.ts`, and `legislatorCache.ts`.

The worker keeps its own local copy in `worker/index.ts` — it cannot import from `src/react-app/` or `src/shared/` without crossing the build boundary. Add a comment above both type definitions:

```ts
// NOTE: This type is mirrored in src/shared/legislatorTypes.ts (React app)
// and worker/index.ts (Cloudflare Worker). Keep them in sync manually.
```

### No new API endpoints

All data comes from existing endpoints:
- `/api/legislators` — called from FindRep (unchanged)
- `/api/bills` — called from TakeAction on mount

### Data Flow

1. **FindRep** saves legislators to `localStorage` after every successful lookup. The results section gains a "Take Action →" button that navigates to `/take-action` via React Router state: `{ state: { legislators, address } }` — both the legislator array and the address string are passed.
2. **BillTracker** bill cards each get a "Contact Your Legislators →" button that navigates to `/take-action` with `{ state: { selectedBillNumber: bill.billNumber } }`.
3. **TakeAction** loads legislators: if `location.state.legislators` is present, call `legislatorCache.save(location.state.address, location.state.legislators)` then use them. If not, fall back to `legislatorCache.load()`. Fetches all bills from `/api/bills` on mount, pre-checking the bill whose `billNumber` matches `location.state.selectedBillNumber`. If that bill is not found, silently skip the pre-check.
4. Templates render entirely client-side — no network call.

---

## Relevant Types

**`Legislator`** — to be moved to `src/shared/legislatorTypes.ts`. `name` field is always "First Last" format as returned by OpenStates (e.g., `"Jane Smith"`, `"Robert A. Johnson"`):
- `name: string`
- `office: string` — used to derive salutation title
- `party: string`
- `level: "state" | "federal"`
- `phone?: string`
- `email?: string`
- `website?: string`
- `address?: string`
- `photoUrl?: string`

**`BillResponse`** (from `src/shared/billTypes.ts`, already exists):
- `billNumber: string`
- `popazInsight: string` — full prose paragraph, always present
- `popazPosition: "support" | "oppose" | "monitor"`
- `bill: LegiScanBill | null`
- `bill.title: string` — only when `bill` is non-null

---

## Legislator Cache (`legislatorCache.ts`)

- localStorage key: `popaz:legislators`
- Shape: `{ address: string, legislators: Legislator[], cachedAt: number }`
- Expiry: 30 days from `cachedAt`
- API:
  - `save(address: string, legislators: Legislator[]): void` — always writes/overwrites, even for repeat lookups at the same address
  - `load(): { address: string, legislators: Legislator[], cachedAt: number } | null` — returns null if absent or expired; deletes stale entry before returning null
  - `clear(): void` — user-initiated reset; deletes regardless of expiry
- FindRep calls `save(address, legislators)` after every successful API response. Failed responses do not touch the cache.
- TakeAction calls `save(address, legislators)` when router state carries legislators. Falls back to `load()` when it does not.

---

## Feature Flag

Gate both the route and the nav link with `FF_BILL_TRACKER` (localhost and workers.dev only).

```tsx
// App.tsx
{FF_BILL_TRACKER && (
    <Route path='take-action' element={<TakeAction />} />
)}

// Navigation.tsx — render link only when FF_BILL_TRACKER is true
```

---

## UI Layout

### Routes

| Page | Route |
|------|-------|
| FindRep | `/resources/find-rep` |
| BillTracker | `/bills` |
| TakeAction | `/take-action` |

### Page Sections (top to bottom)

**1. Name input (optional)**

> **Personalize your messages** *(optional)*
> `[Your name ________________]`
> *Adding your name makes letters and scripts ready to send.*

Controlled input. Feeds into all template functions reactively. If blank, `[Your name]` placeholder remains.

**2. Legislator Selector**

- Checkboxes with name, office, and party badge
- All pre-checked on load (from router state or cache)
- Shows: *"Showing legislators for 123 Main St — [Change address]"*
- "Change address": calls `legislatorCache.clear()`, navigates to `/resources/find-rep`. The router state from the previous TakeAction visit is discarded by the new navigation; fresh legislators arrive when the user returns.
- If no legislators: prompt "Find your legislators first →" (link to `/resources/find-rep`); bill selector still shows

**3. Bill Selector**

- Loading state: spinner or "Loading bills…" text while `/api/bills` is in flight. Same loading indicator shown on retry.
- On success: each bill as a checkbox — bill number, title, POPAZ position badge
- `location.state.selectedBillNumber` bill is pre-checked; all others unchecked
- User can check/uncheck freely
- On failure: see Error Handling table

**4. Generated Content**

Renders reactively when ≥1 legislator and ≥1 bill are selected. Otherwise: *"Select at least one legislator and one bill above."*

Three tabs: **Letter** | **Email** | **Phone Script**

One collapsible panel per selected legislator per tab. Expand/collapse state is per-legislator and **shared across all three tabs** — toggling on Letter also toggles on Email and Phone Script.

**Initial state** (set once when the legislator list first becomes non-empty):
- 1 or 2 legislators → all expanded
- 3+ legislators → all collapsed

**After initial state**, user controls expand/collapse freely. When a legislator is deselected, remaining panels keep their current state. When a legislator is re-selected, it gets a fresh initial state based on the threshold at that moment (≤2 total → expanded, 3+ total → collapsed).

Panel actions by tab:
- **Letter**: read-only textarea + "Copy"
- **Email**: read-only textarea + "Copy" + "Open in email client →" (mailto: with `subject` and `body` URL-encoded)
- **Phone Script**: read-only textarea + "Copy" + "Call [number]" (tel:)

Fallbacks:
- No email → "No email on file — visit their website →" (`legislator.website`); if also no website → "No email on file." (no link)
- No phone → "No phone on file."

---

## Templates (`templates.ts`)

Signature: `(legislator: Legislator, bills: BillResponse[], userName?: string) => string`

### Title Derivation

From `legislator.office` (case-sensitive `String.prototype.includes`):
- Contains `"Senator"` → `"Senator"`
- Contains `"Representative"` → `"Representative"`
- Fallback → `"Representative"`

### Last Name Extraction

`legislator.name` is always "First Last" format from OpenStates. Extract last name as the last space-separated token: `name.split(" ").at(-1)`. This handles middle names (e.g., "Robert A. Johnson" → "Johnson").

### Ask Language Per Bill

| `popazPosition` | Opening phrase (when all bills share this position) | Per-bill closing sentence | Phone ask |
|-----------------|------------------------------------------------------|--------------------------|-----------|
| `support` | "urge your support of the following bill(s)" | "I urge you to vote yes on [bill number]." | "vote yes on [bill number]" |
| `oppose` | "urge your opposition to the following bill(s)" | "I urge you to vote no on [bill number]." | "vote no on [bill number]" |
| `monitor` | "ask you to carefully consider the following bill(s)" | "I ask you to carefully consider [bill number]." | "carefully consider [bill number]" |

### Mixed Position Handling

"Mixed" = the selected bills have differing `popazPosition` values. Same definition applies in the subject line table.

When mixed:
- Opening line: *"I am your constituent writing about the following bills."*
- Email subject: see subject line table below

When all bills share the same position, use the position-specific opening phrase above.

### Singular/Plural

- 1 bill → "this bill", "the following bill"
- 2+ bills → "these bills", "the following bills"

### Letter

```
Dear [title] [last name],

I am your constituent writing to [opening phrase].

[Per-bill block — repeated once per bill:]
[bill number] — [bill title]        (omit " — [bill title]" if bill is null)

[popazInsight verbatim]

[Per-bill closing sentence]

Respectfully,
[userName or "[Your name]"]
```

### Email

**Subject line:**

| Condition | 1 bill | 2+ bills |
|-----------|--------|----------|
| All support | `"[Bill number] — Please support this bill"` | `"[Bill numbers] — Please support these bills"` |
| All oppose | `"[Bill number] — Please oppose this bill"` | `"[Bill numbers] — Please oppose these bills"` |
| All monitor | `"[Bill number] — Please carefully consider this bill"` | `"[Bill numbers] — Please carefully consider these bills"` |
| Mixed | `"[Bill number] — Please review this bill"` | `"[Bill numbers] — Please review these bills"` |

Bill numbers comma-separated. Body: same as Letter. mailto link URL-encodes both `subject` and `body`.

### Phone Script

```
Hi, my name is [userName or "[your name]"] and I'm a constituent calling about [bill numbers, comma-separated].

[Per-bill block — repeated once per bill:]
I'm calling to ask [title] [last name] to [phone ask for this bill].

[popazInsight verbatim for this bill.]

Thank you for your time.
```

The ask line and insight repeat per bill — the legislator name repetition is intentional for spoken clarity.

---

## Cross-Linking Changes

### FindRep.tsx
- Import `Legislator` from `src/shared/legislatorTypes.ts`
- Import `save` from `legislatorCache`
- After every successful `/api/legislators` response: `save(address, legislators)`
- Add "Take Action →" button: navigates to `/take-action` with `{ state: { legislators, address } }`

### BillTracker.tsx (`BillCard` — internal component, no separate file)
- Add "Contact Your Legislators →" button
- Navigates to `/take-action` with `{ state: { selectedBillNumber: bill.billNumber } }`

### App.tsx
```tsx
{FF_BILL_TRACKER && <Route path='take-action' element={<TakeAction />} />}
```

### Navigation.tsx
- Add "Take Action" link after "Track Bills", gated by `FF_BILL_TRACKER`

---

## Error Handling

| Scenario | Behavior |
|----------|----------|
| No legislators | Prompt "Find your legislators first →" to `/resources/find-rep`; bill selector still shown |
| `/api/bills` loading | Spinner or "Loading bills…"; same indicator shown on retry |
| `/api/bills` fails | Red error text + "Try again" button that re-fires the fetch |
| No email on legislator | "No email on file — visit their website →" (links to `website`); if no website either: "No email on file." |
| No phone on legislator | "No phone on file." |
| Nothing selected | "Select at least one legislator and one bill above." in content area |
| `bill` is null | Bill number only in title line; `popazInsight` always present |
| Pre-check bill not in response | Silently skip; no bill pre-selected |

---

## Out of Scope

- AI-generated content
- Sending emails from the site
- Saving or sharing generated content
- Bookmarkable URLs
