import photos from "./item-photos.json";

const byEmoji: Record<string, string> = Object.fromEntries(
  Object.entries(photos.emoji).map(([key, value]) => [key.replace(/\uFE0F/g, ""), value]),
);
const byName: Record<string, string> = photos.labels;

/** Resolve legacy catalogue icons to local photographs; preserve custom image URLs. */
export function emojiSrc(icon: string, name?: string) {
  // Older stored catalogues and order snapshots can contain a Fluent asset path.
  const legacy = icon.match(/^\/img\/e\/([a-f0-9-]+)\.png$/i);
  if (legacy) icon = legacy[1].split("-").map((hex) => String.fromCodePoint(parseInt(hex, 16))).join("");
  if (icon.startsWith("/") || icon.startsWith("http") || icon.startsWith("data:")) return icon;
  return (name && byName[name]) || byEmoji[icon.replace(/\uFE0F/g, "")] || "/img/items/broccoli.webp";
}

/** Split legacy banner art into its individual item keys. */
export const emojiList = (s: string) => Array.from(s).filter((c) => c !== "️" && c !== "‍");
