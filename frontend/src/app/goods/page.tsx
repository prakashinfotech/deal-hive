import type { Metadata } from 'next';
import DealsListingPage from '@/components/deals/DealsListingPage';

export const metadata: Metadata = { title: 'Goods | DealHive' };

export default function GoodsPage() {
  return (
    <DealsListingPage
      title="Goods"
      subtitle="Electronics, fashion, home & garden — shop thousands of discounted products"
      category="goods"
      breadcrumbs={[]}
      subcategories={[
        { label: 'Electronics', href: '/goods/electronics', emoji: '📱' },
        { label: 'Fashion', href: '/goods/womens-clothing-shoes-and-accessories', emoji: '👗' },
        { label: 'Home & Garden', href: '/goods/for-the-home', emoji: '🏡' },
        { label: 'Health & Beauty', href: '/goods/health-and-beauty', emoji: '💄' },
        { label: 'Sports', href: '/goods/sports-and-outdoors', emoji: '⚽' },
        { label: 'Personalized Gifts', href: '/goods/v1-personalized-items', emoji: '🎁' },
        { label: 'Jewelry', href: '/goods/jewelry-and-watches', emoji: '💍' },
        { label: 'Baby & Kids', href: '/goods/baby-kids-and-toys', emoji: '🧸' },
      ]}
    />
  );
}
