import { Link } from 'react-router';
import popazLogo from './assets/People Over Profits Logo.png';
import { FF_RESOURCES, FF_LEGISLATOR_LOOKUP, FF_BILL_TRACKER } from './featureFlags';

function Navigation() {
    return (
        <nav className='bg-white/90 backdrop-blur-md border-b border-brand-sand/20 px-6 py-4 sticky top-0 z-50 shadow-sm'>
            <div className='max-w-7xl mx-auto flex justify-between items-center'>
                <Link to='/'>
                    <img
                        src={popazLogo}
                        alt='POPAZ Logo'
                        className='h-12 w-auto'
                    />
                </Link>
                <div className='flex items-center gap-6'>
                    <Link
                        to='/coalition'
                        className='font-display text-brand-maroon font-semibold hover:text-brand-orange transition-colors tracking-wide uppercase text-sm'
                    >
                        Coalition
                    </Link>
                    {FF_RESOURCES && (
                        <Link
                            to='/resources'
                            className='font-display text-brand-maroon font-semibold hover:text-brand-orange transition-colors tracking-wide uppercase text-sm'
                        >
                            Resources
                        </Link>
                    )}
                    {FF_LEGISLATOR_LOOKUP && (
                        <Link
                            to='/resources/find-rep'
                            className='font-display text-brand-maroon font-semibold hover:text-brand-orange transition-colors tracking-wide uppercase text-sm'
                        >
                            Find Your Rep
                        </Link>
                    )}
                    {FF_BILL_TRACKER && (
                        <Link
                            to='/bills'
                            className='font-display text-brand-maroon font-semibold hover:text-brand-orange transition-colors tracking-wide uppercase text-sm'
                        >
                            Track Bills
                        </Link>
                    )}
                    {FF_BILL_TRACKER && (
                        <Link
                            to='/take-action'
                            className='font-display text-brand-maroon font-semibold hover:text-brand-orange transition-colors tracking-wide uppercase text-sm'
                        >
                            Take Action
                        </Link>
                    )}
                    <Link
                        to='/signup'
                        className='font-display bg-brand-blue text-white px-6 py-2 rounded font-bold hover:bg-brand-rust transition-all shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 uppercase tracking-wider text-sm'
                    >
                        Join the Fight
                    </Link>
                </div>
            </div>
        </nav>
    );
}

export default Navigation;
