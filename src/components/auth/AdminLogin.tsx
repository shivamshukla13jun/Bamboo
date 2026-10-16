'use client';
import React from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { useMutation } from '@tanstack/react-query';
import { RootState } from '../../store';
import { setUser } from '../../store/authSlice';
import { useFormReduxSync } from '../../hooks/useFormReduxSync';
import { loginApi } from '../../services/api';
import { useRouter } from 'next/navigation';
import { ShieldCheck, ArrowLeft, Lock, AlertCircle } from 'lucide-react';
import { siteConfig } from '../../config/site';
import { UserRole } from '../../types';

interface AdminLoginInputs {
  email: string;
  password: string;
}

/** Full-page login gate shown before the admin panel is accessible. */
export const AdminLogin: React.FC = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const user = useSelector((state: RootState) => state.auth.user);
  const [serverError, setServerError] = React.useState('');

  const loginMutation = useMutation({ mutationFn: loginApi });

  const { register, handleSubmit, formState } = useForm<AdminLoginInputs>({
    mode: 'onChange',
    defaultValues: { email: '', password: '' }
  });

  useFormReduxSync('admin-login-form', formState);

  const onSubmit = (data: AdminLoginInputs) => {
    setServerError('');
    loginMutation.mutate(data, {
      onSuccess: (authUser) => {
        if (authUser.role !== UserRole.Admin) {
          setServerError('This account does not have admin access. Sign in with an admin account.');
          return;
        }
        dispatch(setUser(authUser));
        // Re-render the admin layout — the session cookie now grants access
        router.refresh();
      },
      onError: (err: any) => {
        setServerError(err.message || 'Login failed');
      }
    });
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 opacity-15 pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent-600 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-md relative z-10 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-accent-500 text-neutral-950 font-black flex items-center justify-center text-2xl mx-auto shadow-lg">
            {siteConfig.adminBadgeEmoji}
          </div>
          <h1 className="text-2xl font-black text-neutral-50">Admin Sign In</h1>
          <p className="text-xs text-neutral-400">
            Authenticate to access the {siteConfig.siteName} management panel.
          </p>
        </div>

        {user && user.role !== UserRole.Admin && (
          <div className="bg-accent-950/50 border border-accent-800/60 text-accent-300 p-3 rounded-xl text-xs text-center">
            Signed in as <strong>{user.email}</strong> (customer). Enter admin credentials below to continue.
          </div>
        )}

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-8 space-y-4 shadow-2xl"
        >
          <div>
            <label className="block text-xs font-bold text-neutral-300 mb-1">
              Admin Email <span className="text-rose-400">*</span>
            </label>
            <input
              type="email"
              placeholder="admin@bamboorise.com"
              {...register('email', {
                required: 'Email is required',
                pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: 'Invalid email' }
              })}
              className={`w-full bg-neutral-950 text-neutral-100 border rounded-xl px-3 py-2.5 text-sm focus:outline-none ${
                formState.errors.email ? 'border-rose-500' : 'border-neutral-700'
              }`}
            />
            {formState.errors.email && (
              <span className="text-[11px] text-rose-400 block mt-0.5">{formState.errors.email.message}</span>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-300 mb-1">
              Password <span className="text-rose-400">*</span>
            </label>
            <input
              type="password"
              placeholder="••••••••"
              {...register('password', { required: 'Password is required' })}
              className={`w-full bg-neutral-950 text-neutral-100 border rounded-xl px-3 py-2.5 text-sm focus:outline-none ${
                formState.errors.password ? 'border-rose-500' : 'border-neutral-700'
              }`}
            />
            {formState.errors.password && (
              <span className="text-[11px] text-rose-400 block mt-0.5">{formState.errors.password.message}</span>
            )}
          </div>

          {serverError && (
            <div className="bg-rose-950/60 border border-rose-800 text-rose-200 p-3 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{serverError}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loginMutation.isPending}
            className="w-full py-3 rounded-xl bg-accent-500 hover:bg-accent-400 text-neutral-950 font-black text-sm flex items-center justify-center gap-2 transition-colors shadow-lg"
          >
            <Lock className="w-4 h-4" />
            <span>{loginMutation.isPending ? 'Authenticating...' : 'Sign In to Admin Panel'}</span>
          </button>

          <p className="text-[11px] text-neutral-500 text-center pt-1">
            Admin credentials are configured via <code className="font-mono text-neutral-400">ADMIN_EMAIL</code> /{' '}
            <code className="font-mono text-neutral-400">ADMIN_PASSWORD</code> env.
          </p>
        </form>

        <button
          onClick={() => router.push('/')}
          className="mx-auto flex items-center gap-1.5 text-xs text-neutral-400 hover:text-primary-400 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Storefront</span>
        </button>
      </div>
    </div>
  );
};
