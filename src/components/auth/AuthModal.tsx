'use client';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { RootState } from '../../store';
import { setUser, openAuthModal } from '../../store/authSlice';
import { setNotification, NotificationType } from '../../store/adminSlice';
import { useFormReduxSync } from '../../hooks/useFormReduxSync';
import { loginApi, registerApi, forgotPasswordApi, resetPasswordApi } from '../../services/api';
import { X, User, ShieldAlert, Leaf, UserPlus, LogIn, KeyRound, MailCheck, ShieldCheck, ArrowLeft } from 'lucide-react';
import { siteConfig } from '../../config/site';
import { UserRole } from '../../types';

enum AuthMode {
  Login = 'login',
  Register = 'register',
  Forgot = 'forgot',
  Reset = 'reset'
}

interface AuthInputs {
  name: string;
  email: string;
  password: string;
  resetToken: string;
}

interface AuthModalProps {
  /**
   * Render as an inline panel instead of a floating modal — used by the
   * /admin and /account gates. Always visible in this mode.
   */
  inline?: boolean;
  /**
   * Only admin-role sessions may pass this gate. Wording becomes
   * admin-flavored and non-admin logins get an access error (they stay
   * signed in for the storefront).
   */
  requireAdmin?: boolean;
}

/** Unified sign-in / register / forgot-password UI for customers and admins. */
export const AuthModal: React.FC<AuthModalProps> = ({ inline = false, requireAdmin = false }) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const modalOpen = useSelector((state: RootState) => state.auth.isAuthModalOpen);
  const isOpen = inline || modalOpen;

  // Deep link support: /?reset-token=<token> opens the reset step prefilled
  const [prefilledToken] = useState<string>(() => {
    if (typeof window === 'undefined') return '';
    const t = new URLSearchParams(window.location.search).get('reset-token');
    if (t) {
      const url = new URL(window.location.href);
      url.searchParams.delete('reset-token');
      window.history.replaceState({}, '', url.toString());
    }
    return t || '';
  });

  const [mode, setMode] = useState<AuthMode>(
    prefilledToken ? AuthMode.Reset : AuthMode.Login
  );
  const [serverError, setServerError] = useState('');
  const [forgotMessage, setForgotMessage] = useState('');
  const [devResetToken, setDevResetToken] = useState('');

  const loginMutation = useMutation({ mutationFn: loginApi });
  const registerMutation = useMutation({ mutationFn: registerApi });
  const forgotMutation = useMutation({ mutationFn: forgotPasswordApi });
  const resetMutation = useMutation({ mutationFn: resetPasswordApi });
  const isPending =
    loginMutation.isPending ||
    registerMutation.isPending ||
    forgotMutation.isPending ||
    resetMutation.isPending;

  const { register, handleSubmit, reset, setValue, formState } = useForm<AuthInputs>({
    mode: 'onChange',
    defaultValues: { name: '', email: '', password: '', resetToken: prefilledToken }
  });

  const FORM_IDS: Record<AuthMode, string> = {
    [AuthMode.Login]: 'customer-login-form',
    [AuthMode.Register]: 'customer-register-form',
    [AuthMode.Forgot]: 'customer-forgot-password-form',
    [AuthMode.Reset]: 'customer-reset-password-form'
  };

  useFormReduxSync(FORM_IDS[mode], formState);

  if (!isOpen) return null;

  const switchMode = (m: AuthMode) => {
    setMode(m);
    setServerError('');
    setForgotMessage('');
  };

  const close = () => {
    dispatch(openAuthModal(false));
    setServerError('');
    setForgotMessage('');
  };

  const notify = (message: string) =>
    dispatch(setNotification({ message, type: NotificationType.Success }));

  const onSubmit = (data: AuthInputs) => {
    setServerError('');
    const onError = (err: any) => setServerError(err.message || 'Request failed');

    if (mode === AuthMode.Forgot) {
      forgotMutation.mutate(data.email, {
        onSuccess: (res) => {
          setForgotMessage(res.message);
          // Dev convenience — jump straight to the reset step prefilled
          if (res.devResetToken) {
            setDevResetToken(res.devResetToken);
            setMode(AuthMode.Reset);
            setValue('resetToken', res.devResetToken);
          }
        },
        onError
      });
      return;
    }

    if (mode === AuthMode.Reset) {
      resetMutation.mutate(
        { token: data.resetToken, password: data.password },
        {
          onSuccess: (res) => {
            notify(`✅ ${res.message}`);
            switchMode(AuthMode.Login);
          },
          onError
        }
      );
      return;
    }

    const onSuccess = (user: any) => {
      dispatch(setUser(user));
      // Admin gate — role decides access
      if (requireAdmin && user.role !== UserRole.Admin) {
        setServerError(
          'This account does not have admin access. Sign in with an admin account.'
        );
        return;
      }
      if (inline) {
        // Session cookie changed → let the server layout re-evaluate access
        router.refresh();
        return;
      }
      dispatch(openAuthModal(false));
      notify(
        mode === AuthMode.Register
          ? `Welcome to ${siteConfig.siteName}, ${user.name}! Your account is ready.`
          : `Welcome back, ${user.name}!`
      );
      reset();
    };

    if (mode === AuthMode.Register) {
      registerMutation.mutate(
        { name: data.name, email: data.email, password: data.password },
        { onSuccess, onError }
      );
    } else {
      loginMutation.mutate({ email: data.email, password: data.password }, { onSuccess, onError });
    }
  };

  const titles: Record<AuthMode, string> = {
    [AuthMode.Login]: requireAdmin ? `Admin Sign In` : `Sign In to ${siteConfig.siteName}`,
    [AuthMode.Register]: 'Create Your Account',
    [AuthMode.Forgot]: 'Forgot Password',
    [AuthMode.Reset]: 'Reset Your Password'
  };

  const subtitle = requireAdmin
    ? 'Authenticate to access the management panel.'
    : 'Save products, track quote projects, and check out faster.';

  const isPasswordless = mode === AuthMode.Forgot;

  const card = (
    <div className="bg-neutral-900 border border-neutral-700 rounded-3xl max-w-md w-full text-neutral-100 shadow-2xl relative p-6 sm:p-8">
        {!inline && (
          <button
            onClick={close}
            className="absolute top-4 right-4 p-2 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        <div className="flex items-center gap-2 mb-1">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
            requireAdmin ? 'bg-accent-500 text-neutral-950' : 'bg-primary-700 text-primary-200'
          }`}>
            {requireAdmin ? <ShieldCheck className="w-5 h-5" /> : <Leaf className="w-5 h-5" />}
          </div>
          <h2 className="text-lg font-black text-neutral-50">{titles[mode]}</h2>
        </div>
        <p className="text-xs text-neutral-400 mb-5">
          {mode === AuthMode.Forgot
            ? 'Enter your account email and we will generate a password reset link.'
            : mode === AuthMode.Reset
              ? 'Paste your reset token and choose a new password.'
              : subtitle}
        </p>

        {/* Mode Tabs */}
        {(mode === AuthMode.Login || mode === AuthMode.Register) && (
          <div className="flex bg-neutral-950 p-1 rounded-xl border border-neutral-800 mb-5 text-xs font-bold">
            <button
              onClick={() => switchMode(AuthMode.Login)}
              className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-colors ${
                mode === AuthMode.Login ? 'bg-primary-700 text-white' : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
            <button
              onClick={() => switchMode(AuthMode.Register)}
              className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-colors ${
                mode === AuthMode.Register ? 'bg-primary-700 text-white' : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Register</span>
            </button>
          </div>
        )}

        {devResetToken && mode === AuthMode.Reset && (
          <div className="mb-4 bg-accent-950/60 border border-accent-800/60 text-accent-300 p-3 rounded-xl text-[11px]">
            Dev mode: reset token generated — already filled below.
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-xs">
          {mode === AuthMode.Register && (
            <div>
              <label className="block text-neutral-300 font-medium mb-1">
                Full Name <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                placeholder="John Doe"
                {...register('name', {
                  required: mode === AuthMode.Register ? 'Name is required' : false
                })}
                className={`w-full bg-neutral-950 text-neutral-100 border rounded-xl px-3 py-2.5 focus:outline-none ${
                  formState.errors.name ? 'border-rose-500' : 'border-neutral-700'
                }`}
              />
              {formState.errors.name && (
                <span className="text-[11px] text-rose-400 block mt-0.5">{formState.errors.name.message}</span>
              )}
            </div>
          )}

          {mode !== AuthMode.Reset && (
            <div>
              <label className="block text-neutral-300 font-medium mb-1">
                Email Address <span className="text-rose-400">*</span>
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                {...register('email', {
                  required: 'Email is required',
                  pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: 'Invalid email' }
                })}
                className={`w-full bg-neutral-950 text-neutral-100 border rounded-xl px-3 py-2.5 focus:outline-none ${
                  formState.errors.email ? 'border-rose-500' : 'border-neutral-700'
                }`}
              />
              {formState.errors.email && (
                <span className="text-[11px] text-rose-400 block mt-0.5">{formState.errors.email.message}</span>
              )}
            </div>
          )}

          {mode === AuthMode.Reset && (
            <div>
              <label className="block text-neutral-300 font-medium mb-1">
                Reset Token <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                placeholder="Paste the token from your reset link"
                {...register('resetToken', { required: 'Reset token is required' })}
                className={`w-full bg-neutral-950 text-neutral-100 border rounded-xl px-3 py-2.5 focus:outline-none font-mono ${
                  formState.errors.resetToken ? 'border-rose-500' : 'border-neutral-700'
                }`}
              />
              {formState.errors.resetToken && (
                <span className="text-[11px] text-rose-400 block mt-0.5">{formState.errors.resetToken.message}</span>
              )}
            </div>
          )}

          {!isPasswordless && (
            <div>
              <label className="block text-neutral-300 font-medium mb-1">
                {mode === AuthMode.Reset ? 'New Password' : 'Password'}{' '}
                <span className="text-rose-400">*</span>
              </label>
              <input
                type="password"
                placeholder={mode === AuthMode.Login ? '••••••••' : 'Min. 6 characters'}
                {...register('password', {
                  required: 'Password is required',
                  minLength: { value: 6, message: 'Password must be at least 6 characters' }
                })}
                className={`w-full bg-neutral-950 text-neutral-100 border rounded-xl px-3 py-2.5 focus:outline-none ${
                  formState.errors.password ? 'border-rose-500' : 'border-neutral-700'
                }`}
              />
              {formState.errors.password && (
                <span className="text-[11px] text-rose-400 block mt-0.5">{formState.errors.password.message}</span>
              )}
            </div>
          )}

          {forgotMessage && mode === AuthMode.Forgot && (
            <div className="bg-primary-950/60 border border-primary-800 text-primary-200 p-3 rounded-xl flex items-center gap-2">
              <MailCheck className="w-4 h-4 text-primary-400 shrink-0" />
              <span>{forgotMessage}</span>
            </div>
          )}

          {serverError && (
            <div className="bg-rose-950/60 border border-rose-800 text-rose-200 p-3 rounded-xl flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{serverError}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="w-full py-3 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-black text-sm flex items-center justify-center gap-2 transition-colors shadow-lg"
          >
            {mode === AuthMode.Forgot ? (
              <MailCheck className="w-4 h-4" />
            ) : mode === AuthMode.Reset ? (
              <KeyRound className="w-4 h-4" />
            ) : (
              <User className="w-4 h-4" />
            )}
            <span>
              {isPending
                ? 'Please wait...'
                : mode === AuthMode.Login
                  ? 'Sign In'
                  : mode === AuthMode.Register
                    ? 'Create Account & Sign In'
                    : mode === AuthMode.Forgot
                      ? 'Send Reset Link'
                      : 'Update Password'}
            </span>
          </button>
        </form>

        {/* Footer links */}
        <div className="mt-4 text-center text-xs text-neutral-400">
          {mode === AuthMode.Login && (
            <button
              onClick={() => switchMode(AuthMode.Forgot)}
              className="text-primary-400 hover:text-primary-300 font-semibold"
            >
              Forgot your password?
            </button>
          )}
          {(mode === AuthMode.Forgot || mode === AuthMode.Reset) && (
            <button
              onClick={() => switchMode(AuthMode.Login)}
              className="text-primary-400 hover:text-primary-300 font-semibold"
            >
              ← Back to Sign In
            </button>
          )}
        </div>
    </div>
  );

  if (inline) {
    return (
      <div className="min-h-screen bg-neutral-950 text-neutral-100 flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-15 pointer-events-none">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent-600 rounded-full blur-3xl"></div>
        </div>
        <div className="w-full max-w-md relative z-10 space-y-5">
          {card}
          <button
            onClick={() => router.push('/')}
            className="mx-auto flex items-center gap-1.5 text-xs text-neutral-400 hover:text-primary-400 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Store</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-neutral-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      {card}
    </div>
  );
};
