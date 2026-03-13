import type { Legislator } from '../shared/legislatorTypes';

const CACHE_KEY = 'popaz:legislators';
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

type CacheEntry = {
    address: string;
    legislators: Legislator[];
    cachedAt: number;
};

export function save(address: string, legislators: Legislator[]): void {
    const entry: CacheEntry = { address, legislators, cachedAt: Date.now() };
    localStorage.setItem(CACHE_KEY, JSON.stringify(entry));
}

export function load(): CacheEntry | null {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    try {
        const entry = JSON.parse(raw) as CacheEntry;
        if (Date.now() - entry.cachedAt > THIRTY_DAYS_MS) {
            localStorage.removeItem(CACHE_KEY);
            return null;
        }
        return entry;
    } catch {
        localStorage.removeItem(CACHE_KEY);
        return null;
    }
}

export function clear(): void {
    localStorage.removeItem(CACHE_KEY);
}
