import type { Metadata } from 'next';
import DealsListingPage from '@/components/deals/DealsListingPage';

export const metadata: Metadata = { title: 'Things To Do | DealHive' };

export default function ThingsToDoPage({
  searchParams,
}: {
  searchParams?: { minPrice?: string; maxPrice?: string; sort?: string };
}) {
  return (
    <DealsListingPage
      title="Things To Do"
      subtitle="Tours, events, classes and adventures at great prices"
      category="things-to-do"
      searchParams={searchParams}
      breadcrumbs={[{ label: 'Local', href: '/local' }]}
      subcategories={[
        { label: 'Fun & Leisure', href: '/local/fun-and-leisure-activities', emoji: '🎉' },
        { label: 'Tickets & Events', href: '/local/tickets-and-events', emoji: '🎟️' },
        { label: 'Kids Activities', href: '/local/kids-activities', emoji: '🧒' },
        { label: 'Tours', href: '/local/sightseeing-and-tours', emoji: '🗺️' },
        { label: 'Sports & Outdoors', href: '/local/sports-and-outdoor-activities', emoji: '⛷️' },
        { label: 'Classes', href: '/local/classes', emoji: '📚' },
        { label: 'Escape Games', href: '/local/escape-games', emoji: '🔐' },
        { label: 'Boat Tours', href: '/local/boat-tours', emoji: '⛵' },
      ]}
    />
  );
}
