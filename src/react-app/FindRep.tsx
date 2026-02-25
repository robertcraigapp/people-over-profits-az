import { useEffect, useRef, useState } from 'react';

type Legislator = {
    name: string;
    office: string;
    party: string;
    phone?: string;
    website?: string;
    photoUrl?: string;
};

declare global {
    interface Window {
        google: any;
        initAutocomplete: () => void;
    }
}

const GOOGLE_PLACES_API_KEY = import.meta.env.VITE_GOOGLE_PLACES_API_KEY ?? '';

function FindRep() {
    const inputRef = useRef<HTMLInputElement>(null);
    const autocompleteRef = useRef<any>(null);
    const [address, setAddress] = useState('');
    const [legislators, setLegislators] = useState<Legislator[] | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [scriptLoaded, setScriptLoaded] = useState(false);

    // Load Google Places script once
    useEffect(() => {
        if (window.google) {
            // Script already fully loaded (e.g. React Strict Mode remount)
            setScriptLoaded(true);
            return;
        }
        if (document.getElementById('google-places-script')) {
            // Script tag exists but hasn't finished loading yet — register callback
            window.initAutocomplete = () => setScriptLoaded(true);
            return;
        }
        window.initAutocomplete = () => setScriptLoaded(true);
        const script = document.createElement('script');
        script.id = 'google-places-script';
        script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_PLACES_API_KEY}&libraries=places&callback=initAutocomplete`;
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
    }, []);

    // Initialize autocomplete once script is loaded
    useEffect(() => {
        if (!scriptLoaded || !inputRef.current) return;
        const autocomplete = new window.google.maps.places.Autocomplete(
            inputRef.current,
            { types: ['address'], componentRestrictions: { country: 'us' } }
        );
        autocomplete.addListener('place_changed', () => {
            const place = autocomplete.getPlace();
            if (place.formatted_address) {
                setAddress(place.formatted_address);
            }
        });
        autocompleteRef.current = autocomplete;
    }, [scriptLoaded]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = address.trim();
        if (!trimmed) {
            setError('Please enter your address.');
            return;
        }
        setError(null);
        setLoading(true);
        setLegislators(null);
        try {
            const res = await fetch(
                `/api/legislators?address=${encodeURIComponent(trimmed)}`
            );
            const json = await res.json() as any;
            if (!res.ok) {
                const detail: string = json.detail ?? '';
                if (detail.toLowerCase().includes('no address') || detail.toLowerCase().includes('outside')) {
                    setError(
                        'This tool only looks up Arizona legislators. Please enter an Arizona address.'
                    );
                } else {
                    setError('Something went wrong. Please try again in a moment.');
                }
                return;
            }
            const results: Legislator[] = json.legislators ?? [];
            if (results.length === 0) {
                setError(
                    'No legislators found for that address. Make sure it is an Arizona address.'
                );
                return;
            }
            setLegislators(results);
        } catch {
            setError('Something went wrong. Please try again in a moment.');
        } finally {
            setLoading(false);
        }
    };

    const stateLegislators = legislators?.filter((l) =>
        l.office.toLowerCase().includes('arizona') ||
        l.office.toLowerCase().includes('state')
    ) ?? [];

    const federalLegislators = legislators?.filter(
        (l) => !stateLegislators.includes(l)
    ) ?? [];

    return (
        <>
            {/* Hero */}
            <div className='relative overflow-hidden bg-gradient-to-br from-brand-maroon via-brand-plum to-brand-maroon text-white'>
                <div className='absolute inset-0 opacity-10'>
                    <div
                        className='absolute inset-0'
                        style={{
                            backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(255,255,255,0.1) 35px, rgba(255,255,255,0.1) 70px)`,
                        }}
                    />
                    <div className='absolute top-20 left-10 w-96 h-96 bg-brand-orange rounded-full blur-3xl' />
                    <div className='absolute bottom-10 right-20 w-80 h-80 bg-brand-blue rounded-full blur-3xl' />
                </div>
                <div className='relative max-w-6xl mx-auto py-24 px-6'>
                    <div className='mb-6 inline-block'>
                        <div className='flex items-center gap-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-6 py-2'>
                            <div className='w-2 h-2 bg-brand-orange rounded-full animate-pulse' />
                            <span className='text-sm font-semibold tracking-wide uppercase text-brand-sand'>
                                Take Action
                            </span>
                        </div>
                    </div>
                    <h1 className='text-5xl md:text-7xl font-black mb-6 tracking-tight leading-none'>
                        Find Your{' '}
                        <span className='text-brand-orange'>Legislators</span>
                    </h1>
                    <p className='text-xl md:text-2xl text-brand-sand font-medium max-w-3xl leading-relaxed'>
                        Enter your Arizona address to find your state and federal
                        representatives — so you can contact them directly about
                        prison reform.
                    </p>
                </div>
            </div>

            {/* Search Section */}
            <main className='flex-grow py-20 px-6 bg-gradient-to-br from-slate-50 via-white to-brand-sand/10'>
                <div className='max-w-3xl mx-auto'>
                    <form onSubmit={handleSubmit} className='mb-10'>
                        <label
                            htmlFor='address-input'
                            className='block text-lg font-bold text-brand-maroon mb-3'
                        >
                            Your Arizona Address
                        </label>
                        <div className='flex gap-3'>
                            <input
                                id='address-input'
                                ref={inputRef}
                                type='text'
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                placeholder='123 Main St, Phoenix, AZ 85001'
                                className='flex-grow border-2 border-brand-sand rounded-lg px-4 py-3 text-lg focus:outline-none focus:border-brand-orange transition-colors'
                            />
                            <button
                                type='submit'
                                disabled={loading}
                                className='bg-brand-orange text-white px-6 py-3 rounded-lg font-bold text-lg hover:bg-brand-rust transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed'
                            >
                                {loading ? 'Searching…' : 'Find'}
                            </button>
                        </div>
                        {error && (
                            <p className='mt-3 text-red-600 font-medium'>{error}</p>
                        )}
                    </form>

                    {/* Results */}
                    {legislators && legislators.length > 0 && (
                        <div className='space-y-10'>
                            {stateLegislators.length > 0 && (
                                <section>
                                    <h2 className='text-2xl font-black text-brand-maroon mb-4'>
                                        State Legislators
                                    </h2>
                                    <div className='grid sm:grid-cols-2 gap-6'>
                                        {stateLegislators.map((leg, i) => (
                                            <LegislatorCard key={i} legislator={leg} />
                                        ))}
                                    </div>
                                </section>
                            )}
                            {federalLegislators.length > 0 && (
                                <section>
                                    <h2 className='text-2xl font-black text-brand-maroon mb-4'>
                                        Federal Representatives
                                    </h2>
                                    <div className='grid sm:grid-cols-2 gap-6'>
                                        {federalLegislators.map((leg, i) => (
                                            <LegislatorCard key={i} legislator={leg} />
                                        ))}
                                    </div>
                                </section>
                            )}
                        </div>
                    )}
                </div>
            </main>

            {/* Footer */}
            <footer className='bg-brand-maroon text-brand-sand py-10 px-6 text-center border-t-4 border-brand-orange'>
                <p className='mb-2 font-bold text-white'>
                    People Over Profits - AZ (POPAZ)
                </p>
                <p className='text-sm opacity-80'>Building a more just Arizona. © 2026</p>
            </footer>
        </>
    );
}

function LegislatorCard({ legislator }: { legislator: Legislator }) {
    const partyColor =
        legislator.party.toLowerCase().includes('democrat')
            ? 'bg-brand-blue'
            : legislator.party.toLowerCase().includes('republican')
            ? 'bg-brand-rust'
            : 'bg-brand-plum';

    return (
        <div className='bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all'>
            <div className='h-2 bg-gradient-to-r from-brand-orange to-brand-rust' />
            <div className='p-6'>
                <div className='flex items-start gap-4'>
                    {legislator.photoUrl ? (
                        <img
                            src={legislator.photoUrl}
                            alt={legislator.name}
                            className='w-16 h-16 rounded-full object-cover flex-shrink-0'
                        />
                    ) : (
                        <div className='w-16 h-16 rounded-full bg-brand-sand/30 flex items-center justify-center flex-shrink-0'>
                            <svg className='w-8 h-8 text-brand-maroon' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.5} d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' />
                            </svg>
                        </div>
                    )}
                    <div className='flex-grow'>
                        <h3 className='text-lg font-black text-brand-maroon'>
                            {legislator.name}
                        </h3>
                        <p className='text-sm text-gray-600 mb-2'>{legislator.office}</p>
                        <span className={`inline-block text-xs text-white font-bold px-2 py-0.5 rounded-full ${partyColor}`}>
                            {legislator.party}
                        </span>
                    </div>
                </div>
                <div className='mt-4 space-y-2'>
                    {legislator.phone && (
                        <a
                            href={`tel:${legislator.phone}`}
                            className='flex items-center gap-2 text-sm text-brand-maroon hover:text-brand-orange transition-colors'
                        >
                            <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z' />
                            </svg>
                            {legislator.phone}
                        </a>
                    )}
                    {legislator.website && (
                        <a
                            href={legislator.website}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='flex items-center gap-2 text-sm text-brand-orange font-semibold hover:text-brand-rust transition-colors'
                        >
                            <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14' />
                            </svg>
                            Visit Website
                        </a>
                    )}
                </div>
            </div>
        </div>
    );
}

export default FindRep;
