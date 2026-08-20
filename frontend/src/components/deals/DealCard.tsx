'use client';

import Image from 'next/image';
import Link from 'next/link';
import { MapPin } from 'lucide-react';
import { formatDistanceToNow, isPast } from 'date-fns';
import { cn } from '@/lib/utils';
import { useAppDispatch, useAppSelector } from '@/store';
import { optimisticToggleWishlist, toggleWishlist, selectIsWishlisted } from '@/store/slices/dealsSlice';
import type { DealSummary } from '@/types';

/** Parses API date strings in "DD-MM-YYYY HH:mm:ss" or ISO format */
function parseDate(dateStr: string): Date | null {
  if (!dateStr) return null;
  if (/^\d{4}-/.test(dateStr)) {
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? null : d;
  }
  const m = dateStr.match(/^(\d{2})-(\d{2})-(\d{4})\s(\d{2}):(\d{2}):(\d{2})$/);
  if (m) return new Date(Date.UTC(+m[3], +m[2] - 1, +m[1], +m[4], +m[5], +m[6]));
  return null;
}

interface DealCardProps {
  deal: DealSummary;
  onWishlistToggle?: (dealId: string) => void;
}

export function DealCard({ deal, onWishlistToggle }: DealCardProps) {
  const dispatch = useAppDispatch();
  const isWishlisted = useAppSelector(selectIsWishlisted(deal.id));

  const expiresDate = deal.expiresAt ? parseDate(deal.expiresAt) : null;
  const isExpiringSoon = expiresDate && !isPast(expiresDate)
    && expiresDate.getTime() - Date.now() < 48 * 60 * 60 * 1000;
  const isSoldOut = deal.quantitySold !== undefined && deal.quantitySold === 0;

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(optimisticToggleWishlist(deal.id));
    dispatch(toggleWishlist(deal.id));
    onWishlistToggle?.(deal.id);
  };

  const discountPct = Math.round(deal.discountPercent);

  return (
    <Link
      href={`/deals/${deal.slug}`}
      className="group flex flex-col bg-white rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-200 w-full"
    >
      {/* ── Image ── */}
      <div className="relative overflow-hidden bg-gray-100" style={{ aspectRatio: '3/2' }}>
        <Image
          src={deal.primaryImageUrl || '/placeholder-deal.jpg'}
          alt={deal.title}
          fill
          className={cn(
            'object-cover group-hover:scale-105 transition-transform duration-300',
            isSoldOut && 'opacity-60'
          )}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />

        {/* Wishlist heart — top right */}
        <button
          onClick={handleWishlist}
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Save deal'}
          className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/95 shadow flex items-center justify-center hover:scale-110 transition-transform z-10"
        >
          <svg
            className={cn('w-4 h-4', isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-400')}
            viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} fill="none"
          >
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>

        {/* Popular Gift badge — top left */}
        {deal.isFeatured && (
          <div className="absolute top-2 left-2 flex items-center gap-1 bg-[#FFF0F0] text-[#E31837] text-[11px] font-bold px-2 py-0.5 rounded z-10">
            <span>🎁</span> Popular Gift
          </div>
        )}

        {/* Expiring soon bar */}
        {isExpiringSoon && expiresDate && !isPast(expiresDate) && (
          <div className="absolute bottom-0 left-0 right-0 bg-[#E31837] text-white text-[11px] font-bold text-center py-1">
            Expires {formatDistanceToNow(expiresDate, { addSuffix: true })}
          </div>
        )}

        {/* Sold out overlay */}
        {isSoldOut && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
            <span className="bg-white text-gray-800 font-bold text-sm px-4 py-2 rounded shadow">
              Sold Out
            </span>
          </div>
        )}
      </div>

      {/* ── Content ── */}
      <div className="p-3 flex flex-col flex-1">
        {/* Vendor name — above title */}
        <p className="text-xs text-[#636366] truncate mb-1">{deal.vendorName}</p>

        {/* Title */}
        <h3 className="text-sm font-bold text-[#1A1A1A] line-clamp-2 leading-snug mb-1.5">
          {deal.title}
        </h3>

        {/* Location — below title */}
        <div className="flex items-center gap-1 text-[11px] text-[#636366] mb-2">
          <MapPin className="w-3 h-3 flex-shrink-0" />
          <span className="truncate">{deal.vendorCity}</span>
        </div>

        {/* Star rating */}
        {deal.reviewCount > 0 && (
          <div className="flex items-center gap-1 mb-2.5">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((i) => (
                <svg key={i} className={cn('w-3 h-3', i <= Math.round(deal.avgRating) ? 'text-[#FFB800]' : 'text-gray-200')} fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="text-xs text-[#636366]">{deal.avgRating.toFixed(1)} ({deal.reviewCount.toLocaleString()})</span>
          </div>
        )}

        {/* Price block — Groupon style: original ~~strikethrough~~ + sale price + badge */}
        <div className="mt-auto">
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <span className="text-sm text-[#636366] line-through">
              ${deal.originalPrice.toFixed(2)}
            </span>
            <span className="text-base font-bold text-[#53A318]">
              ${deal.discountedPrice.toFixed(2)}
            </span>
            {discountPct > 0 && (
              <span className="text-xs font-bold text-[#53A318] bg-[#EFF7E6] rounded px-1.5 py-0.5">
                -{discountPct}%
              </span>
            )}
          </div>
          {/* Limited time indicator for expiring deals */}
          {isExpiringSoon && (
            <p className="text-[11px] text-[#E31837] font-semibold mt-0.5">Limited time</p>
          )}
          {/* Bought count */}
          {deal.quantitySold > 0 && (
            <p className="text-[11px] text-[#636366] mt-0.5">
              {deal.quantitySold >= 1000
                ? `${(Math.floor(deal.quantitySold / 1000) * 1000).toLocaleString()}+`
                : deal.quantitySold.toLocaleString()
              } bought
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}

export function DealCardSkeleton() {
  return (
    <div className="flex flex-col bg-white rounded-lg overflow-hidden animate-pulse w-full">
      <div className="bg-gray-200" style={{ aspectRatio: '3/2' }} />
      <div className="p-3 space-y-2">
        <div className="h-3 bg-gray-200 rounded w-1/2" />
        <div className="h-4 bg-gray-200 rounded w-full" />
        <div className="h-4 bg-gray-200 rounded w-4/5" />
        <div className="h-3 bg-gray-200 rounded w-1/3" />
        <div className="h-3 bg-gray-200 rounded w-2/3 mt-1" />
        <div className="h-5 bg-gray-200 rounded w-1/2 mt-2" />
      </div>
    </div>
  );
}

export default DealCard;
