import type { Metadata } from 'next';
import Link from 'next/link';
import DealCard from '@/components/deals/DealCard';
import type { DealSummary, PaginatedResponse } from '@/types';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api/v1';

export const metadata: Metadata = { title: 'Search Deals | DealHive' };

async function searchDeals(q: string, page = 1): Promise<PaginatedResponse<DealSummary>> {
  try {
    const qs = new URLSearchParams({ search: q, pageSize: '24', page: String(page) });
    const res = await fetch(`${API}/deals?${qs}`, { cache: 'no-store' });
    if (!res.ok) return { items: [], totalCount: 0, page: 1, pageSize: 24, totalPages: 0 };
    return res.json();
  } catch {
    return { items: [], totalCount: 0, page: 1, pageSize: 24, totalPages: 0 };
  }
}

interface Props {
  searchParams: { q?: string; page?: string };
}

export default async function SearchPage({ searchParams }: Props) {
  const q = searchParams.q?.trim() ?? '';
  const page = Number(searchParams.page ?? 1);
  const result = q ? await searchDeals(q, page) : null;
  const deals = result?.items ?? [];

  return (
    <div className="bg-[#F5F5F5] min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-[#E0E0E0]">
        <div className="max-w-[1280px] mx-auto px-4 py-4">
          <nav className="text-xs text-[#636366] mb-3 flex items-center gap-1">
            <Link href="/" className="hover:text-[#53A318]">Home</Link>
            <span>›</span>
            <span className="text-[#1A1A1A] font-medium">Search</span>
          </nav>
          {q ? (
            <>
              <h1 className="text-2xl font-black text-[#1A1A1A]">
                Results for &ldquo;{q}&rdquo;
              </h1>
              <p className="text-sm text-[#636366] mt-1">
                {result?.totalCount ?? 0} deals found
              </p>
            </>
          ) : (
            <h1 className="text-2xl font-black text-[#1A1A1A]">Search Deals</h1>
          )}
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-4 py-6">
        {!q ? (
          /* No query — show popular categories */
          <div>
            <h2 className="text-lg font-black text-[#1A1A1A] mb-4">Browse by Category</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {[
                { label: 'Beauty & Spas', href: '/local/beauty-and-spas', emoji: '💆' },
                { label: 'Things To Do', href: '/local/things-to-do', emoji: '🎭' },
                { label: 'Automotive', href: '/local/automotive', emoji: '🔧' },
                { label: 'Food & Drink', href: '/local/food-and-drink', emoji: '🍽️' },
                { label: 'Travel', href: '/travel', emoji: '✈️' },
                { label: 'Goods', href: '/goods', emoji: '🛍️' },
                { label: 'Gifts', href: '/gift', emoji: '🎁' },
                { label: 'All Local', href: '/local', emoji: '📍' },
              ].map((cat) => (
                <Link key={cat.href} href={cat.href}
                  className="bg-white rounded border border-[#E0E0E0] p-4 flex items-center gap-3 hover:border-[#53A318] hover:bg-[#EFF7E6] transition-colors">
                  <span className="text-2xl">{cat.emoji}</span>
                  <span className="text-sm font-bold text-[#1A1A1A]">{cat.label}</span>
                </Link>
              ))}
            </div>
          </div>
        ) : deals.length === 0 ? (
          <div className="text-center py-16 bg-white rounded border border-[#E0E0E0]">
            <p className="text-xl font-bold text-[#1A1A1A] mb-2">No deals found for &ldquo;{q}&rdquo;</p>
            <p className="text-sm text-[#636366] mb-6">Try a different search term or browse categories</p>
            <div className="flex gap-3 justify-center flex-wrap">
              <Link href="/local" className="bg-[#53A318] text-white font-bold px-5 py-2 rounded text-sm hover:bg-[#438F10]">Local Deals</Link>
              <Link href="/travel" className="border border-[#53A318] text-[#53A318] font-bold px-5 py-2 rounded text-sm hover:bg-[#EFF7E6]">Travel</Link>
              <Link href="/goods" className="border border-[#53A318] text-[#53A318] font-bold px-5 py-2 rounded text-sm hover:bg-[#EFF7E6]">Goods</Link>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {deals.map((deal) => <DealCard key={deal.id} deal={deal} />)}
            </div>

            {/* Pagination */}
            {result && result.totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                {Array.from({ length: result.totalPages }, (_, i) => i + 1).map((p) => (
                  <Link
                    key={p}
                    href={`/search?q=${encodeURIComponent(q)}&page=${p}`}
                    className={`w-9 h-9 flex items-center justify-center rounded text-sm font-bold border transition-colors ${
                      p === page
                        ? 'bg-[#53A318] text-white border-[#53A318]'
                        : 'bg-white text-[#1A1A1A] border-[#E0E0E0] hover:border-[#53A318] hover:text-[#53A318]'
                    }`}
                  >
                    {p}
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
