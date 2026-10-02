import { useState, useEffect } from 'react';
import coalitionDataRaw from './CoalitionData.json';
import { CoalitionMember } from './types/CoalitionMember';

function Coalition() {
    const [visibleCards, setVisibleCards] = useState<number[]>([]);
    const coalitionData = coalitionDataRaw as CoalitionMember[];

    useEffect(() => {
        // Stagger the card animations on load
        coalitionData.forEach((_, index) => {
            setTimeout(() => {
                setVisibleCards((prev) => [...prev, index]);
            }, index * 100);
        });
    }, []);

    return (
        <>
            {/* Hero Section */}
            <div className='relative overflow-hidden bg-gradient-to-br from-brand-plum via-brand-rust to-brand-sand text-white'>
                {/* Decorative background elements */}
                <div className='absolute inset-0 opacity-10'>
                    <div className='absolute top-20 left-10 w-96 h-96 bg-brand-orange rounded-full blur-3xl'></div>
                    <div className='absolute bottom-10 right-20 w-80 h-80 bg-brand-blue rounded-full blur-3xl'></div>
                </div>

                <div className='relative max-w-6xl mx-auto py-24 px-6'>
                    <h1 className='font-display text-6xl md:text-8xl font-bold mb-6 tracking-tight leading-none uppercase'>
                        Our <span className='text-brand-blue'>Coalition</span>
                    </h1>

                    <p className='text-xl md:text-2xl text-brand-sand font-medium max-w-3xl mb-8 leading-relaxed'>
                        A powerful alliance of organizations united in the
                        mission to remove profit from Arizona's criminal legal
                        system — ending private prisons, predatory
                        communication fees, and the fines and fees that
                        criminalize poverty.
                    </p>

                    <div className='grid md:grid-cols-3 gap-6 mt-12'>
                        <div className='bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all'>
                            <div className='text-4xl font-black text-brand-orange mb-2'>
                                {coalitionData.length}
                            </div>
                            <div className='text-sm text-white uppercase tracking-wider'>
                                Coalition Partners
                            </div>
                        </div>
                        <div className='bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all'>
                            <div className='text-4xl font-black text-brand-orange mb-2'>
                                100+
                            </div>
                            <div className='text-sm text-white uppercase tracking-wider'>
                                Combined Years Experience
                            </div>
                        </div>
                        <div className='bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all'>
                            <div className='text-4xl font-black text-brand-orange mb-2'>
                                1
                            </div>
                            <div className='text-sm text-white uppercase tracking-wider'>
                                Unified Mission
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Coalition Members Grid */}
            <main className='flex-grow py-20 px-6 bg-gradient-to-br from-slate-50 via-white to-brand-sand/10'>
                <div className='max-w-7xl mx-auto'>
                    {/* Section Introduction */}
                    <div className='text-center mb-16'>
                        <h2 className='font-display text-3xl md:text-4xl font-bold text-brand-maroon mb-4 uppercase tracking-wide'>
                            Meet Our Partners
                        </h2>
                        <p className='text-lg text-gray-600 leading-relaxed max-w-3xl mx-auto'>
                            Each organization brings unique expertise,
                            perspective, and passion to our collective fight
                            against profiteering in Arizona's criminal legal
                            system.
                        </p>
                    </div>

                    {/* Members List */}
                    <ul className='grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto'>
                        {coalitionData.map((member, index) => (
                            <li
                                key={member.id}
                                className={`transition-all duration-700 ${
                                    visibleCards.includes(index)
                                        ? 'opacity-100 translate-y-0'
                                        : 'opacity-0 translate-y-8'
                                }`}
                            >
                                {member.website ? (
                                    <a
                                        href={member.website}
                                        target='_blank'
                                        rel='noopener noreferrer'
                                        className='group flex items-center justify-between gap-3 h-full bg-white rounded-xl px-5 py-4 shadow-sm border border-gray-100 border-l-4 border-l-brand-orange hover:shadow-lg hover:border-l-brand-rust transition-all'
                                    >
                                        <span className='font-bold text-brand-maroon group-hover:text-brand-orange transition-colors'>
                                            {member.name}
                                        </span>
                                        <svg
                                            className='w-4 h-4 flex-shrink-0 text-brand-orange transition-transform group-hover:translate-x-1'
                                            fill='none'
                                            stroke='currentColor'
                                            viewBox='0 0 24 24'
                                        >
                                            <path
                                                strokeLinecap='round'
                                                strokeLinejoin='round'
                                                strokeWidth={2}
                                                d='M9 5l7 7-7 7'
                                            />
                                        </svg>
                                    </a>
                                ) : (
                                    <div className='flex items-center h-full bg-white rounded-xl px-5 py-4 shadow-sm border border-gray-100 border-l-4 border-l-brand-sand'>
                                        <span className='font-bold text-brand-maroon'>
                                            {member.name}
                                        </span>
                                    </div>
                                )}
                            </li>
                        ))}
                    </ul>

                    {/* Call to Action Section */}
                    <div className='mt-24 bg-gradient-to-br from-brand-maroon via-brand-plum to-brand-maroon rounded-3xl p-12 text-center text-white relative overflow-hidden'>
                        {/* Background decoration */}
                        <div className='absolute inset-0 opacity-10'>
                            <div className='absolute -top-20 -right-20 w-96 h-96 bg-brand-orange rounded-full blur-3xl'></div>
                            <div className='absolute -bottom-20 -left-20 w-96 h-96 bg-brand-blue rounded-full blur-3xl'></div>
                        </div>

                        <div className='relative z-10'>
                            <h2 className='font-display text-3xl md:text-4xl font-bold mb-4 uppercase tracking-wide'>
                                Join Our Coalition
                            </h2>
                            <p className='text-xl text-brand-sand mb-8 max-w-2xl mx-auto'>
                                Interested in partnering with us? Together, we
                                can build a more just Arizona.
                            </p>
                            <button className='bg-white text-brand-maroon px-8 py-4 rounded-lg font-bold text-lg hover:bg-brand-orange hover:text-white transition-all shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95'>
                                Get Involved
                            </button>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className='bg-brand-plum text-brand-sand py-10 px-6 text-center border-t-4 border-brand-orange'>
                <p className='mb-2 font-bold text-white'>
                    People Over Profits - AZ (POPAZ)
                </p>
                <p className='text-sm opacity-80'>
                    Building a more just Arizona. © 2026
                </p>
            </footer>
        </>
    );
}

export default Coalition;
