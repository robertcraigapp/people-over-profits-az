# Bill Tracker Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a legislative bill tracker page that displays Arizona bills from LegiScan with POPAZ commentary, cached daily in Cloudflare KV to stay within API limits.

**Architecture:** A static `trackedBills.json` file lists bill numbers + POPAZ insights. A Cloudflare Worker endpoint fetches a daily-cached masterlist from LegiScan to resolve bill numbers → bill IDs, then fetches/caches individual bill data only when the LegiScan `change_hash` indicates the bill has changed. The React frontend displays a feature-flagged bill tracker page.

**Tech Stack:** Hono (Cloudflare Worker), Cloudflare KV, LegiScan API, React, TypeScript, Tailwind CSS

---

### Task 1: Add KV Namespace and API Key to Wrangler Config

**Files:**
- Modify: `wrangler.json`
- Modify: `.dev.vars`

**Step 1: Add KV namespace binding to `wrangler.json`**

Add the `kv_namespaces` array and update `vars` in the top-level config and the `dev` env config. The `id` value is a placeholder — it gets replaced in Step 3.

```json
{
    "$schema": "node_modules/wrangler/config-schema.json",
    "name": "people-over-profits-az",
    "main": "./src/worker/index.ts",
    "compatibility_date": "2025-10-08",
    "compatibility_flags": ["nodejs_compat"],
    "observability": {
        "enabled": true
    },
    "upload_source_maps": true,
    "assets": {
        "directory": "./dist/client",
        "not_found_handling": "single-page-application"
    },
    "vars": {
        "OPENSTATES_API_KEY": "2aaac5c0-9176-4be5-990e-1e50f3f290cb"
    },
    "kv_namespaces": [
        {
            "binding": "LEGISCAN_CACHE",
            "id": "PLACEHOLDER_REPLACE_AFTER_STEP_3"
        }
    ],
    "send_email": [
        {
            "name": "EMAIL",
            "destination_address": "contact@abolishprivateprisons.org"
        }
    ],
    "env": {
        "dev": {
            "vars": {
                "OPENSTATES_API_KEY": "2aaac5c0-9176-4be5-990e-1e50f3f290cb",
                "VITE_GOOGLE_PLACES_API_KEY": "AIzaSyBdmO3mVPUaERDJ7fgPDb2o5MTieXjq-hc",
                "LEGISCAN_API_KEY": "YOUR_LEGISCAN_KEY_HERE"
            },
            "send_email": [
                {
                    "name": "EMAIL",
                    "destination_address": "contact@abolishprivateprisons.org"
                }
            ]
        }
    }
}
```

**Step 2: Add LEGISCAN_API_KEY to `.dev.vars`**

Add this line to `.dev.vars`:
```
LEGISCAN_API_KEY=your_actual_key_here
```

Replace `your_actual_key_here` with the real LegiScan API key.

**Step 3: Create the KV namespace in Cloudflare**

Run:
```bash
npx wrangler kv namespace create LEGISCAN_CACHE
```

Copy the `id` from the output and replace `PLACEHOLDER_REPLACE_AFTER_STEP_3` in `wrangler.json`.

Also create a preview namespace for local dev:
```bash
npx wrangler kv namespace create LEGISCAN_CACHE --preview
```

Add the `preview_id` to the KV namespace entry in `wrangler.json`:
```json
"kv_namespaces": [
    {
        "binding": "LEGISCAN_CACHE",
        "id": "your-production-id",
        "preview_id": "your-preview-id"
    }
]
```

**Step 4: Regenerate TypeScript types**

```bash
npm run cf-typegen
```

This updates `worker-configuration.d.ts` so `c.env.LEGISCAN_CACHE` and `c.env.LEGISCAN_API_KEY` are typed.

**Step 5: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

**Step 6: Commit**

```bash
rtk git add wrangler.json worker-configuration.d.ts
rtk git commit -m "chore: add KV namespace and LegiScan API key binding"
```

---

### Task 2: Create `trackedBills.json`

**Files:**
- Create: `src/react-app/trackedBills.json`

**Step 1: Create the file**

```json
[
    {
        "billNumber": "HB2001",
        "popazInsight": "Example insight about this bill and its impact on Arizonans.",
        "popazPosition": "oppose"
    }
]
```

> **Note for non-technical editors:** To track a new bill, add an object to this array with:
> - `billNumber`: The exact bill number as it appears on the Arizona Legislature website (e.g. "HB2001", "SB1234")
> - `popazInsight`: POPAZ's analysis or commentary on the bill
> - `popazPosition`: Either `"oppose"`, `"support"`, or `"monitor"`

Replace the placeholder entry with real bills before deploying.

**Step 2: Commit**

```bash
rtk git add src/react-app/trackedBills.json
rtk git commit -m "chore: add initial tracked bills data file"
```

---

### Task 3: Add Shared Types File

**Files:**
- Create: `src/shared/billTypes.ts`

**Step 1: Create the file**

```typescript
// Matches one entry in trackedBills.json
export type TrackedBill = {
    billNumber: string;
    popazInsight: string;
    popazPosition: 'oppose' | 'support' | 'monitor';
};

// What the worker stores in KV for the masterlist
// Key: "legiscan:masterlist"
export type MasterlistCache = {
    [billNumber: string]: {
        billId: number;
        changeHash: string;
    };
};

// What the worker stores in KV per bill
// Key: "legiscan:bill:{billId}"
export type BillCache = {
    changeHash: string;
    data: LegiScanBill;
};

// Minimal LegiScan bill shape (only fields we use)
export type LegiScanBill = {
    bill_id: number;
    bill_number: string;
    title: string;
    description: string;
    status: number; // 1=Introduced, 2=Engrossed, 3=Enrolled, 4=Passed, 5=Vetoed, 6=Failed
    status_date: string;
    url: string;
    state_link: string;
    history: {
        date: string;
        action: string;
        chamber: string;
        importance: number;
    }[];
    sponsors: {
        name: string;
        party: string;
        role: string;
    }[];
};

// Shape returned by GET /api/bills
export type BillResponse = {
    billNumber: string;
    popazInsight: string;
    popazPosition: 'oppose' | 'support' | 'monitor';
    bill: LegiScanBill | null; // null if LegiScan lookup failed
};
```

**Step 2: Commit**

```bash
rtk git add src/shared/billTypes.ts
rtk git commit -m "feat: add shared bill types"
```

---

### Task 4: Worker Endpoint `GET /api/bills`

**Files:**
- Modify: `src/worker/index.ts`

**Step 1: Add the LegiScan helper functions at the bottom of `index.ts`**

Add these functions before the `// --- Types ---` comment:

```typescript
// --- LegiScan Helpers ---

const LEGISCAN_BASE = 'https://api.legiscan.com/';
const MASTERLIST_CACHE_KEY = 'legiscan:masterlist';

function billCacheKey(billId: number): string {
    return `legiscan:bill:${billId}`;
}

// Seconds from now until next midnight UTC
function ttlUntilMidnightUTC(): number {
    const now = new Date();
    const midnight = new Date(now);
    midnight.setUTCHours(24, 0, 0, 0);
    return Math.max(60, Math.floor((midnight.getTime() - now.getTime()) / 1000));
}

async function fetchMasterList(apiKey: string): Promise<MasterlistCache> {
    const url = `${LEGISCAN_BASE}?key=${apiKey}&op=getMasterListRaw&state=AZ`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`MasterList fetch failed: ${res.status}`);
    const json = (await res.json()) as {
        status: string;
        masterlist: Record<string, { bill_id: number; number: string; change_hash: string }>;
    };
    if (json.status !== 'OK') throw new Error('MasterList status not OK');

    const result: MasterlistCache = {};
    for (const entry of Object.values(json.masterlist)) {
        // The masterlist contains a "0" metadata entry — skip non-bill entries
        if (!entry.number) continue;
        result[entry.number] = { billId: entry.bill_id, changeHash: entry.change_hash };
    }
    return result;
}

async function fetchBill(apiKey: string, billId: number): Promise<LegiScanBill> {
    const url = `${LEGISCAN_BASE}?key=${apiKey}&op=getBill&id=${billId}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`getBill fetch failed: ${res.status}`);
    const json = (await res.json()) as { status: string; bill: LegiScanBill };
    if (json.status !== 'OK') throw new Error('getBill status not OK');
    return json.bill;
}
```

**Step 2: Add the import for shared types at the top of `index.ts`**

Add after the existing imports:
```typescript
import type { TrackedBill, MasterlistCache, BillCache, LegiScanBill, BillResponse } from '../shared/billTypes';
import trackedBillsData from '../react-app/trackedBills.json';
```

**Step 3: Add the `/api/bills` route**

Add this route after the `/api/legislators` route and before the `/api/signup` route:

```typescript
app.get('/api/bills', async (c) => {
    const apiKey = c.env.LEGISCAN_API_KEY;
    const kv = c.env.LEGISCAN_CACHE;
    const trackedBills = trackedBillsData as TrackedBill[];

    if (!apiKey) {
        return c.json({ error: 'LEGISCAN_API_KEY not configured' }, 500);
    }

    // Step 1: Get or refresh masterlist cache
    let masterlist: MasterlistCache;
    const cachedMasterlist = await kv.get(MASTERLIST_CACHE_KEY, 'json') as MasterlistCache | null;

    if (cachedMasterlist) {
        masterlist = cachedMasterlist;
    } else {
        try {
            masterlist = await fetchMasterList(apiKey);
            await kv.put(MASTERLIST_CACHE_KEY, JSON.stringify(masterlist), {
                expirationTtl: ttlUntilMidnightUTC(),
            });
        } catch (e) {
            console.error('[bills] masterlist fetch failed:', e);
            return c.json({ error: 'Failed to fetch bill masterlist' }, 502);
        }
    }

    // Step 2: For each tracked bill, resolve and fetch details
    const results: BillResponse[] = await Promise.all(
        trackedBills.map(async (tracked) => {
            const masterEntry = masterlist[tracked.billNumber];
            if (!masterEntry) {
                console.warn(`[bills] ${tracked.billNumber} not found in masterlist`);
                return { ...tracked, bill: null };
            }

            const { billId, changeHash } = masterEntry;
            const cacheKey = billCacheKey(billId);

            // Check if cached bill is still current via change_hash
            const cachedBill = await kv.get(cacheKey, 'json') as BillCache | null;
            if (cachedBill && cachedBill.changeHash === changeHash) {
                return { ...tracked, bill: cachedBill.data };
            }

            // Fetch fresh bill data
            try {
                const bill = await fetchBill(apiKey, billId);
                const entry: BillCache = { changeHash, data: bill };
                await kv.put(cacheKey, JSON.stringify(entry));
                return { ...tracked, bill };
            } catch (e) {
                console.error(`[bills] getBill failed for ${tracked.billNumber}:`, e);
                // Return stale data if available, null if not
                return { ...tracked, bill: cachedBill?.data ?? null };
            }
        }),
    );

    return c.json({ bills: results });
});
```

**Step 4: Add `LEGISCAN_API_KEY` to the `Env` type**

In the `worker-configuration.d.ts` (which is auto-generated) this will appear after running `cf-typegen`. If the type is not yet there, add it temporarily to `index.ts` using the existing `Env` pattern — but prefer running `npm run cf-typegen` first.

**Step 5: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Fix any type errors before proceeding.

**Step 6: Smoke test locally**

```bash
npm run dev
```

In another terminal:
```bash
curl http://localhost:5173/api/bills
```

Expected: JSON response with `{ bills: [...] }`. Each bill should have `billNumber`, `popazInsight`, `popazPosition`, and either a `bill` object or `bill: null`.

**Step 7: Commit**

```bash
rtk git add src/worker/index.ts src/shared/billTypes.ts
rtk git commit -m "feat: add /api/bills worker endpoint with KV caching"
```

---

### Task 5: Feature Flag + Route

**Files:**
- Modify: `src/react-app/featureFlags.ts`
- Modify: `src/react-app/App.tsx`
- Modify: `src/react-app/Navigation.tsx`

**Step 1: Add feature flag to `featureFlags.ts`**

```typescript
export const FF_BILL_TRACKER =
    // UNCOMMENT TO ENABLE ON DEV ONLY
    window.location.hostname === 'localhost' ||
    window.location.hostname.includes('workers.dev');

    // UNCOMMENT TO ENABLE EVERYWHERE
    // true;

    // UNCOMMENT TO DISABLE EVERYWHERE
    // false;
```

Start with dev-only so you can test before publishing.

**Step 2: Add route to `App.tsx`**

Add import at top:
```typescript
import BillTracker from './BillTracker';
import { FF_BILL_TRACKER } from './featureFlags';
```

Add route inside `<Route path='/' element={<Layout />}>`:
```tsx
{FF_BILL_TRACKER && (
    <Route path='bills' element={<BillTracker />} />
)}
```

**Step 3: Add nav link to `Navigation.tsx`**

Add import at top:
```typescript
import { FF_BILL_TRACKER } from './featureFlags';
```

Add inside the nav links section (after the Coalition link, before Resources):
```tsx
{FF_BILL_TRACKER && (
    <Link
        to='/bills'
        className='font-display text-brand-maroon font-semibold hover:text-brand-orange transition-colors tracking-wide uppercase text-sm'
    >
        Track Bills
    </Link>
)}
```

**Step 4: Commit**

```bash
rtk git add src/react-app/featureFlags.ts src/react-app/App.tsx src/react-app/Navigation.tsx
rtk git commit -m "feat: add bill tracker feature flag and route"
```

---

### Task 6: `BillTracker.tsx` React Component

**Files:**
- Create: `src/react-app/BillTracker.tsx`

**Step 1: Create the component**

```tsx
import { useEffect, useState } from 'react';
import type { BillResponse } from '../shared/billTypes';

const STATUS_LABELS: Record<number, string> = {
    1: 'Introduced',
    2: 'Engrossed',
    3: 'Enrolled',
    4: 'Passed',
    5: 'Vetoed',
    6: 'Failed / Dead',
};

const STATUS_COLORS: Record<number, string> = {
    1: 'bg-blue-100 text-blue-800',
    2: 'bg-yellow-100 text-yellow-800',
    3: 'bg-orange-100 text-orange-800',
    4: 'bg-green-100 text-green-800',
    5: 'bg-red-100 text-red-800',
    6: 'bg-gray-100 text-gray-700',
};

const POSITION_STYLES: Record<string, string> = {
    oppose: 'border-l-4 border-red-500',
    support: 'border-l-4 border-green-500',
    monitor: 'border-l-4 border-yellow-400',
};

const POSITION_LABELS: Record<string, string> = {
    oppose: 'POPAZ Opposes',
    support: 'POPAZ Supports',
    monitor: 'POPAZ Monitoring',
};

function BillCard({ bill: billResponse }: { bill: BillResponse }) {
    const { billNumber, popazInsight, popazPosition, bill } = billResponse;
    const positionStyle = POSITION_STYLES[popazPosition] ?? '';

    return (
        <div className={`bg-white rounded-lg shadow-md p-6 ${positionStyle}`}>
            <div className='flex items-start justify-between gap-4 flex-wrap'>
                <div>
                    <span className='font-display text-brand-maroon font-bold text-lg'>
                        {billNumber}
                    </span>
                    {bill && (
                        <h3 className='text-gray-900 font-semibold mt-1'>{bill.title}</h3>
                    )}
                </div>
                <div className='flex flex-col items-end gap-2'>
                    {bill && (
                        <span
                            className={`text-xs font-bold px-3 py-1 rounded-full ${STATUS_COLORS[bill.status] ?? 'bg-gray-100 text-gray-700'}`}
                        >
                            {STATUS_LABELS[bill.status] ?? 'Unknown Status'}
                        </span>
                    )}
                    <span className='text-xs font-semibold text-brand-maroon uppercase tracking-wide'>
                        {POSITION_LABELS[popazPosition]}
                    </span>
                </div>
            </div>

            <p className='mt-3 text-gray-700 text-sm'>{popazInsight}</p>

            {bill && bill.history.length > 0 && (
                <div className='mt-4'>
                    <h4 className='text-xs font-bold text-gray-500 uppercase tracking-wider mb-2'>
                        Recent Activity
                    </h4>
                    <ul className='space-y-1'>
                        {bill.history
                            .filter((h) => h.importance === 1)
                            .slice(-3)
                            .map((h, i) => (
                                <li key={i} className='text-xs text-gray-600'>
                                    <span className='text-gray-400 mr-2'>{h.date}</span>
                                    {h.action}
                                </li>
                            ))}
                    </ul>
                </div>
            )}

            {bill && (
                <div className='mt-4 flex gap-3'>
                    <a
                        href={bill.url}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='text-xs text-brand-blue hover:underline'
                    >
                        View on LegiScan →
                    </a>
                    {bill.state_link && (
                        <a
                            href={bill.state_link}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='text-xs text-brand-blue hover:underline'
                        >
                            View on AZ Legislature →
                        </a>
                    )}
                </div>
            )}

            {!bill && (
                <p className='mt-3 text-xs text-gray-400 italic'>
                    Bill details unavailable — data will refresh shortly.
                </p>
            )}
        </div>
    );
}

export default function BillTracker() {
    const [bills, setBills] = useState<BillResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetch('/api/bills')
            .then((r) => r.json())
            .then((data: { bills: BillResponse[] }) => {
                setBills(data.bills);
                setLoading(false);
            })
            .catch(() => {
                setError('Failed to load bill data. Please try again later.');
                setLoading(false);
            });
    }, []);

    return (
        <div className='min-h-screen bg-brand-cream'>
            <div className='max-w-4xl mx-auto px-6 py-12'>
                <h1 className='font-display text-4xl font-bold text-brand-maroon mb-3'>
                    Track the Bills
                </h1>
                <p className='text-gray-600 mb-8'>
                    POPAZ is monitoring these Arizona bills. Stay informed and take action.
                </p>

                {loading && (
                    <p className='text-gray-500'>Loading bill data...</p>
                )}

                {error && (
                    <p className='text-red-600'>{error}</p>
                )}

                {!loading && !error && bills.length === 0 && (
                    <p className='text-gray-500'>No bills are currently being tracked.</p>
                )}

                <div className='space-y-6'>
                    {bills.map((b) => (
                        <BillCard key={b.billNumber} bill={b} />
                    ))}
                </div>
            </div>
        </div>
    );
}
```

**Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

**Step 3: Smoke test in browser**

```bash
npm run dev
```

Navigate to `http://localhost:5173/bills` and verify:
- Page loads without crash
- Bill cards render with bill number, title, status badge, POPAZ insight
- "View on LegiScan" links work
- Loading and error states display correctly

**Step 4: Commit**

```bash
rtk git add src/react-app/BillTracker.tsx
rtk git commit -m "feat: add BillTracker page component"
```

---

### Task 7: Add LEGISCAN_API_KEY as Cloudflare Secret

**Step 1: Set the secret in Cloudflare**

```bash
npx wrangler secret put LEGISCAN_API_KEY
```

When prompted, paste the actual API key. This stores it as an encrypted secret in Cloudflare — it will NOT appear in `wrangler.json`.

**Step 2: Deploy**

```bash
npm run deploy
```

**Step 3: Verify production**

Hit `https://your-workers-domain.workers.dev/api/bills` and confirm the response. Check Cloudflare dashboard logs if there are errors.

**Step 4: Enable feature flag for production**

Once verified, update `featureFlags.ts`:
```typescript
export const FF_BILL_TRACKER = true;
```

**Step 5: Final commit and deploy**

```bash
rtk git add src/react-app/featureFlags.ts
rtk git commit -m "feat: enable bill tracker for all users"
npm run deploy
```
