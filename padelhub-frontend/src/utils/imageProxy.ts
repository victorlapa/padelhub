const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3002";

/**
 * Proxies an image URL through our backend to avoid 429 rate limiting from Google
 * @param imageUrl - The original image URL (typically from Google)
 * @returns The proxied URL that goes through our backend
 */
export function getProxiedImageUrl(imageUrl: string | undefined): string | undefined {
  if (!imageUrl) {
    return undefined;
  }

  // Only proxy Google domains to avoid rate limiting
  const googleDomains = [
    'googleusercontent.com',
    'ggpht.com',
    'googleapis.com',
  ];

  const isGoogleDomain = googleDomains.some((domain) => imageUrl.includes(domain));

  if (!isGoogleDomain) {
    // If it's not a Google domain, return the original URL
    return imageUrl;
  }

  // Encode the URL and proxy it through our backend
  const encodedUrl = encodeURIComponent(imageUrl);
  return `${API_URL}/api/image-proxy?url=${encodedUrl}`;
}
