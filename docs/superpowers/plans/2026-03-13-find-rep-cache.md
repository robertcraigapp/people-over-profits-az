# Find Your Reps Cache-First Display Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Show cached legislators immediately on the Find Your Reps page, deferring the search form and Google Maps SDK load until the user explicitly requests them.

**Architecture:** Single-file change to `FindRep.tsx`. Add `showSearchForm` boolean state (false when cache exists on mount, true otherwise). Gate both Google Maps `useEffect`s on `showSearchForm`. CSS-hide the form instead of conditionally rendering it, so `containerRef` and `autocompleteRef` are preserved across open/close cycles.

**Tech Stack:** React 19, TypeScript (strict), Tailwind CSS v4. No test framework — verify with `npx tsc --noEmit` and `npx eslint` after each step.

---

## Chunk 1: Cache-First FindRep

### Task 1: Update `FindRep.tsx`

**Files:**
- Modify: `src/react-app/FindRep.tsx`

- [ ] **Step 1: Add `showSearchForm` state and load cache on mount**

Add `showSearchForm` state directly after the existing `scriptLoaded` state declaration (line 25). Initialize it to `false` — the mount effect will flip it to `true` only on a cache miss. Starting at `false` ensures both gated Google Maps effects see `showSearchForm === false` on the first render and do not fire on cache-hit visits.

```ts
const [showSearchForm, setShowSearchForm] = useState(false);
```

Then add a new `useEffect` directly after the `scriptLoaded` declaration block, before the Google Maps script-loading effect:

```ts
// Load legislators from cache on mount; show search form only if no cache
useEffect(() => {
    const cached = legislatorCache.load();
    if (cached && cached.legislators.length > 0) {
        setLegislators(cached.legislators);
        setResolvedAddress(cached.address);
        // showSearchForm stays false — cached results shown immediately
    } else {
        setShowSearchForm(true);
    }
}, []);
```

- [ ] **Step 2: Gate the Google Maps script-loading effect on `showSearchForm`**

In the existing script-loading `useEffect` (currently lines 28–44), add an early return at the top and add `showSearchForm` to the dependency array:

```ts
// Load Google Maps JS API (v=beta for PlaceAutocompleteElement)
useEffect(() => {
    if (!showSearchForm) return;
    if (window.google) {
        setScriptLoaded(true);
        return;
    }
    if (document.getElementById('google-places-script')) {
        window.initAutocomplete = () => setScriptLoaded(true);
        return;
    }
    window.initAutocomplete = () => setScriptLoaded(true);
    const script = document.createElement('script');
    script.id = 'google-places-script';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_PLACES_API_KEY}&libraries=places&v=beta&callback=initAutocomplete`;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
}, [showSearchForm]);
```

- [ ] **Step 3: Gate the PlaceAutocompleteElement mount effect on `showSearchForm`**

In the existing autocomplete mount `useEffect` (currently lines 47–68), add `showSearchForm` to the guard and to the dependency array:

```ts
// Mount PlaceAutocompleteElement once script is ready
useEffect(() => {
    if (!showSearchForm || !scriptLoaded || !containerRef.current || autocompleteRef.current) return;

    const placeAutocomplete = new window.google.maps.places.PlaceAutocompleteElement({
        componentRestrictions: { country: 'us' },
        types: ['address'],
    });

    // Style the web component to match the rest of the form
    placeAutocomplete.style.width = '100%';

    containerRef.current.appendChild(placeAutocomplete);
    autocompleteRef.current = placeAutocomplete;

    placeAutocomplete.addEventListener('gmp-select', async (event: any) => {
        const place = event.placePrediction.toPlace();
        await place.fetchFields({ fields: ['formattedAddress', 'location'] });
        setAddress(place.formattedAddress ?? '');
        const loc = place.location;
        if (loc) setCoords({ lat: loc.lat(), lng: loc.lng() });
    });
}, [showSearchForm, scriptLoaded]);
```

- [ ] **Step 4: Add `setShowSearchForm(false)` to successful search handler**

In `handleSubmit`, inside the `try` block, after the existing `legislatorCache.save(trimmed, results)` line (currently line 105), add:

```ts
setShowSearchForm(false);
```

- [ ] **Step 5: Add `handleChangeAddress` handler**

Replace the existing inline `onClick` on the "Change address" button in `TakeAction.tsx`... wait, that's a different file. In `FindRep.tsx`, add a new handler function after `handleSubmit`:

```ts
const handleChangeAddress = () => {
    setShowSearchForm(true);
    setAddress('');
    setCoords(null);
};
```

- [ ] **Step 6: Update the JSX — address context bar and CSS-hidden form**

Replace the entire `{/* Search Section */}` `<main>` block (lines 152–210) with:

```tsx
{/* Search / Results Section */}
<main className='flex-grow py-20 px-6 bg-gradient-to-br from-slate-50 via-white to-brand-sand/10'>
    <div className='max-w-3xl mx-auto'>

        {/* Address context bar — shown whenever we have cached/fetched legislators */}
        {legislators && legislators.length > 0 && resolvedAddress && (
            <div className='flex items-center gap-2 text-sm text-gray-500 mb-6'>
                Showing legislators for{' '}
                <span className='font-medium text-gray-700'>{resolvedAddress}</span>
                {' — '}
                <button
                    onClick={handleChangeAddress}
                    className='text-brand-orange hover:underline font-medium'
                >
                    Change address
                </button>
                {showSearchForm && (
                    <>
                        {' | '}
                        <button
                            onClick={() => setShowSearchForm(false)}
                            className='text-gray-500 hover:underline'
                        >
                            Cancel
                        </button>
                    </>
                )}
            </div>
        )}

        {/* Search form — CSS-hidden when not needed, always in DOM to preserve containerRef */}
        <form
            onSubmit={handleSubmit}
            className={`mb-10 ${!showSearchForm ? 'hidden' : ''}`}
        >
            <label className='block text-lg font-bold text-brand-maroon mb-3'>
                Your Arizona Address
            </label>
            {/* PlaceAutocompleteElement mounts here */}
            <div ref={containerRef} className='mb-3' />
            <button
                type='submit'
                disabled={loading || !coords}
                className='w-full bg-brand-orange text-white px-6 py-3 rounded-lg font-bold text-lg hover:bg-brand-rust transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed'
            >
                {loading ? 'Searching…' : 'Find My Legislators'}
            </button>
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
                <div className='mt-8 text-center'>
                    <button
                        onClick={() => navigate('/take-action', { state: { legislators, address: resolvedAddress } })}
                        className='bg-brand-orange text-white px-8 py-3 rounded-lg font-bold text-lg hover:bg-brand-rust transition-all shadow-lg hover:shadow-xl'
                    >
                        Take Action →
                    </button>
                </div>
            </div>
        )}
    </div>
</main>
```

- [ ] **Step 7: Type-check and lint**

```bash
npx tsc --noEmit
npx eslint src/react-app/FindRep.tsx
```

Expected: no new errors (pre-existing `any` errors in FindRep.tsx are acceptable — they existed before this change).

- [ ] **Step 8: Commit**

```bash
rtk git add src/react-app/FindRep.tsx
rtk git commit -m "feat: show cached legislators on FindRep mount, lazy-load Maps SDK"
```
