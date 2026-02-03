import { useState, useEffect } from 'react';

// Placeholder data structure for resources
const resourcesData = [
    {
        id: 1,
        title: 'Arizona Legislation Tracker',
        category: 'Legislative',
        description:
            'Stay informed about current and proposed legislation affecting prison reform and justice in Arizona. Track bills, voting records, and legislative sessions.',
        icon: 'legislation',
        status: 'Updated Weekly',
        lastUpdated: 'February 2026',
        link: '#',
    },
    {
        id: 2,
        title: 'State Representative Contact Information',
        category: 'Advocacy',
        description:
            'Direct contact information for Arizona state representatives and senators. Find your district representatives and learn how to effectively communicate your concerns.',
        icon: 'contact',
        status: 'Current Session',
        lastUpdated: 'January 2026',
        link: '#',
    },
    {
        id: 3,
        title: 'Social Media Activism Packet',
        category: 'Digital Organizing',
        description:
            'Comprehensive toolkit for social media advocacy including graphics, key messaging, hashtags, and best practices for amplifying our mission online.',
        icon: 'social',
        status: 'Ready to Use',
        lastUpdated: 'February 2026',
        link: '#',
    },
];

function Resources() {
    const [visibleCards, setVisibleCards] = useState<number[]>([]);

    useEffect(() => {
        // Stagger the animation of cards
        resourcesData.forEach((_, index) => {
            setTimeout(() => {
                setVisibleCards((prev) => [...prev, index]);
            }, index * 150);
        });
    }, []);

    const getIcon = (iconType: any) => {
        switch (iconType) {
            case 'legislation':
                return (
                    <svg
                        className='w-full h-full'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                    >
                        <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={1.5}
                            d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
                        />
                    </svg>
                );
            case 'contact':
                return (
                    <svg
                        className='w-full h-full'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                    >
                        <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={1.5}
                            d='M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z'
                        />
                    </svg>
                );
            case 'social':
                return (
                    <svg
                        className='w-full h-full'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                    >
                        <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={1.5}
                            d='M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z'
                        />
                    </svg>
                );
            default:
                return null;
        }
    };

    return (
        <>
            {/* Hero Section */}
            <div className='relative overflow-hidden bg-gradient-to-br from-brand-maroon via-brand-plum to-brand-maroon text-white'>
                {/* Decorative background - Modern diagonal stripes pattern */}
                <div className='absolute inset-0 opacity-10'>
                    <div
                        className='absolute inset-0'
                        style={{
                            backgroundImage: `repeating-linear-gradient(
                            45deg,
                            transparent,
                            transparent 35px,
                            rgba(255, 255, 255, 0.1) 35px,
                            rgba(255, 255, 255, 0.1) 70px
                        )`,
                        }}
                    ></div>
                    <div className='absolute top-20 left-10 w-96 h-96 bg-brand-orange rounded-full blur-3xl'></div>
                    <div className='absolute bottom-10 right-20 w-80 h-80 bg-brand-blue rounded-full blur-3xl'></div>
                </div>

                <div className='relative max-w-6xl mx-auto py-24 px-6'>
                    <div className='mb-6 inline-block'>
                        <div className='flex items-center gap-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-6 py-2'>
                            <div className='w-2 h-2 bg-brand-orange rounded-full animate-pulse'></div>
                            <span className='text-sm font-semibold tracking-wide uppercase text-brand-sand'>
                                Tools for Change
                            </span>
                        </div>
                    </div>

                    <h1 className='text-5xl md:text-7xl font-black mb-6 tracking-tight leading-none'>
                        Advocacy{' '}
                        <span className='text-brand-orange'>Resources</span>
                    </h1>

                    <p className='text-xl md:text-2xl text-brand-sand font-medium max-w-3xl mb-8 leading-relaxed'>
                        Essential tools and information to empower your activism
                        and drive meaningful change in Arizona's justice system.
                    </p>

                    <div className='grid md:grid-cols-3 gap-6 mt-12'>
                        <div className='bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all'>
                            <div className='text-4xl font-black text-brand-orange mb-2'>
                                {resourcesData.length}
                            </div>
                            <div className='text-sm text-brand-sand uppercase tracking-wider'>
                                Resource Categories
                            </div>
                        </div>
                        <div className='bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all'>
                            <div className='text-4xl font-black text-brand-blue mb-2'>
                                24/7
                            </div>
                            <div className='text-sm text-brand-sand uppercase tracking-wider'>
                                Access Available
                            </div>
                        </div>
                        <div className='bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all'>
                            <div className='text-4xl font-black text-brand-rust mb-2'>
                                Free
                            </div>
                            <div className='text-sm text-brand-sand uppercase tracking-wider'>
                                For All Advocates
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Resources Grid */}
            <main className='flex-grow py-20 px-6 bg-gradient-to-br from-slate-50 via-white to-brand-sand/10'>
                <div className='max-w-7xl mx-auto'>
                    {/* Section Introduction */}
                    <div className='max-w-3xl mb-16'>
                        <h2 className='text-3xl md:text-4xl font-black text-brand-maroon mb-4'>
                            Your Advocacy Toolkit
                        </h2>
                        <p className='text-lg text-gray-600 leading-relaxed'>
                            Access curated resources designed to amplify your
                            voice and maximize your impact in the fight for
                            justice reform.
                        </p>
                    </div>

                    {/* Resources Cards Grid */}
                    <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20'>
                        {resourcesData.map((resource, index) => (
                            <div
                                key={resource.id}
                                className={`group relative transition-all duration-700 ${
                                    visibleCards.includes(index)
                                        ? 'opacity-100 translate-y-0'
                                        : 'opacity-0 translate-y-8'
                                }`}
                            >
                                {/* Card Background with Gradient Border Effect */}
                                <div className='absolute inset-0 bg-gradient-to-br from-brand-orange via-brand-rust to-brand-plum rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm'></div>

                                {/* Main Card */}
                                <div className='relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 h-full flex flex-col'>
                                    {/* Icon Header Section */}
                                    <div className='relative overflow-hidden h-48 bg-gradient-to-br from-brand-maroon to-brand-plum flex items-center justify-center p-8'>
                                        {/* Diagonal stripe pattern overlay */}
                                        <div
                                            className='absolute inset-0 opacity-20'
                                            style={{
                                                backgroundImage: `repeating-linear-gradient(
                                                -45deg,
                                                transparent,
                                                transparent 20px,
                                                rgba(255, 255, 255, 0.1) 20px,
                                                rgba(255, 255, 255, 0.1) 40px
                                            )`,
                                            }}
                                        ></div>

                                        <div className='relative z-10 w-24 h-24 text-white transition-transform duration-300 group-hover:scale-110'>
                                            {getIcon(resource.icon)}
                                        </div>

                                        {/* Category badge */}
                                        <div className='absolute top-4 right-4'>
                                            <span className='inline-block bg-white/20 backdrop-blur-sm text-white text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border border-white/30'>
                                                {resource.category}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Content Section */}
                                    <div className='p-6 flex-grow flex flex-col'>
                                        {/* Resource Title */}
                                        <h3 className='text-xl md:text-2xl font-black text-brand-maroon mb-3 group-hover:text-brand-orange transition-colors'>
                                            {resource.title}
                                        </h3>

                                        {/* Description */}
                                        <p className='text-gray-700 leading-relaxed mb-4 flex-grow'>
                                            {resource.description}
                                        </p>

                                        {/* Meta Information */}
                                        <div className='space-y-2 pt-4 border-t border-gray-100'>
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
                                                        d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
                                                    />
                                                </svg>
                                                <span>{resource.status}</span>
                                            </div>
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
                                                        d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
                                                    />
                                                </svg>
                                                <span>
                                                    Updated{' '}
                                                    {resource.lastUpdated}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Access Link */}
                                        <a
                                            href={resource.link}
                                            className='mt-4 inline-flex items-center gap-2 text-brand-orange font-semibold hover:text-brand-rust transition-colors group/link'
                                        >
                                            <span>Access Resource</span>
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
                                    </div>

                                    {/* Animated accent bar */}
                                    <div className='h-1 bg-gradient-to-r from-brand-orange via-brand-rust to-brand-plum transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left'></div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Additional Resources Section */}
                    <div className='bg-white rounded-3xl p-8 md:p-12 shadow-lg border border-gray-100 mb-20'>
                        <h2 className='text-3xl md:text-4xl font-black text-brand-maroon mb-6'>
                            Additional Support
                        </h2>

                        <div className='grid md:grid-cols-2 gap-8'>
                            <div className='flex gap-4'>
                                <div className='flex-shrink-0'>
                                    <div className='w-12 h-12 bg-gradient-to-br from-brand-orange to-brand-rust rounded-lg flex items-center justify-center'>
                                        <svg
                                            className='w-6 h-6 text-white'
                                            fill='none'
                                            stroke='currentColor'
                                            viewBox='0 0 24 24'
                                        >
                                            <path
                                                strokeLinecap='round'
                                                strokeLinejoin='round'
                                                strokeWidth={2}
                                                d='M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253'
                                            />
                                        </svg>
                                    </div>
                                </div>
                                <div>
                                    <h3 className='text-xl font-bold text-brand-maroon mb-2'>
                                        Educational Materials
                                    </h3>
                                    <p className='text-gray-600'>
                                        In-depth guides, fact sheets, and
                                        research reports on prison reform
                                        issues.
                                    </p>
                                </div>
                            </div>

                            <div className='flex gap-4'>
                                <div className='flex-shrink-0'>
                                    <div className='w-12 h-12 bg-gradient-to-br from-brand-blue to-brand-plum rounded-lg flex items-center justify-center'>
                                        <svg
                                            className='w-6 h-6 text-white'
                                            fill='none'
                                            stroke='currentColor'
                                            viewBox='0 0 24 24'
                                        >
                                            <path
                                                strokeLinecap='round'
                                                strokeLinejoin='round'
                                                strokeWidth={2}
                                                d='M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z'
                                            />
                                        </svg>
                                    </div>
                                </div>
                                <div>
                                    <h3 className='text-xl font-bold text-brand-maroon mb-2'>
                                        Training Videos
                                    </h3>
                                    <p className='text-gray-600'>
                                        Step-by-step tutorials on advocacy
                                        tactics and community organizing
                                        strategies.
                                    </p>
                                </div>
                            </div>

                            <div className='flex gap-4'>
                                <div className='flex-shrink-0'>
                                    <div className='w-12 h-12 bg-gradient-to-br from-brand-rust to-brand-maroon rounded-lg flex items-center justify-center'>
                                        <svg
                                            className='w-6 h-6 text-white'
                                            fill='none'
                                            stroke='currentColor'
                                            viewBox='0 0 24 24'
                                        >
                                            <path
                                                strokeLinecap='round'
                                                strokeLinejoin='round'
                                                strokeWidth={2}
                                                d='M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z'
                                            />
                                        </svg>
                                    </div>
                                </div>
                                <div>
                                    <h3 className='text-xl font-bold text-brand-maroon mb-2'>
                                        Template Library
                                    </h3>
                                    <p className='text-gray-600'>
                                        Pre-written letters, emails, and social
                                        media posts ready for customization.
                                    </p>
                                </div>
                            </div>

                            <div className='flex gap-4'>
                                <div className='flex-shrink-0'>
                                    <div className='w-12 h-12 bg-gradient-to-br from-brand-orange to-brand-blue rounded-lg flex items-center justify-center'>
                                        <svg
                                            className='w-6 h-6 text-white'
                                            fill='none'
                                            stroke='currentColor'
                                            viewBox='0 0 24 24'
                                        >
                                            <path
                                                strokeLinecap='round'
                                                strokeLinejoin='round'
                                                strokeWidth={2}
                                                d='M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'
                                            />
                                        </svg>
                                    </div>
                                </div>
                                <div>
                                    <h3 className='text-xl font-bold text-brand-maroon mb-2'>
                                        Impact Reports
                                    </h3>
                                    <p className='text-gray-600'>
                                        Data and statistics documenting our
                                        collective progress and ongoing
                                        challenges.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Call to Action Section */}
                    <div className='bg-gradient-to-br from-brand-maroon via-brand-plum to-brand-maroon rounded-3xl p-12 text-center text-white relative overflow-hidden'>
                        {/* Background decoration - diagonal stripes */}
                        <div className='absolute inset-0 opacity-10'>
                            <div
                                className='absolute inset-0'
                                style={{
                                    backgroundImage: `repeating-linear-gradient(
                                    45deg,
                                    transparent,
                                    transparent 35px,
                                    rgba(255, 255, 255, 0.1) 35px,
                                    rgba(255, 255, 255, 0.1) 70px
                                )`,
                                }}
                            ></div>
                            <div className='absolute -top-20 -right-20 w-96 h-96 bg-brand-orange rounded-full blur-3xl'></div>
                            <div className='absolute -bottom-20 -left-20 w-96 h-96 bg-brand-blue rounded-full blur-3xl'></div>
                        </div>

                        <div className='relative z-10'>
                            <h2 className='text-3xl md:text-4xl font-black mb-4'>
                                Need More Resources?
                            </h2>
                            <p className='text-xl text-brand-sand mb-8 max-w-2xl mx-auto'>
                                We're constantly updating our resource library.
                                Have a suggestion or need specific materials?
                                Let us know.
                            </p>
                            <button className='bg-white text-brand-maroon px-8 py-4 rounded-lg font-bold text-lg hover:bg-brand-orange hover:text-white transition-all shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95'>
                                Request Resources
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

export default Resources;
