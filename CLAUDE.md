# POPAZ Project Notes

## Secrets Management

API keys and secrets are managed in two places depending on environment:

### Local Development
Secrets go in `.dev.vars` (gitignored). This file is used by the local Vite/Cloudflare dev server automatically.

```
LEGISCAN_API_KEY=your_actual_key_here
OPENSTATES_API_KEY=...
```

### Production / Deployed Environments
Secrets are set via **Cloudflare Dashboard → Workers & Pages → people-over-profits-az → Settings → Variables & Secrets**, added as encrypted **Secrets** (not plain variables).

**Important:** Do NOT add secrets to the `vars` section of `wrangler.json`. Anything in `vars` gets deployed on every push and will overwrite dashboard values. `vars` is only for non-sensitive plaintext config (like `OPENSTATES_API_KEY` which is already public in the repo).

### Current Secrets
| Secret Name | Where to set |
|---|---|
| `LEGISCAN_API_KEY` | Dashboard (encrypted secret) + `.dev.vars` locally |

## Bill Tracking

Tracked bills are managed in `src/react-app/trackedBills.json`. Non-technical editors can add/remove bills by editing this file — only three fields needed:
- `billNumber`: exact AZ Legislature bill number (e.g. `"HB2823"`)
- `popazInsight`: POPAZ's analysis and position
- `popazPosition`: `"support"`, `"oppose"`, or `"monitor"`

Bill data is fetched from LegiScan and cached in Cloudflare KV (`LEGISCAN_CACHE`) once per day.
