'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, CheckCircle, Eye, EyeOff } from 'lucide-react';
import api from '@/lib/api';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const email = searchParams.get('email') ?? '';
  const token = searchParams.get('token') ?? '';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ newPassword?: string; confirmPassword?: string }>({});
  const [apiError, setApiError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [succeeded, setSucceeded] = useState(false);

  const validate = () => {
    const e: typeof errors = {};
    if (!newPassword) {
      e.newPassword = 'Password is required.';
    } else if (newPassword.length < 8) {
      e.newPassword = 'Password must be at least 8 characters.';
    } else if (!/[A-Z]/.test(newPassword)) {
      e.newPassword = 'Password must contain an uppercase letter.';
    } else if (!/[0-9]/.test(newPassword)) {
      e.newPassword = 'Password must contain a digit.';
    }
    if (!confirmPassword) {
      e.confirmPassword = 'Please confirm your password.';
    } else if (newPassword !== confirmPassword) {
      e.confirmPassword = 'Passwords do not match.';
    }
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setApiError('');
    setIsLoading(true);

    try {
      await api.post('/auth/reset-password', { email, token, newPassword });
      setSucceeded(true);
    } catch (err: any) {
      setApiError(
        err.response?.data?.detail ??
        err.response?.data?.title ??
        'Password reset failed. The link may have expired — please request a new one.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Guard: missing token or email in URL
  if (!token || !email) {
    return (
      <div className="px-6 py-6 text-center">
        <p className="text-sm text-[#636366] mb-4">
          This reset link is invalid or has expired.
        </p>
        <Link
          href="/login/forgot-password"
          className="inline-block bg-[#53A318] hover:bg-[#438F10] text-white font-bold py-3 px-8 rounded-full text-sm transition-colors"
        >
          Request New Link
        </Link>
      </div>
    );
  }

  if (succeeded) {
    return (
      <div className="px-6 py-6 text-center">
        <div className="w-14 h-14 bg-[#EFF7E6] rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-7 h-7 text-[#53A318]" />
        </div>
        <h2 className="text-base font-bold text-[#1A1A1A] mb-2">Password Updated</h2>
        <p className="text-sm text-[#636366] mb-6">
          Your password has been reset successfully. You can now sign in with your new password.
        </p>
        <Link
          href="/login"
          className="block w-full bg-[#53A318] hover:bg-[#438F10] text-white font-bold py-3.5 rounded-full text-sm transition-colors text-center"
        >
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="px-6 py-6">
      <p className="text-sm text-[#636366] mb-5 leading-relaxed">
        Enter a new password for <span className="font-medium text-[#1A1A1A]">{email}</span>.
      </p>

      {apiError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs">
          {apiError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        {/* New password */}
        <div>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => { setNewPassword(e.target.value); setErrors(prev => ({ ...prev, newPassword: undefined })); }}
              placeholder="New password"
              autoComplete="new-password"
              autoFocus
              className="w-full border border-[#E0E0E0] rounded-lg px-4 py-3 pr-10 text-sm outline-none focus:border-[#53A318] focus:ring-1 focus:ring-[#53A318] transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowPassword(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#636366]"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.newPassword && <p className="text-xs text-red-600 mt-1">{errors.newPassword}</p>}
        </div>

        {/* Confirm password */}
        <div>
          <input
            type={showPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => { setConfirmPassword(e.target.value); setErrors(prev => ({ ...prev, confirmPassword: undefined })); }}
            placeholder="Confirm new password"
            autoComplete="new-password"
            className="w-full border border-[#E0E0E0] rounded-lg px-4 py-3 text-sm outline-none focus:border-[#53A318] focus:ring-1 focus:ring-[#53A318] transition-colors"
          />
          {errors.confirmPassword && <p className="text-xs text-red-600 mt-1">{errors.confirmPassword}</p>}
        </div>

        <p className="text-[11px] text-[#9CA3AF] leading-relaxed">
          Must be at least 8 characters with one uppercase letter and one number.
        </p>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-[#53A318] hover:bg-[#438F10] text-white font-bold py-3.5 rounded-full text-sm transition-colors disabled:opacity-60"
        >
          {isLoading ? 'Resetting…' : 'Reset Password'}
        </button>
      </form>

      <p className="text-center mt-4 text-xs text-[#636366]">
        Remember your password?{' '}
        <Link href="/login" className="text-[#53A318] hover:underline font-medium">
          Sign in
        </Link>
      </p>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-[#F5F5F5] flex items-start justify-center pt-10 px-4 pb-16">
      <div className="w-full max-w-[420px] bg-white rounded-2xl shadow-lg overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-[#F0F0F0]">
          <Link href="/login/forgot-password" className="text-[#636366] hover:text-[#1A1A1A] transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-lg font-bold text-[#1A1A1A]">Set New Password</h1>
          <Link href="/" className="text-[#636366] hover:text-[#1A1A1A] transition-colors text-xl leading-none">×</Link>
        </div>

        <Suspense fallback={<div className="px-6 py-8 text-center text-sm text-gray-400">Loading…</div>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
