'use client';

import { usePathname } from 'next/navigation';
import Navbar from './Navbar';

// Routes that should render without the Navbar and footer shell
const SHELL_EXCLUDED = ['/checkout', '/vendor/register'];

interface ShellWrapperProps {
  children: React.ReactNode;
  footer: React.ReactNode;
}

export default function ShellWrapper({ children, footer }: ShellWrapperProps) {
  const pathname = usePathname();
  const excluded = SHELL_EXCLUDED.some((p) => pathname === p || pathname.startsWith(p + '/'));

  if (excluded) {
    return <main className="min-h-screen">{children}</main>;
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen">{children}</main>
      {footer}
    </>
  );
}
