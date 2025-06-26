// src/pages/NotFoundPage.jsx
// (Content as provided in the previous "FRESH & COMPLETE - Batch 5 of 8" for Page Components)
// This file should already be complete from that batch.
import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle, faHome } from '@fortawesome/free-solid-svg-icons';
import Button from '../components/common/Button';

const NotFoundPage = () => {
  return (
    <div className="min-h-[calc(100vh-12rem)] flex flex-col items-center justify-center text-center px-4 text-gray-100">
      <FontAwesomeIcon icon={faExclamationTriangle} className="text-6xl text-yellow-400 mb-6 animate-pulse" />
      <h1 className="text-5xl sm:text-6xl font-orbitron font-bold mb-4">404</h1>
      <h2 className="text-2xl sm:text-3xl font-semibold mb-6 text-gray-300">Page Not Found</h2>
      <p className="text-gray-400 mb-8 max-w-md leading-relaxed">
        Oops! The cosmic sequence you're looking for appears to be off-beat or out of phase. 
        It might have been moved, deleted, or perhaps it never existed in this timeline.
      </p>
      <Link to="/">
        <Button variant="primary" size="lg" iconLeft={faHome}>
            Return to Home Base
        </Button>
      </Link>
    </div>
  );
};
export default NotFoundPage;