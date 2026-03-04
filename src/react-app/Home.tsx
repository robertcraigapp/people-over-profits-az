import { Link } from 'react-router';

function Home() {
    return (
        <>
            <main className='flex-grow'>
                {/* Hero Section */}
                <div className='relative overflow-hidden bg-gradient-to-br from-brand-plum via-brand-rust to-brand-sand text-white'>
                    {/* Decorative background elements */}
                    <div className='absolute inset-0 opacity-10'>
                        <div className='absolute top-20 left-10 w-96 h-96 bg-brand-orange rounded-full blur-3xl'></div>
                        <div className='absolute bottom-10 right-20 w-80 h-80 bg-brand-blue rounded-full blur-3xl'></div>
                    </div>

                    <div className='relative max-w-6xl mx-auto py-28 px-6 text-center'>
                        <h1 className='font-display text-6xl md:text-8xl font-bold mb-6 tracking-tight leading-none uppercase'>
                            People Over{' '}
                            <span className='text-brand-blue'>Profits</span>
                        </h1>

                        <p className='text-xl md:text-2xl text-brand-sand font-medium mb-10 max-w-2xl mx-auto leading-relaxed'>
                            Eliminate Profiteering from Arizona's Criminal Legal
                            System.
                        </p>

                        <div className='flex flex-col sm:flex-row gap-4 justify-center'>
                            <Link
                                to='/signup'
                                className='bg-brand-blue text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-brand-blue transition-all shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95'
                            >
                                Join the Fight
                            </Link>
                            <Link
                                to='/coalition'
                                className='bg-brand-maroon border border-white/30 text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-brand-rust transition-all backdrop-blur-sm'
                            >
                                Our Coalition
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Info Grid */}
                <section className='py-20 px-6 bg-gradient-to-br from-slate-50 via-white to-brand-sand/10'>
                    <div className='max-w-7xl mx-auto'>
                        <div className='text-center mb-14'>
                            <h2 className='font-display text-3xl md:text-4xl font-bold text-brand-maroon mb-3 uppercase tracking-wide'>
                                What We Stand For
                            </h2>
                            <p className='text-gray-600 text-lg max-w-2xl mx-auto'>
                                A unified front demanding accountability,
                                equity, and justice in Arizona's prison system.
                            </p>
                        </div>

                        <div className='grid md:grid-cols-3 gap-8'>
                            {/* The Issue */}
                            <div className='group bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300'>
                                <div className='h-1.5 bg-gradient-to-r from-brand-blue to-brand-plum'></div>
                                <div className='p-8'>
                                    <div className='w-12 h-12 bg-brand-blue/10 rounded-xl flex items-center justify-center mb-5 group-hover:bg-brand-blue/20 transition-colors'>
                                        <svg
                                            className='w-6 h-6 text-brand-blue'
                                            fill='none'
                                            stroke='currentColor'
                                            viewBox='0 0 24 24'
                                        >
                                            <path
                                                strokeLinecap='round'
                                                strokeLinejoin='round'
                                                strokeWidth={1.5}
                                                d='M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z'
                                            />
                                        </svg>
                                    </div>
                                    <h3 className='font-display text-xl font-bold text-brand-maroon mb-3 uppercase tracking-wide'>
                                        The Issue
                                    </h3>
                                    <p className='text-gray-600 leading-relaxed'>
                                        For-profit incarceration prioritizes
                                        shareholder returns over human dignity,
                                        harming Arizona communities and
                                        perpetuating cycles of injustice.
                                    </p>
                                </div>
                            </div>

                            {/* The Mission */}
                            <div className='group bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300'>
                                <div className='h-1.5 bg-gradient-to-r from-brand-rust to-brand-orange'></div>
                                <div className='p-8'>
                                    <div className='w-12 h-12 bg-brand-rust/10 rounded-xl flex items-center justify-center mb-5 group-hover:bg-brand-rust/20 transition-colors'>
                                        <svg
                                            className='w-6 h-6 text-brand-rust'
                                            fill='none'
                                            stroke='currentColor'
                                            viewBox='0 0 24 24'
                                        >
                                            <path
                                                strokeLinecap='round'
                                                strokeLinejoin='round'
                                                strokeWidth={1.5}
                                                d='M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z'
                                            />
                                        </svg>
                                    </div>
                                    <h3 className='font-display text-xl font-bold text-brand-maroon mb-3 uppercase tracking-wide'>
                                        The Mission
                                    </h3>
                                    <p className='text-gray-600 leading-relaxed'>
                                        Our roadmap to legislative change in the
                                        Grand Canyon State — through coalition
                                        building, community organizing, and
                                        direct advocacy.
                                    </p>
                                </div>
                            </div>

                            {/* Take Action */}
                            <div className='group bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300'>
                                <div className='h-1.5 bg-gradient-to-r from-brand-orange to-brand-rust'></div>
                                <div className='p-8'>
                                    <div className='w-12 h-12 bg-brand-orange/10 rounded-xl flex items-center justify-center mb-5 group-hover:bg-brand-orange/20 transition-colors'>
                                        <svg
                                            className='w-6 h-6 text-brand-orange'
                                            fill='none'
                                            stroke='currentColor'
                                            viewBox='0 0 24 24'
                                        >
                                            <path
                                                strokeLinecap='round'
                                                strokeLinejoin='round'
                                                strokeWidth={1.5}
                                                d='M13 10V3L4 14h7v7l9-11h-7z'
                                            />
                                        </svg>
                                    </div>
                                    <h3 className='font-display text-xl font-bold text-brand-maroon mb-3 uppercase tracking-wide'>
                                        Take Action
                                    </h3>
                                    <p className='text-gray-600 leading-relaxed'>
                                        How you can help us mobilize across
                                        Arizona counties — from contacting
                                        legislators to joining our growing
                                        coalition.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className='bg-brand-plum text-brand-sand py-10 px-6 text-center border-t-4 border-brand-orange'>
                <p className='mb-2 font-bold text-white tracking-wide'>
                    People Over Profits — AZ (POPAZ)
                </p>
                <p className='text-sm opacity-70'>
                    Building a more just Arizona. © 2026
                </p>
            </footer>
        </>
    );
}

export default Home;
