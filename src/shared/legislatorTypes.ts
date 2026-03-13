// NOTE: This type is mirrored in src/shared/legislatorTypes.ts (React app)
// and worker/index.ts (Cloudflare Worker). Keep them in sync manually.
export type Legislator = {
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
