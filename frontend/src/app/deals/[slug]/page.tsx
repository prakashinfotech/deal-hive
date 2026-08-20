import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import DealDetailClient from './DealDetailClient';
import type { DealDetail } from '@/types';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api/v1';

async function getDeal(slug: string): Promise<DealDetail | null> {
  try {
    const res = await fetch(`${API}/deals/${slug}`, { next: { revalidate: 300 } });
    if (res.status === 404) return null;
    if (!res.ok) throw new Error('Failed to fetch deal');
    return res.json();
  } catch { return null; }
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const deal = await getDeal(params.slug);
  if (!deal) return { title: 'Deal Not Found' };

  return {
    title: deal.title,
    description: deal.shortDescription,
    openGraph: {
      title: deal.title,
      description: deal.shortDescription,
      images: deal.primaryImageUrl ? [deal.primaryImageUrl] : [],
      type: 'website',
    },
    other: {
      'product:price:amount': String(deal.discountedPrice),
      'product:price:currency': 'USD',
    },
  };
}

export default async function DealDetailPage({ params }: { params: { slug: string } }) {
  const deal = await getDeal(params.slug);
  if (!deal) notFound();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: deal.title,
    description: deal.shortDescription,
    image: deal.primaryImageUrl || undefined,
    offers: {
      '@type': 'Offer',
      price: deal.discountedPrice,
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
    },
    aggregateRating: deal.reviewCount > 0 ? {
      '@type': 'AggregateRating',
      ratingValue: deal.avgRating,
      reviewCount: deal.reviewCount,
    } : undefined,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <DealDetailClient deal={deal} />
    </>
  );
}

export async function generateStaticParams() {
  try {
    const res = await fetch(`${API}/deals?pageSize=1000&sort=popular`, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.items ?? []).map((d: { slug: string }) => ({ slug: d.slug }));
  } catch { return []; }
}
