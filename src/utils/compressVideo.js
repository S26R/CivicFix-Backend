// utils/compressVideo.js
import ffmpeg from "fluent-ffmpeg";
import { tmpdir } from "os";
import { writeFile, unlink, readFile } from "fs/promises";
import path from "path";

export default async function compressVideo(buffer) {
  const inputPath = path.join(tmpdir(), Date.now() + ".mp4");
  const outputPath = path.join(tmpdir(), Date.now() + "-compressed.mp4");
  await writeFile(inputPath, buffer);

  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .outputOptions([
        "-vcodec libx264", // H.264 codec
        "-crf 23",         // quality (lower = better, 18–23 recommended)
        "-preset fast",    // speed vs compression
        "-vf scale=1280:-1" // resize width to 1280px, keep aspect
      ])
      .save(outputPath)
      .on("end", async () => {
        const compressed = await readFile(outputPath);
        await unlink(inputPath);
        await unlink(outputPath);
        resolve(compressed);
      })
      .on("error", (err) => reject(err));
  });
}
