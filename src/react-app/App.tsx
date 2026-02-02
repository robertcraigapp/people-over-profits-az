import Layout from './Layout';
import Home from './Home';
import { Route, Routes } from 'react-router';
import Coalition from './Coalition';

function App() {
    return (
        <Routes>
            <Route path='/' element={<Layout />}>
                <Route index element={<Home />} />
                <Route path='coalition' element={<Coalition />} />
            </Route>
        </Routes>
    );
}

export default App;
