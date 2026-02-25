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

    const apiKey = c.env.OPENSTATES_API_KEY;

    // OpenStates GraphQL API — look up people by address
    const query = `
        query PeopleByLocation($address: String!) {
            people(location: $address, first: 10) {
                edges {
                    node {
                        name
                        party
                        currentRole {
                            title
                            organization {
                                name
                                classification
                            }
                            district
                        }
                        contactDetails {
                            type
                            value
                            note
                        }
                        links {
                            url
                        }
                        image
                    }
                }
            }
        }
    `;

    let res: Response;
    try {
        res = await fetch("https://v3.openstates.org/graphql", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-API-KEY": apiKey,
            },
            body: JSON.stringify({ query, variables: { address } }),
        });
    } catch {
        return c.json({ error: "Failed to reach OpenStates API" }, 502);
    }

    if (!res.ok) {
        const body = await res.text();
        return c.json({ error: "OpenStates API error", detail: body }, 502);
    }

    const data = (await res.json()) as OpenStatesResponse;

    if (data.errors?.length) {
        return c.json({ error: "OpenStates query error", detail: data.errors[0].message }, 502);
    }

    const legislators: Legislator[] = (data.data?.people?.edges ?? []).map(({ node }) => {
        const phone = node.contactDetails?.find((d) => d.type === "voice")?.value;
        const website = node.links?.[0]?.url;
        const role = node.currentRole;
        const chamber = role?.organization?.classification === "upper" ? "Senate" : "House";
        const office = role
            ? `Arizona State ${chamber}, District ${role.district}`
            : "Arizona State Legislature";

        return {
            name: node.name,
            office,
            party: node.party ?? "Unknown",
            phone,
            website,
            photoUrl: node.image ?? undefined,
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
    data?: {
        people?: {
            edges: {
                node: {
                    name: string;
                    party: string;
                    currentRole?: {
                        title: string;
                        organization?: {
                            name: string;
                            classification: string;
                        };
                        district: string;
                    };
                    contactDetails?: { type: string; value: string; note: string }[];
                    links?: { url: string }[];
                    image?: string;
                };
            }[];
        };
    };
    errors?: { message: string }[];
};
