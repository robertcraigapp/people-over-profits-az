import { Link } from 'react-router';

function Join() {
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
                        Join the{' '}
                        <span className='text-brand-orange'>Coalition</span>
                    </h1>

                    <p className='text-xl md:text-2xl text-brand-sand font-medium max-w-3xl mb-10 leading-relaxed'>
                        People Over Profits AZ is stronger when more people are
                        at the table united toward the same goal in eliminating
                        profiteering in justice.
                    </p>

                    <Link
                        to='/signup'
                        className='inline-block bg-brand-blue text-white px-10 py-5 rounded-lg font-bold text-xl uppercase tracking-wide shadow-xl hover:shadow-2xl hover:bg-brand-rust transition-all hover:scale-105 active:scale-95'
                    >
                        Become a Member
                    </Link>
                </div>
            </div>

            <main className='flex-grow py-20 px-6 bg-gradient-to-br from-slate-50 via-white to-brand-sand/10'>
                <div className='max-w-4xl mx-auto'>
                    {/* Introduction */}
                    <section className='space-y-6 text-lg text-gray-700 leading-relaxed'>
                        <p>
                            People Over Profits Arizona (POP AZ) brings together
                            organizations, advocates, community members, people
                            directly impacted by the criminal legal system, and
                            other partners who share a commitment to challenging
                            the ways profit and revenue generation can undermine
                            justice.
                        </p>
                        <p>
                            Together, coalition members build relationships,
                            share knowledge and resources, identify
                            opportunities for collective action, and strengthen
                            efforts already happening across Arizona.
                        </p>
                        <p className='font-display text-2xl font-bold text-brand-maroon uppercase tracking-wide'>
                            There is a place for you in this work.
                        </p>
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

export default Join;
