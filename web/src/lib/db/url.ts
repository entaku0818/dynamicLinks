import { customAlphabet } from 'nanoid';
import { checkLinkExists } from './links';

const alphabet = '23456789abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ';
const nanoid = customAlphabet(alphabet, 6);

export async function generateUniqueShortcode(): Promise<string> {
  while (true) {
    const shortcode = nanoid();
    const exists = await checkLinkExists(shortcode);
    if (!exists) {
      return shortcode;
    }
  }
}

export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function normalizeUrl(url: string): string {
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return `https://${url}`;
  }
  return url;
}

export function isValidCustomPath(path: string): boolean {
  return /^[a-zA-Z0-9-_]+$/.test(path);
}