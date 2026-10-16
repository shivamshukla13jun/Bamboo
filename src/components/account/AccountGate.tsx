'use client';
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { AuthModal } from '../auth/AuthModal';

/**
 * Shown on /account/* when there's no session — renders the unified
 * sign-in form inline; a successful login refreshes the server layout.
 */
export const AccountGate: React.FC = () => {
  const router = useRouter();
  const user = useSelector((state: RootState) => state.auth.user);

  // If a session arrives via another tab/modal, re-render the server layout
  useEffect(() => {
    if (user) router.refresh();
  }, [user, router]);

  return <AuthModal inline />;
};
