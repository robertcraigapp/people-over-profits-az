import type { ReactNode } from 'react';

const POPAZ_MATERIALS_URL =
    'https://drive.google.com/drive/folders/1bmgqokylOaqsMwmARno_qugCjiszuLGy?usp=sharing';

// Each hub section gets a jump button at the top of the page
const SECTIONS = [{ id: 'resources', label: 'Resources' }];

function ExternalCard({
    href,
    title,
    children,
}: {
    href: string;
    title: string;
    children: ReactNode;
}) {
    return (
        <a
            href={href}
            target='_blank'
            rel='noopener noreferrer'
            className='group block bg-white rounded-2xl shadow-lg border border-gray-100 border-l-4 border-l-brand-orange p-6 hover:shadow-2xl transition-all'
        >
            <h3 className='font-display text-xl md:text-2xl font-bold text-brand-maroon mb-2 uppercase tracking-wide group-hover:text-brand-orange transition-colors'>
                {title}
            </h3>
            <div className='text-gray-700 leading-relaxed mb-3'>{children}</div>
            <span className='inline-flex items-center gap-2 text-brand-orange font-semibold'>
                Open
                <svg
                    className='w-4 h-4 transition-transform group-hover:translate-x-1'
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
            </span>
        </a>
    );
}

function SectionHeading({ children }: { children: ReactNode }) {
    return (
        <h2 className='font-display text-3xl md:text-4xl font-bold text-brand-maroon mb-8 uppercase tracking-wide'>
            {children}
        </h2>
    );
}

function Resources() {
    return (
        <>
            {/* Hero Section */}
            <div className='relative overflow-hidden bg-gradient-to-br from-brand-maroon via-brand-plum to-brand-maroon text-white'>
                <div className='absolute inset-0 opacity-10'>
                    <div className='absolute top-20 left-10 w-96 h-96 bg-brand-orange rounded-full blur-3xl'></div>
                    <div className='absolute bottom-10 right-20 w-80 h-80 bg-brand-blue rounded-full blur-3xl'></div>
                </div>

                <div className='relative max-w-6xl mx-auto py-24 px-6'>
                    <h1 className='font-display text-6xl md:text-8xl font-bold mb-6 tracking-tight leading-none uppercase'>
                        Coalition{' '}
                        <span className='text-brand-orange'>Resources</span>
                    </h1>

                    <p className='text-xl md:text-2xl text-brand-sand font-medium max-w-3xl mb-10 leading-relaxed'>
                        Materials, meetings, updates, and tools available to
                        POP AZ and the coalition.
                    </p>

                    <div className='flex flex-col sm:flex-row gap-4'>
                        {SECTIONS.map((section) => (
                            <a
                                key={section.id}
                                href={`#${section.id}`}
                                className='bg-white/10 border border-white/30 text-white px-8 py-4 rounded-lg font-bold text-lg uppercase tracking-wide text-center hover:bg-brand-orange hover:border-brand-orange transition-all'
                            >
                                {section.label}
                            </a>
                        ))}
                    </div>
                </div>
            </div>

            <main className='flex-grow py-20 px-6 bg-gradient-to-br from-slate-50 via-white to-brand-sand/10'>
                <div className='max-w-5xl mx-auto space-y-24'>
                    {/* Resources */}
                    <section id='resources' className='scroll-mt-28'>
                        <SectionHeading>Resources</SectionHeading>
                        <ExternalCard
                            href={POPAZ_MATERIALS_URL}
                            title='POP AZ Resources & Materials'
                        >
                            Our 1-page overview of POP AZ, our feasibility
                            study, and other POP AZ materials.
                        </ExternalCard>
                    </section>
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

export default Resources;
