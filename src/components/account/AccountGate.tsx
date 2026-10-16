'use client';
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { openAuthModal } from '../../store/authSlice';
import { AuthModal } from '../auth/AuthModal';
import { siteConfig } from '../../config/site';
import { User, ArrowLeft } from 'lucide-react';

/** Shown on /account/* when there's no session — prompts sign-in. */
export const AccountGate: React.FC = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const user = useSelector((state: RootState) => state.auth.user);

  // If a session arrives (sign-in via modal), re-render the server layout
  useEffect(() => {
    if (user) router.refresh();
  }, [user, router]);

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-5">
        <div className="w-14 h-14 rounded-2xl bg-primary-700 text-primary-100 flex items-center justify-center mx-auto">
          <User className="w-7 h-7" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-neutral-50">Sign in to your account</h1>
          <p className="text-xs text-neutral-400 mt-2">
            View your orders, track quote projects, and manage your {siteConfig.siteName} profile.
          </p>
        </div>
        <button
          onClick={() => dispatch(openAuthModal(true))}
          className="w-full py-3 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-black text-sm transition-colors"
        >
          Sign In / Register
        </button>
        <button
          onClick={() => router.push('/')}
          className="mx-auto flex items-center gap-1.5 text-xs text-neutral-400 hover:text-primary-400 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Store</span>
        </button>
      </div>
      <AuthModal />
    </div>
  );
};
