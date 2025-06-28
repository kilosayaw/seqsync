// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import router from './router'; // Your router.jsx
import { AuthProvider } from './contexts/AuthContext';
import { SequencerSettingsProvider } from './contexts/SequencerSettingsContext'; // Assuming you create this
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './index.css'; // Your global styles
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
            theme="dark" // Uses Toastify's dark theme, further customizable in index.css
          />
        </SequencerSettingsProvider>
      </AuthProvider>
    </ErrorBoundary>
  </React.StrictMode>
);