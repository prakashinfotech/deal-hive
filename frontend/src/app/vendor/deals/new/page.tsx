'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { PlusCircle, Trash2, Tag, Info } from 'lucide-react';
import api from '@/lib/api';
import type { Category } from '@/types';

// ─── Types ───────────────────────────────────────────────────

interface DealOption {
  title: string;
  description: string;
  price: string;
  quantity: string;
}

interface FormData {
  categoryId: string;
  title: string;
  shortDescription: string;
  description: string;
  finePrint: string;
  type: string; // '0' | '1' | '2' | '3'
  originalPrice: string;
  discountedPrice: string;
  startsAt: string;
  expiresAt: string;
  quantityTotal: string;
  quantityLimit: string;
  voucherValidity: string;
  options: DealOption[];
}

const DEAL_TYPES = [
  { value: '0', label: 'Service' },
  { value: '1', label: 'Travel' },
  { value: '2', label: 'Goods' },
  { value: '3', label: 'Experience' },
];

const emptyOption = (): DealOption => ({
  title: '',
  description: '',
  price: '',
  quantity: '',
});

const todayStr = () => new Date().toISOString().split('T')[0];

const initialForm: FormData = {
  categoryId: '',
  title: '',
  shortDescription: '',
  description: '',
  finePrint: '',
  type: '0',
  originalPrice: '',
  discountedPrice: '',
  startsAt: todayStr(),
  expiresAt: '',
  quantityTotal: '',
  quantityLimit: '',
  voucherValidity: '90',
  options: [emptyOption()],
};

// ─── Section wrapper ─────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
      <h2 className="font-semibold text-gray-900 mb-4">{title}</h2>
      {children}
    </div>
  );
}

function InputField({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </div>
  );
}

const inputCls =
  'w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent';
const textareaCls = `${inputCls} resize-none`;

// ─── Discount badge ───────────────────────────────────────────

function DiscountPreview({ original, discounted }: { original: string; discounted: string }) {
  const o = parseFloat(original);
  const d = parseFloat(discounted);
  if (!o || !d || d >= o) return null;
  const pct = Math.round(((o - d) / o) * 100);
  return (
    <span className="ml-2 text-xs font-bold bg-green-100 text-green-700 rounded-full px-2 py-0.5">
      -{pct}% off
    </span>
  );
}

// ─── Main page ────────────────────────────────────────────────

export default function CreateDealPage() {
  const router = useRouter();
  const [form, setForm] = useState<FormData>(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Fetch categories for the dropdown
  const { data: categories } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: () => api.get<Category[]>('/categories').then((r) => r.data),
    staleTime: 600_000,
  });

  const set = (field: keyof FormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const setOption = (i: number, field: keyof DealOption) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((prev) => {
        const options = [...prev.options];
        options[i] = { ...options[i], [field]: e.target.value };
        return { ...prev, options };
      });
    };

  const addOption = () =>
    setForm((prev) => ({ ...prev, options: [...prev.options, emptyOption()] }));

  const removeOption = (i: number) =>
    setForm((prev) => ({
      ...prev,
      options: prev.options.length > 1 ? prev.options.filter((_, idx) => idx !== i) : prev.options,
    }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    // Client-side guard
    const o = parseFloat(form.originalPrice);
    const d = parseFloat(form.discountedPrice);
    if (d >= o) {
      setFieldErrors({ discountedPrice: 'Discounted price must be less than original price.' });
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        categoryId: parseInt(form.categoryId, 10),
        title: form.title,
        shortDescription: form.shortDescription,
        description: form.description,
        finePrint: form.finePrint || null,
        type: parseInt(form.type, 10),
        originalPrice: o,
        discountedPrice: d,
        startsAt: new Date(form.startsAt).toISOString(),
        expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : null,
        quantityTotal: form.quantityTotal ? parseInt(form.quantityTotal, 10) : null,
        quantityLimit: form.quantityLimit ? parseInt(form.quantityLimit, 10) : null,
        voucherValidity: parseInt(form.voucherValidity, 10),
        options: form.options
          .filter((opt) => opt.title.trim())
          .map((opt) => ({
            title: opt.title,
            description: opt.description || null,
            price: parseFloat(opt.price),
            quantity: opt.quantity ? parseInt(opt.quantity, 10) : null,
          })),
      };

      await api.post('/vendors/me/deals', payload);
      router.push('/vendor/deals');
    } catch (err: any) {
      const data = err.response?.data;
      if (data?.errors) {
        // FluentValidation errors map — flatten to Record<field, message>
        const fe: Record<string, string> = {};
        for (const [key, msgs] of Object.entries(data.errors)) {
          fe[key.toLowerCase()] = (msgs as string[]).join(' ');
        }
        setFieldErrors(fe);
        setError('Please fix the errors below.');
      } else {
        setError(data?.detail ?? data?.title ?? 'Failed to create deal. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-primary-light rounded-xl flex items-center justify-center">
          <Tag className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create a Deal</h1>
          <p className="text-sm text-gray-500">Publish a new offer on the DealHive marketplace</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 flex gap-2 items-start">
          <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <Section title="Basic Information">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <InputField label="Category" required>
                <select
                  value={form.categoryId}
                  onChange={set('categoryId')}
                  required
                  className={inputCls}
                >
                  <option value="">Select a category…</option>
                  {categories?.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </InputField>
              <InputField label="Deal Type" required>
                <select value={form.type} onChange={set('type')} required className={inputCls}>
                  {DEAL_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </InputField>
            </div>

            <InputField label="Title" required hint="Max 300 characters">
              <input
                value={form.title}
                onChange={set('title')}
                required
                maxLength={300}
                placeholder="e.g. 60-Minute Swedish Massage at Downtown Spa"
                className={inputCls}
              />
            </InputField>

            <InputField label="Short Description" required hint="Shown on deal cards (max 500 chars)">
              <textarea
                value={form.shortDescription}
                onChange={set('shortDescription')}
                required
                maxLength={500}
                rows={2}
                placeholder="One-line summary that entices customers to click…"
                className={textareaCls}
              />
            </InputField>

            <InputField label="Full Description" required>
              <textarea
                value={form.description}
                onChange={set('description')}
                required
                rows={6}
                placeholder="Describe the experience, what's included, business background…"
                className={textareaCls}
              />
            </InputField>

            <InputField label="Fine Print" hint="Restrictions, exclusions, expiry conditions">
              <textarea
                value={form.finePrint}
                onChange={set('finePrint')}
                rows={3}
                placeholder="Not valid with other offers. Must present voucher at time of service…"
                className={textareaCls}
              />
            </InputField>
          </div>
        </Section>

        {/* Pricing */}
        <Section title="Pricing">
          <div className="grid grid-cols-2 gap-4">
            <InputField label="Original Price ($)" required>
              <input
                type="number"
                value={form.originalPrice}
                onChange={set('originalPrice')}
                required
                min="0.01"
                step="0.01"
                placeholder="100.00"
                className={`${inputCls} ${fieldErrors.originalprice ? 'border-red-300 ring-1 ring-red-300' : ''}`}
              />
              {fieldErrors.originalprice && (
                <p className="text-xs text-red-500 mt-1">{fieldErrors.originalprice}</p>
              )}
            </InputField>

            <InputField label="Sale Price ($)" required>
              <div className="relative">
                <input
                  type="number"
                  value={form.discountedPrice}
                  onChange={set('discountedPrice')}
                  required
                  min="0.01"
                  step="0.01"
                  placeholder="49.00"
                  className={`${inputCls} ${fieldErrors.discountedprice ? 'border-red-300 ring-1 ring-red-300' : ''}`}
                />
              </div>
              <div className="flex items-center mt-1 gap-2">
                {fieldErrors.discountedprice && (
                  <p className="text-xs text-red-500">{fieldErrors.discountedprice}</p>
                )}
                <DiscountPreview original={form.originalPrice} discounted={form.discountedPrice} />
              </div>
            </InputField>
          </div>
        </Section>

        {/* Schedule */}
        <Section title="Schedule & Availability">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <InputField label="Start Date" required>
              <input
                type="date"
                value={form.startsAt}
                onChange={set('startsAt')}
                required
                min={todayStr()}
                className={inputCls}
              />
            </InputField>
            <InputField label="Expiry Date" hint="Leave blank for no expiry">
              <input
                type="date"
                value={form.expiresAt}
                onChange={set('expiresAt')}
                min={form.startsAt || todayStr()}
                className={inputCls}
              />
            </InputField>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <InputField label="Total Quantity" hint="Leave blank for unlimited">
              <input
                type="number"
                value={form.quantityTotal}
                onChange={set('quantityTotal')}
                min="1"
                placeholder="e.g. 500"
                className={inputCls}
              />
            </InputField>
            <InputField label="Per-Customer Limit" hint="Max per order">
              <input
                type="number"
                value={form.quantityLimit}
                onChange={set('quantityLimit')}
                min="1"
                placeholder="e.g. 3"
                className={inputCls}
              />
            </InputField>
            <InputField label="Voucher Validity (days)" required hint="7–365">
              <input
                type="number"
                value={form.voucherValidity}
                onChange={set('voucherValidity')}
                required
                min="7"
                max="365"
                placeholder="90"
                className={inputCls}
              />
            </InputField>
          </div>
        </Section>

        {/* Options */}
        <Section title="Deal Options">
          <p className="text-xs text-gray-500 mb-4">
            Add one or more options customers can choose from (e.g. "For 1 Person", "For 2 People").
          </p>
          <div className="space-y-4">
            {form.options.map((opt, i) => (
              <div
                key={i}
                className="border border-gray-100 rounded-xl p-4 bg-gray-50 relative"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Option {i + 1}
                  </span>
                  {form.options.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeOption(i)}
                      className="text-red-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <InputField label="Option Title" required>
                    <input
                      value={opt.title}
                      onChange={setOption(i, 'title')}
                      required
                      maxLength={200}
                      placeholder="e.g. For 1 Person"
                      className={inputCls}
                    />
                  </InputField>
                  <InputField label="Price ($)" required>
                    <input
                      type="number"
                      value={opt.price}
                      onChange={setOption(i, 'price')}
                      required
                      min="0.01"
                      step="0.01"
                      placeholder="49.00"
                      className={inputCls}
                    />
                  </InputField>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <InputField label="Description" hint="Optional">
                    <input
                      value={opt.description}
                      onChange={setOption(i, 'description')}
                      placeholder="What's included in this option"
                      className={inputCls}
                    />
                  </InputField>
                  <InputField label="Available Quantity" hint="Leave blank for unlimited">
                    <input
                      type="number"
                      value={opt.quantity}
                      onChange={setOption(i, 'quantity')}
                      min="1"
                      placeholder="Unlimited"
                      className={inputCls}
                    />
                  </InputField>
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addOption}
            className="mt-4 flex items-center gap-2 text-sm text-primary font-medium hover:text-primary-dark transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            Add Another Option
          </button>
        </Section>

        {/* Submit */}
        <div className="flex gap-3 pb-8">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 border border-gray-200 text-gray-700 font-semibold py-3 rounded-xl hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 bg-primary text-white font-semibold py-3 rounded-xl hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Creating deal…' : 'Publish Deal'}
          </button>
        </div>
      </form>
    </div>
  );
}
