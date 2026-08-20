'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { SlidersHorizontal, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PriceRange {
  label: string;
  min?: number;
  max?: number;
}

const PRICE_RANGES: PriceRange[] = [
  { label: 'All Prices' },
  { label: 'Under $25', max: 25 },
  { label: '$25 – $50', min: 25, max: 50 },
  { label: '$50 – $100', min: 50, max: 100 },
  { label: '$100 – $200', min: 100, max: 200 },
  { label: '$200+', min: 200 },
];

const SORT_OPTIONS = [
  { label: 'Relevance', value: 'relevance' },
  { label: 'Most Popular', value: 'popular' },
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' },
  { label: 'Newest', value: 'newest' },
];

export default function PriceFilterBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentMin = searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined;
  const currentMax = searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined;
  const currentSort = searchParams.get('sort') ?? 'relevance';

  const isRangeActive = (range: PriceRange) => {
    if (!range.min && !range.max) return !currentMin && !currentMax;
    return range.min === currentMin && range.max === currentMax;
  };

  const applyRange = (range: PriceRange) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('minPrice');
    params.delete('maxPrice');
    params.delete('page');
    if (range.min !== undefined) params.set('minPrice', String(range.min));
    if (range.max !== undefined) params.set('maxPrice', String(range.max));
    router.push(`${pathname}?${params.toString()}`);
  };

  const applySort = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('page');
    if (value === 'relevance') {
      params.delete('sort');
    } else {
      params.set('sort', value);
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  const hasActiveFilter = !!currentMin || !!currentMax;

  return (
    <div className="bg-white border-b border-[#E0E0E0]">
      <div className="max-w-[1280px] mx-auto px-4 py-2.5">
        <div className="flex items-center gap-3 flex-wrap">

          {/* Filter icon + label */}
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#636366] flex-shrink-0">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Price</span>
          </div>

          {/* Price range pills */}
          <div className="flex items-center gap-1.5 flex-wrap flex-1">
            {PRICE_RANGES.map((range) => (
              <button
                key={range.label}
                onClick={() => applyRange(range)}
                className={cn(
                  'px-3 py-1 rounded-full text-xs font-semibold border transition-colors whitespace-nowrap',
                  isRangeActive(range)
                    ? 'bg-[#53A318] text-white border-[#53A318]'
                    : 'bg-white text-[#1A1A1A] border-[#E0E0E0] hover:border-[#53A318] hover:text-[#53A318]'
                )}
              >
                {range.label}
              </button>
            ))}
          </div>

          {/* Divider */}
          <div className="hidden sm:block h-5 w-px bg-[#E0E0E0] flex-shrink-0" />

          {/* Sort dropdown */}
          <div className="relative flex-shrink-0">
            <div className="flex items-center gap-1 text-xs font-bold text-[#636366] mb-0.5 sm:hidden">
              Sort
            </div>
            <div className="relative">
              <select
                value={currentSort}
                onChange={(e) => applySort(e.target.value)}
                className="appearance-none bg-white border border-[#E0E0E0] rounded-full pl-3 pr-7 py-1 text-xs font-semibold text-[#1A1A1A] cursor-pointer hover:border-[#53A318] focus:outline-none focus:border-[#53A318] transition-colors"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-[#636366] pointer-events-none" />
            </div>
          </div>

          {/* Clear filter */}
          {hasActiveFilter && (
            <button
              onClick={() => applyRange({ label: 'All Prices' })}
              className="text-xs text-[#E31837] hover:underline font-medium flex-shrink-0"
            >
              Clear
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
