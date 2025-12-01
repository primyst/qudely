import './globals.css';
import { Analytics } from "@vercel/analytics/next"

export const metadata = {
  title: 'Qudely - AI Image restoration tool',
  description: 'Qudely: AI-powered image restoration, colorization, and more.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <Analytics />
      <body>{children}</body>
    </html>
  );
}
