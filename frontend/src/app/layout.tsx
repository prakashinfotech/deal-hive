import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Providers from '@/components/providers/Providers';
import ShellWrapper from '@/components/layout/ShellWrapper';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: { default: 'DealHive — Up to 80% off local deals', template: '%s | DealHive' },
  description: 'Discover incredible deals on restaurants, spas, travel, activities and more near you.',
  openGraph: {
    siteName: 'DealHive',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="bg-[#F5F5F5] text-[#1A1A1A] antialiased">
        <Providers>
          <ShellWrapper footer={
          /* ── Groupon-style Footer ── */
          <footer className="bg-white border-t border-[#E0E0E0] mt-8">
            {/* Top CTA strip */}
            <div className="bg-[#F5F5F5] border-b border-[#E0E0E0]">
              <div className="max-w-[1280px] mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="font-black text-lg text-[#1A1A1A]">Get the DealHive App</h3>
                  <p className="text-sm text-[#636366] mt-1">Exclusive app-only deals. Download free.</p>
                </div>
                <div className="flex gap-3">
                  <a href="#" className="flex items-center gap-2 bg-[#1A1A1A] text-white px-4 py-2.5 rounded text-sm font-bold hover:bg-gray-800 transition-colors">
                    📱 App Store
                  </a>
                  <a href="#" className="flex items-center gap-2 bg-[#1A1A1A] text-white px-4 py-2.5 rounded text-sm font-bold hover:bg-gray-800 transition-colors">
                    🤖 Google Play
                  </a>
                </div>
              </div>
            </div>

            {/* Main footer links */}
            <div className="max-w-[1280px] mx-auto px-6 py-10">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-8">

                <div>
                  <h4 className="font-black text-sm text-[#1A1A1A] mb-3 uppercase tracking-wide">Categories</h4>
                  <ul className="space-y-2 text-sm text-[#636366]">
                    <li><a href="/local/beauty-and-spas" className="hover:text-[#53A318] transition-colors">Beauty & Spas</a></li>
                    <li><a href="/local/things-to-do" className="hover:text-[#53A318] transition-colors">Things To Do</a></li>
                    <li><a href="/local/automotive" className="hover:text-[#53A318] transition-colors">Auto & Home</a></li>
                    <li><a href="/local/food-and-drink" className="hover:text-[#53A318] transition-colors">Food & Drink</a></li>
                    <li><a href="/travel" className="hover:text-[#53A318] transition-colors">Travel</a></li>
                    <li><a href="/goods" className="hover:text-[#53A318] transition-colors">Goods</a></li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-black text-sm text-[#1A1A1A] mb-3 uppercase tracking-wide">Merchants</h4>
                  <ul className="space-y-2 text-sm text-[#636366]">
                    <li><a href="/vendor/register" className="hover:text-[#53A318] transition-colors">Sell on DealHive</a></li>
                    <li><a href="/vendor/dashboard" className="hover:text-[#53A318] transition-colors">Vendor Portal</a></li>
                    <li><a href="/vendor/register" className="hover:text-[#53A318] transition-colors">Pricing</a></li>
                    <li><a href="/vendor/register" className="hover:text-[#53A318] transition-colors">Success Stories</a></li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-black text-sm text-[#1A1A1A] mb-3 uppercase tracking-wide">Support</h4>
                  <ul className="space-y-2 text-sm text-[#636366]">
                    <li><a href="/help" className="hover:text-[#53A318] transition-colors">Help Center</a></li>
                    <li><a href="/contact" className="hover:text-[#53A318] transition-colors">Contact Us</a></li>
                    <li><a href="/account/orders" className="hover:text-[#53A318] transition-colors">My Orders</a></li>
                    <li><a href="/account/groupons" className="hover:text-[#53A318] transition-colors">My Vouchers</a></li>
                    <li><a href="/help/refunds" className="hover:text-[#53A318] transition-colors">Refund Policy</a></li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-black text-sm text-[#1A1A1A] mb-3 uppercase tracking-wide">Company</h4>
                  <ul className="space-y-2 text-sm text-[#636366]">
                    <li><a href="/about" className="hover:text-[#53A318] transition-colors">About Us</a></li>
                    <li><a href="/careers" className="hover:text-[#53A318] transition-colors">Careers</a></li>
                    <li><a href="/press" className="hover:text-[#53A318] transition-colors">Press</a></li>
                    <li><a href="/blog" className="hover:text-[#53A318] transition-colors">Blog</a></li>
                    <li><a href="/investor-relations" className="hover:text-[#53A318] transition-colors">Investors</a></li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-black text-sm text-[#1A1A1A] mb-3 uppercase tracking-wide">Legal</h4>
                  <ul className="space-y-2 text-sm text-[#636366]">
                    <li><a href="/privacy" className="hover:text-[#53A318] transition-colors">Privacy Policy</a></li>
                    <li><a href="/terms" className="hover:text-[#53A318] transition-colors">Terms of Service</a></li>
                    <li><a href="/cookies" className="hover:text-[#53A318] transition-colors">Cookie Policy</a></li>
                    <li><a href="/accessibility" className="hover:text-[#53A318] transition-colors">Accessibility</a></li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Bottom bar */}
            <div className="border-t border-[#E0E0E0]">
              <div className="max-w-[1280px] mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="font-black text-[#53A318] text-xl">DealHive</span>
                  <span className="text-xs text-[#636366]">© {new Date().getFullYear()} DealHive, Inc. All rights reserved.</span>
                </div>
                <div className="flex items-center gap-4 text-xs text-[#636366]">
                  <a href="#" className="hover:text-[#53A318]" aria-label="Twitter">Twitter</a>
                  <a href="#" className="hover:text-[#53A318]" aria-label="Facebook">Facebook</a>
                  <a href="#" className="hover:text-[#53A318]" aria-label="Instagram">Instagram</a>
                </div>
              </div>
            </div>
          </footer>
          }>
            {children}
          </ShellWrapper>
        </Providers>
      </body>
    </html>
  );
}
