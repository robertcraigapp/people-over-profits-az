# Signup Email Notification Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** When a user submits the signup form, the Cloudflare Worker sends a full-data HTML email notification to a designated inbox using Cloudflare's native `send_email` binding.

**Architecture:** The React frontend POSTs form data as JSON to a new `/api/signup` Hono route. The Worker validates the payload, builds an HTML email, and dispatches it via a `send_email` binding connected to Cloudflare Email Routing. No third-party services or data storage involved.

**Tech Stack:** Hono (Worker router), Cloudflare `send_email` binding, Cloudflare Email Routing, React (frontend)

---

## Pre-requisites (Manual Cloudflare Dashboard Steps)

Before any code runs, the human must complete these in the Cloudflare dashboard:

1. Go to **Email > Email Routing** for the domain and enable it
2. Add and verify the destination address (the inbox that receives notifications)
3. Note the sender address to use (e.g. `noreply@yourdomain.com`) — Cloudflare requires it be on the same domain

These steps are not automatable via code. The plan below assumes they are done before deploying.

---

### Task 1: Add `send_email` binding to wrangler.json

**Files:**
- Modify: `wrangler.json`

**Step 1: Add the binding**

Open `wrangler.json`. After the `"vars"` block, add:

```json
"send_email": [
    {
        "name": "EMAIL",
        "destination_address": "notify@example.com"
    }
]
```

Replace `notify@example.com` with the actual verified destination address once known. The full file should look like:

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
    "send_email": [
        {
            "name": "EMAIL",
            "destination_address": "notify@example.com"
        }
    ],
    "env": {
        "dev": {
            "vars": {
                "OPENSTATES_API_KEY": "2aaac5c0-9176-4be5-990e-1e50f3f290cb",
                "VITE_GOOGLE_PLACES_API_KEY": "AIzaSyBdmO3mVPUaERDJ7fgPDb2o5MTieXjq-hc"
            }
        }
    }
}
```

**Step 2: Regenerate types**

```bash
npx wrangler types
```

This regenerates `worker-configuration.d.ts`. Verify the top of that file now includes `EMAIL: SendEmail` in the `Env` interface.

**Step 3: Commit**

```bash
rtk git add wrangler.json worker-configuration.d.ts
rtk git commit -m "feat: add send_email binding for signup notifications"
```

---

### Task 2: Add `POST /api/signup` route to the Worker

**Files:**
- Modify: `src/worker/index.ts`

**Step 1: Define the signup body type**

At the bottom of `src/worker/index.ts`, below the existing type definitions, add:

```typescript
type SignupBody = {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    zipCode?: string;
    volunteer?: string;
    hearAbout?: string;
};
```

**Step 2: Add a helper to build the HTML email body**

Add this function below the `SignupBody` type:

```typescript
function buildEmailHtml(data: SignupBody): string {
    const rows = [
        ["First Name", data.firstName],
        ["Last Name", data.lastName],
        ["Email", data.email],
        ["Phone", data.phone || "—"],
        ["Zip Code", data.zipCode || "—"],
        ["Volunteer Interest", data.volunteer || "—"],
        ["How They Heard", data.hearAbout || "—"],
    ]
        .map(
            ([label, value]) =>
                `<tr><td style="padding:8px 12px;font-weight:bold;background:#f5f5f5;border:1px solid #ddd">${label}</td><td style="padding:8px 12px;border:1px solid #ddd">${value}</td></tr>`
        )
        .join("");

    return `
        <html><body style="font-family:sans-serif;max-width:600px;margin:0 auto">
        <h2 style="color:#6b1f2a">New POPAZ Signup</h2>
        <table style="border-collapse:collapse;width:100%">${rows}</table>
        </body></html>
    `;
}
```

**Step 3: Add the route**

After the existing `app.get("/api/legislators", ...)` route and before `export default app;`, add:

```typescript
app.post("/api/signup", async (c) => {
    let body: SignupBody;
    try {
        body = await c.req.json<SignupBody>();
    } catch {
        return c.json({ error: "Invalid JSON" }, 400);
    }

    if (!body.firstName || !body.lastName || !body.email) {
        return c.json({ error: "firstName, lastName, and email are required" }, 400);
    }

    const message = new EmailMessage(
        "noreply@yourdomain.com",
        c.env.EMAIL.destination,
        {
            subject: `New Signup: ${body.firstName} ${body.lastName}`,
            html: buildEmailHtml(body),
        }
    );

    try {
        await c.env.EMAIL.send(message);
    } catch (err) {
        console.error("Email send failed:", err);
        return c.json({ error: "Failed to send notification email" }, 500);
    }

    return c.json({ success: true });
});
```

> **Note on `EmailMessage`:** Cloudflare's `send_email` binding uses the `EmailMessage` constructor from the Workers runtime — it is available globally, no import needed. Replace `noreply@yourdomain.com` with the actual sender address on your domain.

> **Note on `c.env.EMAIL.destination`:** After running `wrangler types`, the `EMAIL` binding exposes `.destination` (the verified address from `wrangler.json`) and `.send(message)`. If the TypeScript compiler complains, check the generated type in `worker-configuration.d.ts` and adjust the property name accordingly.

**Step 4: Type-check**

```bash
npx tsc --noEmit -p tsconfig.worker.json
```

Expected: no errors. If `EmailMessage` or `SendEmail` types are missing, check that `wrangler types` was run in Task 1.

**Step 5: Commit**

```bash
rtk git add src/worker/index.ts
rtk git commit -m "feat: add POST /api/signup route with email notification"
```

---

### Task 3: Update SignUp.tsx to submit to the API

**Files:**
- Modify: `src/react-app/SignUp.tsx`

**Step 1: Add submission state**

In the `SignUp` function, after the existing `formData` state, add two new state variables:

```typescript
const [submitting, setSubmitting] = useState(false);
const [submitted, setSubmitted] = useState(false);
const [submitError, setSubmitError] = useState('');
```

**Step 2: Replace `handleSubmit`**

Replace the existing `handleSubmit` function (lines 23–27) with:

```typescript
const handleSubmit = async (e: any) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError('');
    try {
        const res = await fetch('/api/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
        });
        if (!res.ok) throw new Error('Server error');
        setSubmitted(true);
    } catch {
        setSubmitError('Something went wrong. Please try again.');
    } finally {
        setSubmitting(false);
    }
};
```

**Step 3: Show success state**

In the JSX, replace the submit button block (the `<div>` containing the submit button, around lines 345–381) with:

```tsx
<div className='flex flex-col sm:flex-row gap-4 items-center justify-between'>
    <p className='text-sm text-gray-600'>
        <span className='text-brand-orange'>*</span>{' '}
        Required fields
    </p>

    {submitted ? (
        <div className='w-full sm:w-auto bg-green-50 border border-green-200 text-green-800 px-8 py-4 rounded-lg font-bold text-lg text-center'>
            Thank you for signing up!
        </div>
    ) : (
        <>
            {submitError && (
                <p className='text-red-600 text-sm'>{submitError}</p>
            )}
            <button
                type='submit'
                disabled={submitting}
                className='w-full sm:w-auto bg-gradient-to-r from-brand-maroon via-brand-plum to-brand-rust text-white px-10 py-4 rounded-lg font-bold text-lg hover:shadow-2xl transition-all hover:scale-105 active:scale-95 relative overflow-hidden group disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100'
            >
                <div
                    className='absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity'
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='30' height='30' viewBox='0 0 30 30' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M15 0l12.99 7.5v15L15 30 2.01 22.5v-15z' fill='%23ffffff'/%3E%3C/svg%3E")`,
                        backgroundSize: '30px 30px',
                    }}
                ></div>

                <span className='relative flex items-center gap-2 justify-center'>
                    {submitting ? 'Sending...' : 'Join the Movement'}
                    {!submitting && (
                        <svg
                            className='w-5 h-5'
                            fill='none'
                            stroke='currentColor'
                            viewBox='0 0 24 24'
                        >
                            <path
                                strokeLinecap='round'
                                strokeLinejoin='round'
                                strokeWidth={2}
                                d='M13 7l5 5m0 0l-5 5m5-5H6'
                            />
                        </svg>
                    )}
                </span>
            </button>
        </>
    )}
</div>
```

**Step 4: Type-check the frontend**

```bash
npx tsc --noEmit
```

Expected: no errors.

**Step 5: Commit**

```bash
rtk git add src/react-app/SignUp.tsx
rtk git commit -m "feat: wire signup form to /api/signup endpoint"
```

---

### Task 4: Build and verify

**Step 1: Build**

```bash
rtk next build
```

Or if using the project's build script:

```bash
npm run build
```

Expected: clean build, no TypeScript errors.

**Step 2: Dry-run deploy**

```bash
npm run check
```

This runs `tsc && vite build && wrangler deploy --dry-run`. Expected: passes cleanly. This validates the Worker bundle without actually deploying.

**Step 3: Deploy**

```bash
npm run deploy
```

Or:

```bash
npx wrangler deploy
```

**Step 4: Smoke test**

After deploying, submit the live signup form with a test entry. Verify the notification email arrives at the configured destination address.

**Step 5: Commit any fixes, then final commit**

```bash
rtk git add .
rtk git commit -m "chore: post-deploy fixes if any"
```

---

## Notes

- The `send_email` binding does **not** work in local `wrangler dev` — it only works in production. You cannot test email sending locally; the dry-run in Task 4 is the best pre-deploy check.
- If `wrangler types` produces a `SendEmail` type that differs from what's used above (e.g. `.send()` vs `.sendEmail()`), check `worker-configuration.d.ts` and adjust accordingly.
- Once the real notification email address is known, update the `destination_address` in `wrangler.json` and the sender address in `index.ts`, then redeploy.
