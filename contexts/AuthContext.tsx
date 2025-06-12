import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { databaseService, UserProfile } from '@/lib/database';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, username?: string) => Promise<{ error: any }>;
  signInWithGoogle: () => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.id);
      
      if (session?.user) {
        await loadUserProfile(session.user.id);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const getInitialSession = async () => {
    try {
      console.log('Getting initial session...');
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Error getting initial session:', error);
        setLoading(false);
        return;
      }
      
      if (session?.user) {
        console.log('Initial session found for user:', session.user.id);
        await loadUserProfile(session.user.id);
      } else {
        console.log('No initial session found');
      }
    } catch (error) {
      console.error('Unexpected error getting initial session:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserProfile = async (userId: string) => {
    try {
      console.log('Loading user profile for:', userId);
      const { data, error } = await databaseService.getUserById(userId);
      
      if (error) {
        console.error('Error loading user profile:', error);
        
        // If it's a database configuration error, try to handle gracefully
        if (error.message?.includes('relation') || error.message?.includes('does not exist')) {
          console.log('Database schema issue detected, user profile may need to be created later');
          setUser(null);
          return;
        }
        
        // For other errors, still try to set a minimal user object
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (authUser && authUser.id === userId) {
          const minimalUser: UserProfile = {
            id: authUser.id,
            email: authUser.email || undefined,
            username: authUser.user_metadata?.username || authUser.email?.split('@')[0] || 'User',
            iq_score: 0,
            eq_score: 0,
            profile_photos: [],
            profile_completed: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          setUser(minimalUser);
        }
        return;
      }
      
      console.log('Loaded user profile:', data);
      setUser(data);
    } catch (error) {
      console.error('Unexpected error loading user profile:', error);
      setUser(null);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log('Attempting sign in for:', email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Sign in error:', error);
        return { error };
      }

      console.log('Sign in successful for user:', data.user?.id);
      if (data.user) {
        await loadUserProfile(data.user.id);
      }

      return { error: null };
    } catch (error) {
      console.error('Unexpected sign in error:', error);
      return { error };
    }
  };

  const signUp = async (email: string, password: string, username?: string) => {
    try {
      console.log('Attempting sign up for:', email);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: username || email.split('@')[0]
          }
        }
      });

      if (error) {
        console.error('Sign up error:', error);
        return { error };
      }

      console.log('Sign up successful for user:', data.user?.id);
      // User profile will be created automatically via trigger or in auth state change
      return { error: null };
    } catch (error) {
      console.error('Unexpected sign up error:', error);
      return { error };
    }
  };

  const signInWithGoogle = async () => {
    try {
      console.log('Attempting Google sign in...');
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      
      if (error) {
        console.error('Google sign in error:', error);
      }
      
      return { error };
    } catch (error) {
      console.error('Unexpected Google sign in error:', error);
      return { error };
    }
  };

  const signOut = async () => {
    try {
      console.log('Signing out...');
      await supabase.auth.signOut();
      setUser(null);
      console.log('Sign out successful');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const refreshUser = async () => {
    if (!user) {
      console.log('No user to refresh');
      return;
    }
    
    console.log('Refreshing user profile...');
    await loadUserProfile(user.id);
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}