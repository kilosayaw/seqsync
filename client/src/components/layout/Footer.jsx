// src/components/layout/Footer.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-800 text-gray-400 shadow-top mt-auto"> {/* mt-auto pushes footer to bottom in flex col */}
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 text-center">
        <p className="text-sm">
          © {currentYear} SĒQsync Platform. All Rights Reserved.
        </p>
        <div className="mt-4 space-x-6">
          <Link to="/about" className="text-sm hover:text-gray-200 transition-colors">
            About Us
          </Link>
          {/* Add other footer links like Privacy Policy, Terms of Service if needed */}
          {/* <Link to="/privacy" className="text-sm hover:text-gray-200 transition-colors">
            Privacy Policy
          </Link>
          <Link to="/terms" className="text-sm hover:text-gray-200 transition-colors">
            Terms of Service
          </Link> */}
        </div>
        <p className="mt-4 text-xs">
          Built with poSĒQr™ Technology by Kilosayaw.
        </p>
      </div>
    </footer>
  );
};

export default Footer;