'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Store } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store';
import { register as registerUser, selectAuthLoading, selectAuthError } from '@/store/slices/authSlice';

const schema = z.object({
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName: z.string().min(1, 'Last name is required').max(100),
  email: z.string().email('Invalid email address'),
  password: z.string()
    .min(8, 'At least 8 characters')
    .regex(/[A-Z]/, 'Must contain an uppercase letter')
    .regex(/[0-9]/, 'Must contain a digit'),
});
type FormData = z.infer<typeof schema>;

export default function SignupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const isLoading = useAppSelector(selectAuthLoading);
  const error = useAppSelector(selectAuthError);

  const prefillEmail = searchParams.get('email') ?? '';

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: prefillEmail },
  });

  const onSubmit = async (data: FormData) => {
    const result = await dispatch(registerUser(data));
    if (registerUser.fulfilled.match(result)) {
      router.push('/?registered=1');
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex items-start justify-center pt-10 px-4 pb-16">
      <div className="w-full max-w-[420px] bg-white rounded-2xl shadow-lg overflow-hidden">

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-[#F0F0F0]">
          <Link href="/login" className="text-[#636366] hover:text-[#1A1A1A] transition-colors text-sm">
            ←
          </Link>
          <h1 className="text-lg font-bold text-[#1A1A1A]">Create your account</h1>
          <Link href="/" className="text-[#636366] hover:text-[#1A1A1A] transition-colors text-xl leading-none">×</Link>
        </div>

        <div className="px-6 py-5">

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <input
                  {...register('firstName')}
                  type="text"
                  autoComplete="given-name"
                  placeholder="First name"
                  className="w-full border border-[#E0E0E0] rounded-lg px-4 py-3 text-sm outline-none focus:border-[#53A318] focus:ring-1 focus:ring-[#53A318] transition-colors"
                />
                {errors.firstName && <p className="mt-1 text-xs text-red-600">{errors.firstName.message}</p>}
              </div>
              <div>
                <input
                  {...register('lastName')}
                  type="text"
                  autoComplete="family-name"
                  placeholder="Last name"
                  className="w-full border border-[#E0E0E0] rounded-lg px-4 py-3 text-sm outline-none focus:border-[#53A318] focus:ring-1 focus:ring-[#53A318] transition-colors"
                />
                {errors.lastName && <p className="mt-1 text-xs text-red-600">{errors.lastName.message}</p>}
              </div>
            </div>

            <div>
              <input
                {...register('email')}
                type="email"
                autoComplete="email"
                placeholder="Email"
                className="w-full border border-[#E0E0E0] rounded-lg px-4 py-3 text-sm outline-none focus:border-[#53A318] focus:ring-1 focus:ring-[#53A318] transition-colors"
              />
              {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
            </div>

            <div>
              <input
                {...register('password')}
                type="password"
                autoComplete="new-password"
                placeholder="Password (min 8 chars, 1 uppercase, 1 number)"
                className="w-full border border-[#E0E0E0] rounded-lg px-4 py-3 text-sm outline-none focus:border-[#53A318] focus:ring-1 focus:ring-[#53A318] transition-colors"
              />
              {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#53A318] hover:bg-[#438F10] text-white font-bold py-3.5 rounded-full text-sm transition-colors disabled:opacity-60"
            >
              {isLoading ? 'Creating account…' : 'Create Account'}
            </button>
          </form>

          <p className="mt-3 text-[11px] text-[#9CA3AF] text-center leading-relaxed">
            By signing up, I agree to the{' '}
            <Link href="/terms" className="underline text-[#636366]">Terms of Service</Link>
            {' '}and{' '}
            <Link href="/privacy" className="underline text-[#636366]">Privacy Policy</Link>.
          </p>

          <div className="mt-4 pt-4 border-t border-[#F0F0F0] text-center text-sm text-[#636366]">
            Already have an account?{' '}
            <Link href="/login" className="text-[#53A318] font-bold hover:underline">Sign in</Link>
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
        </div>
      </div>
    </div>
  );
}
