import fs from "fs";
import { createSubtitles } from "./helpers/openaiHelper.js";
import {
  getSegmentSubtitles,
  getWordSubtitles,
  processSubtitles,
  writeSubtitleToFile,
} from "./helpers/subtitlesHelpers.js";
import { splitVideo } from "./helpers/fileHelpers.js";
import { getVideo } from "./helpers/youtubeHelpers.js";
import { error, info, warning } from "./helpers/consoleHelpers.js";

export const main = async ({
  key,
  video,
  url,
  outputDir,
  type,
  mode,
  prefix,
}) => {
  const startDate = new Date();
  info("Empezando tarea");
  let message = "Procesando video...";
  let loadingInterval;
  if (!url && !video) {
    error("No se ha proporcionado un video");
    return;
  }
  const outTempDir = ".temp/";
  try {
    let videoPath = "";
    if (url && !video) {
      videoPath = await getVideo(url, outTempDir)
        .then((path) => path)
        .catch((e) => {
          console.log("first4");
        });
    } else if (video && !url) {
      videoPath = video;
    } else {
      error("Se han proporcionado dos fuentes de video y solo se admite una");
      return;
    }
    loadingInterval = setInterval(() => {
      info(message);
    }, 1000);
    const filePaths = await splitVideo(videoPath, outTempDir, prefix);
    message = "Generando subtítulos...";
    const subtitlesRaw = await Promise.all(
      filePaths.map(
        async (filePath) =>
          await createSubtitles({
            filePath,
            key,
            mode,
          })
      )
    );

    const subtitles = processSubtitles(subtitlesRaw).reduce(
      (prev, curr) => {
        prev.words = [...(prev.words || []), ...(curr.words || [])];
        prev.segments = [...(prev.segments || []), ...(curr.segments || [])];
        prev.text = `${prev.text} ${curr.text}`;
        return prev;
      },
      { words: [], segments: [], text: "" }
    );

    clearInterval(loadingInterval);
    const directory = outputDir || "subtitles";
    if (fs.existsSync(outTempDir)) {
      fs.rmSync(outTempDir, { recursive: true });
    }

    info(`Creando carpeta '${directory}'`);
    fs.mkdirSync(directory, { recursive: true });

    const { srt: subtitlesSrtSegments, vtt: subtitlesVttSegments } =
      await getSegmentSubtitles(subtitles.segments, mode);
    const { srt: subtitlesSrtWords, vtt: subtitlesVttWords } =
      await getWordSubtitles(subtitles.words, mode);

    info("Guardando archivos...");

    writeSubtitleToFile(`${directory}/${prefix}-texto.txt`, subtitles.text);

    if (type === "srt") {
      writeSubtitleToFile(
        `${directory}/${prefix}-frases.srt`,
        subtitlesSrtSegments
      );
      writeSubtitleToFile(
        `${directory}/${prefix}-palabras.srt`,
        subtitlesSrtWords
      );
    } else if (type === "vtt") {
      writeSubtitleToFile(
        `${directory}/${prefix}-frases.vtt`,
        subtitlesVttSegments
      );
      writeSubtitleToFile(
        `${directory}/${prefix}-palabras.vtt`,
        subtitlesVttWords
      );
    } else {
      writeSubtitleToFile(
        `${directory}/${prefix}-frases.srt`,
        subtitlesSrtSegments
      );
      writeSubtitleToFile(
        `${directory}/${prefix}-palabras.srt`,
        subtitlesSrtWords
      );
      writeSubtitleToFile(
        `${directory}/${prefix}-frases.vtt`,
        subtitlesVttSegments
      );
      writeSubtitleToFile(
        `${directory}/${prefix}-palabras.vtt`,
        subtitlesVttWords
      );
    }

    const endDate = new Date();

    info("Subtítulos generados");
    warning(
      "Tiempo: ",
      `${new Date(endDate - startDate).getMinutes()}m ${new Date(
        endDate - startDate
      ).getSeconds()}s ${new Date(endDate - startDate).getMilliseconds()}ms`
    );
  } catch (errorText) {
    clearInterval(loadingInterval);
    if (fs.existsSync(outTempDir)) {
      fs.rmSync(outTempDir, { recursive: true });
    }
    if (typeof errorText === "string") {
      error(errorText);
    } else {
      console.error(errorText);
    }
    return;
  }
};
