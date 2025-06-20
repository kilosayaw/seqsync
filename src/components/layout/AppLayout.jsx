// src/components/layout/AppLayout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

const AppLayout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-dark-bg"> {/* Ensure full height */}
      <Header />
      <main className="flex-grow container mx-auto px-2 py-4 sm:px-4 sm:py-6 w-full max-w-full"> {/* Use flex-grow to take available space */}
        <Outlet /> {/* Child routes will render here */}
      </main>
      <Footer />
    </div>
  );
};

export default AppLayout;