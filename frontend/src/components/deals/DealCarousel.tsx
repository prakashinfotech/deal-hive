'use client';

import { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { DealCard } from './DealCard';
import type { DealSummary } from '@/types';

interface DealCarouselProps {
  title: string;
  deals: DealSummary[];
  seeAllHref?: string;
  /** Optional subtitle shown to the right of the heading (e.g. location) */
  subtitle?: React.ReactNode;
}

export default function DealCarousel({ title, deals, seeAllHref, subtitle }: DealCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const CARD_WIDTH = 272; // px — approximate card + gap

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  };

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    el?.addEventListener('scroll', checkScroll, { passive: true });
    window.addEventListener('resize', checkScroll);
    return () => {
      el?.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, [deals]);

  const scroll = (dir: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === 'left' ? -CARD_WIDTH * 2 : CARD_WIDTH * 2, behavior: 'smooth' });
  };

  if (deals.length === 0) return null;

  return (
    <section className="max-w-[1280px] mx-auto px-4 py-6">
      {/* Section header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-black text-[#1A1A1A]">{title}</h2>
          {subtitle && <div className="text-sm text-[#636366]">{subtitle}</div>}
        </div>
        {seeAllHref && (
          <Link href={seeAllHref} className="text-sm font-bold text-[#53A318] hover:underline whitespace-nowrap flex-shrink-0">
            See all →
          </Link>
        )}
      </div>

      {/* Carousel wrapper */}
      <div className="relative group/carousel">
        {/* Left arrow */}
        {canScrollLeft && (
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-20
                       w-10 h-10 bg-white rounded-full shadow-lg border border-gray-200
                       flex items-center justify-center hover:bg-gray-50 transition-colors"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-5 h-5 text-gray-700" />
          </button>
        )}

        {/* Scrollable track */}
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scroll-smooth pb-2"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          onScroll={checkScroll}
        >
          {deals.map((deal) => (
            <div key={deal.id} className="flex-shrink-0 w-[256px]">
              <DealCard deal={deal} />
            </div>
          ))}
        </div>

        {/* Right arrow */}
        {canScrollRight && (
          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-20
                       w-10 h-10 bg-white rounded-full shadow-lg border border-gray-200
                       flex items-center justify-center hover:bg-gray-50 transition-colors"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-5 h-5 text-gray-700" />
          </button>
        )}
      </div>
    </section>
  );
}
