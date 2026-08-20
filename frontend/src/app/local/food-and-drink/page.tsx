import type { Metadata } from 'next';
import DealsListingPage from '@/components/deals/DealsListingPage';

export const metadata: Metadata = { title: 'Food & Drink Deals | DealHive' };

export default function FoodAndDrinkPage({
  searchParams,
}: {
  searchParams?: { minPrice?: string; maxPrice?: string; sort?: string };
}) {
  return (
    <DealsListingPage
      title="Food & Drink"
      subtitle="Restaurants, bars, cafes and delivery — save big on every meal"
      category="food"
      searchParams={searchParams}
      breadcrumbs={[{ label: 'Local', href: '/local' }]}
      subcategories={[
        { label: 'Restaurants', href: '/local/restaurants', emoji: '🍽️' },
        { label: 'Bars & Nightlife', href: '/local/bars', emoji: '🍸' },
        { label: 'Cafes & Treats', href: '/local/cafes-and-treats', emoji: '☕' },
        { label: 'Bakeries', href: '/local/bakeries', emoji: '🥐' },
        { label: 'Breweries', href: '/local/breweries-wineries-and-distilleries', emoji: '🍺' },
      ]}
    />
  );
}
