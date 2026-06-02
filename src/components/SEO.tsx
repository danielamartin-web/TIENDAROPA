import { useEffect } from 'react';

interface SEOProps {
  title: string;
  description?: string;
  canonical?: string;
  image?: string;
  type?: 'website' | 'product' | 'article';
  jsonLd?: object | object[];
  noindex?: boolean;
}

const SITE_URL =
  (import.meta.env.VITE_SITE_URL as string | undefined)?.replace(/\/$/, '') ||
  'https://marda.com.ar';

function setMeta(selector: string, attr: string, value: string) {
  let el = document.head.querySelector<HTMLMetaElement>(selector);
  if (!el) {
    el = document.createElement('meta');
    const [, k, v] = selector.match(/\[([^=]+)="([^"]+)"\]/) ?? [];
    if (k && v) el.setAttribute(k, v);
    document.head.appendChild(el);
  }
  el.setAttribute(attr, value);
}

function setLink(rel: string, href: string) {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

const JSONLD_ID = 'page-jsonld';

function setJsonLd(data?: object | object[]) {
  const existing = document.getElementById(JSONLD_ID);
  if (existing) existing.remove();
  if (!data) return;
  const script = document.createElement('script');
  script.id = JSONLD_ID;
  script.type = 'application/ld+json';
  script.text = JSON.stringify(data);
  document.head.appendChild(script);
}

export default function SEO({
  title,
  description,
  canonical,
  image,
  type = 'website',
  jsonLd,
  noindex = false,
}: SEOProps) {
  useEffect(() => {
    const fullTitle = title.includes('MARDA') ? title : `${title} | MARDA`;
    document.title = fullTitle;

    if (description) {
      setMeta('meta[name="description"]', 'content', description);
      setMeta('meta[property="og:description"]', 'content', description);
      setMeta('meta[property="twitter:description"]', 'content', description);
    }

    setMeta('meta[property="og:title"]', 'content', fullTitle);
    setMeta('meta[property="twitter:title"]', 'content', fullTitle);
    setMeta('meta[property="og:type"]', 'content', type);

    const canonicalUrl = canonical
      ? canonical.startsWith('http')
        ? canonical
        : `${SITE_URL}${canonical}`
      : `${SITE_URL}${window.location.pathname}`;
    setLink('canonical', canonicalUrl);
    setMeta('meta[property="og:url"]', 'content', canonicalUrl);
    setMeta('meta[property="twitter:url"]', 'content', canonicalUrl);

    if (image) {
      const imageUrl = image.startsWith('http') ? image : `${SITE_URL}${image}`;
      setMeta('meta[property="og:image"]', 'content', imageUrl);
      setMeta('meta[property="twitter:image"]', 'content', imageUrl);
    }

    setMeta('meta[name="robots"]', 'content', noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large');

    setJsonLd(jsonLd);
  }, [title, description, canonical, image, type, jsonLd, noindex]);

  return null;
}

export { SITE_URL };
