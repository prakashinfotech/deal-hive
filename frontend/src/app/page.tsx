import type { Metadata } from 'next';
import Link from 'next/link';
import DealCarousel from '@/components/deals/DealCarousel';
import type { DealSummary } from '@/types';

export const metadata: Metadata = {
  title: 'DealHive — Up to 80% off local deals',
  description: 'Discover incredible deals on restaurants, spas, travel, activities and more near you.',
};

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api/v1';

async function getFeaturedDeals(): Promise<DealSummary[]> {
  try {
    const res = await fetch(`${API}/deals/featured`, { next: { revalidate: 300 } });
    if (!res.ok) return [];
    return res.json();
  } catch { return []; }
}

async function getTrendingDeals(): Promise<DealSummary[]> {
  try {
    const res = await fetch(`${API}/deals/trending`, { next: { revalidate: 300 } });
    if (!res.ok) return [];
    return res.json();
  } catch { return []; }
}

async function getBeautyDeals(): Promise<DealSummary[]> {
  try {
    const res = await fetch(`${API}/deals?category=beauty-spas&pageSize=10`, { next: { revalidate: 300 } });
    if (!res.ok) return [];
    const data = await res.json();
    return data.items ?? [];
  } catch { return []; }
}


export default async function HomePage() {
  const [featured, trending, beauty] = await Promise.all([
    getFeaturedDeals(),
    getTrendingDeals(),
    getBeautyDeals(),
  ]);

  // Location subtitle — matches Groupon's "📍 Houston, TX · Change Location" pattern
  const locationSubtitle = (
    <span className="flex items-center gap-1 text-[#636366]">
      <svg className="w-3.5 h-3.5 text-[#53A318]" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
      </svg>
      <span>United States</span>
      <span className="mx-1 text-gray-300">·</span>
      <Link href="/local" className="text-[#53A318] font-semibold hover:underline">Change Location</Link>
    </span>
  );

  return (
    <div className="bg-[#F5F5F5] min-h-screen">

      {/* ── Trending Deals (carousel) ── */}
      {trending.length > 0 && (
        <div className="bg-white mt-2">
          <DealCarousel
            title="Trending Deals"
            deals={trending}
            seeAllHref="/local?sort=popular"
            subtitle={locationSubtitle}
          />
        </div>
      )}

      {/* ── Featured Deals (carousel) ── */}
      {featured.length > 0 && (
        <div className="bg-white mt-2">
          <DealCarousel
            title="Featured Deals"
            deals={featured}
            seeAllHref="/local?featured=true"
          />
        </div>
      )}

      {/* ── Beauty & Spas carousel ── */}
      {beauty.length > 0 && (
        <div className="bg-white mt-2">
          <DealCarousel
            title="Beauty & Spas"
            deals={beauty}
            seeAllHref="/local/beauty-and-spas"
          />
        </div>
      )}

      {/* ── Sell on DealHive ── */}
      <section className="max-w-[1280px] mx-auto px-4 py-8">
        <div className="bg-white rounded-lg border border-[#E0E0E0] p-8 flex flex-col md:flex-row items-center gap-6">
          <div className="text-4xl">🏪</div>
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-xl font-black text-[#1A1A1A] mb-2">Grow your business with DealHive</h2>
            <p className="text-sm text-[#636366]">
              Reach thousands of new customers in your area. List your services and start getting bookings today.
            </p>
          </div>
          <Link
            href="/vendor/register"
            className="bg-[#53A318] hover:bg-[#438F10] text-white font-black px-8 py-3 rounded text-sm transition-colors whitespace-nowrap"
          >
            Become a Merchant
          </Link>
        </div>
      </section>
    </div>
  );
}
