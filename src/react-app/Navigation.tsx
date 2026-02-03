import { Link } from 'react-router';
import popazLogo from './assets/People Over Profits Logo.png';

function Navigation() {
    return (
        <nav className='bg-white/80 backdrop-blur-md border-b border-brand-sand/20 px-6 py-4 sticky top-0 z-50'>
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
                        className='text-brand-maroon font-semibold hover:text-brand-orange transition-colors'
                    >
                        Coalition
                    </Link>
                    <Link
                        to='/resources'
                        className='text-brand-maroon font-semibold hover:text-brand-orange transition-colors'
                    >
                        Resources
                    </Link>
                    <Link
                        to='/signup'
                        className='bg-brand-orange text-white px-6 py-2 rounded font-bold hover:bg-brand-rust transition-all shadow-lg hover:shadow-xl hover:scale-105 active:scale-95'
                    >
                        Join the Fight
                    </Link>
                </div>
            </div>
        </nav>
    );
}

export default Navigation;
