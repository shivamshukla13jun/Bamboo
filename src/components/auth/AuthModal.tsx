'use client';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { useMutation } from '@tanstack/react-query';
import { RootState } from '../../store';
import { setUser, openAuthModal } from '../../store/authSlice';
import { setNotification } from '../../store/adminSlice';
import { useFormReduxSync } from '../../hooks/useFormReduxSync';
import { loginApi, registerApi } from '../../services/api';
import { X, User, ShieldAlert, Leaf, UserPlus, LogIn } from 'lucide-react';

interface AuthInputs {
  name: string;
  email: string;
  password: string;
}

/** Customer sign-in / register modal. */
export const AuthModal: React.FC = () => {
  const dispatch = useDispatch();
  const isOpen = useSelector((state: RootState) => state.auth.isAuthModalOpen);
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [serverError, setServerError] = useState('');

  const loginMutation = useMutation({ mutationFn: loginApi });
  const registerMutation = useMutation({ mutationFn: registerApi });
  const isPending = loginMutation.isPending || registerMutation.isPending;

  const { register, handleSubmit, reset, formState } = useForm<AuthInputs>({
    mode: 'onChange',
    defaultValues: { name: '', email: '', password: '' }
  });

  useFormReduxSync(mode === 'login' ? 'customer-login-form' : 'customer-register-form', formState);

  if (!isOpen) return null;

  const close = () => {
    dispatch(openAuthModal(false));
    setServerError('');
  };

  const onSubmit = (data: AuthInputs) => {
    setServerError('');
    const onSuccess = (user: any) => {
      dispatch(setUser(user));
      dispatch(openAuthModal(false));
      dispatch(
        setNotification({
          message:
            mode === 'register'
              ? `Welcome to Bamboorise, ${user.name}! Your account is ready.`
              : `Welcome back, ${user.name}!`,
          type: 'success'
        })
      );
      reset();
    };
    const onError = (err: any) => setServerError(err.message || 'Request failed');

    if (mode === 'register') {
      registerMutation.mutate(
        { name: data.name, email: data.email, password: data.password },
        { onSuccess, onError }
      );
    } else {
      loginMutation.mutate({ email: data.email, password: data.password }, { onSuccess, onError });
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-stone-900 border border-stone-700 rounded-3xl max-w-md w-full text-stone-100 shadow-2xl relative p-6 sm:p-8">
        <button
          onClick={close}
          className="absolute top-4 right-4 p-2 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-1">
          <div className="w-9 h-9 rounded-xl bg-emerald-700 flex items-center justify-center text-emerald-200">
            <Leaf className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-black text-stone-50">
            {mode === 'login' ? 'Sign In to Bamboorise' : 'Create Your Account'}
          </h2>
        </div>
        <p className="text-xs text-stone-400 mb-5">
          Save eco-products, track bamboo home quotes, and check out faster.
        </p>

        {/* Mode Tabs */}
        <div className="flex bg-stone-950 p-1 rounded-xl border border-stone-800 mb-5 text-xs font-bold">
          <button
            onClick={() => {
              setMode('login');
              setServerError('');
            }}
            className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-colors ${
              mode === 'login' ? 'bg-emerald-700 text-white' : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>
          <button
            onClick={() => {
              setMode('register');
              setServerError('');
            }}
            className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-colors ${
              mode === 'register' ? 'bg-emerald-700 text-white' : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Register</span>
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-xs">
          {mode === 'register' && (
            <div>
              <label className="block text-stone-300 font-medium mb-1">
                Full Name <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                placeholder="John Doe"
                {...register('name', {
                  required: mode === 'register' ? 'Name is required' : false
                })}
                className={`w-full bg-stone-950 text-stone-100 border rounded-xl px-3 py-2.5 focus:outline-none ${
                  formState.errors.name ? 'border-rose-500' : 'border-stone-700'
                }`}
              />
              {formState.errors.name && (
                <span className="text-[11px] text-rose-400 block mt-0.5">{formState.errors.name.message}</span>
              )}
            </div>
          )}

          <div>
            <label className="block text-stone-300 font-medium mb-1">
              Email Address <span className="text-rose-400">*</span>
            </label>
            <input
              type="email"
              placeholder="you@example.com"
              {...register('email', {
                required: 'Email is required',
                pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: 'Invalid email' }
              })}
              className={`w-full bg-stone-950 text-stone-100 border rounded-xl px-3 py-2.5 focus:outline-none ${
                formState.errors.email ? 'border-rose-500' : 'border-stone-700'
              }`}
            />
            {formState.errors.email && (
              <span className="text-[11px] text-rose-400 block mt-0.5">{formState.errors.email.message}</span>
            )}
          </div>

          <div>
            <label className="block text-stone-300 font-medium mb-1">
              Password <span className="text-rose-400">*</span>
            </label>
            <input
              type="password"
              placeholder={mode === 'register' ? 'Min. 6 characters' : '••••••••'}
              {...register('password', {
                required: 'Password is required',
                minLength: { value: 6, message: 'Password must be at least 6 characters' }
              })}
              className={`w-full bg-stone-950 text-stone-100 border rounded-xl px-3 py-2.5 focus:outline-none ${
                formState.errors.password ? 'border-rose-500' : 'border-stone-700'
              }`}
            />
            {formState.errors.password && (
              <span className="text-[11px] text-rose-400 block mt-0.5">{formState.errors.password.message}</span>
            )}
          </div>

          {serverError && (
            <div className="bg-rose-950/60 border border-rose-800 text-rose-200 p-3 rounded-xl flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{serverError}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm flex items-center justify-center gap-2 transition-colors shadow-lg"
          >
            <User className="w-4 h-4" />
            <span>
              {isPending
                ? 'Please wait...'
                : mode === 'login'
                  ? 'Sign In'
                  : 'Create Account & Sign In'}
            </span>
          </button>
        </form>
      </div>
    </div>
  );
};
