// "How to get involved" path shown on the home page. Hash links use a plain
// <a> so the browser scrolls to the section on load.
const STEPS = [
    { label: 'Learn', href: '/resources' },
    { label: 'Attend a Meeting', href: '/resources#meetings' },
    { label: 'Join', href: '/join' },
    { label: 'Participate', href: '/signup' },
    { label: 'Take Action', href: '/resources#tools' },
];

function GetInvolvedSteps() {
    return (
        <section className='py-16 px-6 bg-white border-b border-gray-100'>
            <div className='max-w-6xl mx-auto'>
                <h2 className='font-display text-3xl md:text-4xl font-bold text-brand-maroon mb-10 uppercase tracking-wide text-center'>
                    How to Get Involved
                </h2>

                <ol className='flex flex-col md:flex-row items-stretch md:items-center gap-3 md:gap-0'>
                    {STEPS.map((step, index) => (
                        <li
                            key={step.label}
                            className='flex flex-col md:flex-row items-center md:flex-1'
                        >
                            <a
                                href={step.href}
                                className='group w-full flex md:flex-col items-center gap-4 md:gap-3 bg-gradient-to-br from-slate-50 to-brand-sand/10 border border-gray-100 rounded-2xl px-5 py-4 md:py-6 hover:shadow-lg hover:border-brand-orange transition-all'
                            >
                                <span className='w-10 h-10 bg-gradient-to-br from-brand-orange to-brand-rust text-white font-black rounded-full flex items-center justify-center flex-shrink-0'>
                                    {index + 1}
                                </span>
                                <span className='font-display font-bold text-brand-maroon uppercase tracking-wide text-center group-hover:text-brand-orange transition-colors'>
                                    {step.label}
                                </span>
                            </a>
                            {index < STEPS.length - 1 && (
                                <svg
                                    className='w-6 h-6 my-1 md:my-0 md:mx-2 text-brand-orange flex-shrink-0 rotate-90 md:rotate-0'
                                    fill='none'
                                    stroke='currentColor'
                                    viewBox='0 0 24 24'
                                    aria-hidden='true'
                                >
                                    <path
                                        strokeLinecap='round'
                                        strokeLinejoin='round'
                                        strokeWidth={2}
                                        d='M13 7l5 5m0 0l-5 5m5-5H6'
                                    />
                                </svg>
                            )}
                        </li>
                    ))}
                </ol>
            </div>
        </section>
    );
}

export default GetInvolvedSteps;
