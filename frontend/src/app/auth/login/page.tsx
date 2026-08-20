import { redirect } from 'next/navigation';

export default function OldLoginRedirect({ searchParams }: { searchParams: Record<string, string> }) {
  const qs = new URLSearchParams(searchParams).toString();
  redirect(`/login${qs ? `?${qs}` : ''}`);
}
