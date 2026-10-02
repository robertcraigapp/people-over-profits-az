import { Link } from 'react-router';

const MEMBER_WAYS = [
    {
        title: 'Connect',
        text: 'Attend bi-monthly coalition meetings and build relationships with people and organizations working across Arizona.',
    },
    {
        title: 'Learn',
        text: "Exchange information, research, lived experience, tools, and resources related to POP AZ's priorities.",
    },
    {
        title: 'Collaborate',
        text: 'Participate in workgroups, cross-sector partnerships, community education, storytelling, or other collaborative projects.',
    },
    {
        title: 'Take Action',
        text: 'Engage in advocacy, public education, community outreach, and collective actions aligned with coalition priorities. Amplify voices, strategize as a collective, and help to shape the priorities and conversations.',
    },
];

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

                {/* What Membership Means */}
                <section className='max-w-6xl mx-auto mt-24'>
                    <div className='max-w-4xl mx-auto text-center mb-12'>
                        <h2 className='font-display text-3xl md:text-4xl font-bold text-brand-maroon mb-6 uppercase tracking-wide'>
                            What Does It Mean to Be a Coalition Member?
                        </h2>
                        <p className='text-xl font-bold text-brand-plum mb-4'>
                            Coalition membership is an invitation to
                            participate, not a requirement to do everything.
                        </p>
                        <p className='text-lg text-gray-700 leading-relaxed'>
                            POP AZ members engage in ways that align with their
                            experience, expertise, organizational capacity, and
                            interests. Some members participate regularly in
                            workgroups or advocacy efforts. Others contribute
                            expertise, amplify information, attend coalition
                            meetings, share resources, or collaborate when
                            opportunities align with their work.
                        </p>
                    </div>

                    <div className='grid sm:grid-cols-2 lg:grid-cols-4 gap-6'>
                        {MEMBER_WAYS.map((way) => (
                            <div
                                key={way.title}
                                className='bg-white rounded-2xl shadow-lg border border-gray-100 border-t-4 border-t-brand-orange p-6'
                            >
                                <h3 className='font-display text-2xl font-bold text-brand-maroon mb-3 uppercase tracking-wide'>
                                    {way.title}
                                </h3>
                                <p className='text-gray-700 leading-relaxed'>
                                    {way.text}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>
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
