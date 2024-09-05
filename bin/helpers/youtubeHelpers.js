import ytdl from "@distube/ytdl-core";
import fs from "fs";
import readline from "readline";
import { error } from "./consoleHelpers.js";

export const getVideoDuration = async (url) => {
  const info = await ytdl.getBasicInfo(url);
  return info.videoDetails.lengthSeconds;
};

/**
 * Asynchronous function to download a video from a given URL and save it to the specified output directory.
 *
 * @param {string} url - The URL of the video to be downloaded
 * @param {string} [outputDir=".chunks"] - The output directory where the video will be saved
 * @return {Promise<string>} A promise that resolves with the path of the downloaded video
 */
export const getVideo = async (url, outputDir = ".chunks") => {
  try {
    return new Promise(async (resolve, reject) => {
      try {
        let starttime;

        const data = await ytdl(url, {
          quality: "lowest",
        });

        fs.mkdirSync(outputDir, { recursive: true });

        const outputPath = `${outputDir}/video.mp4`;

        data.pipe(fs.createWriteStream(outputPath, {}));

        data.once("response", () => {
          starttime = Date.now();
        });

        data.on("uncaughtException", function (err) {
          error("UNCAUGHT EXCEPTION - keeping process alive:", err);
        });

        data.on("progress", (chunkLength, downloaded, total) => {
          try {
            const percent = downloaded / total;

            const downloadedMinutes = (Date.now() - starttime) / 1000 / 60;

            const estimatedDownloadTime =
              downloadedMinutes / percent - downloadedMinutes;

            readline.cursorTo(process.stdout, 0);

            process.stdout.write(
              `${(percent * 100).toFixed(2)}% descargado (${(
                downloaded /
                1024 /
                1024
              ).toFixed(2)}MB de ${(total / 1024 / 1024).toFixed(
                2
              )}MB) \nDescargando por ${downloadedMinutes.toFixed(
                2
              )} minutos, le quedan ${estimatedDownloadTime.toFixed(
                2
              )} minutos aprox \n`
            );
            readline.moveCursor(process.stdout, 0, -1);
          } catch (error) {
            reject(error);
          }
        });
        data.on("end", () => {
          resolve(outputPath);
        });
        data.on("error", (error) => {
          reject(error);
        });
      } catch (error) {
        reject(error);
      }
    });
  } catch (error) {
    throw error;
  }
};
