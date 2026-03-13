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
