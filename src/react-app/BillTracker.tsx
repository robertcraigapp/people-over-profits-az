import { useEffect, useState } from 'react';
import type { BillResponse } from '../shared/billTypes';

const STATUS_LABELS: Record<number, string> = {
    1: 'Introduced',
    2: 'Engrossed',
    3: 'Enrolled',
    4: 'Passed',
    5: 'Vetoed',
    6: 'Failed / Dead',
};

const STATUS_COLORS: Record<number, string> = {
    1: 'bg-blue-100 text-blue-800',
    2: 'bg-yellow-100 text-yellow-800',
    3: 'bg-orange-100 text-orange-800',
    4: 'bg-green-100 text-green-800',
    5: 'bg-red-100 text-red-800',
    6: 'bg-gray-100 text-gray-700',
};

const POSITION_STYLES: Record<string, string> = {
    oppose: 'border-l-4 border-red-500',
    support: 'border-l-4 border-green-500',
    monitor: 'border-l-4 border-yellow-400',
};

const POSITION_LABELS: Record<string, string> = {
    oppose: 'POPAZ Opposes',
    support: 'POPAZ Supports',
    monitor: 'POPAZ Monitoring',
};

function BillCard({ bill: billResponse }: { bill: BillResponse }) {
    const { billNumber, popazInsight, popazPosition, bill } = billResponse;
    const positionStyle = POSITION_STYLES[popazPosition] ?? '';

    return (
        <div className={`bg-white rounded-lg shadow-md p-6 ${positionStyle}`}>
            <div className='flex items-start justify-between gap-4 flex-wrap'>
                <div>
                    <span className='font-display text-brand-maroon font-bold text-lg'>
                        {billNumber}
                    </span>
                    {bill && (
                        <h3 className='text-gray-900 font-semibold mt-1'>{bill.title}</h3>
                    )}
                </div>
                <div className='flex flex-col items-end gap-2'>
                    {bill && (
                        <span
                            className={`text-xs font-bold px-3 py-1 rounded-full ${STATUS_COLORS[bill.status] ?? 'bg-gray-100 text-gray-700'}`}
                        >
                            {STATUS_LABELS[bill.status] ?? 'Unknown Status'}
                        </span>
                    )}
                    <span className='text-xs font-semibold text-brand-maroon uppercase tracking-wide'>
                        {POSITION_LABELS[popazPosition]}
                    </span>
                </div>
            </div>

            <p className='mt-3 text-gray-700 text-sm'>{popazInsight}</p>

            {bill && bill.history.length > 0 && (
                <div className='mt-4'>
                    <h4 className='text-xs font-bold text-gray-500 uppercase tracking-wider mb-2'>
                        Recent Activity
                    </h4>
                    <ul className='space-y-1'>
                        {bill.history
                            .filter((h) => h.importance === 1)
                            .slice(-3)
                            .map((h, i) => (
                                <li key={i} className='text-xs text-gray-600'>
                                    <span className='text-gray-400 mr-2'>{h.date}</span>
                                    {h.action}
                                </li>
                            ))}
                    </ul>
                </div>
            )}

            {bill && (
                <div className='mt-4 flex gap-3'>
                    <a
                        href={bill.url}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='text-xs text-brand-blue hover:underline'
                    >
                        View on LegiScan →
                    </a>
                    {bill.state_link && (
                        <a
                            href={bill.state_link}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='text-xs text-brand-blue hover:underline'
                        >
                            View on AZ Legislature →
                        </a>
                    )}
                </div>
            )}

            {!bill && (
                <p className='mt-3 text-xs text-gray-400 italic'>
                    Bill details unavailable — data will refresh shortly.
                </p>
            )}
        </div>
    );
}

export default function BillTracker() {
    const [bills, setBills] = useState<BillResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetch('/api/bills')
            .then((r) => r.json())
            .then((data: { bills: BillResponse[] }) => {
                setBills(data.bills);
                setLoading(false);
            })
            .catch(() => {
                setError('Failed to load bill data. Please try again later.');
                setLoading(false);
            });
    }, []);

    return (
        <div className='min-h-screen bg-brand-cream'>
            <div className='max-w-4xl mx-auto px-6 py-12'>
                <h1 className='font-display text-4xl font-bold text-brand-maroon mb-3'>
                    Track the Bills
                </h1>
                <p className='text-gray-600 mb-8'>
                    POPAZ is monitoring these Arizona bills. Stay informed and take action.
                </p>

                {loading && (
                    <p className='text-gray-500'>Loading bill data...</p>
                )}

                {error && (
                    <p className='text-red-600'>{error}</p>
                )}

                {!loading && !error && bills.length === 0 && (
                    <p className='text-gray-500'>No bills are currently being tracked.</p>
                )}

                <div className='space-y-6'>
                    {bills.map((b) => (
                        <BillCard key={b.billNumber} bill={b} />
                    ))}
                </div>
            </div>
        </div>
    );
}
