# Arizona Legislator Lookup — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a feature-flagged `/resources/find-rep` page where a user types their Arizona address (with Google Places autocomplete) and sees their elected legislators.

**Architecture:** A `VITE_FF_LEGISLATOR_LOOKUP` env var gates all UI entry points. The React page calls `/api/legislators?address=...` on the Hono Cloudflare Worker, which holds the Google API key as a Worker secret and proxies the Google Civic Information API.

**Tech Stack:** React 19 + TypeScript, React Router v7, Hono on Cloudflare Workers, Google Civic Information API, Google Places Autocomplete JS SDK, TailwindCSS v4, Wrangler v4.

---

## Prerequisites (do these manually before starting)

### A. Get a Google API key
1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create a project (or use an existing one)
3. Enable **Civic Information API**
4. Enable **Places API** (needed for autocomplete)
5. Create an API key under "Credentials"
6. Optionally restrict it to these two APIs

### B. Set the Worker secret locally
```bash
cd /z/Programming/popaz
npx wrangler secret put GOOGLE_CIVIC_API_KEY
# Paste your key when prompted
```

### C. Create `.env.local` to enable the feature flag
Create the file `/z/Programming/popaz/.env.local` with this content:
```
VITE_FF_LEGISLATOR_LOOKUP=true
```
This file is git-ignored and only used locally.

---

## Task 1: Add feature flag module

**Files:**
- Create: `src/react-app/featureFlags.ts`

**Step 1: Create the file**

```ts
// src/react-app/featureFlags.ts
export const FF_LEGISLATOR_LOOKUP =
    import.meta.env.VITE_FF_LEGISLATOR_LOOKUP === 'true';
```

**Step 2: Verify TypeScript is happy**

Run: `npm run build`
Expected: Build succeeds (no type errors from this file)

**Step 3: Commit**

```bash
rtk git add src/react-app/featureFlags.ts
rtk git commit -m "feat: add FF_LEGISLATOR_LOOKUP feature flag module"
```

---

## Task 2: Add Hono Worker endpoint

**Files:**
- Modify: `src/worker/index.ts`

The Worker needs to know about the `GOOGLE_CIVIC_API_KEY` secret binding. The `@cloudflare/vite-plugin` generates types automatically via `wrangler types`, but we need to declare the binding in `wrangler.jsonc` (or equivalent config) first.

**Step 1: Find and update the Wrangler config**

Check if a `wrangler.jsonc` or `wrangler.toml` exists:
```bash
ls /z/Programming/popaz
```

If neither exists, the `@cloudflare/vite-plugin` uses the `cloudflare` field in `package.json`. In that case, create `wrangler.jsonc` in the project root:

```jsonc
{
    "name": "people-over-profits-az",
    "compatibility_date": "2025-01-01",
    "main": "src/worker/index.ts"
}
```

> Note: The secret value is NOT stored here — only its name is declared so Wrangler knows it exists. The actual value was set via `wrangler secret put` in the prerequisites.

**Step 2: Run `wrangler types` to generate the `Env` type**

```bash
npm run cf-typegen
```

Expected: Creates or updates `worker-configuration.d.ts` in the project root with:
```ts
interface Env {
    GOOGLE_CIVIC_API_KEY: string;
}
```

If it doesn't auto-include the secret, manually add `GOOGLE_CIVIC_API_KEY: string` to the `Env` interface in that file.

**Step 3: Add the `/api/legislators` route**

Replace the contents of `src/worker/index.ts` with:

```ts
import { Hono } from "hono";
import { cors } from "hono/cors";

const app = new Hono<{ Bindings: Env }>();

app.use("/api/*", cors());

app.get("/api/", (c) => c.json({ name: "Cloudflare" }));

app.get("/api/legislators", async (c) => {
    const address = c.req.query("address");
    if (!address || address.trim() === "") {
        return c.json({ error: "address is required" }, 400);
    }

    const apiKey = c.env.GOOGLE_CIVIC_API_KEY;
    const url = new URL(
        "https://civicinfo.googleapis.com/civicinfo/v2/representatives"
    );
    url.searchParams.set("address", address);
    url.searchParams.set("key", apiKey);

    let googleRes: Response;
    try {
        googleRes = await fetch(url.toString());
    } catch {
        return c.json({ error: "Failed to reach Google Civic API" }, 502);
    }

    if (!googleRes.ok) {
        const body = await googleRes.text();
        return c.json({ error: "Google Civic API error", detail: body }, 502);
    }

    const data = (await googleRes.json()) as GoogleCivicResponse;

    // Build a map from official index → office info
    const legislators: Legislator[] = [];

    for (const office of data.offices ?? []) {
        // Filter to offices we care about
        const relevant = office.levels?.some((l) =>
            ["country", "administrativeArea1"].includes(l)
        );
        if (!relevant) continue;

        for (const officialIndex of office.officialIndices ?? []) {
            const official = data.officials?.[officialIndex];
            if (!official) continue;

            legislators.push({
                name: official.name,
                office: office.name,
                party: official.party ?? "Unknown",
                phone: official.phones?.[0],
                website: official.urls?.[0],
                photoUrl: official.photoUrl,
            });
        }
    }

    return c.json({ legislators });
});

export default app;

// --- Types ---

type Legislator = {
    name: string;
    office: string;
    party: string;
    phone?: string;
    website?: string;
    photoUrl?: string;
};

type GoogleCivicResponse = {
    offices?: {
        name: string;
        levels?: string[];
        officialIndices?: number[];
    }[];
    officials?: {
        name: string;
        party?: string;
        phones?: string[];
        urls?: string[];
        photoUrl?: string;
    }[];
};
```

**Step 4: Build to verify no TypeScript errors**

Run: `npm run build`
Expected: Build succeeds

**Step 5: Commit**

```bash
rtk git add src/worker/index.ts
rtk git commit -m "feat: add /api/legislators Worker endpoint proxying Google Civic API"
```

---

## Task 3: Create the `FindRep` page component

**Files:**
- Create: `src/react-app/FindRep.tsx`

This component:
1. Loads Google Places Autocomplete via script tag
2. Shows an address input with autocomplete
3. On submit, calls `/api/legislators?address=...`
4. Renders legislator cards grouped by level (State / Federal)

**Step 1: Create `src/react-app/FindRep.tsx`**

```tsx
import { useEffect, useRef, useState } from 'react';

type Legislator = {
    name: string;
    office: string;
    party: string;
    phone?: string;
    website?: string;
    photoUrl?: string;
};

declare global {
    interface Window {
        google: any;
        initAutocomplete: () => void;
    }
}

const GOOGLE_PLACES_API_KEY = import.meta.env.VITE_GOOGLE_PLACES_API_KEY ?? '';

function FindRep() {
    const inputRef = useRef<HTMLInputElement>(null);
    const autocompleteRef = useRef<any>(null);
    const [address, setAddress] = useState('');
    const [legislators, setLegislators] = useState<Legislator[] | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [scriptLoaded, setScriptLoaded] = useState(false);

    // Load Google Places script once
    useEffect(() => {
        if (document.getElementById('google-places-script')) {
            setScriptLoaded(true);
            return;
        }
        window.initAutocomplete = () => setScriptLoaded(true);
        const script = document.createElement('script');
        script.id = 'google-places-script';
        script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_PLACES_API_KEY}&libraries=places&callback=initAutocomplete`;
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
    }, []);

    // Initialize autocomplete once script is loaded
    useEffect(() => {
        if (!scriptLoaded || !inputRef.current) return;
        const autocomplete = new window.google.maps.places.Autocomplete(
            inputRef.current,
            { types: ['address'], componentRestrictions: { country: 'us' } }
        );
        autocomplete.addListener('place_changed', () => {
            const place = autocomplete.getPlace();
            if (place.formatted_address) {
                setAddress(place.formatted_address);
            }
        });
        autocompleteRef.current = autocomplete;
    }, [scriptLoaded]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = address.trim();
        if (!trimmed) {
            setError('Please enter your address.');
            return;
        }
        setError(null);
        setLoading(true);
        setLegislators(null);
        try {
            const res = await fetch(
                `/api/legislators?address=${encodeURIComponent(trimmed)}`
            );
            const json = await res.json() as any;
            if (!res.ok) {
                const detail: string = json.detail ?? '';
                if (detail.toLowerCase().includes('no address') || detail.toLowerCase().includes('outside')) {
                    setError(
                        'This tool only looks up Arizona legislators. Please enter an Arizona address.'
                    );
                } else {
                    setError('Something went wrong. Please try again in a moment.');
                }
                return;
            }
            const results: Legislator[] = json.legislators ?? [];
            if (results.length === 0) {
                setError(
                    'No legislators found for that address. Make sure it is an Arizona address.'
                );
                return;
            }
            setLegislators(results);
        } catch {
            setError('Something went wrong. Please try again in a moment.');
        } finally {
            setLoading(false);
        }
    };

    const stateLegislators = legislators?.filter((l) =>
        l.office.toLowerCase().includes('arizona') ||
        l.office.toLowerCase().includes('state')
    ) ?? [];

    const federalLegislators = legislators?.filter(
        (l) => !stateLegislators.includes(l)
    ) ?? [];

    return (
        <>
            {/* Hero */}
            <div className='relative overflow-hidden bg-gradient-to-br from-brand-maroon via-brand-plum to-brand-maroon text-white'>
                <div className='absolute inset-0 opacity-10'>
                    <div
                        className='absolute inset-0'
                        style={{
                            backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(255,255,255,0.1) 35px, rgba(255,255,255,0.1) 70px)`,
                        }}
                    />
                    <div className='absolute top-20 left-10 w-96 h-96 bg-brand-orange rounded-full blur-3xl' />
                    <div className='absolute bottom-10 right-20 w-80 h-80 bg-brand-blue rounded-full blur-3xl' />
                </div>
                <div className='relative max-w-6xl mx-auto py-24 px-6'>
                    <div className='mb-6 inline-block'>
                        <div className='flex items-center gap-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-6 py-2'>
                            <div className='w-2 h-2 bg-brand-orange rounded-full animate-pulse' />
                            <span className='text-sm font-semibold tracking-wide uppercase text-brand-sand'>
                                Take Action
                            </span>
                        </div>
                    </div>
                    <h1 className='text-5xl md:text-7xl font-black mb-6 tracking-tight leading-none'>
                        Find Your{' '}
                        <span className='text-brand-orange'>Legislators</span>
                    </h1>
                    <p className='text-xl md:text-2xl text-brand-sand font-medium max-w-3xl leading-relaxed'>
                        Enter your Arizona address to find your state and federal
                        representatives — so you can contact them directly about
                        prison reform.
                    </p>
                </div>
            </div>

            {/* Search Section */}
            <main className='flex-grow py-20 px-6 bg-gradient-to-br from-slate-50 via-white to-brand-sand/10'>
                <div className='max-w-3xl mx-auto'>
                    <form onSubmit={handleSubmit} className='mb-10'>
                        <label
                            htmlFor='address-input'
                            className='block text-lg font-bold text-brand-maroon mb-3'
                        >
                            Your Arizona Address
                        </label>
                        <div className='flex gap-3'>
                            <input
                                id='address-input'
                                ref={inputRef}
                                type='text'
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                placeholder='123 Main St, Phoenix, AZ 85001'
                                className='flex-grow border-2 border-brand-sand rounded-lg px-4 py-3 text-lg focus:outline-none focus:border-brand-orange transition-colors'
                            />
                            <button
                                type='submit'
                                disabled={loading}
                                className='bg-brand-orange text-white px-6 py-3 rounded-lg font-bold text-lg hover:bg-brand-rust transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed'
                            >
                                {loading ? 'Searching…' : 'Find'}
                            </button>
                        </div>
                        {error && (
                            <p className='mt-3 text-red-600 font-medium'>{error}</p>
                        )}
                    </form>

                    {/* Results */}
                    {legislators && legislators.length > 0 && (
                        <div className='space-y-10'>
                            {stateLegislators.length > 0 && (
                                <section>
                                    <h2 className='text-2xl font-black text-brand-maroon mb-4'>
                                        State Legislators
                                    </h2>
                                    <div className='grid sm:grid-cols-2 gap-6'>
                                        {stateLegislators.map((leg, i) => (
                                            <LegislatorCard key={i} legislator={leg} />
                                        ))}
                                    </div>
                                </section>
                            )}
                            {federalLegislators.length > 0 && (
                                <section>
                                    <h2 className='text-2xl font-black text-brand-maroon mb-4'>
                                        Federal Representatives
                                    </h2>
                                    <div className='grid sm:grid-cols-2 gap-6'>
                                        {federalLegislators.map((leg, i) => (
                                            <LegislatorCard key={i} legislator={leg} />
                                        ))}
                                    </div>
                                </section>
                            )}
                        </div>
                    )}
                </div>
            </main>

            {/* Footer */}
            <footer className='bg-brand-maroon text-brand-sand py-10 px-6 text-center border-t-4 border-brand-orange'>
                <p className='mb-2 font-bold text-white'>
                    People Over Profits - AZ (POPAZ)
                </p>
                <p className='text-sm opacity-80'>Building a more just Arizona. © 2026</p>
            </footer>
        </>
    );
}

function LegislatorCard({ legislator }: { legislator: Legislator }) {
    const partyColor =
        legislator.party.toLowerCase().includes('democrat')
            ? 'bg-brand-blue'
            : legislator.party.toLowerCase().includes('republican')
            ? 'bg-brand-rust'
            : 'bg-brand-plum';

    return (
        <div className='bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all'>
            <div className='h-2 bg-gradient-to-r from-brand-orange to-brand-rust' />
            <div className='p-6'>
                <div className='flex items-start gap-4'>
                    {legislator.photoUrl ? (
                        <img
                            src={legislator.photoUrl}
                            alt={legislator.name}
                            className='w-16 h-16 rounded-full object-cover flex-shrink-0'
                        />
                    ) : (
                        <div className='w-16 h-16 rounded-full bg-brand-sand/30 flex items-center justify-center flex-shrink-0'>
                            <svg className='w-8 h-8 text-brand-maroon' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.5} d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' />
                            </svg>
                        </div>
                    )}
                    <div className='flex-grow'>
                        <h3 className='text-lg font-black text-brand-maroon'>
                            {legislator.name}
                        </h3>
                        <p className='text-sm text-gray-600 mb-2'>{legislator.office}</p>
                        <span className={`inline-block text-xs text-white font-bold px-2 py-0.5 rounded-full ${partyColor}`}>
                            {legislator.party}
                        </span>
                    </div>
                </div>
                <div className='mt-4 space-y-2'>
                    {legislator.phone && (
                        <a
                            href={`tel:${legislator.phone}`}
                            className='flex items-center gap-2 text-sm text-brand-maroon hover:text-brand-orange transition-colors'
                        >
                            <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z' />
                            </svg>
                            {legislator.phone}
                        </a>
                    )}
                    {legislator.website && (
                        <a
                            href={legislator.website}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='flex items-center gap-2 text-sm text-brand-orange font-semibold hover:text-brand-rust transition-colors'
                        >
                            <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14' />
                            </svg>
                            Visit Website
                        </a>
                    )}
                </div>
            </div>
        </div>
    );
}

export default FindRep;
```

**Step 2: Build to check for TypeScript errors**

Run: `npm run build`
Expected: Build succeeds

**Step 3: Commit**

```bash
rtk git add src/react-app/FindRep.tsx
rtk git commit -m "feat: add FindRep page component with Places autocomplete and legislator cards"
```

---

## Task 4: Wire up routing and navigation

**Files:**
- Modify: `src/react-app/App.tsx`
- Modify: `src/react-app/Navigation.tsx`
- Modify: `src/react-app/Resources.tsx`

### 4a — Add route in `App.tsx`

**Step 1: Edit `src/react-app/App.tsx`**

Add the import at the top:
```ts
import FindRep from './FindRep';
import { FF_LEGISLATOR_LOOKUP } from './featureFlags';
```

Add the conditional route inside the `<Route path='/'>` parent, after the `resources` route:
```tsx
{FF_LEGISLATOR_LOOKUP && (
    <Route path='resources/find-rep' element={<FindRep />} />
)}
```

Full updated file:
```tsx
import Layout from './Layout';
import Home from './Home';
import { Route, Routes } from 'react-router';
import Coalition from './Coalition';
import Resources from './Resources';
import SignUp from './SignUp';
import FindRep from './FindRep';
import { FF_LEGISLATOR_LOOKUP } from './featureFlags';

function App() {
    return (
        <Routes>
            <Route path='/' element={<Layout />}>
                <Route index element={<Home />} />
                <Route path='coalition' element={<Coalition />} />
                <Route path='resources' element={<Resources />} />
                <Route path='signup' element={<SignUp />} />
                {FF_LEGISLATOR_LOOKUP && (
                    <Route path='resources/find-rep' element={<FindRep />} />
                )}
            </Route>
        </Routes>
    );
}

export default App;
```

### 4b — Add nav link in `Navigation.tsx`

Add the import at the top:
```ts
import { FF_LEGISLATOR_LOOKUP } from './featureFlags';
```

Add a conditional link in the nav links section (before the "Join the Fight" button):
```tsx
{FF_LEGISLATOR_LOOKUP && (
    <Link
        to='/resources/find-rep'
        className='text-brand-maroon font-semibold hover:text-brand-orange transition-colors'
    >
        Find Your Rep
    </Link>
)}
```

### 4c — Add card on `Resources.tsx`

Add the import at the top:
```ts
import { Link } from 'react-router';
import { FF_LEGISLATOR_LOOKUP } from './featureFlags';
```

After the closing `</div>` of the resources cards grid (around line 315, after the `resourcesData.map` block), add a conditional "Find Your Rep" call-to-action card:

```tsx
{FF_LEGISLATOR_LOOKUP && (
    <div className='col-span-full md:col-span-1'>
        <div className='group relative'>
            <div className='absolute inset-0 bg-gradient-to-br from-brand-orange via-brand-rust to-brand-plum rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm' />
            <div className='relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 h-full flex flex-col'>
                <div className='relative overflow-hidden h-48 bg-gradient-to-br from-brand-orange to-brand-rust flex items-center justify-center p-8'>
                    <div className='relative z-10 w-24 h-24 text-white transition-transform duration-300 group-hover:scale-110'>
                        <svg className='w-full h-full' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.5} d='M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z' />
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.5} d='M15 11a3 3 0 11-6 0 3 3 0 016 0z' />
                        </svg>
                    </div>
                    <div className='absolute top-4 right-4'>
                        <span className='inline-block bg-white/20 backdrop-blur-sm text-white text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border border-white/30'>
                            Interactive
                        </span>
                    </div>
                </div>
                <div className='p-6 flex-grow flex flex-col'>
                    <h3 className='text-xl md:text-2xl font-black text-brand-maroon mb-3 group-hover:text-brand-orange transition-colors'>
                        Find Your Representatives
                    </h3>
                    <p className='text-gray-700 leading-relaxed mb-4 flex-grow'>
                        Enter your Arizona address to instantly find your state and federal
                        legislators — with direct contact info so you can make your voice heard.
                    </p>
                    <Link
                        to='/resources/find-rep'
                        className='mt-4 inline-flex items-center gap-2 text-brand-orange font-semibold hover:text-brand-rust transition-colors group/link'
                    >
                        <span>Find My Legislators</span>
                        <svg className='w-4 h-4 transition-transform group-hover/link:translate-x-1' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 5l7 7-7 7' />
                        </svg>
                    </Link>
                </div>
                <div className='h-1 bg-gradient-to-r from-brand-orange via-brand-rust to-brand-plum transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left' />
            </div>
        </div>
    </div>
)}
```

**Step 2: Build to verify**

Run: `npm run build`
Expected: Build succeeds with no errors

**Step 3: Commit**

```bash
rtk git add src/react-app/App.tsx src/react-app/Navigation.tsx src/react-app/Resources.tsx
rtk git commit -m "feat: wire FindRep route, nav link, and Resources card behind feature flag"
```

---

## Task 5: Expose the Google Places API key to the frontend

The Places SDK is loaded client-side via a `<script>` tag and requires an API key in the URL. This key will be visible in the browser — that is acceptable **if you restrict it to your domain** in Google Cloud Console.

**Step 1: Add `VITE_GOOGLE_PLACES_API_KEY` to `.env.local`**

Open `/z/Programming/popaz/.env.local` and add:
```
VITE_GOOGLE_PLACES_API_KEY=your_google_api_key_here
```

Use the same key as `GOOGLE_CIVIC_API_KEY` — it covers both APIs.

**Step 2: Verify the dev server picks it up**

Run: `npm run dev`
Navigate to `http://localhost:5173/resources/find-rep`
Expected: Page loads, address input is present, typing shows autocomplete suggestions

**Step 3: Test end-to-end**
1. Type a valid Arizona address (e.g. "1700 W Washington St, Phoenix, AZ 85007")
2. Select the autocomplete suggestion
3. Click "Find"
4. Expected: Legislator cards appear for AZ state reps, AZ state senators, US senators, US house rep

**Step 4: Test error states**
- Submit with empty address → "Please enter your address." message appears
- Submit a non-AZ address → appropriate error message appears

**Step 5: Commit**

```bash
# .env.local is git-ignored, nothing to commit here.
# If you added any code changes, commit those:
rtk git add src/react-app/FindRep.tsx
rtk git commit -m "feat: wire VITE_GOOGLE_PLACES_API_KEY into Places Autocomplete"
```

---

## Task 6: Verify feature flag gates work

**Step 1: Test with flag OFF**

Temporarily rename `.env.local` to `.env.local.bak`:
```bash
mv /z/Programming/popaz/.env.local /z/Programming/popaz/.env.local.bak
```

Run: `npm run dev`

Expected:
- No "Find Your Rep" link in the nav
- No "Find Your Representatives" card on the Resources page
- Navigating to `/resources/find-rep` directly returns 404 / blank

**Step 2: Restore the flag**

```bash
mv /z/Programming/popaz/.env.local.bak /z/Programming/popaz/.env.local
```

Run: `npm run dev` — confirm feature is visible again.

---

## Task 7: Production deployment setup

**Step 1: Set the secret in Cloudflare dashboard**

1. Go to [dash.cloudflare.com](https://dash.cloudflare.com)
2. Workers & Pages → your Worker → Settings → Variables
3. Under "Secret Variables", add `GOOGLE_CIVIC_API_KEY` with your key value
4. Save

**Step 2: Set the Places API key as a regular env var for the build**

In the Cloudflare Pages/Workers build settings (or your CI), set:
```
VITE_FF_LEGISLATOR_LOOKUP=true
VITE_GOOGLE_PLACES_API_KEY=your_key_here
```

**Step 3: Deploy**

```bash
npm run deploy
```

Expected: `wrangler deploy` succeeds, Worker is live with the new `/api/legislators` route.

---

## Final Checklist

- [ ] Google Cloud: Civic Information API enabled
- [ ] Google Cloud: Places API enabled
- [ ] API key created and domain-restricted
- [ ] `wrangler secret put GOOGLE_CIVIC_API_KEY` run locally
- [ ] Secret set in Cloudflare dashboard for production
- [ ] `.env.local` has both `VITE_FF_LEGISLATOR_LOOKUP=true` and `VITE_GOOGLE_PLACES_API_KEY`
- [ ] All 7 tasks committed
- [ ] End-to-end test passes with a real AZ address
- [ ] Feature flag off test confirms nothing leaks through
