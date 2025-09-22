// utils/compressImage.js
import sharp from "sharp";

export default async function compressImage(buffer) {
  return sharp(buffer)
    .resize({ width: 1280, withoutEnlargement: true }) // don’t upscale
    .jpeg({ quality: 80 }) // decent quality
    .toBuffer();
}
