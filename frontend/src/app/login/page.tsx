'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Tag, Eye, Gift, Languages, ChevronRight, Store } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store';
import { login, selectAuthLoading, selectAuthError } from '@/store/slices/authSlice';

// ── Social button ──────────────────────────────────────────────
function SocialBtn({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <button className="flex-1 flex items-center justify-center gap-2 border border-[#E0E0E0] rounded-full py-2.5 px-3 text-sm font-semibold text-[#1A1A1A] hover:bg-gray-50 transition-colors">
      {icon}
      <span>{label}</span>
    </button>
  );
}

// ── Google icon ────────────────────────────────────────────────
function GoogleIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );
}

// ── Apple icon ─────────────────────────────────────────────────
function AppleIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
    </svg>
  );
}

// ── Facebook icon ──────────────────────────────────────────────
function FacebookIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="#1877F2">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  );
}

// ── Quick link row ─────────────────────────────────────────────
function QuickLink({ icon, label, right, href }: {
  icon: React.ReactNode;
  label: string;
  right?: React.ReactNode;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between py-3 border-b border-[#F0F0F0] last:border-0 hover:bg-gray-50 -mx-6 px-6 transition-colors"
    >
      <div className="flex items-center gap-3 text-sm text-[#1A1A1A]">
        <span className="text-[#636366]">{icon}</span>
        {label}
      </div>
      <div className="flex items-center gap-1 text-sm text-[#636366]">
        {right}
        <ChevronRight className="w-4 h-4" />
      </div>
    </Link>
  );
}

// ── Page ───────────────────────────────────────────────────────
export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const isLoading = useAppSelector(selectAuthLoading);
  const authError = useAppSelector(selectAuthError);

  const [step, setStep] = useState<'email' | 'password'>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [pwError, setPwError] = useState('');

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError('Please enter a valid email address.');
      return;
    }
    setEmailError('');
    setStep('password');
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) { setPwError('Password is required.'); return; }
    setPwError('');
    const result = await dispatch(login({ email, password }));
    if (login.fulfilled.match(result)) {
      const redirect = searchParams.get('redirect') ?? '/';
      router.push(redirect);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex items-start justify-center pt-10 px-4 pb-16">
      <div className="w-full max-w-[420px] bg-white rounded-2xl shadow-lg overflow-hidden">

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-[#F0F0F0]">
          {step === 'password' ? (
            <button onClick={() => setStep('email')} className="text-[#636366] hover:text-[#1A1A1A] transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
          ) : (
            <div className="w-5" />
          )}
          <h1 className="text-lg font-bold text-[#1A1A1A]">Log in or sign up</h1>
          <Link href="/" className="text-[#636366] hover:text-[#1A1A1A] transition-colors text-xl leading-none">×</Link>
        </div>

        <div className="px-6 py-5">

          {/* ── Step 1 : Email ── */}
          {step === 'email' && (
            <>
              {/* Social buttons */}
              <div className="flex gap-2 mb-4">
                <SocialBtn icon={<GoogleIcon />} label="Google" />
                <SocialBtn icon={<AppleIcon />} label="Apple" />
                <SocialBtn icon={<FacebookIcon />} label="Facebook" />
              </div>

              {/* Divider */}
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 h-px bg-[#E0E0E0]" />
                <span className="text-xs text-[#636366]">Or use an email</span>
                <div className="flex-1 h-px bg-[#E0E0E0]" />
              </div>

              {/* Email form */}
              <form onSubmit={handleContinue} className="space-y-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setEmailError(''); }}
                  placeholder="Email"
                  autoComplete="email"
                  autoFocus
                  className="w-full border border-[#E0E0E0] rounded-lg px-4 py-3 text-sm outline-none focus:border-[#53A318] focus:ring-1 focus:ring-[#53A318] transition-colors"
                />
                {emailError && <p className="text-xs text-red-600">{emailError}</p>}

                <button
                  type="submit"
                  className="w-full bg-[#53A318] hover:bg-[#438F10] text-white font-bold py-3.5 rounded-full text-sm transition-colors"
                >
                  Continue
                </button>
              </form>

              {/* Legal */}
              <p className="text-[11px] text-[#9CA3AF] text-center mt-3 leading-relaxed">
                By clicking an option above, I agree to the{' '}
                <a href="/terms" className="underline text-[#636366]">Terms and Conditions</a>
                {' '}and have read the{' '}
                <a href="/privacy" className="underline text-[#636366]">Privacy Statement</a>.
              </p>
            </>
          )}

          {/* ── Step 2 : Password ── */}
          {step === 'password' && (
            <>
              <p className="text-sm text-[#636366] mb-4 text-center">{email}</p>

              {authError && (
                <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs">
                  {authError}
                </div>
              )}

              <form onSubmit={handleSignIn} className="space-y-3">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setPwError(''); }}
                  placeholder="Password"
                  autoComplete="current-password"
                  autoFocus
                  className="w-full border border-[#E0E0E0] rounded-lg px-4 py-3 text-sm outline-none focus:border-[#53A318] focus:ring-1 focus:ring-[#53A318] transition-colors"
                />
                {pwError && <p className="text-xs text-red-600">{pwError}</p>}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#53A318] hover:bg-[#438F10] text-white font-bold py-3.5 rounded-full text-sm transition-colors disabled:opacity-60"
                >
                  {isLoading ? 'Signing in…' : 'Sign In'}
                </button>
              </form>

              <div className="flex items-center justify-between mt-3 text-xs">
                <Link href="/login/forgot-password" className="text-[#53A318] hover:underline">
                  Forgot password?
                </Link>
                <Link href={`/signup?email=${encodeURIComponent(email)}`} className="text-[#53A318] hover:underline">
                  Create account
                </Link>
              </div>
            </>
          )}

          {/* ── Quick links ── */}
          <div className="mt-5 border-t border-[#F0F0F0] pt-2">
            <QuickLink href="/account/groupons" icon={<Tag className="w-4 h-4" />} label="My Groupons" />
            <QuickLink href="/account/orders" icon={<Eye className="w-4 h-4" />} label="Recently Viewed" />
            <QuickLink href="/gift" icon={<Gift className="w-4 h-4" />} label="Redeem Gift Card" />
            <QuickLink
              href="#"
              icon={<Languages className="w-4 h-4" />}
              label="Language"
              right={<span className="text-xs">🇺🇸 English</span>}
            />
          </div>

          {/* ── Sell on DealHive ── */}
          <div className="mt-4 pt-4 border-t border-[#F0F0F0]">
            <Link
              href="/vendor/register"
              className="flex items-center justify-center gap-2 w-full border-2 border-[#53A318] text-[#53A318] font-bold text-sm py-3 rounded-full hover:bg-[#EFF7E6] transition-colors"
            >
              <Store className="w-4 h-4" />
              Sell on DealHive
            </Link>
          </div>

          {/* ── Get the App ── */}
          <div className="mt-4 pt-4 border-t border-[#F0F0F0] flex items-start gap-3">
            <div className="flex-1">
              <p className="text-xs font-bold text-[#53A318] mb-0.5">Get the DealHive App</p>
              <p className="text-sm font-bold text-[#1A1A1A] leading-snug mb-1">
                Unlock up to 90% discounts on the go!
              </p>
              <p className="text-xs text-[#636366] leading-relaxed mb-2">
                Exclusive deals, push notifications, and digital vouchers at your fingertips.
              </p>
              <div className="flex text-[#FFB800] text-sm">{'★★★★★'}</div>
            </div>
            {/* QR code placeholder */}
            <div className="w-16 h-16 bg-[#1A1A1A] rounded flex-shrink-0 flex items-center justify-center">
              <svg viewBox="0 0 64 64" className="w-14 h-14 text-white" fill="currentColor">
                <rect x="4" y="4" width="24" height="24" rx="2" />
                <rect x="8" y="8" width="16" height="16" rx="1" fill="#1A1A1A" />
                <rect x="10" y="10" width="12" height="12" />
                <rect x="36" y="4" width="24" height="24" rx="2" />
                <rect x="40" y="8" width="16" height="16" rx="1" fill="#1A1A1A" />
                <rect x="42" y="10" width="12" height="12" />
                <rect x="4" y="36" width="24" height="24" rx="2" />
                <rect x="8" y="40" width="16" height="16" rx="1" fill="#1A1A1A" />
                <rect x="10" y="42" width="12" height="12" />
                <rect x="36" y="36" width="8" height="8" />
                <rect x="48" y="36" width="8" height="8" />
                <rect x="36" y="48" width="8" height="8" />
                <rect x="48" y="48" width="8" height="8" />
              </svg>
            </div>
          </div>

          <Link
            href="#"
            className="mt-3 block w-full bg-[#53A318] hover:bg-[#438F10] text-white font-bold text-sm py-3 rounded-full text-center transition-colors"
          >
            Get the App
          </Link>

        </div>
      </div>
    </div>
  );
}
