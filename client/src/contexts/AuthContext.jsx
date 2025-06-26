// src/contexts/AuthContext.jsx
import React, { createContext, useState, useEffect, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { supabase } from '../services/supabaseClient'; // Your Supabase client
import { toast } from 'react-toastify';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Supabase user object
  const [session, setSession] = useState(null); // Supabase session object
  const [isLoading, setIsLoading] = useState(true); // Initial loading state
  const [authError, setAuthError] = useState(null);
  const [userProfile, setUserProfile] = useState(null); // Stores profile data from your public.users/user_roles

  const clearAuthError = useCallback(() => setAuthError(null), []);

  const fetchUserProfile = useCallback(async (authUser) => {
    if (!authUser || !authUser.id) {
      setUserProfile(null);
      return;
    }
    try {
      // This assumes your backend has a /api/auth/profile route
      // that fetches combined auth user info and roles from your DB.
      // If you prefer direct Supabase call here for roles, adjust accordingly.
      // For now, let's assume it uses your custom backend service for profile which includes roles.
      // const profileData = await authService.getProfile(); // Using your existing authService
      // For direct Supabase approach to get roles (if you add functions or views):
      const { data: profileWithRoles, error: profileError } = await supabase
        .from('user_profiles_with_roles_view') // Example view name
        .select('*')
        .eq('id', authUser.id)
        .single();
      
      if (profileError) {
        console.error("Error fetching user profile with roles:", profileError.message);
        toast.error(`Failed to fetch profile: ${profileError.message}`);
        setUserProfile({ // Fallback to basic auth user info
          id: authUser.id,
          email: authUser.email,
          username: authUser.user_metadata?.username || authUser.email?.split('@')[0],
          roles: [], // Default to no roles if fetch fails
        });
      } else if (profileWithRoles) {
        setUserProfile(profileWithRoles); // This should include { id, email, username, roles: [{name, description}]}
      } else {
         setUserProfile({
          id: authUser.id,
          email: authUser.email,
          username: authUser.user_metadata?.username || authUser.email?.split('@')[0],
          roles: [], // Default to no roles if not found
        });
      }

    } catch (error) {
      console.error("Error in fetchUserProfile:", error);
      toast.error(error.message || "Could not load user profile.");
      setUserProfile({ // Fallback
          id: authUser.id,
          email: authUser.email,
          username: authUser.user_metadata?.username || authUser.email?.split('@')[0],
          roles: [],
        });
    }
  }, []);


  useEffect(() => {
    setIsLoading(true);
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      const currentUser = currentSession?.user || null;
      setUser(currentUser);
      if (currentUser) {
        fetchUserProfile(currentUser);
      }
      setIsLoading(false);
    }).catch(err => {
        console.error("Error getting initial session:", err);
        setIsLoading(false);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, newSession) => {
        console.log(`Auth event: ${_event}`, newSession);
        setSession(newSession);
        const newAuthUser = newSession?.user || null;
        setUser(newAuthUser);
        if (newAuthUser) {
          await fetchUserProfile(newAuthUser);
        } else {
          setUserProfile(null); // Clear profile on logout
        }
        if (_event === 'PASSWORD_RECOVERY') {
          // Handle password recovery UI flow (e.g., navigate to a reset password page)
          toast.info("Password recovery email sent. Follow the instructions in your email.");
        }
        if (_event === 'USER_UPDATED') {
            if(newAuthUser) fetchUserProfile(newAuthUser); // Re-fetch profile if user data changed
        }
        setIsLoading(false); // Ensure loading is false after initial check or change
      }
    );

    return () => {
      if (authListener && typeof authListener.unsubscribe === 'function') {
        authListener.unsubscribe();
      } else if (authListener && authListener.subscription && typeof authListener.subscription.unsubscribe === 'function') {
        // For newer Supabase versions where listener might be { data: { subscription } }
        authListener.subscription.unsubscribe();
      }
    };
  }, [fetchUserProfile]);

  const login = async (email, password) => {
    setIsLoading(true);
    setAuthError(null);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      // Auth state change listener will handle setting user and session
      toast.success(`Welcome back, ${data.user?.user_metadata?.username || data.user?.email}!`);
      return data;
    } catch (error) {
      console.error("Login error:", error);
      const errorMessage = error.message || "Invalid login credentials.";
      setAuthError(errorMessage);
      toast.error(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email, password, username) => {
    setIsLoading(true);
    setAuthError(null);
    try {
      const userMetadata = username ? { username: username.trim() } : {};
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userMetadata, // For user_metadata
        },
      });
      if (error) throw error;

      if (data.user && !data.session) { // Email confirmation might be required
        toast.info("Registration successful! Please check your email to confirm your account.");
      } else if (data.user && data.session) {
        toast.success(`Welcome, ${data.user?.user_metadata?.username || data.user?.email}! Registration complete.`);
      } else {
         toast.info("Registration request sent. Follow any instructions provided.");
      }
      // Auth state change listener will handle setting user and session upon confirmation if needed
      return data;
    } catch (error) {
      console.error("Registration error:", error);
      const errorMessage = error.message || "Registration failed. Please try again.";
      setAuthError(errorMessage);
      toast.error(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    setAuthError(null);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      // Auth state change listener will set user and session to null
      setUserProfile(null); // Explicitly clear profile
      toast.info("You have been successfully logged out.");
    } catch (error) {
      console.error("Logout error:", error);
      const errorMessage = error.message || "Logout failed.";
      setAuthError(errorMessage);
      toast.error(errorMessage);
      throw error; // Re-throw for component handling if needed
    } finally {
      setIsLoading(false);
    }
  };

  const sendPasswordResetEmail = async (email) => {
    setIsLoading(true);
    setAuthError(null);
    try {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/update-password` // Your reset password page
        });
        if (error) throw error;
        toast.success("Password reset email sent! Check your inbox.");
    } catch (error) {
        console.error("Password reset email error:", error);
        const errorMessage = error.message || "Failed to send password reset email.";
        setAuthError(errorMessage);
        toast.error(errorMessage);
        throw error;
    } finally {
        setIsLoading(false);
    }
  };

  const updatePassword = async (newPassword) => {
    setIsLoading(true);
    setAuthError(null);
    try {
        const { error } = await supabase.auth.updateUser({ password: newPassword });
        if (error) throw error;
        toast.success("Password updated successfully!");
    } catch (error) {
        console.error("Update password error:", error);
        const errorMessage = error.message || "Failed to update password.";
        setAuthError(errorMessage);
        toast.error(errorMessage);
        throw error;
    } finally {
        setIsLoading(false);
    }
  };


  const value = useMemo(() => ({
    user,       // Supabase auth.user object
    session,    // Supabase session object
    userProfile,// Your custom profile object { id, email, username, roles: [] }
    isAuthenticated: !!user && !!session, // More robust check
    isLoading,
    authError,
    login,
    register,
    logout,
    clearAuthError,
    fetchUserProfile, // Expose if manual refresh is needed elsewhere
    sendPasswordResetEmail,
    updatePassword,
  }), [user, session, userProfile, isLoading, authError, clearAuthError, fetchUserProfile]);


  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};