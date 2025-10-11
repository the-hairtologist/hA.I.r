import { useEffect } from "react";

interface SEOHeadProps {
  title: string;
  description: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: "website" | "profile" | "article";
}

export const SEOHead = ({ 
  title, 
  description, 
  keywords,
  image = "/og-image.png",
  url,
  type = "website"
}: SEOHeadProps) => {
  useEffect(() => {
    // Update title
    document.title = `${title} | hA.I.r`;

    // Update or create meta tags
    const updateMetaTag = (name: string, content: string, isProperty = false) => {
      const attribute = isProperty ? "property" : "name";
      let meta = document.querySelector(`meta[${attribute}="${name}"]`);
      
      if (!meta) {
        meta = document.createElement("meta");
        meta.setAttribute(attribute, name);
        document.head.appendChild(meta);
      }
      
      meta.setAttribute("content", content);
    };

    // Standard meta tags
    updateMetaTag("description", description);
    if (keywords) {
      updateMetaTag("keywords", keywords);
    }

    // Open Graph tags
    updateMetaTag("og:title", title, true);
    updateMetaTag("og:description", description, true);
    updateMetaTag("og:type", type, true);
    updateMetaTag("og:image", image.startsWith('http') ? image : `${window.location.origin}${image}`, true);
    
    if (url) {
      updateMetaTag("og:url", url.startsWith('http') ? url : `${window.location.origin}${url}`, true);
    }

    // Twitter Card tags
    updateMetaTag("twitter:card", "summary_large_image");
    updateMetaTag("twitter:title", title);
    updateMetaTag("twitter:description", description);
    updateMetaTag("twitter:image", image.startsWith('http') ? image : `${window.location.origin}${image}`);

    // Canonical URL - use dynamic origin instead of hardcoded domain
    const canonicalUrl = url 
      ? (url.startsWith('http') ? url : `${window.location.origin}${url}`)
      : window.location.href;
      
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", canonicalUrl);
  }, [title, description, keywords, image, url, type]);

  return null;
};
