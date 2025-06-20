// src/pages/HomePage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCubesStacked, faSignInAlt, faUserPlus, faTachometerAlt } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/common/Button'; // Using common Button for consistency

const HomePage = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-12rem)] text-center py-10 sm:py-16 px-4">
      <header className="mb-10 sm:mb-12">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-orbitron text-brand-accent mb-4">
          SĒQsync
        </h1>
        <p className="text-lg sm:text-xl text-gray-400 max-w-3xl mx-auto">
          The Universal Language of Movement.
        </p>
        <p className="text-md sm:text-lg text-gray-300 mt-2 max-w-2xl mx-auto leading-relaxed">
          Compose, analyze, and synchronize biomechanical sequences with unparalleled precision.
          For creators, athletes, and innovators.
        </p>
      </header>

      <section className="mb-10 sm:mb-12">
        <Link to="/sequencer">
          <Button variant="primary" size="lg" className="group !text-xl !py-4 !px-10 shadow-xl hover:shadow-brand-accent/30">
            <FontAwesomeIcon icon={faCubesStacked} className="mr-3 group-hover:animate-pulse" />
            Launch POSEQr™ Studio
          </Button>
        </Link>
      </section>

      <section className="w-full max-w-md">
        {!isAuthenticated ? (
          <div className="space-y-3">
            <Link to="/login" className="w-full">
              <Button variant="secondary" className="w-full !py-3" iconLeft={faSignInAlt}>
                Sign In
              </Button>
            </Link>
            <Link to="/register" className="w-full">
              {/* Changed variant from "outline" to "secondary" */}
              {/* You can add specific styling here if "secondary" default isn't what you want for an outline look */}
              <Button 
                variant="secondary" // Using a supported variant
                className="w-full !py-3 border border-brand-accent text-brand-accent hover:bg-brand-accent/10 hover:text-white" // Added border and text color to mimic outline
                iconLeft={faUserPlus}
              >
                Create Account
              </Button>
            </Link>
          </div>
        ) : (
          <Link to="/dashboard" className="w-full">
            <Button variant="secondary" className="w-full !py-3" iconLeft={faTachometerAlt}>
              Go to Your Dashboard
            </Button>
          </Link>
        )}
      </section>
      
      <section className="mt-12 text-gray-500 text-sm">
          <p>Discover the poSĒQr™ notation system. Protect your choreography. Train with rhythmic precision.</p>
      </section>
    </div>
  );
};
export default HomePage;