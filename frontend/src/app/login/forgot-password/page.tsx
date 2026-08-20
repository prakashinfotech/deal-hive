'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Mail } from 'lucide-react';
import api from '@/lib/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError('Please enter a valid email address.');
      return;
    }
    setEmailError('');
    setError('');
    setIsLoading(true);

    try {
      await api.post('/auth/forgot-password', { email });
      setSubmitted(true);
    } catch {
      // Always show success to avoid revealing whether the email exists
      setSubmitted(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex items-start justify-center pt-10 px-4 pb-16">
      <div className="w-full max-w-[420px] bg-white rounded-2xl shadow-lg overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-[#F0F0F0]">
          <Link href="/login" className="text-[#636366] hover:text-[#1A1A1A] transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-lg font-bold text-[#1A1A1A]">Reset Password</h1>
          <Link href="/" className="text-[#636366] hover:text-[#1A1A1A] transition-colors text-xl leading-none">×</Link>
        </div>

        <div className="px-6 py-6">
          {submitted ? (
            <div className="text-center py-4">
              <div className="w-14 h-14 bg-[#EFF7E6] rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-7 h-7 text-[#53A318]" />
              </div>
              <h2 className="text-base font-bold text-[#1A1A1A] mb-2">Check your email</h2>
              <p className="text-sm text-[#636366] leading-relaxed mb-6">
                If an account exists for <span className="font-medium text-[#1A1A1A]">{email}</span>,
                we've sent a password reset link. Check your inbox and spam folder.
              </p>
              <Link
                href="/login"
                className="block w-full bg-[#53A318] hover:bg-[#438F10] text-white font-bold py-3.5 rounded-full text-sm transition-colors text-center"
              >
                Back to Sign In
              </Link>
            </div>
          ) : (
            <>
              <p className="text-sm text-[#636366] mb-5 leading-relaxed">
                Enter your email address and we'll send you a link to reset your password.
              </p>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setEmailError(''); }}
                  placeholder="Email address"
                  autoComplete="email"
                  autoFocus
                  className="w-full border border-[#E0E0E0] rounded-lg px-4 py-3 text-sm outline-none focus:border-[#53A318] focus:ring-1 focus:ring-[#53A318] transition-colors"
                />
                {emailError && <p className="text-xs text-red-600">{emailError}</p>}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#53A318] hover:bg-[#438F10] text-white font-bold py-3.5 rounded-full text-sm transition-colors disabled:opacity-60"
                >
                  {isLoading ? 'Sending…' : 'Send Reset Link'}
                </button>
              </form>

              <p className="text-center mt-4 text-xs text-[#636366]">
                Remember your password?{' '}
                <Link href="/login" className="text-[#53A318] hover:underline font-medium">
                  Sign in
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
