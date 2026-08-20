'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, Share2, MapPin, Store, ChevronLeft, ChevronRight, Eye, Info } from 'lucide-react';
import { useAppDispatch } from '@/store';
import { addItem } from '@/store/slices/cartSlice';
import CountdownTimer from '@/components/ui/CountdownTimer';
import { cn } from '@/lib/utils';
import type { DealDetail } from '@/types';

interface Props { deal: DealDetail; }

const PLACEHOLDER_IMG = 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=80';

// ── Helpers ──────────────────────────────────────────────
function formatBought(n: number): string {
  if (n >= 10_000) return `${(Math.floor(n / 1000) * 1000).toLocaleString()}+`;
  if (n >= 1_000) return `${Math.floor(n / 1000)}k+`;
  return n.toLocaleString();
}

function getViewedToday(quantitySold: number): number {
  return (quantitySold % 400) + 50;
}

function renderStars(rating: number) {
  return Array.from({ length: 5 }, (_, i) => {
    const filled = rating >= i + 1;
    const half = !filled && rating >= i + 0.5;
    return (
      <svg key={i} className="w-4 h-4" viewBox="0 0 20 20" fill="none">
        {filled ? (
          <polygon points="10,1 12.9,7 19.5,7.6 14.7,12 16.2,18.5 10,15 3.8,18.5 5.3,12 0.5,7.6 7.1,7"
            fill="#f59e0b" />
        ) : half ? (
          <>
            <polygon points="10,1 12.9,7 19.5,7.6 14.7,12 16.2,18.5 10,15 3.8,18.5 5.3,12 0.5,7.6 7.1,7"
              fill="#e5e7eb" />
            <clipPath id={`half-${i}`}><rect x="0" y="0" width="10" height="20" /></clipPath>
            <polygon points="10,1 12.9,7 19.5,7.6 14.7,12 16.2,18.5 10,15 3.8,18.5 5.3,12 0.5,7.6 7.1,7"
              fill="#f59e0b" clipPath={`url(#half-${i})`} />
          </>
        ) : (
          <polygon points="10,1 12.9,7 19.5,7.6 14.7,12 16.2,18.5 10,15 3.8,18.5 5.3,12 0.5,7.6 7.1,7"
            fill="#e5e7eb" />
        )}
      </svg>
    );
  });
}

// Auto-generate review chips from deal metadata
function getReviewChips(deal: DealDetail): string[] {
  const chips = ['great value', 'top-rated'];
  if (deal.categoryName) chips.push(deal.categoryName.toLowerCase());
  if (deal.vendorCity) chips.push(deal.vendorCity.toLowerCase());
  if (deal.type === 'Service') chips.push('professional service');
  if (deal.type === 'Experience') chips.push('memorable experience');
  if (deal.avgRating >= 4.7) chips.push('highly recommended');
  return chips.slice(0, 7);
}

// ── Component ─────────────────────────────────────────────
export default function DealDetailClient({ deal }: Props) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedOption, setSelectedOption] = useState(deal.options[0]?.id ?? null);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [activeTab, setActiveTab] = useState<'about' | 'needToKnow' | 'faqs' | 'whereToRedeem' | 'reviews'>('about');
  const [wishlist, setWishlist] = useState(false);

  const getQty = (optId: string) => quantities[optId] ?? 1;
  const setQty = (optId: string, val: number) =>
    setQuantities((prev) => ({ ...prev, [optId]: Math.max(1, val) }));

  const currentOption = deal.options.find((o) => o.id === selectedOption);
  const price = currentOption?.price ?? deal.discountedPrice;

  const handleBuyNow = () => {
    const qty = selectedOption ? getQty(selectedOption) : 1;
    dispatch(addItem({
      dealId: deal.id,
      dealTitle: deal.title,
      vendorName: deal.vendorName,
      primaryImageUrl: deal.primaryImageUrl,
      dealOptionId: selectedOption ?? undefined,
      optionTitle: currentOption?.title,
      unitPrice: price,
      originalUnitPrice: deal.originalPrice,
      quantity: qty,
    }));
    router.push('/checkout');
  };

  const primaryUrl = deal.primaryImageUrl || PLACEHOLDER_IMG;
  const images = deal.images.length > 0
    ? deal.images
    : [{ url: primaryUrl, altText: deal.title, isPrimary: true }];

  const MAX_THUMBS = 6;
  const visibleThumbs = images.slice(0, MAX_THUMBS);
  const extraCount = images.length > MAX_THUMBS ? images.length - MAX_THUMBS : 0;

  const discountPercent = Math.round(
    ((deal.originalPrice - price) / deal.originalPrice) * 100
  );

  const tabs = [
    { key: 'about', label: 'About' },
    { key: 'needToKnow', label: 'Need To Know Info' },
    { key: 'faqs', label: 'FAQs' },
    { key: 'whereToRedeem', label: 'Where To Redeem' },
    { key: 'reviews', label: 'Reviews' },
  ] as const;

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-[1280px] mx-auto px-6 py-6">

        {/* ── Breadcrumb ──────────────────────────────────── */}
        <nav className="text-xs text-gray-500 mb-4 flex items-center gap-1 flex-wrap">
          <Link href="/" className="hover:underline">Local</Link>
          <span>/</span>
          <Link href={`/local/${deal.categorySlug}`} className="hover:underline">{deal.categoryName}</Link>
          <span>/</span>
          <span className="text-gray-800">{deal.title}</span>
        </nav>

        <div className="flex flex-col lg:flex-row gap-8">

          {/* ════════════════════════════════════════════════
              LEFT COLUMN
          ════════════════════════════════════════════════ */}
          <div className="flex-1 min-w-0">

            {/* Title — above image */}
            <h1 className="text-2xl md:text-[26px] font-bold text-[#1A1A1A] leading-snug mb-3">
              {deal.title}
            </h1>

            {/* Vendor + location row */}
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-2 flex-wrap">
              <Store className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <span className="font-medium text-gray-800">{deal.vendorName}</span>
              <span className="text-gray-300">|</span>
              <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <span>{deal.vendorCity}</span>
            </div>

            {/* Rating row */}
            {deal.reviewCount > 0 && (
              <div className="flex items-center gap-2 mb-2">
                <div className="flex items-center gap-0.5">{renderStars(deal.avgRating)}</div>
                <span className="text-sm font-semibold text-gray-800">{deal.avgRating.toFixed(1)}</span>
                <span className="text-sm text-gray-500">
                  ({deal.reviewCount.toLocaleString()}+ reviews)
                </span>
              </div>
            )}

            {/* Best Rated badge */}
            {deal.isFeatured && (
              <div className="inline-flex items-center gap-1 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold px-2.5 py-1 rounded-full mb-4">
                <span>⭐</span> Best Rated
              </div>
            )}

            {/* ── Image gallery ── */}
            <div className="mb-4">
              {/* Main image */}
              <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-gray-100 mb-3">
                <Image
                  src={images[selectedImage]?.url || primaryUrl}
                  alt={images[selectedImage]?.altText ?? deal.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 62vw"
                  priority
                />
                {/* Top-right overlay buttons */}
                <div className="absolute top-3 right-3 flex gap-2">
                  <button
                    className="w-9 h-9 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-sm transition-colors"
                    aria-label="Share"
                  >
                    <Share2 className="w-4 h-4 text-gray-700" />
                  </button>
                  <button
                    onClick={() => setWishlist((w) => !w)}
                    className="w-9 h-9 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-sm transition-colors"
                    aria-label="Save to wishlist"
                  >
                    <Heart className={cn('w-4 h-4 transition-colors', wishlist ? 'fill-red-500 text-red-500' : 'text-gray-700')} />
                  </button>
                </div>
              </div>

              {/* Thumbnail strip with arrows */}
              {images.length > 1 && (
                <div className="relative flex items-center gap-2">
                  {/* Left arrow */}
                  <button
                    onClick={() => setSelectedImage((i) => Math.max(0, i - 1))}
                    disabled={selectedImage === 0}
                    className="flex-shrink-0 w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4 text-gray-600" />
                  </button>

                  {/* Thumbnails */}
                  <div className="flex gap-2 overflow-hidden flex-1">
                    {visibleThumbs.map((img, i) => {
                      const isLast = i === visibleThumbs.length - 1 && extraCount > 0;
                      return (
                        <button
                          key={i}
                          onClick={() => setSelectedImage(i)}
                          className={cn(
                            'relative flex-shrink-0 w-[72px] h-[72px] rounded-md overflow-hidden border-2 transition-all',
                            selectedImage === i
                              ? 'border-[#53A318] ring-1 ring-[#53A318]'
                              : 'border-transparent hover:border-gray-300'
                          )}
                        >
                          <Image src={img.url || PLACEHOLDER_IMG} alt={`${deal.title} ${i + 1}`} fill className="object-cover" />
                          {isLast && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                              <span className="text-white text-xs font-bold">+{extraCount}</span>
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Right arrow */}
                  <button
                    onClick={() => setSelectedImage((i) => Math.min(images.length - 1, i + 1))}
                    disabled={selectedImage === images.length - 1}
                    className="flex-shrink-0 w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
              )}
            </div>

            {/* ── Tab bar ── */}
            <div className="border-b border-gray-200 mb-6">
              <div className="flex gap-0 overflow-x-auto">
                {tabs.map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => setActiveTab(key)}
                    className={cn(
                      'px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors flex-shrink-0',
                      activeTab === key
                        ? 'border-[#1A1A1A] text-[#1A1A1A]'
                        : 'border-transparent text-gray-500 hover:text-gray-800'
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* ── Tab content ── */}
            <div className="text-sm text-gray-700 leading-relaxed">
              {activeTab === 'about' && (
                <div
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: deal.description }}
                />
              )}

              {activeTab === 'needToKnow' && (
                <div className="space-y-6">
                  {deal.highlights.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">What's Included</h3>
                      <ul className="space-y-2">
                        {deal.highlights.map((h, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-[#53A318] font-bold mt-0.5">✓</span>
                            <span>{h}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {deal.finePrint && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">The Fine Print</h3>
                      <p className="text-gray-600">{deal.finePrint}</p>
                    </div>
                  )}
                  {!deal.finePrint && deal.highlights.length === 0 && (
                    <p className="text-gray-500">No additional conditions.</p>
                  )}
                </div>
              )}

              {activeTab === 'faqs' && (
                <div className="space-y-4">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <p className="font-medium text-gray-900 mb-1">How do I redeem my voucher?</p>
                    <p className="text-gray-600">Present your voucher code at the merchant location. You can show it on your phone or print it out.</p>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-4">
                    <p className="font-medium text-gray-900 mb-1">How long is my voucher valid?</p>
                    <p className="text-gray-600">Your voucher is valid for {deal.voucherValidity} days from the date of purchase.</p>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-4">
                    <p className="font-medium text-gray-900 mb-1">Can I get a refund?</p>
                    <p className="text-gray-600">Unredeemed vouchers can be refunded within 3 days of purchase. See our <Link href="/help/refunds" className="text-[#53A318] hover:underline">refund policy</Link> for details.</p>
                  </div>
                </div>
              )}

              {activeTab === 'whereToRedeem' && (
                <div>
                  <div className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg">
                    <MapPin className="w-5 h-5 text-[#53A318] flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900">{deal.vendorName}</p>
                      <p className="text-gray-600 mt-1">{deal.vendorCity}</p>
                      <p className="text-gray-500 text-xs mt-2">Present voucher at the merchant location upon arrival.</p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'reviews' && (
                <div>
                  {deal.reviewCount > 0 ? (
                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl mb-4">
                      <div className="text-center">
                        <p className="text-4xl font-bold text-gray-900">{deal.avgRating.toFixed(1)}</p>
                        <div className="flex justify-center mt-1">{renderStars(deal.avgRating)}</div>
                        <p className="text-xs text-gray-500 mt-1">{deal.reviewCount.toLocaleString()} reviews</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500">No reviews yet for this deal.</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* ════════════════════════════════════════════════
              RIGHT COLUMN — sticky buy box
          ════════════════════════════════════════════════ */}
          <div className="lg:w-[380px] flex-shrink-0">
            <div className="sticky top-6 space-y-3">

              {/* Sale countdown banner */}
              {deal.expiresAt && (
                <div className="bg-[#FFF5F3] border border-[#FFD5CC] rounded-lg px-4 py-2.5 flex items-center gap-2">
                  <svg className="w-4 h-4 text-orange-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
                  </svg>
                  <span className="text-sm text-orange-700 font-medium">
                    Sale ends in{' '}
                    <CountdownTimer expiresAt={deal.expiresAt} variant="inline" className="text-orange-700" />
                  </span>
                </div>
              )}

              {/* Buy box card */}
              <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="p-5">

                  {/* Select Option row */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold text-gray-900">Select Option:</span>
                    <label className="flex items-center gap-1.5 text-sm text-gray-600 cursor-pointer">
                      <input type="checkbox" className="w-4 h-4 rounded border-gray-300 accent-[#53A318]" />
                      Buy As a Gift
                      <Info className="w-3.5 h-3.5 text-gray-400" />
                    </label>
                  </div>

                  {/* Option cards */}
                  <div className="space-y-3 mb-4">
                    {deal.options.length > 0 ? deal.options.map((opt) => {
                      const isSelected = selectedOption === opt.id;
                      const optDiscount = Math.round(((deal.originalPrice - opt.price) / deal.originalPrice) * 100);
                      const qty = getQty(opt.id);
                      return (
                        <div
                          key={opt.id}
                          onClick={() => setSelectedOption(opt.id)}
                          className={cn(
                            'border-2 rounded-xl p-4 cursor-pointer transition-all',
                            isSelected
                              ? 'border-[#53A318] bg-green-50'
                              : 'border-gray-200 hover:border-gray-300 bg-white'
                          )}
                        >
                          <div className="flex items-start gap-3">
                            {/* Radio dot */}
                            <div className={cn(
                              'flex-shrink-0 w-5 h-5 rounded-full border-2 mt-0.5 flex items-center justify-center',
                              isSelected ? 'border-[#53A318]' : 'border-gray-300'
                            )}>
                              {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-[#53A318]" />}
                            </div>

                            <div className="flex-1 min-w-0">
                              {/* Option title */}
                              <p className="text-sm font-semibold text-gray-900 leading-snug mb-1.5">
                                {opt.title}
                              </p>

                              {/* Price row */}
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-sm text-gray-400 line-through">
                                  ${deal.originalPrice.toFixed(2)}
                                </span>
                                <span className="text-base font-bold text-[#1A1A1A]">
                                  ${opt.price.toFixed(2)}
                                </span>
                                {optDiscount > 0 && (
                                  <span className="text-xs font-bold text-green-700 bg-green-100 rounded-full px-2 py-0.5">
                                    -{optDiscount}%
                                  </span>
                                )}
                              </div>

                              {/* Quantity stepper (inside card) */}
                              <div className="flex items-center gap-3 mt-3">
                                <button
                                  onClick={(e) => { e.stopPropagation(); setQty(opt.id, qty - 1); }}
                                  className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors text-lg leading-none"
                                >
                                  −
                                </button>
                                <span className="text-sm font-bold min-w-[20px] text-center">{qty}</span>
                                <button
                                  onClick={(e) => { e.stopPropagation(); setQty(opt.id, qty + 1); }}
                                  className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors text-lg leading-none"
                                >
                                  +
                                </button>
                              </div>

                              {/* Bought count */}
                              {deal.quantitySold > 0 && (
                                <p className="text-xs text-gray-400 mt-2">
                                  {formatBought(deal.quantitySold)} bought
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    }) : (
                      /* Fallback if no options — show single price card */
                      <div className="border-2 border-[#53A318] bg-green-50 rounded-xl p-4">
                        <div className="flex items-center gap-2 flex-wrap mb-3">
                          <span className="text-sm text-gray-400 line-through">${deal.originalPrice.toFixed(2)}</span>
                          <span className="text-lg font-bold text-[#1A1A1A]">${deal.discountedPrice.toFixed(2)}</span>
                          {discountPercent > 0 && (
                            <span className="text-xs font-bold text-green-700 bg-green-100 rounded-full px-2 py-0.5">
                              -{discountPercent}%
                            </span>
                          )}
                        </div>
                        {deal.quantitySold > 0 && (
                          <p className="text-xs text-gray-400">{formatBought(deal.quantitySold)} bought</p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Urgency line */}
                  <div className="flex items-center gap-2 text-sm text-gray-500 py-2 mb-3">
                    <Eye className="w-4 h-4 flex-shrink-0" />
                    <span>Over {getViewedToday(deal.quantitySold)} viewed today, so act now!</span>
                  </div>

                  {/* CTA buttons */}
                  <div className="flex gap-3">
                    <button className="flex-1 border-2 border-[#1a7a2d] text-[#1a7a2d] rounded-full py-3 text-sm font-bold hover:bg-green-50 transition-colors">
                      Buy As a Gift
                    </button>
                    <button
                      onClick={handleBuyNow}
                      className="flex-1 bg-[#1a7a2d] hover:bg-[#145e22] text-white rounded-full py-3 text-sm font-bold transition-colors"
                    >
                      Buy Now
                    </button>
                  </div>
                </div>

                {/* AI Customer Review Summary */}
                {deal.reviewCount > 0 && (
                  <div className="border-t border-gray-100 bg-gray-50 p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-base">✨</span>
                      <span className="text-sm font-semibold text-gray-800">AI Customer Review Summary</span>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed mb-3">
                      {deal.shortDescription}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {getReviewChips(deal).map((chip) => (
                        <span
                          key={chip}
                          className="bg-white border border-gray-200 text-gray-600 text-xs rounded-full px-2.5 py-0.5"
                        >
                          {chip}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
