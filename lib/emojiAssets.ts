import "server-only";
import photos from "./item-photos.json";

/** Real item photos available in the admin image picker. */
export function availableIcons(): string[] {
  return [...new Set([...Object.values(photos.emoji), ...Object.values(photos.labels)])].sort();
}
