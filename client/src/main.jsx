// /client/src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import router from './router.jsx';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// CONTEXT PROVIDERS
import { AuthProvider } from './contexts/AuthContext.jsx';
import { SequencerSettingsProvider } from './contexts/SequencerSettingsContext.jsx';
import { UIStateProvider } from './contexts/UIStateContext.jsx';
import { SequenceProvider } from './contexts/SequenceContext.jsx';
import { PlaybackProvider } from './contexts/PlaybackContext.jsx';
import { MediaProvider } from './contexts/MediaContext.jsx';
import { MotionAnalysisProvider } from './contexts/MotionAnalysisContext.jsx';
import { AnalysisProvider } from './contexts/AnalysisContext.jsx';
import { DebugProvider } from './contexts/DebugContext.jsx';

// STYLES & CORE COMPONENTS
import './icons.js'; 
import './index.css'; 
import ErrorBoundary from './components/common/ErrorBoundary.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <DebugProvider>
        <AuthProvider>
          <SequencerSettingsProvider>
            <UIStateProvider>
              <SequenceProvider>
                <PlaybackProvider>
                    <MediaProvider>
                        <MotionAnalysisProvider>
                            <AnalysisProvider>
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
                            </AnalysisProvider>
                        </MotionAnalysisProvider>
                    </MediaProvider>
                </PlaybackProvider>
              </SequenceProvider>
            </UIStateProvider>
          </SequencerSettingsProvider>
        </AuthProvider>
      </DebugProvider>
    </ErrorBoundary>
  </React.StrictMode>
);