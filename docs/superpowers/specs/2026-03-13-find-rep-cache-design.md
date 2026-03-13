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
- **Cache hit:** populate `legislators` + `resolvedAddress` from cache; hide the search form
- **Cache miss:** show the search form (existing behavior)

### "Change address" link
- Sets `showSearchForm = true`
- Cached legislators remain visible below the open form
- Google Maps `PlaceAutocompleteElement` mounts at this point (lazy load)

### Successful new search
- Sets `showSearchForm = false`
- Updates `legislators`, `resolvedAddress`, and localStorage cache

### Google Maps script loading
- Currently loads unconditionally on mount
- New behavior: only load (and mount `PlaceAutocompleteElement`) when `showSearchForm === true`
- Avoids loading the Maps SDK when the user already has cached results

---

## Layout

**Cache exists, form hidden:**
```
[Showing legislators for 123 Main St, Phoenix — Change address]
[State Legislators grid]
[Federal Representatives grid]
[Take Action → button]
```

**Form open (with cached results below):**
```
[Address search form]
[State Legislators grid]   ← cached, stays visible
[Federal Representatives grid]
[Take Action → button]
```

---

## State changes

| State var | Before | After |
|---|---|---|
| `showSearchForm` | (new) | `true` if no cache, `false` if cache exists |
| `resolvedAddress` | set after search | also set on mount from cache |
| `legislators` | set after search | also set on mount from cache |

No new props, no new files, no new routes.

---

## Error handling

- Invalid/corrupt cache entry: `legislatorCache.load()` already returns `null` in this case → falls back to showing form
- Expired cache (>30 days): same — `load()` returns `null`

---

## Out of scope

- No changes to `legislatorCache.ts`, `TakeAction.tsx`, or any other file
- No new API endpoints
- No changes to cache expiry logic
