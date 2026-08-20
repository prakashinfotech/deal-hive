'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import type { User } from '@/types';

const profileSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName: z.string().min(1, 'Last name is required').max(100),
  email: z.string().email(),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'At least 8 characters')
    .regex(/[A-Z]/, 'Must contain an uppercase letter')
    .regex(/[0-9]/, 'Must contain a digit'),
  confirmPassword: z.string(),
}).refine((d) => d.newPassword === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type ProfileFormData = z.infer<typeof profileSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

function InputField({ label, error, ...props }: { label: string; error?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        {...props}
        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm disabled:bg-gray-50 disabled:text-gray-500"
      />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

export default function ProfilePage() {
  const qc = useQueryClient();

  const { data: user } = useQuery<User>({
    queryKey: ['me'],
    queryFn: () => api.get<User>('/users/me').then((r) => r.data),
  });

  const profileForm = useForm<ProfileFormData>({ resolver: zodResolver(profileSchema) });
  const passwordForm = useForm<PasswordFormData>({ resolver: zodResolver(passwordSchema) });

  useEffect(() => {
    if (user) {
      profileForm.reset({ firstName: user.firstName, lastName: user.lastName, email: user.email });
    }
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  const updateProfile = useMutation({
    mutationFn: (data: ProfileFormData) => api.put('/users/me', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['me'] });
      toast.success('Profile updated successfully');
    },
    onError: () => toast.error('Failed to update profile'),
  });

  const changePassword = useMutation({
    mutationFn: (data: PasswordFormData) => api.post('/users/me/change-password', data),
    onSuccess: () => {
      passwordForm.reset();
      toast.success('Password changed successfully');
    },
    onError: () => toast.error('Failed to change password. Check your current password.'),
  });

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold">Profile Settings</h1>

      {/* Profile section */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Personal Information</h2>
        <form onSubmit={profileForm.handleSubmit((d) => updateProfile.mutate(d))} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <InputField
              label="First name"
              {...profileForm.register('firstName')}
              error={profileForm.formState.errors.firstName?.message}
            />
            <InputField
              label="Last name"
              {...profileForm.register('lastName')}
              error={profileForm.formState.errors.lastName?.message}
            />
          </div>
          <InputField
            label="Email address"
            type="email"
            {...profileForm.register('email')}
            disabled
            error={profileForm.formState.errors.email?.message}
          />
          <p className="text-xs text-gray-400">Email changes require verification and are not yet supported.</p>
          <button
            type="submit"
            disabled={updateProfile.isPending}
            className="bg-primary hover:bg-primary-dark text-white font-semibold px-6 py-2.5 rounded-lg transition-colors disabled:opacity-60 text-sm"
          >
            {updateProfile.isPending ? 'Saving…' : 'Save Changes'}
          </button>
        </form>
      </div>

      {/* Change password section */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Change Password</h2>
        <form onSubmit={passwordForm.handleSubmit((d) => changePassword.mutate(d))} className="space-y-4">
          <InputField
            label="Current password"
            type="password"
            autoComplete="current-password"
            {...passwordForm.register('currentPassword')}
            error={passwordForm.formState.errors.currentPassword?.message}
          />
          <InputField
            label="New password"
            type="password"
            autoComplete="new-password"
            placeholder="Min 8 characters, 1 uppercase, 1 digit"
            {...passwordForm.register('newPassword')}
            error={passwordForm.formState.errors.newPassword?.message}
          />
          <InputField
            label="Confirm new password"
            type="password"
            autoComplete="new-password"
            {...passwordForm.register('confirmPassword')}
            error={passwordForm.formState.errors.confirmPassword?.message}
          />
          <button
            type="submit"
            disabled={changePassword.isPending}
            className="bg-primary hover:bg-primary-dark text-white font-semibold px-6 py-2.5 rounded-lg transition-colors disabled:opacity-60 text-sm"
          >
            {changePassword.isPending ? 'Updating…' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
