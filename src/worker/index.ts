import { Hono } from "hono";
import { cors } from "hono/cors";

const app = new Hono<{ Bindings: Env }>();

app.use("/api/*", cors());

app.get("/api/", (c) => c.json({ name: "Cloudflare" }));

app.get("/api/legislators", async (c) => {
    const lat = c.req.query("lat");
    const lng = c.req.query("lng");
    if (!lat || !lng) {
        return c.json({ error: "lat and lng are required" }, 400);
    }

    const apiKey = c.env.OPENSTATES_API_KEY;
    if (!apiKey) return c.json({ error: "Missing OPENSTATES_API_KEY binding" }, 500);

    // OpenStates REST geo endpoint — look up state legislators by lat/lng
    const url = new URL("https://v3.openstates.org/people.geo");
    url.searchParams.set("lat", lat);
    url.searchParams.set("lng", lng);
    url.searchParams.set("apikey", apiKey);
    url.searchParams.append("include", "offices");
    url.searchParams.append("include", "links");

    let res: Response;
    try {
        res = await fetch(url.toString());
    } catch {
        return c.json({ error: "Failed to reach OpenStates API" }, 502);
    }

    if (!res.ok) {
        const body = await res.text();
        return c.json({ error: "OpenStates API error", detail: body }, 502);
    }

    const data = (await res.json()) as OpenStatesResponse;

    const legislators: Legislator[] = (data.results ?? []).map((person) => {
        const role = person.current_role;
        const jurisdiction = person.jurisdiction;
        let office = "State Legislature";
        if (role && jurisdiction) {
            if (jurisdiction.classification === "country") {
                // Federal: e.g. "US Senator (Texas)" or "US Representative (TX-10)"
                office = `US ${role.title} (${role.district})`;
            } else {
                // State: e.g. "Arizona Senator, District 14"
                office = `${jurisdiction.name} ${role.title}, District ${role.district}`;
            }
        }

        const capitolOffice = person.offices?.find((o) => o.classification === "capitol") ?? person.offices?.[0];

        return {
            name: person.name,
            office,
            party: person.party ?? "Unknown",
            level: jurisdiction?.classification === "country" ? "federal" : "state",
            phone: capitolOffice?.voice || undefined,
            address: capitolOffice?.address || undefined,
            email: person.email || undefined,
            website: person.links?.[0]?.url,
            photoUrl: person.image ?? undefined,
        };
    });

    return c.json({ legislators });
});

export default app;

// --- Types ---

type Legislator = {
    name: string;
    office: string;
    party: string;
    level: "state" | "federal";
    phone?: string;
    address?: string;
    email?: string;
    website?: string;
    photoUrl?: string;
};

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
