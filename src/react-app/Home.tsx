function Home() {
    return (
        <>
            {/* Hero Section */}
            <main className='flex-grow'>
                <div className='bg-brand-maroon text-white py-20 px-6'>
                    <div className='max-w-4xl mx-auto text-center'>
                        <h1 className='text-4xl md:text-6xl font-black mb-6 tracking-tight'>
                            PEOPLE OVER{' '}
                            <span className='text-brand-orange'>PROFITS</span>
                        </h1>
                        <p className='text-xl md:text-2xl text-brand-sand font-medium mb-8'>
                            Abolish Private Prisons in Arizona.
                        </p>
                        <div className='bg-brand-plum/30 border border-brand-plum p-6 rounded-lg inline-block'>
                            <p className='text-lg italic'>
                                "Stay tuned for changes in Arizona."
                            </p>
                        </div>
                    </div>
                </div>
                {/* Info Grid */}
                <section className='max-w-7xl mx-auto py-16 px-6 grid md:grid-cols-3 gap-8'>
                    <div className='border-l-4 border-brand-blue p-6 bg-slate-50'>
                        <h3 className='font-bold text-brand-maroon text-xl mb-2'>
                            The Issue
                        </h3>
                        <p className='text-gray-700'>
                            Explaining why for-profit incarceration harms our
                            communities.
                        </p>
                    </div>
                    <div className='border-l-4 border-brand-rust p-6 bg-slate-50'>
                        <h3 className='font-bold text-brand-maroon text-xl mb-2'>
                            The Mission
                        </h3>
                        <p className='text-gray-700'>
                            Our roadmap to legislative change in the Grand
                            Canyon State.
                        </p>
                    </div>
                    <div className='border-l-4 border-brand-orange p-6 bg-slate-50'>
                        <h3 className='font-bold text-brand-maroon text-xl mb-2'>
                            Take Action
                        </h3>
                        <p className='text-gray-700'>
                            How you can help us mobilize across Arizona
                            counties.
                        </p>
                    </div>
                </section>
            </main>
            {/* Footer */}
            <footer className='bg-brand-maroon text-brand-sand py-10 px-6 text-center'>
                <p className='mb-2 font-bold text-white'>
                    Abolish Private Prisons (POPAZ)
                </p>
                <p className='text-sm opacity-80'>
                    Building a more just Arizona. © 2026
                </p>
            </footer>
        </>
    );
}

export default Home;
