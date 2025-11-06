import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './provider';

export const metadata: Metadata = {
  title: 'Attestify - Verified Savings on Celo',
  description: 'AI-powered investment vault with privacy-preserving identity verification. Built on Celo.',
  keywords: ['Celo', 'DeFi', 'Self Protocol', 'Savings', 'Aave Market'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}