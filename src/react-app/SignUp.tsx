import { useState } from 'react';

function SignUp() {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        zipCode: '',
        interests: [],
        volunteer: '',
        hearAbout: '',
    });

    const handleInputChange = (e: any) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = (e: any) => {
        e.preventDefault();
        // Form submission logic will go here
        console.log('Form submitted:', formData);
    };

    return (
        <>
            {/* Hero Section */}
            <div className='relative overflow-hidden bg-gradient-to-br from-brand-maroon via-brand-plum to-brand-maroon text-white'>
                {/* Decorative background - Modern hexagonal pattern */}
                <div className='absolute inset-0 opacity-10'>
                    <div
                        className='absolute inset-0'
                        style={{
                            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l25.98 15v30L30 60 4.02 45V15z' fill='none' stroke='%23ffffff' stroke-width='1' opacity='0.3'/%3E%3C/svg%3E")`,
                            backgroundSize: '60px 60px',
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
                                Join the Movement
                            </span>
                        </div>
                    </div>

                    <h1 className='text-5xl md:text-7xl font-black mb-6 tracking-tight leading-none'>
                        Stay{' '}
                        <span className='text-brand-orange'>Connected</span>
                    </h1>

                    <p className='text-xl md:text-2xl text-brand-sand font-medium max-w-3xl mb-8 leading-relaxed'>
                        Join our mailing list to receive updates on advocacy
                        opportunities, upcoming events, and critical
                        developments in Arizona's fight for justice reform.
                    </p>

                    <div className='grid md:grid-cols-3 gap-6 mt-12'>
                        <div className='bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all'>
                            <div className='text-4xl font-black text-brand-orange mb-2'>
                                5K+
                            </div>
                            <div className='text-sm text-brand-sand uppercase tracking-wider'>
                                Active Subscribers
                            </div>
                        </div>
                        <div className='bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all'>
                            <div className='text-4xl font-black text-brand-blue mb-2'>
                                Weekly
                            </div>
                            <div className='text-sm text-brand-sand uppercase tracking-wider'>
                                Action Updates
                            </div>
                        </div>
                        <div className='bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all'>
                            <div className='text-4xl font-black text-brand-rust mb-2'>
                                100%
                            </div>
                            <div className='text-sm text-brand-sand uppercase tracking-wider'>
                                Privacy Protected
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Form Section */}
            <main className='flex-grow py-20 px-6 bg-gradient-to-br from-slate-50 via-white to-brand-sand/10'>
                <div className='max-w-4xl mx-auto'>
                    {/* Form Container */}
                    <div className='bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden'>
                        {/* Form Header */}
                        <div className='bg-gradient-to-r from-brand-maroon via-brand-plum to-brand-rust p-8 md:p-12 relative overflow-hidden'>
                            {/* Hexagonal pattern overlay */}
                            <div
                                className='absolute inset-0 opacity-20'
                                style={{
                                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 0l17.32 10v20L20 40 2.68 30V10z' fill='none' stroke='%23ffffff' stroke-width='1'/%3E%3C/svg%3E")`,
                                    backgroundSize: '40px 40px',
                                }}
                            ></div>

                            <div className='relative'>
                                <h2 className='text-3xl md:text-4xl font-black text-white mb-3'>
                                    Sign Up Today
                                </h2>
                                <p className='text-brand-sand text-lg'>
                                    Your voice matters. Join thousands of
                                    Arizonans working toward justice reform.
                                </p>
                            </div>
                        </div>

                        {/* Form Content */}
                        <form onSubmit={handleSubmit} className='p-8 md:p-12'>
                            {/* Personal Information Section */}
                            <div className='mb-10'>
                                <h3 className='text-2xl font-black text-brand-maroon mb-6 flex items-center gap-3'>
                                    <div className='w-8 h-8 bg-gradient-to-br from-brand-orange to-brand-rust rounded-lg flex items-center justify-center flex-shrink-0'>
                                        <span className='text-white font-black text-sm'>
                                            1
                                        </span>
                                    </div>
                                    Personal Information
                                </h3>

                                <div className='grid md:grid-cols-2 gap-6'>
                                    {/* First Name */}
                                    <div>
                                        <label
                                            htmlFor='firstName'
                                            className='block text-sm font-bold text-gray-700 mb-2'
                                        >
                                            First Name{' '}
                                            <span className='text-brand-orange'>
                                                *
                                            </span>
                                        </label>
                                        <input
                                            type='text'
                                            id='firstName'
                                            name='firstName'
                                            value={formData.firstName}
                                            onChange={handleInputChange}
                                            required
                                            className='w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-brand-orange focus:outline-none focus:ring-2 focus:ring-brand-orange/20 transition-all'
                                            placeholder='Jane'
                                        />
                                    </div>

                                    {/* Last Name */}
                                    <div>
                                        <label
                                            htmlFor='lastName'
                                            className='block text-sm font-bold text-gray-700 mb-2'
                                        >
                                            Last Name{' '}
                                            <span className='text-brand-orange'>
                                                *
                                            </span>
                                        </label>
                                        <input
                                            type='text'
                                            id='lastName'
                                            name='lastName'
                                            value={formData.lastName}
                                            onChange={handleInputChange}
                                            required
                                            className='w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-brand-orange focus:outline-none focus:ring-2 focus:ring-brand-orange/20 transition-all'
                                            placeholder='Doe'
                                        />
                                    </div>

                                    {/* Email */}
                                    <div>
                                        <label
                                            htmlFor='email'
                                            className='block text-sm font-bold text-gray-700 mb-2'
                                        >
                                            Email Address{' '}
                                            <span className='text-brand-orange'>
                                                *
                                            </span>
                                        </label>
                                        <input
                                            type='email'
                                            id='email'
                                            name='email'
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            required
                                            className='w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-brand-orange focus:outline-none focus:ring-2 focus:ring-brand-orange/20 transition-all'
                                            placeholder='jane.doe@example.com'
                                        />
                                    </div>

                                    {/* Phone */}
                                    <div>
                                        <label
                                            htmlFor='phone'
                                            className='block text-sm font-bold text-gray-700 mb-2'
                                        >
                                            Phone Number (Optional)
                                        </label>
                                        <input
                                            type='tel'
                                            id='phone'
                                            name='phone'
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            className='w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-brand-orange focus:outline-none focus:ring-2 focus:ring-brand-orange/20 transition-all'
                                            placeholder='(555) 123-4567'
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Volunteer Interest Section */}
                            <div className='mb-10'>
                                <h3 className='text-2xl font-black text-brand-maroon mb-6 flex items-center gap-3'>
                                    <div className='w-8 h-8 bg-gradient-to-br from-brand-rust to-brand-orange rounded-lg flex items-center justify-center flex-shrink-0'>
                                        <span className='text-white font-black text-sm'>
                                            2
                                        </span>
                                    </div>
                                    Get Involved
                                </h3>

                                <div className='mb-6'>
                                    <label
                                        htmlFor='volunteer'
                                        className='block text-sm font-bold text-gray-700 mb-2'
                                    >
                                        Are you interested in volunteering?
                                    </label>
                                    <select
                                        id='volunteer'
                                        name='volunteer'
                                        value={formData.volunteer}
                                        onChange={handleInputChange}
                                        className='w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-brand-orange focus:outline-none focus:ring-2 focus:ring-brand-orange/20 transition-all bg-white'
                                    >
                                        <option value=''>
                                            Select an option
                                        </option>
                                        <option value='yes-immediately'>
                                            Yes, contact me immediately
                                        </option>
                                        <option value='yes-future'>
                                            Yes, but in the future
                                        </option>
                                        <option value='maybe'>
                                            Maybe, tell me more
                                        </option>
                                        <option value='no'>
                                            Not at this time
                                        </option>
                                    </select>
                                </div>

                                <div>
                                    <label
                                        htmlFor='hearAbout'
                                        className='block text-sm font-bold text-gray-700 mb-2'
                                    >
                                        How did you hear about us?
                                    </label>
                                    <select
                                        id='hearAbout'
                                        name='hearAbout'
                                        value={formData.hearAbout}
                                        onChange={handleInputChange}
                                        className='w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-brand-orange focus:outline-none focus:ring-2 focus:ring-brand-orange/20 transition-all bg-white'
                                    >
                                        <option value=''>
                                            Select an option
                                        </option>
                                        <option value='social-media'>
                                            Social Media
                                        </option>
                                        <option value='friend'>
                                            Friend or Family
                                        </option>
                                        <option value='event'>
                                            Event or Rally
                                        </option>
                                        <option value='news'>
                                            News Article
                                        </option>
                                        <option value='search'>
                                            Web Search
                                        </option>
                                        <option value='coalition'>
                                            Coalition Partner
                                        </option>
                                        <option value='other'>Other</option>
                                    </select>
                                </div>
                            </div>

                            {/* Privacy Notice */}
                            <div className='mb-8 p-6 bg-gradient-to-br from-brand-sand/20 to-brand-orange/10 border-l-4 border-brand-orange rounded-lg'>
                                <div className='flex gap-4'>
                                    <div className='flex-shrink-0'>
                                        <svg
                                            className='w-6 h-6 text-brand-orange'
                                            fill='none'
                                            stroke='currentColor'
                                            viewBox='0 0 24 24'
                                        >
                                            <path
                                                strokeLinecap='round'
                                                strokeLinejoin='round'
                                                strokeWidth={2}
                                                d='M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z'
                                            />
                                        </svg>
                                    </div>
                                    <div>
                                        <h4 className='font-bold text-brand-maroon mb-2'>
                                            Privacy & Data Protection
                                        </h4>
                                        <p className='text-sm text-gray-700 leading-relaxed'>
                                            We respect your privacy. Your
                                            information will only be used to
                                            send you updates about our mission
                                            and will never be sold or shared
                                            with third parties. You can
                                            unsubscribe at any time.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <div className='flex flex-col sm:flex-row gap-4 items-center justify-between'>
                                <p className='text-sm text-gray-600'>
                                    <span className='text-brand-orange'>*</span>{' '}
                                    Required fields
                                </p>

                                <button
                                    type='submit'
                                    className='w-full sm:w-auto bg-gradient-to-r from-brand-maroon via-brand-plum to-brand-rust text-white px-10 py-4 rounded-lg font-bold text-lg hover:shadow-2xl transition-all hover:scale-105 active:scale-95 relative overflow-hidden group'
                                >
                                    {/* Hexagonal pattern on hover */}
                                    <div
                                        className='absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity'
                                        style={{
                                            backgroundImage: `url("data:image/svg+xml,%3Csvg width='30' height='30' viewBox='0 0 30 30' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M15 0l12.99 7.5v15L15 30 2.01 22.5v-15z' fill='%23ffffff'/%3E%3C/svg%3E")`,
                                            backgroundSize: '30px 30px',
                                        }}
                                    ></div>

                                    <span className='relative flex items-center gap-2 justify-center'>
                                        Join the Movement
                                        <svg
                                            className='w-5 h-5'
                                            fill='none'
                                            stroke='currentColor'
                                            viewBox='0 0 24 24'
                                        >
                                            <path
                                                strokeLinecap='round'
                                                strokeLinejoin='round'
                                                strokeWidth={2}
                                                d='M13 7l5 5m0 0l-5 5m5-5H6'
                                            />
                                        </svg>
                                    </span>
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Benefits Section */}
                    <div className='mt-16 grid md:grid-cols-3 gap-8'>
                        <div className='text-center'>
                            <div className='w-16 h-16 bg-gradient-to-br from-brand-orange to-brand-rust rounded-full flex items-center justify-center mx-auto mb-4'>
                                <svg
                                    className='w-8 h-8 text-white'
                                    fill='none'
                                    stroke='currentColor'
                                    viewBox='0 0 24 24'
                                >
                                    <path
                                        strokeLinecap='round'
                                        strokeLinejoin='round'
                                        strokeWidth={2}
                                        d='M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9'
                                    />
                                </svg>
                            </div>
                            <h3 className='text-lg font-bold text-brand-maroon mb-2'>
                                Stay Informed
                            </h3>
                            <p className='text-gray-600 text-sm'>
                                Receive timely updates on legislation, events,
                                and opportunities to make your voice heard.
                            </p>
                        </div>

                        <div className='text-center'>
                            <div className='w-16 h-16 bg-gradient-to-br from-brand-blue to-brand-plum rounded-full flex items-center justify-center mx-auto mb-4'>
                                <svg
                                    className='w-8 h-8 text-white'
                                    fill='none'
                                    stroke='currentColor'
                                    viewBox='0 0 24 24'
                                >
                                    <path
                                        strokeLinecap='round'
                                        strokeLinejoin='round'
                                        strokeWidth={2}
                                        d='M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z'
                                    />
                                </svg>
                            </div>
                            <h3 className='text-lg font-bold text-brand-maroon mb-2'>
                                Build Community
                            </h3>
                            <p className='text-gray-600 text-sm'>
                                Connect with thousands of fellow advocates
                                working toward the same goal across Arizona.
                            </p>
                        </div>

                        <div className='text-center'>
                            <div className='w-16 h-16 bg-gradient-to-br from-brand-rust to-brand-maroon rounded-full flex items-center justify-center mx-auto mb-4'>
                                <svg
                                    className='w-8 h-8 text-white'
                                    fill='none'
                                    stroke='currentColor'
                                    viewBox='0 0 24 24'
                                >
                                    <path
                                        strokeLinecap='round'
                                        strokeLinejoin='round'
                                        strokeWidth={2}
                                        d='M13 10V3L4 14h7v7l9-11h-7z'
                                    />
                                </svg>
                            </div>
                            <h3 className='text-lg font-bold text-brand-maroon mb-2'>
                                Take Action
                            </h3>
                            <p className='text-gray-600 text-sm'>
                                Get exclusive access to advocacy tools, action
                                alerts, and ways to directly impact change.
                            </p>
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

export default SignUp;
