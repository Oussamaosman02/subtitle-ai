import fs from "fs";
import ffmpeg from "fluent-ffmpeg";

const MAX_SIZE = 25 * 1024 * 1024; // 25MB in bytes

/**
 * Asynchronously splits a file into parts and returns a promise that resolves with an array of read streams for each part.
 *
 * @param {string} filePath - The path to the file to be split.
 * @return {Promise<ReadStream[]>} A promise that resolves with an array of read streams for each part of the file.
 */
export async function splitFile(filePath) {
  const stream = fs.statSync(filePath).size;
  const toBeSplitted = stream > MAX_SIZE;
  if (!toBeSplitted) {
    return [fs.createReadStream(filePath)];
  } else {
    fs.mkdirSync(".chunks", { recursive: true });
    const chunksNumber = Math.ceil(stream / MAX_SIZE);
    const chunkFiles = [];

    for (let i = 0; i < chunksNumber; i++) {
      const start = i * MAX_SIZE;
      const end = Math.min((i + 1) * MAX_SIZE, stream) - 1;
      const chunkFilePath = `.chunks/chunk-${i}.mp4`; // File path for chunk i

      const readStream = fs.createReadStream(filePath, {
        encoding: "utf-8",
        autoClose: true,
      });

      readStream
        .pipe(fs.createWriteStream(chunkFilePath))
        .on("data", (data) => {
          console.log({ data });
        })
        .on("error", (err) => {
          console.log(err);
        });

      chunkFiles.push(chunkFilePath);
    }

    return chunkFiles;
  }
}

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
export async function splitVideo(filePath, outputDir = ".chunks/") {
  const fileSize = fs.statSync(filePath).size; // in bytes
  const maxFileSize = 25 * 1024 * 1024; // 25MB in bytes

  if (fileSize <= maxFileSize) {
    // File size is within the limit. Return the file path.
    return [filePath];
  }

  const numParts = Math.ceil(fileSize / maxFileSize);
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
      const outputFile = outputDir + `part${i + 1}.mp4`;

      ffmpeg(filePath)
        .setStartTime(startTime)
        .setDuration(partDuration)
        .output(outputFile)
        .on("end", () => {
          outputFilePaths.push(outputFile);
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
