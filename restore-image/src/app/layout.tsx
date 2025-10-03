import './globals.css';

export const metadata = {
  title: 'Qudely - AI Tools & Utilities',
  description: 'Qudely: AI-powered image restoration, colorization, and more.',
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