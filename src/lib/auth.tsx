'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { UserProfile, CheckInRecord, CheckInReason } from '@/types';
import { supabase, isSupabaseConfigured, localStore } from './supabase';

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  activeCheckIn: CheckInRecord | null;
  loginWithOutlook: (mockRole?: 'student' | 'staff', mockName?: string) => Promise<void>;
  logout: () => Promise<void>;
  submitCheckIn: (period: string, reason: CheckInReason, teacherName?: string, teacherId?: string) => Promise<void>;
  submitCheckOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeCheckIn, setActiveCheckIn] = useState<CheckInRecord | null>(null);

  const router = useRouter();
  const pathname = usePathname();

  // Load user from storage or Supabase session
  useEffect(() => {
    async function initAuth() {
      if (isSupabaseConfigured && supabase) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const email = session.user.email || '';
          // Account name from Outlook provider (user_metadata.full_name or name)
          const name = session.user.user_metadata?.full_name || session.user.user_metadata?.name || email.split('@')[0];
          // Check role: staff members end in bergen.org or have role metadata
          const isStaff = session.user.user_metadata?.role === 'staff' || email.startsWith('admin') || email.includes('staff');
          setUser({
            id: session.user.id,
            email,
            name,
            role: isStaff ? 'staff' : 'student'
          });
        }
      } else {
        // Fallback localStorage auth
        const saved = localStorage.getItem('bca_user');
        if (saved) {
          try {
            setUser(JSON.parse(saved));
          } catch {}
        }
      }
      setIsLoading(false);
    }
    initAuth();
  }, []);

  // Sync active check-in dynamically
  useEffect(() => {
    if (!user) {
      setActiveCheckIn(null);
      return;
    }

    const updateActive = () => {
      const active = localStore.getActiveCheckIn(user.email);
      setActiveCheckIn(active || null);
    };

    updateActive();
    const unsubscribe = localStore.subscribe(updateActive);
    return () => unsubscribe();
  }, [user]);

  // Route protection & redirection rules
  useEffect(() => {
    if (isLoading) return;

    // 1. If not logged in and not on /login -> redirect to /login
    if (!user && pathname !== '/login') {
      router.replace('/login');
      return;
    }

    // 2. If logged in and on /login -> redirect to appropriate screen
    if (user && pathname === '/login') {
      if (user.role === 'staff') {
        router.replace('/admin');
      } else {
        router.replace('/');
      }
      return;
    }

    // 3. Students cannot access admin routes -> redirect to /
    if (user && user.role === 'student' && pathname.startsWith('/admin')) {
      router.replace('/');
      return;
    }

    // 4. Staff/Admins cannot access student routes (including /absences) -> redirect to /admin
    const studentRoutes = ['/', '/absences', '/check-in/code', '/check-in/reason', '/check-in/teacher', '/check-out'];
    if (user && user.role === 'staff' && (studentRoutes.includes(pathname) || pathname.startsWith('/check-in') || pathname.startsWith('/absences'))) {
      router.replace('/admin');
      return;
    }

    // 5. If student is checked in, lock to /check-out on all pages except /absences
    if (user && user.role === 'student' && activeCheckIn) {
      const allowedPaths = ['/check-out', '/absences'];
      if (!allowedPaths.includes(pathname)) {
        router.replace('/check-out');
        return;
      }
    }
  }, [user, isLoading, activeCheckIn, pathname, router]);

  const loginWithOutlook = async (mockRole: 'student' | 'staff' = 'student', mockName?: string) => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signInWithOAuth({
        provider: 'azure',
        options: {
          scopes: 'openid profile email User.Read',
          redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/` : undefined
        }
      });
      return;
    }

    // Dev/Mock fallback
    const studentName = mockName || (mockRole === 'staff' ? 'Dr. Robert Degan' : 'Kabir Sekhon');
    const studentEmail = mockRole === 'staff' ? 'rdegan@bergen.org' : 'kabsek30@bergen.org';
    const profile: UserProfile = {
      id: `usr-${Date.now()}`,
      email: studentEmail,
      name: studentName,
      role: mockRole
    };
    setUser(profile);
    if (typeof window !== 'undefined') {
      localStorage.setItem('bca_user', JSON.stringify(profile));
    }

    if (profile.role === 'staff') {
      router.push('/admin');
    } else {
      router.push('/');
    }
  };

  const logout = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setActiveCheckIn(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('bca_user');
    }
    router.push('/login');
  };

  const submitCheckIn = async (
    period: string,
    reason: CheckInReason,
    teacherName?: string,
    teacherId?: string
  ) => {
    if (!user) return;
    const record = localStore.createCheckIn({
      studentName: user.name,
      studentEmail: user.email,
      period,
      reason,
      teacherName,
      teacherId
    });
    setActiveCheckIn(record);
    router.push('/check-out');
  };

  const submitCheckOut = async () => {
    if (!user || !activeCheckIn) return;
    localStore.checkOut(activeCheckIn.id);
    setActiveCheckIn(null);
    router.push('/');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        activeCheckIn,
        loginWithOutlook,
        logout,
        submitCheckIn,
        submitCheckOut
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
