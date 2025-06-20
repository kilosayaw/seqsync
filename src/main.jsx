// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import router from './router'; 
import { AuthProvider } from './contexts/AuthContext';
import { SequencerSettingsProvider } from './contexts/SequencerSettingsContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './icons.js'; 
import './index.css'; 
import ErrorBoundary from './components/common/ErrorBoundary';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        <SequencerSettingsProvider> {/* Wrap with SequencerSettingsProvider if it exists */}
          <RouterProvider router={router} />
          <ToastContainer
            position="bottom-right"
            autoClose={4000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="dark" 
          />
        </SequencerSettingsProvider>
      </AuthProvider>
    </ErrorBoundary>
  </React.StrictMode>
);