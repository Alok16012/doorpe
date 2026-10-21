import "server-only";
import { readdirSync } from "fs";
import path from "path";

/** Every product image we ship, as the emoji it renders. Used by the admin image picker. */
export function availableIcons(): string[] {
  try {
    return readdirSync(path.join(process.cwd(), "public/img/e"))
      .filter((f) => f.endsWith(".png"))
      .map((f) => f.replace(".png", "").split("-").map((h) => String.fromCodePoint(parseInt(h, 16))).join(""))
      .sort();
  } catch {
    return [];
  }
}
