import React, { Suspense } from 'react'; // Suspense is good for lazy loading, which you might re-introduce
import { createBrowserRouter } from 'react-router-dom';

// Layouts
import AppLayout from './components/layout/AppLayout.jsx';
import DashboardOutletPage from './pages/DashboardOutletPage.jsx';

// Auth Components
import ProtectedRoute from './components/auth/ProtectedRoute.jsx';

// Page Components (Direct Static Imports for Now)
import HomePage from './pages/HomePage.jsx';
import SequencerPage from './pages/SequencerPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegistrationPage from './pages/RegistrationPage.jsx';
import UserDashboardPage from './pages/UserDashboardPage.jsx';
import SequenceUploadPage from './pages/SequenceUploadPage.jsx';
import SequenceDetailPage from './pages/SequenceDetailPage.jsx';
import AboutPage from './pages/AboutPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';
import EmailConfirmationPage from './pages/EmailConfirmationPage.jsx';

// Common Components for Fallback
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

const LoadingFallback = () => (
  <div className="flex flex-col justify-center items-center min-h-[calc(100vh-8rem)] bg-gray-900 text-brand-accent">
    <FontAwesomeIcon icon={faSpinner} spin size="3x" className="mb-4" />
    <span className="text-xl">Loading Page...</span>
  </div>
);

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    // Using Suspense here would be for lazy-loaded child routes, not AppLayout itself
    // If AppLayout or its children cause suspense, a Suspense boundary might be needed within AppLayout
    // or around the <Outlet />. For now, this structure is fine with static imports.
    errorElement: <Suspense fallback={<LoadingFallback />}><NotFoundPage /></Suspense>, // Wrap errorElement too if it can suspend
    children: [
      { index: true, element: <Suspense fallback={<LoadingFallback />}><HomePage /></Suspense> },
      { path: 'sequencer', element: <Suspense fallback={<LoadingFallback />}><SequencerPage /></Suspense> },
      { path: 'login', element: <Suspense fallback={<LoadingFallback />}><LoginPage /></Suspense> },
      { path: 'register', element: <Suspense fallback={<LoadingFallback />}><RegistrationPage /></Suspense> },
      { path: 'confirm-email', element: <Suspense fallback={<LoadingFallback />}><EmailConfirmationPage /></Suspense> },
      { path: 'about', element: <Suspense fallback={<LoadingFallback />}><AboutPage /></Suspense> },
      {
        path: 'dashboard',
        element: <ProtectedRoute />, // ProtectedRoute handles its own loading/auth check
        children: [
          {
            // DashboardOutletPage itself might not need Suspense unless it lazy loads something internally
            element: <DashboardOutletPage />,
            children: [
                { index: true, element: <Suspense fallback={<LoadingFallback />}><UserDashboardPage /></Suspense> },
                { path: 'upload', element: <Suspense fallback={<LoadingFallback />}><SequenceUploadPage /></Suspense> },
                { path: 'sequence/:id', element: <Suspense fallback={<LoadingFallback />}><SequenceDetailPage /></Suspense> },
            ]
          }
        ],
      },
      // Catch-all for 404, should be last among siblings
      { path: '*', element: <Suspense fallback={<LoadingFallback />}><NotFoundPage /></Suspense> },
    ],
  },
]);

export default router;