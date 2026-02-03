import Layout from './Layout';
import Home from './Home';
import { Route, Routes } from 'react-router';
import Coalition from './Coalition';
import Resources from './Resources';
import SignUp from './SignUp';

function App() {
    return (
        <Routes>
            <Route path='/' element={<Layout />}>
                <Route index element={<Home />} />
                <Route path='coalition' element={<Coalition />} />
                <Route path='resources' element={<Resources />} />
                <Route path='signup' element={<SignUp />} />
            </Route>
        </Routes>
    );
}

export default App;
