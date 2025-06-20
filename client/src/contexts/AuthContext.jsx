// src/contexts/AuthContext.jsx
import React, { createContext, useState, useEffect, useCallback, useMemo, useContext } from 'react';
import PropTypes from 'prop-types';
import { supabase } from '../services/supabaseClient';
import apiClient from '../services/apiClient';
import { toast } from 'react-toastify';

// ===================================
// == THE FIX: EXPORT THIS CONSTANT ==
// ===================================
export const AuthContext = createContext(null); // The context itself must be exported

const devUser = {
  id: 'sirkris',
  email: 'info@kilosayaw.com',
  name: 'Dev Admin',
  roles: ['admin', 'user'],
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  const clearAuthError = useCallback(() => setAuthError(null), []);

  const fetchUserProfile = useCallback(async (authUser) => {
    if (!authUser || !authUser.id) {
      setUserProfile(null);
      return;
    }
    try {
      const { data } = await apiClient.get('/auth/profile');
      if (data && data.data && data.data.user) {
        setUserProfile(data.data.user);
      } else {
        throw new Error("Profile data not found in API response.");
      }
    } catch (error) {
      console.error("Error fetching user profile:", error.message);
      setUserProfile({
        id: authUser.id,
        email: authUser.email,
        username: authUser.user_metadata?.username || authUser.email.split('@')[0],
        roles: [],
      });
    }
  }, []);

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    if (queryParams.get('dev') === 'true') {
      console.warn('%cDEV MODE ACTIVE', 'color: yellow; font-size: 1.5rem; font-weight: bold;');
      toast.info("DEV MODE: Admin user automatically logged in.");
      setUser(devUser);
      setUserProfile({
        id: devUser.id,
        email: devUser.email,
        username: devUser.name,
        roles: devUser.roles,
      });
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      const currentUser = currentSession?.user;
      setUser(currentUser);
      if (currentUser) {
        fetchUserProfile(currentUser);
      }
      setIsLoading(false);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, newSession) => {
        setSession(newSession);
        const newAuthUser = newSession?.user ?? null;
        setUser(newAuthUser);
        if (newAuthUser) {
          await fetchUserProfile(newAuthUser);
        } else {
          setUserProfile(null);
        }
      }
    );

    return () => authListener.subscription.unsubscribe();
  }, [fetchUserProfile]);

  const value = useMemo(() => ({
    user: userProfile,
    session,
    isAuthenticated: !!userProfile,
    isLoading,
    authError,
    clearAuthError,
  }), [userProfile, session, isLoading, authError, clearAuthError]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};