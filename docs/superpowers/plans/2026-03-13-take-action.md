# Take Action Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a `/take-action` page that generates personalized constituent-contact letters, emails, and phone scripts from the user's legislators and selected tracked bills.

**Architecture:** Three new files (`legislatorTypes.ts`, `legislatorCache.ts`, `templates.ts`) provide foundation logic, and `TakeAction.tsx` is the page component. Existing files `FindRep.tsx`, `BillTracker.tsx`, `App.tsx`, `Navigation.tsx`, and `worker/index.ts` get small targeted changes.

**Tech Stack:** React 19, TypeScript (strict), React Router v7, Tailwind CSS v4, Cloudflare Workers/Vite. No test framework — verify with `rtk tsc` (TypeScript) and `rtk lint` (ESLint) after each task, then dev server for visual confirmation.

---

## Chunk 1: Foundation — Types, Cache, Templates

### Task 1: Migrate `Legislator` type to shared module

**Files:**
- Create: `src/shared/legislatorTypes.ts`
- Modify: `src/react-app/FindRep.tsx`
- Modify: `src/worker/index.ts`

- [ ] **Step 1: Create `src/shared/legislatorTypes.ts`**

```ts
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
```

- [ ] **Step 2: Update `FindRep.tsx` — replace local type with import**

Remove the local `Legislator` type declaration (lines 3–13) and add at the top of the file:

```ts
import type { Legislator } from '../shared/legislatorTypes';
```

The rest of `FindRep.tsx` is unchanged — the type shape is identical.

- [ ] **Step 3: Update `worker/index.ts` — add mirror comment**

Find the local `Legislator` type in `worker/index.ts` (around line 245). Prepend these two comment lines directly above the `type Legislator = {` line — do not change anything else:

```ts
// NOTE: This type is mirrored in src/shared/legislatorTypes.ts (React app)
// and worker/index.ts (Cloudflare Worker). Keep them in sync manually.
```

The worker keeps its own copy — do not add an import or modify the type fields.

- [ ] **Step 4: Type-check**

```bash
rtk tsc
```

Expected: no errors.

- [ ] **Step 5: Commit**

```bash
rtk git add src/shared/legislatorTypes.ts src/react-app/FindRep.tsx src/worker/index.ts
rtk git commit -m "refactor: move Legislator type to src/shared/legislatorTypes"
```

---

### Task 2: Build `legislatorCache.ts`

**Files:**
- Create: `src/react-app/legislatorCache.ts`

- [ ] **Step 1: Create `src/react-app/legislatorCache.ts`**

```ts
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
```

- [ ] **Step 2: Type-check**

```bash
rtk tsc
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
rtk git add src/react-app/legislatorCache.ts
rtk git commit -m "feat: add legislatorCache with 30-day localStorage expiry"
```

---

### Task 3: Build `templates.ts`

**Files:**
- Create: `src/react-app/templates.ts`

- [ ] **Step 1: Create `src/react-app/templates.ts`**

```ts
import type { Legislator } from '../shared/legislatorTypes';
import type { BillResponse } from '../shared/billTypes';

// --- Internal helpers ---

function deriveTitle(office: string): string {
    if (office.includes('Senator')) return 'Senator';
    if (office.includes('Representative')) return 'Representative';
    return 'Representative';
}

function deriveLastName(name: string): string {
    return name.split(' ').at(-1) ?? name;
}

type Position = 'support' | 'oppose' | 'monitor' | 'mixed';

function resolvePosition(bills: BillResponse[]): Position {
    const positions = new Set(bills.map((b) => b.popazPosition));
    return positions.size === 1 ? bills[0].popazPosition : 'mixed';
}

function openingPhrase(position: Position, count: number): string {
    const billWord = count === 1 ? 'the following bill' : 'the following bills';
    if (position === 'support') return `urge your support of ${billWord}`;
    if (position === 'oppose') return `urge your opposition to ${billWord}`;
    if (position === 'monitor') return `ask you to carefully consider ${billWord}`;
    // mixed
    return 'write about the following bills'; // unused for mixed — see openingLine
}

function openingLine(position: Position, count: number): string {
    if (position === 'mixed') {
        return 'I am your constituent writing about the following bills.';
    }
    return `I am your constituent writing to ${openingPhrase(position, count)}.`;
}

function billTitleLine(bill: BillResponse): string {
    return bill.bill?.title ? `${bill.billNumber} — ${bill.bill.title}` : bill.billNumber;
}

function perBillClosingSentence(bill: BillResponse): string {
    if (bill.popazPosition === 'support') return `I urge you to vote yes on ${bill.billNumber}.`;
    if (bill.popazPosition === 'oppose') return `I urge you to vote no on ${bill.billNumber}.`;
    return `I ask you to carefully consider ${bill.billNumber}.`;
}

function phoneAsk(bill: BillResponse): string {
    if (bill.popazPosition === 'support') return `vote yes on ${bill.billNumber}`;
    if (bill.popazPosition === 'oppose') return `vote no on ${bill.billNumber}`;
    return `carefully consider ${bill.billNumber}`;
}

function emailSubject(bills: BillResponse[]): string {
    const numbers = bills.map((b) => b.billNumber).join(', ');
    const position = resolvePosition(bills);
    const countWord = bills.length === 1 ? 'this bill' : 'these bills';
    if (position === 'support') return `${numbers} — Please support ${countWord}`;
    if (position === 'oppose') return `${numbers} — Please oppose ${countWord}`;
    if (position === 'monitor') return `${numbers} — Please carefully consider ${countWord}`;
    return `${numbers} — Please review ${countWord}`;
}

// --- Public API ---

export function generateLetter(
    legislator: Legislator,
    bills: BillResponse[],
    userName?: string,
): string {
    const title = deriveTitle(legislator.office);
    const lastName = deriveLastName(legislator.name);
    const position = resolvePosition(bills);
    const name = userName?.trim() || '[Your name]';

    const perBillBlocks = bills
        .map((bill) =>
            [billTitleLine(bill), '', bill.popazInsight, '', perBillClosingSentence(bill)].join('\n'),
        )
        .join('\n\n');

    return [
        `Dear ${title} ${lastName},`,
        '',
        openingLine(position, bills.length),
        '',
        perBillBlocks,
        '',
        'Respectfully,',
        name,
    ].join('\n');
}

export function generateEmailContent(
    legislator: Legislator,
    bills: BillResponse[],
    userName?: string,
): { subject: string; body: string } {
    return {
        subject: emailSubject(bills),
        body: generateLetter(legislator, bills, userName),
    };
}

export function generatePhoneScript(
    legislator: Legislator,
    bills: BillResponse[],
    userName?: string,
): string {
    const title = deriveTitle(legislator.office);
    const lastName = deriveLastName(legislator.name);
    const name = userName?.trim() || '[your name]';
    const billNumbers = bills.map((b) => b.billNumber).join(', ');

    const perBillBlocks = bills
        .map((bill) =>
            [
                `I'm calling to ask ${title} ${lastName} to ${phoneAsk(bill)}.`,
                '',
                bill.popazInsight,
            ].join('\n'),
        )
        .join('\n\n');

    return [
        `Hi, my name is ${name} and I'm a constituent calling about ${billNumbers}.`,
        '',
        perBillBlocks,
        '',
        'Thank you for your time.',
    ].join('\n');
}
```

- [ ] **Step 2: Type-check**

```bash
rtk tsc
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
rtk git add src/react-app/templates.ts
rtk git commit -m "feat: add constituent contact templates (letter, email, phone script)"
```

---

## Chunk 2: TakeAction Page

### Task 4: Build `TakeAction.tsx`

**Files:**
- Create: `src/react-app/TakeAction.tsx`

This is the main page component. It has four sections: name input, legislator selector, bill selector, and generated content with tabs.

- [ ] **Step 1: Create `src/react-app/TakeAction.tsx`**

```tsx
import { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router';
import type { Legislator } from '../shared/legislatorTypes';
import type { BillResponse } from '../shared/billTypes';
import * as legislatorCache from './legislatorCache';
import { generateLetter, generateEmailContent, generatePhoneScript } from './templates';

type Tab = 'letter' | 'email' | 'phone';

type RouterState = {
    legislators?: Legislator[];
    address?: string;
    selectedBillNumber?: string;
} | null;

// --- Sub-components ---

function NameInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
    return (
        <div className='bg-brand-sand/20 border border-brand-sand/40 rounded-xl p-5 mb-8'>
            <p className='font-bold text-brand-maroon mb-1'>Personalize your messages <span className='font-normal text-gray-500'>(optional)</span></p>
            <input
                type='text'
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder='Your name'
                className='border border-gray-300 rounded-lg px-4 py-2 w-full max-w-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-orange'
            />
            <p className='text-sm text-gray-500 mt-2'>Adding your name makes letters and scripts ready to send.</p>
        </div>
    );
}

function LegislatorSelector({
    legislators,
    cachedAddress,
    selectedNames,
    onToggle,
    onChangeAddress,
}: {
    legislators: Legislator[];
    cachedAddress: string | null;
    selectedNames: Set<string>;
    onToggle: (name: string) => void;
    onChangeAddress: () => void;
}) {
    if (legislators.length === 0) {
        return (
            <div className='mb-8'>
                <h2 className='text-xl font-black text-brand-maroon mb-3'>Your Legislators</h2>
                <p className='text-gray-600'>
                    <Link to='/resources/find-rep' className='text-brand-orange font-semibold hover:underline'>
                        Find your legislators first →
                    </Link>
                </p>
            </div>
        );
    }

    return (
        <div className='mb-8'>
            <h2 className='text-xl font-black text-brand-maroon mb-1'>Your Legislators</h2>
            {cachedAddress && (
                <p className='text-sm text-gray-500 mb-3'>
                    Showing legislators for <span className='font-medium'>{cachedAddress}</span>
                    {' — '}
                    <button
                        onClick={onChangeAddress}
                        className='text-brand-orange hover:underline font-medium'
                    >
                        Change address
                    </button>
                </p>
            )}
            <div className='grid sm:grid-cols-2 gap-3'>
                {legislators.map((leg) => (
                    <label
                        key={leg.name}
                        className='flex items-start gap-3 bg-white rounded-xl border border-gray-200 p-4 cursor-pointer hover:border-brand-orange/40 transition-colors'
                    >
                        <input
                            type='checkbox'
                            checked={selectedNames.has(leg.name)}
                            onChange={() => onToggle(leg.name)}
                            className='mt-1 accent-brand-orange'
                        />
                        <div>
                            <p className='font-bold text-brand-maroon text-sm'>{leg.name}</p>
                            <p className='text-xs text-gray-500'>{leg.office}</p>
                            <span className={`inline-block text-xs text-white font-bold px-2 py-0.5 rounded-full mt-1 ${
                                leg.party.toLowerCase().includes('democrat')
                                    ? 'bg-brand-blue'
                                    : leg.party.toLowerCase().includes('republican')
                                    ? 'bg-brand-rust'
                                    : 'bg-brand-plum'
                            }`}>{leg.party}</span>
                        </div>
                    </label>
                ))}
            </div>
        </div>
    );
}

const POSITION_BADGE: Record<string, string> = {
    support: 'bg-green-100 text-green-800',
    oppose: 'bg-red-100 text-red-800',
    monitor: 'bg-yellow-100 text-yellow-800',
};

const POSITION_LABEL: Record<string, string> = {
    support: 'POPAZ Supports',
    oppose: 'POPAZ Opposes',
    monitor: 'POPAZ Monitoring',
};

function BillSelector({
    bills,
    loading,
    error,
    selectedNumbers,
    onToggle,
    onRetry,
}: {
    bills: BillResponse[];
    loading: boolean;
    error: string | null;
    selectedNumbers: Set<string>;
    onToggle: (num: string) => void;
    onRetry: () => void;
}) {
    return (
        <div className='mb-8'>
            <h2 className='text-xl font-black text-brand-maroon mb-3'>Select Bills</h2>
            {loading && <p className='text-gray-500'>Loading bills…</p>}
            {error && (
                <div>
                    <p className='text-red-600 mb-2'>{error}</p>
                    <button onClick={onRetry} className='text-brand-orange font-semibold hover:underline text-sm'>
                        Try again
                    </button>
                </div>
            )}
            {!loading && !error && (
                <div className='space-y-3'>
                    {bills.map((b) => (
                        <label
                            key={b.billNumber}
                            className='flex items-start gap-3 bg-white rounded-xl border border-gray-200 p-4 cursor-pointer hover:border-brand-orange/40 transition-colors'
                        >
                            <input
                                type='checkbox'
                                checked={selectedNumbers.has(b.billNumber)}
                                onChange={() => onToggle(b.billNumber)}
                                className='mt-1 accent-brand-orange'
                            />
                            <div className='flex-1'>
                                <div className='flex items-center gap-2 flex-wrap'>
                                    <span className='font-bold text-brand-maroon text-sm'>{b.billNumber}</span>
                                    {b.bill && <span className='text-sm text-gray-700'>{b.bill.title}</span>}
                                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${POSITION_BADGE[b.popazPosition] ?? ''}`}>
                                        {POSITION_LABEL[b.popazPosition]}
                                    </span>
                                </div>
                            </div>
                        </label>
                    ))}
                </div>
            )}
        </div>
    );
}

function CopyButton({ text }: { text: string }) {
    const [copied, setCopied] = useState(false);
    const handleCopy = () => {
        navigator.clipboard.writeText(text).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };
    return (
        <button
            onClick={handleCopy}
            className='text-sm font-semibold text-brand-maroon border border-brand-maroon/30 rounded-lg px-3 py-1.5 hover:bg-brand-maroon hover:text-white transition-all'
        >
            {copied ? 'Copied!' : 'Copy'}
        </button>
    );
}

function LegislatorPanel({
    legislator,
    bills,
    activeTab,
    userName,
    expanded,
    onToggleExpand,
}: {
    legislator: Legislator;
    bills: BillResponse[];
    activeTab: Tab;
    userName: string;
    expanded: boolean;
    onToggleExpand: () => void;
}) {
    const letterText = generateLetter(legislator, bills, userName);
    const { subject, body } = generateEmailContent(legislator, bills, userName);
    const phoneText = generatePhoneScript(legislator, bills, userName);

    const mailtoHref = legislator.email
        ? `mailto:${legislator.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
        : null;

    const telHref = legislator.phone ? `tel:${legislator.phone}` : null;

    return (
        <div className='bg-white rounded-2xl border border-gray-200 overflow-hidden'>
            {/* Panel header */}
            <button
                onClick={onToggleExpand}
                className='w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors'
            >
                <div>
                    <span className='font-black text-brand-maroon'>{legislator.name}</span>
                    <span className='text-sm text-gray-500 ml-2'>{legislator.office}</span>
                </div>
                <span className='text-gray-400 text-lg'>{expanded ? '▲' : '▼'}</span>
            </button>

            {expanded && (
                <div className='border-t border-gray-100 p-4'>
                    {/* Letter tab */}
                    {activeTab === 'letter' && (
                        <div>
                            <textarea
                                readOnly
                                value={letterText}
                                rows={12}
                                className='w-full border border-gray-200 rounded-lg p-3 text-sm text-gray-800 font-mono resize-y bg-gray-50'
                            />
                            <div className='mt-2 flex gap-2'>
                                <CopyButton text={letterText} />
                            </div>
                        </div>
                    )}

                    {/* Email tab */}
                    {activeTab === 'email' && (
                        <div>
                            <p className='text-xs text-gray-500 mb-1 font-medium'>Subject: {subject}</p>
                            <textarea
                                readOnly
                                value={body}
                                rows={12}
                                className='w-full border border-gray-200 rounded-lg p-3 text-sm text-gray-800 font-mono resize-y bg-gray-50'
                            />
                            <div className='mt-2 flex gap-2 flex-wrap'>
                                <CopyButton text={body} />
                                {mailtoHref ? (
                                    <a
                                        href={mailtoHref}
                                        className='text-sm font-semibold text-brand-orange border border-brand-orange/30 rounded-lg px-3 py-1.5 hover:bg-brand-orange hover:text-white transition-all'
                                    >
                                        Open in email client →
                                    </a>
                                ) : legislator.website ? (
                                    <a
                                        href={legislator.website}
                                        target='_blank'
                                        rel='noopener noreferrer'
                                        className='text-sm text-gray-500'
                                    >
                                        No email on file — visit their website →
                                    </a>
                                ) : (
                                    <span className='text-sm text-gray-500'>No email on file.</span>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Phone tab */}
                    {activeTab === 'phone' && (
                        <div>
                            <textarea
                                readOnly
                                value={phoneText}
                                rows={12}
                                className='w-full border border-gray-200 rounded-lg p-3 text-sm text-gray-800 font-mono resize-y bg-gray-50'
                            />
                            <div className='mt-2 flex gap-2 flex-wrap'>
                                <CopyButton text={phoneText} />
                                {telHref ? (
                                    <a
                                        href={telHref}
                                        className='text-sm font-semibold text-brand-orange border border-brand-orange/30 rounded-lg px-3 py-1.5 hover:bg-brand-orange hover:text-white transition-all'
                                    >
                                        Call {legislator.phone}
                                    </a>
                                ) : (
                                    <span className='text-sm text-gray-500'>No phone on file.</span>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

function GeneratedContent({
    selectedLegislators,
    selectedBills,
    userName,
    activeTab,
    onTabChange,
    expandedPanels,
    onTogglePanel,
}: {
    selectedLegislators: Legislator[];
    selectedBills: BillResponse[];
    userName: string;
    activeTab: Tab;
    onTabChange: (tab: Tab) => void;
    expandedPanels: Record<string, boolean>;
    onTogglePanel: (name: string) => void;
}) {
    if (selectedLegislators.length === 0 || selectedBills.length === 0) {
        return (
            <p className='text-gray-500 italic'>Select at least one legislator and one bill above.</p>
        );
    }

    const tabs: { id: Tab; label: string }[] = [
        { id: 'letter', label: 'Letter' },
        { id: 'email', label: 'Email' },
        { id: 'phone', label: 'Phone Script' },
    ];

    return (
        <div>
            {/* Tabs */}
            <div className='flex gap-1 mb-6 border-b border-gray-200'>
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => onTabChange(tab.id)}
                        className={`px-5 py-2.5 font-bold text-sm rounded-t-lg transition-colors ${
                            activeTab === tab.id
                                ? 'bg-white border border-gray-200 border-b-white text-brand-maroon -mb-px'
                                : 'text-gray-500 hover:text-brand-maroon'
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Legislator panels */}
            <div className='space-y-4'>
                {selectedLegislators.map((leg) => (
                    <LegislatorPanel
                        key={leg.name}
                        legislator={leg}
                        bills={selectedBills}
                        activeTab={activeTab}
                        userName={userName}
                        expanded={expandedPanels[leg.name] ?? true}
                        onToggleExpand={() => onTogglePanel(leg.name)}
                    />
                ))}
            </div>
        </div>
    );
}

// --- Main page ---

export default function TakeAction() {
    const location = useLocation();
    const navigate = useNavigate();
    const state = (location.state ?? null) as RouterState;

    const [userName, setUserName] = useState('');
    const [legislators, setLegislators] = useState<Legislator[]>([]);
    const [cachedAddress, setCachedAddress] = useState<string | null>(null);
    const [selectedNames, setSelectedNames] = useState<Set<string>>(new Set());

    const [bills, setBills] = useState<BillResponse[]>([]);
    const [billsLoading, setBillsLoading] = useState(true);
    const [billsError, setBillsError] = useState<string | null>(null);
    const [selectedBillNumbers, setSelectedBillNumbers] = useState<Set<string>>(new Set());

    const [activeTab, setActiveTab] = useState<Tab>('letter');
    const [expandedPanels, setExpandedPanels] = useState<Record<string, boolean>>({});

    // Load legislators from router state or cache
    useEffect(() => {
        if (state?.legislators && state.legislators.length > 0) {
            legislatorCache.save(state.address ?? '', state.legislators);
            setLegislators(state.legislators);
            setCachedAddress(state.address ?? null);
            setSelectedNames(new Set(state.legislators.map((l) => l.name)));
        } else {
            const cached = legislatorCache.load();
            if (cached) {
                setLegislators(cached.legislators);
                setCachedAddress(cached.address);
                setSelectedNames(new Set(cached.legislators.map((l) => l.name)));
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Fetch bills
    const fetchBills = () => {
        setBillsLoading(true);
        setBillsError(null);
        fetch('/api/bills')
            .then((r) => {
                if (!r.ok) throw new Error(`API error ${r.status}`);
                return r.json();
            })
            .then((data: { bills: BillResponse[] }) => {
                const fetched = data.bills ?? [];
                setBills(fetched);
                setBillsLoading(false);
                // Pre-check bill from router state
                if (state?.selectedBillNumber) {
                    const found = fetched.find((b) => b.billNumber === state.selectedBillNumber);
                    if (found) setSelectedBillNumbers(new Set([state.selectedBillNumber]));
                }
            })
            .catch(() => {
                setBillsError('Failed to load bill data.');
                setBillsLoading(false);
            });
    };

    useEffect(() => {
        fetchBills();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Sync expand/collapse state when selected legislators change
    const selectedLegislators = legislators.filter((l) => selectedNames.has(l.name));
    useEffect(() => {
        if (selectedLegislators.length === 0) return;
        const defaultExpanded = selectedLegislators.length <= 2;
        setExpandedPanels((prev) => {
            const next: Record<string, boolean> = {};
            for (const leg of selectedLegislators) {
                // Preserve existing state; assign default for newly (re-)selected
                next[leg.name] = leg.name in prev ? prev[leg.name] : defaultExpanded;
            }
            return next;
        });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedLegislators.map((l) => l.name).join(',')]);

    const selectedBills = bills.filter((b) => selectedBillNumbers.has(b.billNumber));

    const toggleLegislator = (name: string) => {
        setSelectedNames((prev) => {
            const next = new Set(prev);
            if (next.has(name)) next.delete(name);
            else next.add(name);
            return next;
        });
    };

    const toggleBill = (num: string) => {
        setSelectedBillNumbers((prev) => {
            const next = new Set(prev);
            if (next.has(num)) next.delete(num);
            else next.add(num);
            return next;
        });
    };

    const handleChangeAddress = () => {
        legislatorCache.clear();
        navigate('/resources/find-rep');
    };

    const togglePanel = (name: string) => {
        setExpandedPanels((prev) => ({ ...prev, [name]: !prev[name] }));
    };

    return (
        <>
            {/* Hero */}
            <div className='relative overflow-hidden bg-gradient-to-br from-brand-maroon via-brand-plum to-brand-maroon text-white'>
                <div className='relative max-w-6xl mx-auto py-16 px-6'>
                    <div className='mb-4 inline-block'>
                        <div className='flex items-center gap-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-6 py-2'>
                            <div className='w-2 h-2 bg-brand-orange rounded-full animate-pulse' />
                            <span className='text-sm font-semibold tracking-wide uppercase text-brand-sand'>
                                Take Action
                            </span>
                        </div>
                    </div>
                    <h1 className='font-display text-5xl md:text-7xl font-bold mb-4 tracking-tight leading-none uppercase'>
                        Contact Your{' '}
                        <span className='text-brand-orange'>Legislators</span>
                    </h1>
                    <p className='text-lg md:text-xl text-brand-sand font-medium max-w-3xl leading-relaxed'>
                        Choose your legislators and the bills you care about — we'll generate a personalized letter, email, or phone script for you.
                    </p>
                </div>
            </div>

            {/* Main content */}
            <main className='flex-grow py-12 px-6 bg-gradient-to-br from-slate-50 via-white to-brand-sand/10'>
                <div className='max-w-3xl mx-auto'>
                    <NameInput value={userName} onChange={setUserName} />

                    <LegislatorSelector
                        legislators={legislators}
                        cachedAddress={cachedAddress}
                        selectedNames={selectedNames}
                        onToggle={toggleLegislator}
                        onChangeAddress={handleChangeAddress}
                    />

                    <BillSelector
                        bills={bills}
                        loading={billsLoading}
                        error={billsError}
                        selectedNumbers={selectedBillNumbers}
                        onToggle={toggleBill}
                        onRetry={fetchBills}
                    />

                    <div>
                        <h2 className='text-xl font-black text-brand-maroon mb-4'>Generated Messages</h2>
                        <GeneratedContent
                            selectedLegislators={selectedLegislators}
                            selectedBills={selectedBills}
                            userName={userName}
                            activeTab={activeTab}
                            onTabChange={setActiveTab}
                            expandedPanels={expandedPanels}
                            onTogglePanel={togglePanel}
                        />
                    </div>
                </div>
            </main>

            <footer className='bg-brand-maroon text-brand-sand py-10 px-6 text-center border-t-4 border-brand-orange'>
                <p className='mb-2 font-bold text-white'>People Over Profits - AZ (POPAZ)</p>
                <p className='text-sm opacity-80'>Building a more just Arizona. © 2026</p>
            </footer>
        </>
    );
}
```

- [ ] **Step 2: Type-check**

```bash
rtk tsc
```

Expected: no errors.

- [ ] **Step 3: Lint**

```bash
rtk lint
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
rtk git add src/react-app/TakeAction.tsx
rtk git commit -m "feat: add TakeAction page with legislator/bill selectors and content generator"
```

---

## Chunk 3: Cross-Linking and Wiring

### Task 5: Update `FindRep.tsx`

**Files:**
- Modify: `src/react-app/FindRep.tsx`

- [ ] **Step 1: Add cache save and Take Action button**

**1a. Add imports** at the top of `FindRep.tsx`:

```ts
import { useNavigate } from 'react-router';
import * as legislatorCache from './legislatorCache';
```

**1b. Add `useNavigate` hook** inside the `FindRep` function body (alongside the existing `useState` calls):

```ts
const navigate = useNavigate();
```

**1c. Add `resolvedAddress` state variable** alongside the existing `useState` declarations. Note: `FindRep.tsx` already has an `address` state variable (line 27) which tracks what the user types in the autocomplete. `resolvedAddress` is separate — it stores the address only after a *successful* lookup, so the Take Action button can reference it from JSX:

```ts
const [resolvedAddress, setResolvedAddress] = useState('');
```

**1d. Update `handleSubmit`** — inside the `try` block, immediately after `setLegislators(results)` (line 110), add:

```ts
setResolvedAddress(trimmed);
legislatorCache.save(trimmed, results);
```

Do not add these calls in the `catch` or `finally` blocks. `trimmed` is already in scope in `handleSubmit`.

**1e. Add Take Action button** inside the `{legislators && legislators.length > 0 && (` block (line 178), after both the `stateLegislators` and `federalLegislators` `<section>` blocks, before the closing `</div>`:

```tsx
<div className='mt-8 text-center'>
    <button
        onClick={() => navigate('/take-action', { state: { legislators, address: resolvedAddress } })}
        className='bg-brand-orange text-white px-8 py-3 rounded-lg font-bold text-lg hover:bg-brand-rust transition-all shadow-lg hover:shadow-xl'
    >
        Take Action →
    </button>
</div>
```

- [ ] **Step 2: Type-check**

```bash
rtk tsc
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
rtk git add src/react-app/FindRep.tsx
rtk git commit -m "feat: save legislator cache and add Take Action button in FindRep"
```

---

### Task 6: Update `BillTracker.tsx`

**Files:**
- Modify: `src/react-app/BillTracker.tsx`

- [ ] **Step 1: Add Contact Your Legislators button to `BillCard`**

At the top of `BillTracker.tsx`, add:

```ts
import { useNavigate } from 'react-router';
```

Inside `BillCard`, add:

```ts
const navigate = useNavigate();
```

Add the button **outside** the `{bill && (` block. `billNumber` is always available from the destructured `billResponse` at line 35 (`const { billNumber, popazInsight, popazPosition, bill } = billResponse`), so the button does not need `bill` to be non-null. Place it after the `{!bill && (` block at the bottom of the card `<div>`, before the closing `</div>`:

```tsx
<div className='mt-4'>
    <button
        onClick={() => navigate('/take-action', { state: { selectedBillNumber: billNumber } })}
        className='text-sm font-bold text-brand-orange hover:text-brand-rust transition-colors'
    >
        Contact Your Legislators →
    </button>
</div>
```

- [ ] **Step 2: Type-check**

```bash
rtk tsc
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
rtk git add src/react-app/BillTracker.tsx
rtk git commit -m "feat: add Contact Your Legislators button to each bill card"
```

---

### Task 7: Wire router and nav

**Files:**
- Modify: `src/react-app/App.tsx`
- Modify: `src/react-app/Navigation.tsx`

- [ ] **Step 1: Add route in `App.tsx`**

Add import:
```ts
import TakeAction from './TakeAction';
```

Add route inside the `<Route path='/' element={<Layout />}>` block. Place it after the closing `)}` of the existing `FF_BILL_TRACKER` block (the one containing `<Route path='bills' ...>`), as a new separate conditional — do not nest it inside the existing block:

```tsx
{FF_BILL_TRACKER && (
    <Route path='take-action' element={<TakeAction />} />
)}
```

- [ ] **Step 2: Add nav link in `Navigation.tsx`**

After the `FF_BILL_TRACKER` "Track Bills" link block and before the "Join the Fight" button, add:

```tsx
{FF_BILL_TRACKER && (
    <Link
        to='/take-action'
        className='font-display text-brand-maroon font-semibold hover:text-brand-orange transition-colors tracking-wide uppercase text-sm'
    >
        Take Action
    </Link>
)}
```

- [ ] **Step 3: Type-check and lint**

```bash
rtk tsc && rtk lint
```

Expected: no errors.

- [ ] **Step 4: Verify in dev server**

```bash
npm run dev
```

Open `http://localhost:5173`:
- Navigate to Find Your Rep → enter an AZ address → confirm "Take Action →" button appears after results
- Click Take Action → verify it lands on `/take-action` with legislators pre-checked
- Select a bill → verify all three tabs generate content
- Open Email tab → click "Open in email client →" → confirm email client opens pre-filled
- Navigate to Track Bills → click "Contact Your Legislators →" on a bill card → verify it lands on `/take-action` with that bill pre-checked
- Close dev server with Ctrl+C

- [ ] **Step 5: Commit**

```bash
rtk git add src/react-app/App.tsx src/react-app/Navigation.tsx
rtk git commit -m "feat: wire Take Action route and nav link"
```
