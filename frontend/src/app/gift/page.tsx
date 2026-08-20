import type { Metadata } from 'next';
import DealsListingPage from '@/components/deals/DealsListingPage';

export const metadata: Metadata = { title: 'Gifts | DealHive' };

export default function GiftPage() {
  return (
    <DealsListingPage
      title="Gifts"
      subtitle="The perfect gift for everyone — thoughtful deals for every occasion"
      breadcrumbs={[]}
      subcategories={[
        { label: 'For Her', href: '/gift/for-her', emoji: '💝' },
        { label: 'For Him', href: '/gift/for-him', emoji: '🎁' },
        { label: 'For Couples', href: '/gift/for-couples', emoji: '💑' },
        { label: 'For Kids', href: '/gift/for-kids', emoji: '🧒' },
        { label: 'Birthday', href: '/gift/birthday', emoji: '🎂' },
        { label: 'Anniversary', href: '/gift/anniversary', emoji: '💍' },
        { label: 'Wedding', href: '/gift/wedding', emoji: '💒' },
        { label: 'Graduation', href: '/gift/graduation', emoji: '🎓' },
      ]}
    />
  );
}
