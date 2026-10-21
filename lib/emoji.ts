/** Product art: Microsoft Fluent Emoji 3D (MIT), stored in /public/img/e/<codepoints>.png */
export function emojiSrc(e: string) {
  const code = Array.from(e).filter((c) => c !== "️").map((c) => c.codePointAt(0)!.toString(16)).join("-");
  return `/img/e/${code}.png`;
}
/** Split a string of several emoji (banner art) into single glyphs. */
export const emojiList = (s: string) => Array.from(s).filter((c) => c !== "️" && c !== "‍");
