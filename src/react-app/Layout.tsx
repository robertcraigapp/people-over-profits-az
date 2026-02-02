import { Outlet } from 'react-router';
import Navigation from './Navigation';

function Layout() {
    return (
        <div className='min-h-screen flex flex-col font-sans selection:bg-brand-orange selection:text-white'>
            <Navigation />
            <Outlet />
        </div>
    );
}

export default Layout;
