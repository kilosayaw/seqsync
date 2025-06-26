// src/components/layout/Header.jsx
import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth'; // Corrected path if hooks is directly under src
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faTimes, faUserCircle, faSignOutAlt, faSignInAlt, faUserPlus, faTachometerAlt, faMusic, faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import Button from '../common/Button';
import Tooltip from '../common/Tooltip';
import PropTypes from 'prop-types'; // Added PropTypes import

const Header = () => {
  const { isAuthenticated, userProfile, logout, isLoading } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    setIsMobileMenuOpen(false);
    navigate('/');
  };

  const navLinkClasses = ({ isActive }) =>
    `px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 ease-in-out block sm:inline-block
     ${isActive
      ? 'bg-brand-accent/20 text-brand-accent-base ring-1 ring-brand-accent-base/50'
      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
    }`;
  
  const mobileNavLinkClasses = ({ isActive }) =>
    `block px-3 py-3 rounded-md text-base font-medium 
     ${isActive
      ? 'bg-brand-accent/20 text-brand-accent-base'
      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
    }`;

  const commonLinks = [
    { to: "/sequencer", label: "POSEQr", icon: faMusic, tooltip: "Open the POSEQr Sequencer" },
    { to: "/about", label: "About", icon: faInfoCircle, tooltip: "Learn more about SĒQsync" },
  ];

  const authLinks = isAuthenticated
    ? [ { to: "/dashboard", label: "Dashboard", icon: faTachometerAlt, tooltip: "Go to your dashboard" }]
    : [
        { to: "/login", label: "Login", icon: faSignInAlt, tooltip: "Sign in to your account" },
        { to: "/register", label: "Register", icon: faUserPlus, tooltip: "Create a new account" },
      ];

  const allNavLinks = [...commonLinks, ...authLinks];

  return (
    <nav className="bg-gray-800 shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center group">
              <span className="font-orbitron text-2xl text-brand-accent-base font-bold group-hover:opacity-80 transition-opacity">
                SĒQsync
              </span>
            </Link>
          </div>

          <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-4">
            {allNavLinks.map((link) => (
              <Tooltip content={link.tooltip} placement="bottom" key={link.to}>
                <NavLink to={link.to} className={navLinkClasses} end={link.to === "/"}>
                  <FontAwesomeIcon icon={link.icon} className="mr-1.5 sm:hidden lg:inline-block" />
                  {link.label}
                </NavLink>
              </Tooltip>
            ))}
            {isAuthenticated && userProfile && (
              <div className="relative ml-3">
                <DropdownMenu userProfile={userProfile} onLogout={handleLogout} isLoading={isLoading}/>
              </div>
            )}
          </div>

          <div className="sm:hidden flex items-center">
            {isAuthenticated && userProfile && !isMobileMenuOpen && (
                 <div className="relative mr-3">
                    <Tooltip content={userProfile.username || userProfile.email} placement="bottom">
                        <button 
                            onClick={() => navigate('/dashboard')}
                            className="p-1 rounded-full text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white"
                            aria-label="Open user dashboard"
                        >
                            <FontAwesomeIcon icon={faUserCircle} className="h-7 w-7" />
                        </button>
                    </Tooltip>
                 </div>
            )}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              aria-controls="mobile-menu"
              aria-expanded={isMobileMenuOpen}
            >
              <span className="sr-only">Open main menu</span>
              {isMobileMenuOpen ? (
                <FontAwesomeIcon icon={faTimes} className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <FontAwesomeIcon icon={faBars} className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="sm:hidden absolute top-16 inset-x-0 z-40 bg-gray-800 shadow-xl pb-3 space-y-1 ring-1 ring-black ring-opacity-5" id="mobile-menu">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {allNavLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={mobileNavLinkClasses}
                onClick={() => setIsMobileMenuOpen(false)}
                end={link.to === "/"}
              >
                <FontAwesomeIcon icon={link.icon} className="mr-3" />
                {link.label}
              </NavLink>
            ))}
          </div>
          {isAuthenticated && userProfile && (
            <div className="pt-4 pb-3 border-t border-gray-700">
              <div className="flex items-center px-5">
                <div className="flex-shrink-0">
                  <FontAwesomeIcon icon={faUserCircle} className="h-10 w-10 rounded-full text-gray-400" />
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium text-white">{userProfile?.username || 'User'}</div>
                  <div className="text-sm font-medium text-gray-400">{userProfile?.email}</div>
                </div>
              </div>
              <div className="mt-3 px-2 space-y-1">
                <Button
                  onClick={handleLogout}
                  className="w-full !justify-start" // Adjusted for mobile menu button
                  variant="custom" // Use custom for full control with Tailwind classes
                  tailwindClasses="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
                  disabled={isLoading}
                  iconLeft={isLoading ? faBars : faSignOutAlt}
                  iconProps={isLoading ? {spin: true, className:"mr-3"} : {className:"mr-3"}}
                >
                   {isLoading ? 'Logging out...' : 'Sign out'}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

// DropdownMenu Component
const DropdownMenu = ({ userProfile, onLogout, isLoading }) => {
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate(); // Assuming useNavigate is imported in Header.jsx
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen]);

    if (!userProfile) return null;

    return (
        <div className="relative" ref={dropdownRef}>
            <Tooltip content="Your Account" placement="bottom">
                <button
                    type="button"
                    className="bg-gray-800 flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white"
                    id="user-menu-button"
                    aria-expanded={isOpen}
                    aria-haspopup="true"
                    onClick={() => setIsOpen(prev => !prev)} // Use functional update for toggling
                >
                    <span className="sr-only">Open user menu</span>
                    <FontAwesomeIcon icon={faUserCircle} className="h-8 w-8 rounded-full text-gray-400 hover:text-white" />
                </button>
            </Tooltip>

            {/* Conditional rendering of the dropdown panel */}
            {isOpen && (
                <div
                    className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg py-1 bg-gray-700 ring-1 ring-black ring-opacity-5 focus:outline-none"
                    role="menu"
                    aria-orientation="vertical"
                    aria-labelledby="user-menu-button" // Links this menu to the button
                    tabIndex="-1" // Makes it programmatically focusable
                >
                    {/* Dropdown Header Section */}
                    <div className="px-4 py-3 border-b border-gray-600">
                        <p className="text-sm text-white" id="user-menu-greeting">Signed in as</p> {/* Added id for potential aria-describedby */}
                        <p className="text-sm font-medium text-gray-300 truncate" title={userProfile.username || userProfile.email}>
                            {userProfile.username || userProfile.email.split('@')[0]}
                        </p>
                        {userProfile.roles && userProfile.roles.length > 0 && (
                            <p className="text-xs text-gray-400 mt-1 capitalize">
                                Role: {userProfile.roles.map(r => r.name).join(', ')}
                            </p>
                        )}
                    </div>
                    {/* Dropdown Menu Items */}
                    <NavLink
                        to="/dashboard"
                        className={({isActive}) => 
                            `block px-4 py-2 text-sm ${isActive ? 'bg-gray-600 text-white' : 'text-gray-300 hover:bg-gray-600 hover:text-white'}`
                        }
                        role="menuitem"
                        tabIndex="-1" // Individual items in a menu usually have -1 if menu itself is focusable
                        onClick={() => setIsOpen(false)}
                    >
                        Dashboard
                    </NavLink>
                    {/* Example for future links:
                    <NavLink 
                        to="/profile-settings" 
                        className={({isActive}) => `block px-4 py-2 text-sm ${isActive ? 'bg-gray-600 text-white' : 'text-gray-300 hover:bg-gray-600 hover:text-white'}`}
                        role="menuitem" 
                        tabIndex="-1" 
                        onClick={() => setIsOpen(false)}
                    >
                        Settings
                    </NavLink>
                    */}
                    <button
                        onClick={() => { 
                            onLogout(); 
                            setIsOpen(false); 
                        }}
                        disabled={isLoading}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-600 hover:text-white disabled:opacity-50"
                        role="menuitem"
                        tabIndex="-1"
                    >
                        {isLoading ? 'Logging out...' : 'Sign out'}
                    </button>
                </div>
            )}
            {/* End of conditional dropdown panel */}
        </div>
    );
};

DropdownMenu.propTypes = { // This is line 215 (now fixed)
    userProfile: PropTypes.object,
    onLogout: PropTypes.func.isRequired,
    isLoading: PropTypes.bool,
};

Header.propTypes = {
  // No specific props passed directly to Header from AppLayout,
  // but good practice to keep if it were to accept props later.
};

export default Header;