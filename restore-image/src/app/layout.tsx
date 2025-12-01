import './globals.css';
import { Analytics } from "@vercel/analytics/next";

export const metadata = {
  title: 'Qudely - AI Image Restoration Tool',
  description: 'Qudely revives old, faded, and black-and-white photos into modern, sharp, colorized images using AI. Restore your memories instantly.',
  url: 'https://qudely-ai.vercel.app',
  image: 'https://qudely-ai.vercel.app/preview.png', // Replace with an actual preview image
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* SEO Meta */}
        <title>{metadata.title}</title>
        <meta name="description" content={metadata.description} />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={metadata.url} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />

        {/* Google Site Verification */}
        <meta name="google-site-verification" content="GEhIL5p4eL2t-sYJHEb4OFm_nJKqeq-5WOBt-_vHRpc" />

        {/* Open Graph / Facebook */}
        <meta property="og:title" content={metadata.title} />
        <meta property="og:description" content={metadata.description} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={metadata.url} />
        <meta property="og:image" content={metadata.image} />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={metadata.title} />
        <meta name="twitter:description" content={metadata.description} />
        <meta name="twitter:image" content={metadata.image} />
      </head>
      <body>
        <Analytics />
        {children}
      </body>
    </html>
  );
}
