# Find Your Reps — Cache-First Display

**Date:** 2026-03-13
**Scope:** `src/react-app/FindRep.tsx` only

---

## Goal

When a user visits `/resources/find-rep` and legislators are already cached in localStorage, show the results immediately — no API call, no form. The address search form is only shown on first visit or when the user explicitly clicks "Change address".

---

## Behavior

### On mount
- Check `legislatorCache.load()`
- **Cache hit:** populate `legislators` + `resolvedAddress` from cache; set `showSearchForm = false`
- **Cache miss:** set `showSearchForm = true` (existing behavior — form shown immediately)

### "Change address" link
- Sets `showSearchForm = true`
- Resets `address = ''` and `coords = null` so stale values don't linger in form state
- Cached legislators remain visible below the open form while `showSearchForm === true`
- Google Maps script loads and `PlaceAutocompleteElement` mounts at this point (lazy)

### Cancel button (form → cached results)
- A "Cancel" button appears in the form **only when cached legislators exist** (`legislators !== null && legislators.length > 0`)
- Clicking Cancel sets `showSearchForm = false` — returns to the cached results view
- If there are no cached legislators (fresh visit), no Cancel button is shown

### Successful new search
- Sets `showSearchForm = false`
- Clears the cached results immediately when the user clicks "Find My Legislators" (existing `setLegislators(null)` behavior is kept — results clear during loading, then repopulate)
- Updates `legislators`, `resolvedAddress`, and localStorage cache on success

### Google Maps script and PlaceAutocompleteElement
- **Both** the script-loading effect and the `PlaceAutocompleteElement` mount effect are gated on `showSearchForm === true` — neither runs on mount when the cache is hit
- The form container is **CSS-hidden** (`className='hidden'` or equivalent) rather than conditionally rendered, to preserve the `containerRef` DOM node and avoid stale `autocompleteRef` on re-open
- `autocompleteRef.current` guard (`if (autocompleteRef.current) return`) prevents double-mounting when the form is shown a second time
- When the user clicks "Change address" (`showSearchForm` becomes `true`), both effects run for the first time, loading the script and mounting the element exactly as they do today on a fresh visit

---

## Layout

**Cache exists, form hidden:**
```
[Showing legislators for 123 Main St, Phoenix — Change address]
[State Legislators grid]
[Federal Representatives grid]
[Take Action → button]
```

**Form open (cached results below, Cancel visible):**
```
[Showing legislators for 123 Main St, Phoenix — Change address | Cancel]
[Address search form]
[State Legislators grid]   ← cached, stays visible during typing
[Federal Representatives grid]
[Take Action → button]
```

**Loading (new search submitted):**
```
[Address search form]
[Searching…]              ← legislators cleared immediately on submit
```

**Fresh visit (no cache):**
```
[Address search form]     ← no Cancel button, no cached results
```

---

## State changes

| State var | Before | After |
|---|---|---|
| `showSearchForm` | (new) | `true` if no cache on mount, `false` if cache hit |
| `resolvedAddress` | set after search | also set on mount from cache |
| `legislators` | set after search | also set on mount from cache |
| `address` | unchanged | also reset to `''` on "Change address" click |
| `coords` | unchanged | also reset to `null` on "Change address" click |

No new props, no new files, no new routes.

---

## Error handling

- Invalid/corrupt cache entry: `legislatorCache.load()` returns `null` → falls back to showing form
- Expired cache (>30 days): same — `load()` returns `null`
- User opens form, doesn't complete search, clicks Cancel: cached results are still in state and display normally

---

## Out of scope

- No changes to `legislatorCache.ts`, `TakeAction.tsx`, or any other file
- No new API endpoints
- No changes to cache expiry logic
