import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'CreoleCentric TTS - Next.js Example',
  description: 'Text-to-Speech example using the CreoleCentric API',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
