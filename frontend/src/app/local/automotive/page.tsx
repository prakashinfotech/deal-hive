import type { Metadata } from 'next';
import DealsListingPage from '@/components/deals/DealsListingPage';

export const metadata: Metadata = { title: 'Auto & Home Deals | DealHive' };

export default function AutomotivePage({
  searchParams,
}: {
  searchParams?: { minPrice?: string; maxPrice?: string; sort?: string };
}) {
  return (
    <DealsListingPage
      title="Auto & Home"
      subtitle="Oil changes, car washes, cleaning services and more"
      category="auto-home"
      searchParams={searchParams}
      breadcrumbs={[{ label: 'Local', href: '/local' }]}
      subcategories={[
        { label: 'Oil Changes', href: '/local/oil-change', emoji: '🛢️' },
        { label: 'Auto Repair', href: '/local/auto-repair', emoji: '🔧' },
        { label: 'Car Wash', href: '/local/car-wash', emoji: '🚗' },
        { label: 'Home Cleaning', href: '/local/cleaning-services', emoji: '🧹' },
        { label: 'Home Improvement', href: '/local/home-improvement', emoji: '🏠' },
        { label: 'Parking', href: '/local/parking', emoji: '🅿️' },
      ]}
    />
  );
}
