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
            <div className='relative overflow-hidden bg-gradient-to-br from-brand-maroon via-brand-plum to-brand-maroon text-white'>
                {/* Decorative background elements */}
                <div className='absolute inset-0 opacity-10'>
                    <div className='absolute top-20 left-10 w-96 h-96 bg-brand-orange rounded-full blur-3xl'></div>
                    <div className='absolute bottom-10 right-20 w-80 h-80 bg-brand-blue rounded-full blur-3xl'></div>
                </div>

                <div className='relative max-w-6xl mx-auto py-24 px-6'>
                    <div className='mb-6 inline-block'>
                        <div className='flex items-center gap-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-6 py-2'>
                            <div className='w-2 h-2 bg-brand-orange rounded-full animate-pulse'></div>
                            <span className='text-sm font-semibold tracking-wide uppercase text-brand-sand'>
                                United for Change
                            </span>
                        </div>
                    </div>

                    <h1 className='text-5xl md:text-7xl font-black mb-6 tracking-tight leading-none'>
                        Our <span className='text-brand-orange'>Coalition</span>
                    </h1>

                    <p className='text-xl md:text-2xl text-brand-sand font-medium max-w-3xl mb-8 leading-relaxed'>
                        A powerful alliance of organizations united in the
                        mission to abolish private prisons and build a more just
                        Arizona.
                    </p>

                    <div className='grid md:grid-cols-3 gap-6 mt-12'>
                        <div className='bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all'>
                            <div className='text-4xl font-black text-brand-orange mb-2'>
                                {coalitionData.length}
                            </div>
                            <div className='text-sm text-brand-sand uppercase tracking-wider'>
                                Partner Organizations
                            </div>
                        </div>
                        <div className='bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all'>
                            <div className='text-4xl font-black text-brand-blue mb-2'>
                                100+
                            </div>
                            <div className='text-sm text-brand-sand uppercase tracking-wider'>
                                Combined Years Experience
                            </div>
                        </div>
                        <div className='bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all'>
                            <div className='text-4xl font-black text-brand-rust mb-2'>
                                1
                            </div>
                            <div className='text-sm text-brand-sand uppercase tracking-wider'>
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
                    <div className='max-w-3xl mb-16'>
                        <h2 className='text-3xl md:text-4xl font-black text-brand-maroon mb-4'>
                            Meet Our Partners
                        </h2>
                        <p className='text-lg text-gray-600 leading-relaxed'>
                            Each organization brings unique expertise,
                            perspective, and passion to our collective fight for
                            justice reform in Arizona.
                        </p>
                    </div>

                    {/* Members Grid - Asymmetric Masonry Style */}
                    <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-8'>
                        {coalitionData.map((member, index) => (
                            <div
                                key={member.id}
                                className={`group relative transition-all duration-700 ${
                                    visibleCards.includes(index)
                                        ? 'opacity-100 translate-y-0'
                                        : 'opacity-0 translate-y-8'
                                } ${index % 5 === 0 ? 'lg:col-span-2' : ''}`}
                            >
                                {/* Card Background with Gradient Border Effect */}
                                <div className='absolute inset-0 bg-gradient-to-br from-brand-orange via-brand-rust to-brand-plum rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm'></div>

                                {/* Main Card */}
                                <div className='relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 h-full flex flex-col'>
                                    {/* Logo Section */}
                                    <div
                                        className={`relative overflow-hidden ${
                                            index % 5 === 0 ? 'h-64' : 'h-48'
                                        } bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-8 border-b border-gray-200`}
                                    >
                                        <div className='absolute inset-0 opacity-5 bg-gradient-to-br from-brand-blue via-brand-plum to-brand-orange'></div>
                                        <img
                                            src={member.logo}
                                            alt={`${member.name} logo`}
                                            className='relative z-10 max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-110'
                                        />

                                        {/* Hover overlay */}
                                        <div className='absolute inset-0 bg-brand-maroon/0 group-hover:bg-brand-maroon/5 transition-colors duration-300'></div>
                                    </div>

                                    {/* Content Section */}
                                    <div className='p-6 flex-grow flex flex-col'>
                                        {/* Focus Area Tag */}
                                        <div className='mb-3'>
                                            <span className='inline-block bg-brand-orange/10 text-brand-orange text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full'>
                                                {member.focusArea}
                                            </span>
                                        </div>

                                        {/* Organization Name */}
                                        <h3 className='text-xl md:text-2xl font-black text-brand-maroon mb-3 group-hover:text-brand-orange transition-colors'>
                                            {member.name}
                                        </h3>

                                        {/* Description */}
                                        <p className='text-gray-700 leading-relaxed mb-4 flex-grow'>
                                            {member.description}
                                        </p>

                                        {/* Meta Information */}
                                        <div className='space-y-2 pt-4 border-t border-gray-100'>
                                            {member.founded && (
                                                <div className='flex items-center gap-2 text-sm text-gray-600'>
                                                    <svg
                                                        className='w-4 h-4 text-brand-blue'
                                                        fill='none'
                                                        stroke='currentColor'
                                                        viewBox='0 0 24 24'
                                                    >
                                                        <path
                                                            strokeLinecap='round'
                                                            strokeLinejoin='round'
                                                            strokeWidth={2}
                                                            d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
                                                        />
                                                    </svg>
                                                    <span>
                                                        Founded {member.founded}
                                                    </span>
                                                </div>
                                            )}
                                            {member.location && (
                                                <div className='flex items-center gap-2 text-sm text-gray-600'>
                                                    <svg
                                                        className='w-4 h-4 text-brand-rust'
                                                        fill='none'
                                                        stroke='currentColor'
                                                        viewBox='0 0 24 24'
                                                    >
                                                        <path
                                                            strokeLinecap='round'
                                                            strokeLinejoin='round'
                                                            strokeWidth={2}
                                                            d='M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z'
                                                        />
                                                        <path
                                                            strokeLinecap='round'
                                                            strokeLinejoin='round'
                                                            strokeWidth={2}
                                                            d='M15 11a3 3 0 11-6 0 3 3 0 016 0z'
                                                        />
                                                    </svg>
                                                    <span>
                                                        {member.location}
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Website Link */}
                                        {member.website && (
                                            <a
                                                href={member.website}
                                                target='_blank'
                                                rel='noopener noreferrer'
                                                className='mt-4 inline-flex items-center gap-2 text-brand-orange font-semibold hover:text-brand-rust transition-colors group/link'
                                            >
                                                <span>Learn More</span>
                                                <svg
                                                    className='w-4 h-4 transition-transform group-hover/link:translate-x-1'
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
                                        )}
                                    </div>

                                    {/* Animated accent bar */}
                                    <div className='h-1 bg-gradient-to-r from-brand-orange via-brand-rust to-brand-plum transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left'></div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Call to Action Section */}
                    <div className='mt-24 bg-gradient-to-br from-brand-maroon via-brand-plum to-brand-maroon rounded-3xl p-12 text-center text-white relative overflow-hidden'>
                        {/* Background decoration */}
                        <div className='absolute inset-0 opacity-10'>
                            <div className='absolute -top-20 -right-20 w-96 h-96 bg-brand-orange rounded-full blur-3xl'></div>
                            <div className='absolute -bottom-20 -left-20 w-96 h-96 bg-brand-blue rounded-full blur-3xl'></div>
                        </div>

                        <div className='relative z-10'>
                            <h2 className='text-3xl md:text-4xl font-black mb-4'>
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
            <footer className='bg-brand-maroon text-brand-sand py-10 px-6 text-center border-t-4 border-brand-orange'>
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
