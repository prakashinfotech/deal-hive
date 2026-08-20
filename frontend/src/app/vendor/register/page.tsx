'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import api from '@/lib/api';
import { useAppSelector } from '@/store';
import { selectCurrentUser, selectUserRole, selectIsSessionRestoring } from '@/store/slices/authSlice';
import { useQuery } from '@tanstack/react-query';
import type { Category } from '@/types';

// ─── Photo mosaic data ────────────────────────────────────────

const LEFT_PHOTOS = [
  { src: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400&q=80', alt: 'Spa massage' },
  { src: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&q=80', alt: 'Fitness class' },
  { src: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&q=80', alt: 'Fine dining' },
  { src: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=80', alt: 'Food' },
  { src: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&q=80', alt: 'Nail salon' },
  { src: 'https://images.unsplash.com/photo-1622288432450-277d0fef5ed6?w=400&q=80', alt: 'Beauty salon' },
];

const RIGHT_PHOTOS = [
  { src: 'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=400&q=80', alt: 'Wellness' },
  { src: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&q=80', alt: 'Cooking class' },
  { src: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=400&q=80', alt: 'Auto service' },
  { src: 'https://images.unsplash.com/photo-1424847651672-bf20a4b0982b?w=400&q=80', alt: 'Restaurant' },
  { src: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&q=80', alt: 'Hair salon' },
  { src: 'https://images.unsplash.com/photo-1487222444408-4bc0d13e4eb4?w=400&q=80', alt: 'Relaxation' },
];

const STORAGE_KEY = 'vendor_register_draft';

// ─── Input component ──────────────────────────────────────────

function Field({
  placeholder,
  value,
  onChange,
  type = 'text',
  required,
  readOnly,
  name,
}: {
  placeholder: string;
  value: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  required?: boolean;
  readOnly?: boolean;
  name?: string;
}) {
  return (
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      readOnly={readOnly}
      className={`w-full border border-gray-300 rounded px-4 py-3 text-sm placeholder-gray-400 focus:outline-none focus:border-[#53A318] focus:ring-1 focus:ring-[#53A318] ${
        readOnly ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : 'bg-white'
      }`}
    />
  );
}

// ─── Types ───────────────────────────────────────────────────

interface FormState {
  businessName: string;
  addressLine1: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  website: string;
  categoryId: string;
}

const emptyForm: FormState = {
  businessName: '',
  addressLine1: '',
  fullName: '',
  email: '',
  phoneNumber: '',
  website: '',
  categoryId: '',
};

// ─── Page ─────────────────────────────────────────────────────

export default function VendorRegisterPage() {
  const router = useRouter();
  const user = useAppSelector(selectCurrentUser);
  const role = useAppSelector(selectUserRole);
  const isSessionRestoring = useAppSelector(selectIsSessionRestoring);

  const [form, setForm] = useState<FormState>(emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: categories } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: () => api.get<Category[]>('/categories').then((r) => r.data),
    staleTime: 600_000,
  });

  // Restore a saved draft from sessionStorage (set before login redirect)
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) setForm(JSON.parse(saved));
    } catch {
      // ignore parse errors
    }
  }, []);

  // If the user just logged in and came back here as a non-vendor, auto-submit the saved draft
  useEffect(() => {
    if (isSessionRestoring) return;
    if (role !== 'Consumer' && role !== undefined) return; // already vendor or still unauthenticated

    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (!saved || !user) return; // no saved draft or not logged in yet

    // Authenticated Consumer with a saved draft → submit immediately
    let draft: FormState;
    try { draft = JSON.parse(saved); } catch { return; }

    sessionStorage.removeItem(STORAGE_KEY);
    setIsSubmitting(true);

    api.post('/vendors/register', {
      businessName: draft.businessName,
      addressLine1: draft.addressLine1,
      phoneNumber: draft.phoneNumber || null,
      website: draft.website || null,
      categoryId: draft.categoryId ? parseInt(draft.categoryId, 10) : null,
    })
      .then(() => { window.location.href = '/vendor/dashboard'; })
      .catch((err: any) => {
        setError(err.response?.data?.detail ?? err.response?.data?.title ?? 'Registration failed.');
        setIsSubmitting(false);
      });
  }, [isSessionRestoring, user, role]);

  // Already a vendor — go straight to dashboard
  if (role === 'Vendor') {
    router.replace('/vendor/dashboard');
    return null;
  }

  const set = (field: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Not logged in → save draft and send to login (pre-fill email in login form via query param)
    if (!user) {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(form));
      const loginUrl = `/login?redirect=${encodeURIComponent('/vendor/register')}${form.email ? `&email=${encodeURIComponent(form.email)}` : ''}`;
      router.push(loginUrl);
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post('/vendors/register', {
        businessName: form.businessName,
        addressLine1: form.addressLine1,
        phoneNumber: form.phoneNumber || null,
        website: form.website || null,
        categoryId: form.categoryId ? parseInt(form.categoryId, 10) : null,
      });
      // Full reload so restoreSession fetches a new JWT with Vendor role
      window.location.href = '/vendor/dashboard';
    } catch (err: any) {
      setError(
        err.response?.data?.detail ??
          err.response?.data?.title ??
          'Sign up failed. Please try again.'
      );
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen overflow-hidden bg-white">
      {/* ── Left photo mosaic ── */}
      <div className="hidden xl:grid grid-cols-2 flex-1 overflow-hidden" style={{ maxHeight: '100vh' }}>
        {LEFT_PHOTOS.map((photo, i) => (
          <div key={i} className="relative overflow-hidden" style={{ height: 'calc(100vh / 3)' }}>
            <Image src={photo.src} alt={photo.alt} fill className="object-cover" sizes="200px" />
          </div>
        ))}
      </div>

      {/* ── Center: header + form ── */}
      <div className="flex flex-col flex-none w-full xl:w-[520px] min-h-screen border-x border-gray-100 bg-white overflow-y-auto">

        {/* Header */}
        <header className="flex items-center justify-between px-8 py-4 border-b border-gray-100 flex-shrink-0">
          <Link href="/" className="flex items-baseline gap-0.5">
            <span className="font-black text-xl text-[#53A318] tracking-tight">DealHive</span>
            <span className="font-bold text-xl text-[#1A1A1A] ml-1.5">Merchant</span>
          </Link>
          <div className="flex items-center gap-4 text-sm">
            {user ? (
              <span className="text-gray-500 text-xs">
                Signed in as <strong>{user.firstName}</strong>
              </span>
            ) : (
              <Link
                href={`/login?redirect=${encodeURIComponent('/vendor/register')}`}
                className="text-gray-500 hover:text-[#53A318] transition-colors"
              >
                Login
              </Link>
            )}
            <Link
              href="/"
              className="bg-[#53A318] hover:bg-[#438F10] text-white font-bold text-sm px-4 py-2 rounded-full transition-colors"
            >
              Back to DealHive
            </Link>
          </div>
        </header>

        {/* Form area */}
        <div className="flex-1 flex flex-col justify-center px-8 py-8">
          {/* Headline */}
          <div className="text-center mb-7">
            <h1 className="text-[28px] font-black text-[#1A1A1A] leading-tight mb-2">
              Fill More Seats And Attract<br />
              New Local Customers —{' '}
              <span className="text-[#53A318]">Without Upfront Cost</span>
            </h1>
            <p className="text-sm text-gray-500">
              DealHive helps local businesses reach nearby customers who are ready to buy.
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700 text-center">
              {error}
            </div>
          )}

          {/* Auto-submitting indicator */}
          {isSubmitting && !user && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded text-sm text-green-700 text-center">
              Completing your vendor registration…
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Business Name */}
            <Field
              placeholder="Business Name"
              name="businessName"
              value={form.businessName}
              onChange={set('businessName')}
              required
            />

            {/* Business Address */}
            <Field
              placeholder="Business Address"
              name="addressLine1"
              value={form.addressLine1}
              onChange={set('addressLine1')}
              required
            />

            {/* First & Last Name */}
            <Field
              placeholder="First & Last Name"
              name="fullName"
              value={user ? `${user.firstName} ${user.lastName}` : form.fullName}
              readOnly={!!user}
              onChange={user ? undefined : set('fullName')}
            />

            {/* Email */}
            <Field
              placeholder="Email Address"
              type="email"
              name="email"
              value={user ? user.email : form.email}
              readOnly={!!user}
              onChange={user ? undefined : set('email')}
            />

            {/* Phone */}
            <Field
              placeholder="Phone Number"
              name="phoneNumber"
              type="tel"
              value={form.phoneNumber}
              onChange={set('phoneNumber')}
            />

            {/* Website */}
            <Field
              placeholder="Website or Social Media Page"
              name="website"
              type="url"
              value={form.website}
              onChange={set('website')}
            />

            {/* Type of business */}
            <div className="relative">
              <select
                value={form.categoryId}
                onChange={set('categoryId')}
                className="w-full border border-gray-300 rounded px-4 py-3 text-sm bg-white focus:outline-none focus:border-[#53A318] focus:ring-1 focus:ring-[#53A318] appearance-none text-gray-700"
              >
                <option value="">Choose a category</option>
                {categories?.map((cat) => (
                  <option key={cat.id} value={String(cat.id)}>
                    {cat.name}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Terms */}
            <p className="text-xs text-gray-500 text-center leading-relaxed pt-1">
              By clicking below, I agree to the{' '}
              <Link href="/terms" className="text-[#53A318] hover:underline">Terms of Use</Link>
              {' '}and that I have read the{' '}
              <Link href="/privacy" className="text-[#53A318] hover:underline">Privacy Statement</Link>.
            </p>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#53A318] hover:bg-[#438F10] disabled:opacity-60 disabled:cursor-not-allowed text-white font-black text-base py-3.5 rounded-full transition-colors"
            >
              {isSubmitting
                ? 'Please wait…'
                : user
                ? 'Sign Up'
                : 'Sign Up — Continue to Login'}
            </button>

            {/* Login hint for unauthenticated users */}
            {!user && (
              <p className="text-xs text-gray-400 text-center">
                Already have an account?{' '}
                <Link
                  href={`/login?redirect=${encodeURIComponent('/vendor/register')}`}
                  className="text-[#53A318] hover:underline font-medium"
                >
                  Log in to complete setup
                </Link>
              </p>
            )}
          </form>
        </div>
      </div>

      {/* ── Right photo mosaic ── */}
      <div className="hidden xl:grid grid-cols-2 flex-1 overflow-hidden" style={{ maxHeight: '100vh' }}>
        {RIGHT_PHOTOS.map((photo, i) => (
          <div key={i} className="relative overflow-hidden" style={{ height: 'calc(100vh / 3)' }}>
            <Image src={photo.src} alt={photo.alt} fill className="object-cover" sizes="200px" />
          </div>
        ))}
      </div>
    </div>
  );
}
