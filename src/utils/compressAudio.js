// utils/compressAudio.js
import ffmpeg from "fluent-ffmpeg";
import { tmpdir } from "os";
import { writeFile, unlink, readFile } from "fs/promises";
import path from "path";

export default async function compressAudio(buffer) {
  const inputPath = path.join(tmpdir(), Date.now() + ".wav");
  const outputPath = path.join(tmpdir(), Date.now() + "-compressed.mp3");
  await writeFile(inputPath, buffer);

  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .audioCodec("libmp3lame")
      .audioBitrate("128k")
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
