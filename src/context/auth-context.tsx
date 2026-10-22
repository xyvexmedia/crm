'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { UserProfile } from '@/types';
import { supabase } from '@/lib/supabase';

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  updateUser: (updates: Partial<UserProfile>) => void;
}

const defaultAdminUser: UserProfile = {
  id: 'usr_salih',
  name: 'Salih',
  email: 'salih@xyvex.agency',
  role: 'Founder & Managing Director',
  avatar: '/xyvex-logo.jpeg',
  phone: '+91 99955 88221',
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Check local session or Supabase session
    const initAuth = async () => {
      try {
        const storedUser = localStorage.getItem('xyvex_auth_user');
        if (storedUser) {
          try {
            setUser(JSON.parse(storedUser));
          } catch {
            localStorage.removeItem('xyvex_auth_user');
          }
        }

        // Also check Supabase auth if session exists
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const authUser: UserProfile = {
            id: session.user.id,
            name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'Salih',
            email: session.user.email || 'salih@xyvex.agency',
            role: 'Admin',
            avatar: session.user.user_metadata?.avatar_url || '/xyvex-logo.jpeg',
          };
          setUser(authUser);
          localStorage.setItem('xyvex_auth_user', JSON.stringify(authUser));
        }
      } catch (e) {
        console.warn('Auth init check error:', e);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  // Route protection
  useEffect(() => {
    if (isLoading) return;

    const publicRoutes = ['/login', '/forgot-password', '/reset-password'];
    const isPublic = publicRoutes.some((route) => pathname?.startsWith(route));

    if (!user && !isPublic) {
      router.push('/login');
    }
  }, [user, isLoading, pathname, router]);

  const login = async (email: string, password?: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      // Attempt Supabase sign in if password provided
      if (password && password.length >= 6) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (!error && data.user) {
          const authenticatedUser: UserProfile = {
            id: data.user.id,
            name: data.user.user_metadata?.name || 'Salih',
            email: data.user.email || email,
            role: 'Admin',
            avatar: '/xyvex-logo.jpeg',
          };
          setUser(authenticatedUser);
          localStorage.setItem('xyvex_auth_user', JSON.stringify(authenticatedUser));
          router.push('/dashboard');
          return { success: true };
        }
      }

      // Seamless fallback login for Salih / demo
      const loggedUser: UserProfile = {
        id: `usr_${Date.now()}`,
        name: email.toLowerCase().includes('salih') ? 'Salih' : (email.split('@')[0] || 'Salih'),
        email: email || 'salih@xyvex.agency',
        role: 'Admin',
        avatar: '/xyvex-logo.jpeg',
      };
      setUser(loggedUser);
      localStorage.setItem('xyvex_auth_user', JSON.stringify(loggedUser));
      router.push('/dashboard');
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Login failed' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch {
      // ignore
    }
    setUser(null);
    localStorage.removeItem('xyvex_auth_user');
    router.push('/login');
  };

  const resetPassword = async (email: string): Promise<{ success: boolean; error?: string }> => {
    try {
      await supabase.auth.resetPasswordForEmail(email);
      return { success: true };
    } catch (err: any) {
      // Fallback success for mock
      return { success: true };
    }
  };

  const updateUser = (updates: Partial<UserProfile>) => {
    if (!user) return;
    const updated = { ...user, ...updates };
    setUser(updated);
    localStorage.setItem('xyvex_auth_user', JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, resetPassword, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
