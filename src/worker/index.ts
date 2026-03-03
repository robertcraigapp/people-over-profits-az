import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { EmailMessage } from 'cloudflare:email';

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
    const raw = [
        `From: signup@popaz.org`,
        `To: robertcraig@abolishprivateprisons.org`,
        `Subject: ${subject}`,
        `MIME-Version: 1.0`,
        `Content-Type: text/html; charset=utf-8`,
        ``,
        html,
    ].join('\r\n');

    const message = new EmailMessage(
        'signup@popaz.org',
        'robertcraig@abolishprivateprisons.org',
        raw,
    );

    try {
        await c.env.EMAIL.send(message);
    } catch (err) {
        console.error('Email send failed:', err);
        return c.json({ error: 'Failed to send notification email' }, 500);
    }

    return c.json({ success: true });
});

export default app;

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
