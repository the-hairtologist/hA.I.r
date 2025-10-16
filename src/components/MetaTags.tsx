/**
 * SEO Meta Tags Component
 * Dynamically sets meta tags for better SEO
 */

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface MetaTagsProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  type?: 'website' | 'article' | 'profile';
}

const DEFAULT_META = {
  title: 'hA.I.r App - Professional Hair Salon Management',
  description: 'Modern salon management platform with AI-powered features for stylists and clients. Manage appointments, formulas, client profiles, and more.',
  keywords: 'salon management, hair stylist, appointment booking, formula tracking, client management, AI hair recommendations',
  image: '/og-image.png',
  type: 'website' as const,
};

export function MetaTags({
  title,
  description,
  keywords,
  image,
  type = 'website'
}: MetaTagsProps) {
  const location = useLocation();
  const baseUrl = window.location.origin;
  const currentUrl = baseUrl + location.pathname;

  const meta = {
    title: title ? `${title} | hA.I.r App` : DEFAULT_META.title,
    description: description || DEFAULT_META.description,
    keywords: keywords || DEFAULT_META.keywords,
    image: image ? `${baseUrl}${image}` : `${baseUrl}${DEFAULT_META.image}`,
    type: type || DEFAULT_META.type,
  };

  useEffect(() => {
    // Update document title
    document.title = meta.title;

    // Update or create meta tags
    const updateMeta = (property: string, content: string) => {
      let element = document.querySelector(`meta[property="${property}"]`) ||
                    document.querySelector(`meta[name="${property}"]`);
      
      if (!element) {
        element = document.createElement('meta');
        if (property.startsWith('og:') || property.startsWith('twitter:')) {
          element.setAttribute('property', property);
        } else {
          element.setAttribute('name', property);
        }
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // Standard meta tags
    updateMeta('description', meta.description);
    updateMeta('keywords', meta.keywords);

    // Open Graph tags
    updateMeta('og:title', meta.title);
    updateMeta('og:description', meta.description);
    updateMeta('og:image', meta.image);
    updateMeta('og:url', currentUrl);
    updateMeta('og:type', meta.type);

    // Twitter Card tags
    updateMeta('twitter:card', 'summary_large_image');
    updateMeta('twitter:title', meta.title);
    updateMeta('twitter:description', meta.description);
    updateMeta('twitter:image', meta.image);

    // Canonical URL
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = currentUrl;
  }, [meta, currentUrl]);

  return null;
}

// Structured Data for SEO
export function StructuredData({ type, data }: { type: 'Organization' | 'WebApplication'; data: any }) {
  useEffect(() => {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': type,
      ...data,
    });
    
    const existingScript = document.querySelector('script[type="application/ld+json"]');
    if (existingScript) {
      existingScript.remove();
    }
    
    document.head.appendChild(script);

    return () => {
      script.remove();
    };
  }, [type, data]);

  return null;
}
