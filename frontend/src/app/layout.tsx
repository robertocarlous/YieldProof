import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './provider';

export const metadata: Metadata = {
  title: 'YieldProof - Verified Savings',
  description: 'AI-powered investment vault with privacy-preserving identity verification.',
  keywords: ['Ethereum', 'DeFi', 'Savings', 'Aave V3', 'USDC'],
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