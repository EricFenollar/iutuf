import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.css';
import { AuthProvider } from "./context/AuthContext.jsx";

createRoot(document.getElementById('root')!).render(
  <StrictMode>
      <AuthProvider>
        <BrowserRouter>
            <App />
        </BrowserRouter>
      </AuthProvider>
  </StrictMode>
);
