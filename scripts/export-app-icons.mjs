import sharp from "sharp";

const master = "public/brand/app-icon-master.png";
const outputs = [
  ["public/icon-192.png", 192],
  ["public/icon-512.png", 512],
  ["app/icon.png", 512],
  ["app/apple-icon.png", 180],
];
for (const [file, size] of outputs) {
  await sharp(master).resize(size, size, { kernel: "lanczos3" }).png().toFile(file);
}
// Keep the complete door symbol within the maskable icon's central safe area.
await sharp(master).resize(392, 392, { kernel: "lanczos3" })
  .extend({ top: 60, bottom: 60, left: 60, right: 60, background: "#ffffff" })
  .png().toFile("public/icon-maskable-512.png");
console.log("Exported Android, iPhone, browser, and maskable app icons.");
