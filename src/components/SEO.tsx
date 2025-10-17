/**
 * SEO Component
 * Dynamically updates page meta tags for better search visibility
 */

import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'profile';
}

export const SEO = ({
  title = 'hA.I.r - AI-Powered Salon Assistant',
  description = 'Professional color formulas in seconds. AI-powered booking, client management, and formula generation for hair stylists.',
  keywords = 'hair salon software, color formula generator, salon booking, stylist app, hair color AI, salon management',
  image = 'https://hair.app/og-image.png',
  url = 'https://hair.app/',
  type = 'website',
}: SEOProps) => {
  const fullTitle = title.includes('hA.I.r') ? title : `${title} | hA.I.r`;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <link rel="canonical" href={url} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={url} />
      <meta property="twitter:title" content={fullTitle} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={image} />
    </Helmet>
  );
};
