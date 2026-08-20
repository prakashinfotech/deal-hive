import type { Metadata } from 'next';
import DealsListingPage from '@/components/deals/DealsListingPage';

export const metadata: Metadata = { title: 'Beauty & Spas Deals | DealHive' };

export default function BeautyAndSpasPage({
  searchParams,
}: {
  searchParams?: { minPrice?: string; maxPrice?: string; sort?: string };
}) {
  return (
    <DealsListingPage
      title="Beauty & Spas"
      subtitle="Massages, facials, hair styling and more — at unbeatable prices"
      category="beauty-spas"
      searchParams={searchParams}
      breadcrumbs={[{ label: 'Local', href: '/local' }]}
      subcategories={[
        { label: 'Massage', href: '/local/massage', emoji: '💆' },
        { label: 'Hair Removal', href: '/local/hair-removal', emoji: '✨' },
        { label: 'Face & Skin Care', href: '/local/skin-care', emoji: '🧖' },
        { label: 'Nail Salons', href: '/local/nail-salons', emoji: '💅' },
        { label: 'Spas', href: '/local/spa', emoji: '🛁' },
        { label: 'Hair & Styling', href: '/local/hair-salons', emoji: '💇' },
        { label: 'Brows & Lashes', href: '/local/brow-and-lash', emoji: '👁️' },
        { label: 'Tanning', href: '/local/tanning', emoji: '☀️' },
      ]}
    />
  );
}
