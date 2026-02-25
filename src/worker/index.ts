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

    const legislators: Legislator[] = [];

    for (const office of data.offices ?? []) {
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
