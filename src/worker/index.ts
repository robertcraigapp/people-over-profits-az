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

    // OpenStates REST geo endpoint — look up state legislators by lat/lng
    const url = new URL("https://v3.openstates.org/people.geo");
    url.searchParams.set("lat", lat);
    url.searchParams.set("lng", lng);
    url.searchParams.set("apikey", apiKey);

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
        const chamber = role?.org_classification === "upper" ? "Senate" : "House";
        const office = role
            ? `Arizona State ${chamber}, District ${role.district}`
            : "Arizona State Legislature";

        return {
            name: person.name,
            office,
            party: person.party ?? "Unknown",
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
    phone?: string;
    website?: string;
    photoUrl?: string;
};

type OpenStatesResponse = {
    results: {
        name: string;
        party: string;
        current_role?: {
            title: string;
            org_classification: string;
            district: string;
        };
        links?: { url: string }[];
        image?: string;
    }[];
};
