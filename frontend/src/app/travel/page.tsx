import type { Metadata } from 'next';
import DealsListingPage from '@/components/deals/DealsListingPage';

export const metadata: Metadata = { title: 'Travel Deals | DealHive' };

export default function TravelPage() {
  return (
    <DealsListingPage
      title="Travel"
      subtitle="Hotels, resorts, getaways and adventures — at prices you'll love"
      category="travel"
      breadcrumbs={[]}
      subcategories={[
        { label: 'Hotels', href: '/travel/hotels', emoji: '🏨' },
        { label: 'Resorts', href: '/travel/resorts', emoji: '🌴' },
        { label: 'Weekend Getaways', href: '/travel/weekend-getaways', emoji: '🚗' },
        { label: 'Cruises', href: '/travel/cruises', emoji: '🚢' },
        { label: 'Theme Parks', href: '/travel/waterparks', emoji: '🎢' },
        { label: 'All-Inclusive', href: '/travel/all-inclusive', emoji: '🍹' },
        { label: 'Family Trips', href: '/travel/family-trips', emoji: '👨‍👩‍👧' },
        { label: 'Spa & Wellness', href: '/travel/spa-and-wellness', emoji: '🧘' },
      ]}
    />
  );
}
