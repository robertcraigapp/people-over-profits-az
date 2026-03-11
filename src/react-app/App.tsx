import Layout from './Layout';
import Home from './Home';
import { Route, Routes } from 'react-router';
import Coalition from './Coalition';
import Resources from './Resources';
import SignUp from './SignUp';
import FindRep from './FindRep';
import BillTracker from './BillTracker';
import { FF_LEGISLATOR_LOOKUP, FF_BILL_TRACKER } from './featureFlags';

function App() {
    return (
        <Routes>
            <Route path='/' element={<Layout />}>
                <Route index element={<Home />} />
                <Route path='coalition' element={<Coalition />} />
                <Route path='resources' element={<Resources />} />
                <Route path='signup' element={<SignUp />} />
                {FF_LEGISLATOR_LOOKUP && (
                    <Route path='resources/find-rep' element={<FindRep />} />
                )}
                {FF_BILL_TRACKER && (
                    <Route path='bills' element={<BillTracker />} />
                )}
            </Route>
        </Routes>
    );
}

export default App;
