'use client';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { useMutation } from '@tanstack/react-query';
import { RootState } from '../../store';
import { setUser } from '../../store/authSlice';
import { setNotification, NotificationType } from '../../store/adminSlice';
import { useFormReduxSync } from '../../hooks/useFormReduxSync';
import { updateProfileApi, changePasswordApi } from '../../services/api';
import { User, KeyRound, Save, ShieldCheck } from 'lucide-react';

interface ProfileInputs {
  name: string;
}

interface PasswordInputs {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export const AccountProfile: React.FC = () => {
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);
  const [pwError, setPwError] = useState('');

  const profileMutation = useMutation({ mutationFn: updateProfileApi });
  const passwordMutation = useMutation({ mutationFn: changePasswordApi });

  const profileForm = useForm<ProfileInputs>({
    mode: 'onChange',
    defaultValues: { name: user?.name || '' }
  });
  const passwordForm = useForm<PasswordInputs>({
    mode: 'onChange',
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' }
  });

  useFormReduxSync('account-profile-form', profileForm.formState);
  useFormReduxSync('account-password-form', passwordForm.formState);

  const onSaveProfile = (data: ProfileInputs) => {
    profileMutation.mutate(data.name, {
      onSuccess: (updated) => {
        dispatch(setUser(updated));
        dispatch(setNotification({ message: 'Profile updated!', type: NotificationType.Success }));
      },
      onError: (err: any) =>
        dispatch(setNotification({ message: err.message || 'Update failed', type: NotificationType.Error }))
    });
  };

  const onChangePassword = (data: PasswordInputs) => {
    setPwError('');
    if (data.newPassword !== data.confirmPassword) {
      setPwError('New passwords do not match');
      return;
    }
    passwordMutation.mutate(
      { currentPassword: data.currentPassword, newPassword: data.newPassword },
      {
        onSuccess: (res) => {
          dispatch(setNotification({ message: `✅ ${res.message}`, type: NotificationType.Success }));
          passwordForm.reset();
        },
        onError: (err: any) => setPwError(err.message || 'Change failed')
      }
    );
  };

  const inputCls = (hasErr: boolean) =>
    `w-full bg-neutral-950 text-neutral-100 border rounded-xl px-3 py-2.5 text-sm focus:outline-none ${
      hasErr ? 'border-rose-500' : 'border-neutral-700'
    }`;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-neutral-50">Profile & Security</h1>
        <p className="text-neutral-400 text-xs mt-1">Manage your account details and password.</p>
      </div>

      {/* Profile */}
      <form onSubmit={profileForm.handleSubmit(onSaveProfile)} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-4 max-w-lg">
        <h3 className="font-bold text-neutral-100 text-sm flex items-center gap-2">
          <User className="w-4 h-4 text-primary-400" />
          <span>Profile</span>
        </h3>
        <div>
          <label className="block text-xs font-bold text-neutral-300 mb-1">Email</label>
          <input
            type="email"
            value={user?.email || ''}
            disabled
            className="w-full bg-neutral-950 text-neutral-500 border border-neutral-800 rounded-xl px-3 py-2.5 text-sm cursor-not-allowed"
          />
          <span className="text-[10px] text-neutral-500 block mt-0.5">Email can't be changed.</span>
        </div>
        <div>
          <label className="block text-xs font-bold text-neutral-300 mb-1">Full Name</label>
          <input
            type="text"
            {...profileForm.register('name', { required: 'Name is required' })}
            className={inputCls(!!profileForm.formState.errors.name)}
          />
          {profileForm.formState.errors.name && (
            <span className="text-[11px] text-rose-400 block mt-0.5">{profileForm.formState.errors.name.message}</span>
          )}
        </div>
        <button
          type="submit"
          disabled={profileMutation.isPending}
          className="px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-bold text-xs flex items-center gap-1.5"
        >
          <Save className="w-3.5 h-3.5" />
          <span>{profileMutation.isPending ? 'Saving...' : 'Save Profile'}</span>
        </button>
      </form>

      {/* Password */}
      <form onSubmit={passwordForm.handleSubmit(onChangePassword)} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-4 max-w-lg">
        <h3 className="font-bold text-neutral-100 text-sm flex items-center gap-2">
          <KeyRound className="w-4 h-4 text-accent-400" />
          <span>Change Password</span>
        </h3>
        <div>
          <label className="block text-xs font-bold text-neutral-300 mb-1">Current Password</label>
          <input
            type="password"
            {...passwordForm.register('currentPassword', { required: 'Current password is required' })}
            className={inputCls(!!passwordForm.formState.errors.currentPassword)}
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-neutral-300 mb-1">New Password</label>
          <input
            type="password"
            {...passwordForm.register('newPassword', {
              required: 'New password is required',
              minLength: { value: 6, message: 'Min. 6 characters' }
            })}
            className={inputCls(!!passwordForm.formState.errors.newPassword)}
          />
          {passwordForm.formState.errors.newPassword && (
            <span className="text-[11px] text-rose-400 block mt-0.5">{passwordForm.formState.errors.newPassword.message}</span>
          )}
        </div>
        <div>
          <label className="block text-xs font-bold text-neutral-300 mb-1">Confirm New Password</label>
          <input
            type="password"
            {...passwordForm.register('confirmPassword', { required: 'Please confirm the password' })}
            className={inputCls(!!passwordForm.formState.errors.confirmPassword)}
          />
        </div>
        {pwError && (
          <div className="bg-rose-950/60 border border-rose-800 text-rose-200 p-3 rounded-xl text-xs flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{pwError}</span>
          </div>
        )}
        <button
          type="submit"
          disabled={passwordMutation.isPending}
          className="px-4 py-2.5 rounded-xl bg-accent-600 hover:bg-accent-500 text-neutral-950 font-bold text-xs flex items-center gap-1.5"
        >
          <KeyRound className="w-3.5 h-3.5" />
          <span>{passwordMutation.isPending ? 'Updating...' : 'Update Password'}</span>
        </button>
      </form>
    </div>
  );
};
