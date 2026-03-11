import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { EmailMessage } from 'cloudflare:email';
import type { TrackedBill, MasterlistCache, BillCache, LegiScanBill, BillResponse } from '../shared/billTypes';
import trackedBillsData from '../react-app/trackedBills.json';

const app = new Hono<{ Bindings: Env }>();

app.use('/api/*', cors());

app.get('/api/', (c) => c.json({ name: 'Cloudflare' }));

app.get('/api/legislators', async (c) => {
    const lat = c.req.query('lat');
    const lng = c.req.query('lng');
    if (!lat || !lng) {
        return c.json({ error: 'lat and lng are required' }, 400);
    }

    const apiKey = c.env.OPENSTATES_API_KEY;

    // OpenStates REST geo endpoint — look up state legislators by lat/lng
    const url = new URL('https://v3.openstates.org/people.geo');
    url.searchParams.set('lat', lat);
    url.searchParams.set('lng', lng);
    url.searchParams.set('apikey', apiKey);
    url.searchParams.append('include', 'offices');
    url.searchParams.append('include', 'links');

    let res: Response;
    try {
        res = await fetch(url.toString());
    } catch {
        return c.json({ error: 'Failed to reach OpenStates API' }, 502);
    }

    if (!res.ok) {
        const body = await res.text();
        return c.json({ error: 'OpenStates API error', detail: body }, 502);
    }

    const data = (await res.json()) as OpenStatesResponse;

    const legislators: Legislator[] = (data.results ?? []).map((person) => {
        const role = person.current_role;
        const jurisdiction = person.jurisdiction;
        let office = 'State Legislature';
        if (role && jurisdiction) {
            if (jurisdiction.classification === 'country') {
                // Federal: e.g. "US Senator (Texas)" or "US Representative (TX-10)"
                office = `US ${role.title} (${role.district})`;
            } else {
                // State: e.g. "Arizona Senator, District 14"
                office = `${jurisdiction.name} ${role.title}, District ${role.district}`;
            }
        }

        const capitolOffice =
            person.offices?.find((o) => o.classification === 'capitol') ??
            person.offices?.[0];

        return {
            name: person.name,
            office,
            party: person.party ?? 'Unknown',
            level:
                jurisdiction?.classification === 'country'
                    ? 'federal'
                    : 'state',
            phone: capitolOffice?.voice || undefined,
            address: capitolOffice?.address || undefined,
            email: person.email || undefined,
            website: person.links?.[0]?.url,
            photoUrl: person.image ?? undefined,
        };
    });

    return c.json({ legislators });
});

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

app.post('/api/signup', async (c) => {
    let body: SignupBody;
    try {
        body = await c.req.json<SignupBody>();
    } catch {
        return c.json({ error: 'Invalid JSON' }, 400);
    }

    if (!body.firstName || !body.lastName || !body.email) {
        return c.json(
            { error: 'firstName, lastName, and email are required' },
            400,
        );
    }

    if (!body.email.includes('@')) {
        return c.json({ error: 'Invalid email address' }, 400);
    }

    const html = buildEmailHtml(body);
    const safeName = (s: string) => s.replace(/[\r\n]/g, ' ');
    const subject = `New Signup: ${safeName(body.firstName)} ${safeName(body.lastName)}`;
    const messageId = `<${Date.now()}.${Math.random().toString(36).slice(2)}@popaz.org>`;
    const raw = [
        `From: signup@popaz.org`,
        `To: contact@abolishprivateprisons.org`,
        `Message-ID: ${messageId}`,
        `Subject: ${subject}`,
        `MIME-Version: 1.0`,
        `Content-Type: text/html; charset=utf-8`,
        ``,
        html,
    ].join('\r\n');

    const message = new EmailMessage(
        'signup@popaz.org',
        'contact@abolishprivateprisons.org',
        raw,
    );

    try {
        await c.env.EMAIL.send(message);
    } catch (err) {
        console.error('Email send failed:', err);
        return c.json(
            { error: 'Failed to send notification email', detail: String(err) },
            500,
        );
    }

    return c.json({ success: true });
});

export default app;

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

// --- Types ---

type Legislator = {
    name: string;
    office: string;
    party: string;
    level: 'state' | 'federal';
    phone?: string;
    address?: string;
    email?: string;
    website?: string;
    photoUrl?: string;
};

type SignupBody = {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    zipCode?: string;
    volunteer?: string;
    hearAbout?: string;
};

function escapeHtml(s: string): string {
    return String(s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;');
}

function buildEmailHtml(data: SignupBody): string {
    const rows = [
        ['First Name', data.firstName],
        ['Last Name', data.lastName],
        ['Email', data.email],
        ['Phone', data.phone || '—'],
        ['Zip Code', data.zipCode || '—'],
        ['Volunteer Interest', data.volunteer || '—'],
        ['How They Heard', data.hearAbout || '—'],
    ]
        .map(
            ([label, value]) =>
                `<tr><td style="padding:8px 12px;font-weight:bold;background:#f5f5f5;border:1px solid #ddd">${label}</td><td style="padding:8px 12px;border:1px solid #ddd">${escapeHtml(value)}</td></tr>`,
        )
        .join('');

    return `
        <html><body style="font-family:sans-serif;max-width:600px;margin:0 auto">
        <h2 style="color:#6b1f2a">New POPAZ Signup</h2>
        <table style="border-collapse:collapse;width:100%">${rows}</table>
        </body></html>
    `;
}

type OpenStatesResponse = {
    results: {
        name: string;
        party: string;
        email?: string;
        image?: string;
        current_role?: {
            title: string;
            org_classification: string;
            district: string;
        };
        jurisdiction?: {
            name: string;
            classification: string;
        };
        offices?: {
            name: string;
            classification: string;
            voice?: string;
            address?: string;
            fax?: string;
        }[];
        links?: { url: string }[];
    }[];
};
