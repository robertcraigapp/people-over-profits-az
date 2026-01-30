import { StrictMode } from 'react';
import './index.css';
import App from './App.tsx';
import { BrowserRouter } from 'react-router';
import ReactDOM from 'react-dom/client';

const root = document.getElementById('root');

ReactDOM.createRoot(root).render(
    <StrictMode>
        <BrowserRouter>
            <App />
        </BrowserRouter>
    </StrictMode>,
);
