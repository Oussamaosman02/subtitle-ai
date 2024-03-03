import fs from "fs";
import ffmpeg from "fluent-ffmpeg";

/**
 * Retrieves the duration of a video file.
 *
 * @param {string} filePath - The path to the video file
 * @return {Promise} A Promise that resolves with the duration of the video
 */
function getVideoDuration(filePath) {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) {
        reject(err);
      } else {
        resolve(metadata.format.duration);
      }
    });
  });
}

/**
 * Split a video file into smaller chunks if it exceeds the maximum file size.
 *
 * @param {string} filePath - The path to the video file.
 * @param {string} [outputDir=".chunks/"] - The directory where the video chunks will be stored.
 * @return {Promise<string[]>} An array of file paths for the video chunks.
 */
export async function splitVideo(
  filePath,
  outputDir = ".chunks/",
  prefix = ""
) {
  const fileSize = fs.statSync(filePath).size; // in bytes
  const maxFileSize = 25 * 1024 * 1024; // 25MB in bytes
  const maxOutputFileSize = 24 * 1024 * 1024; // 24MB in bytes

  if (fileSize <= maxFileSize) {
    // File size is within the limit. Return the file path.
    return [filePath];
  }

  const numParts = Math.ceil(fileSize / maxOutputFileSize);
  const duration = await getVideoDuration(filePath);
  const partDuration = duration / numParts;
  const outputFilePaths = [];

  // Create output directory if it doesn't exist
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }

  let partsCreated = 0;

  return new Promise((resolve, reject) => {
    for (let i = 0; i < numParts; i++) {
      const startTime = i * partDuration;
      const outputFile = outputDir + `part${prefix}-${i + 1}.mp4`;

      ffmpeg(filePath)
        .videoCodec("libx264")
        .size("50%")
        .setStartTime(startTime)
        .setDuration(partDuration)
        .output(outputFile)
        .on("end", () => {
          if (fs.statSync(outputFile).size <= maxFileSize) {
            outputFilePaths.push(outputFile);
          }
          partsCreated++;

          if (partsCreated === numParts) {
            resolve(outputFilePaths);
          }
        })
        .on("error", (err) => {
          console.error(`Error splitting part ${i + 1}:`, err);
          reject(err);
        })
        .run();
    }
  });
}
