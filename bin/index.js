#! /usr/bin/env node

import chalk from "chalk";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import fs from "fs";
import { createSubtitles } from "./helpers/openaiHelper.js";
import {
  getSegmentSubtitles,
  getWordSubtitles,
  processSubtitles,
  writeSubtitleToFile,
} from "./helpers/subtitlesHelpers.js";
import { splitVideo } from "./helpers/fileHelpers.js";

const log = (...text) =>
  console.log(chalk.hex("#DEADED").bold(" >>> "), ...text);
const info = (...text) => log(chalk.blue(...text));
const warning = (...text) => log(chalk.bold.hex("#FFA500")(...text));
const error = (...text) => log(chalk.bold.red(...text));

const getArguments = (key) =>
  yargs(process.argv.slice(2)).parse()[key] ||
  yargs(process.argv.slice(2)).parse()[key.split("")[0]];

yargs(hideBin(process.argv))
  .option("key", {
    alias: "k",
    type: "string",
    describe: "Api key de Openai",
    demandOption: true,
  })
  .option("video", {
    alias: "v",
    type: "video",
    describe: "Ruta del video a subtitular",
    demandOption: true,
  })
  .option("salida", {
    alias: "s",
    type: "ruta",
    describe:
      "Directorio/Carpeta de salida para los archivos de subtítulos. Por defecto se crea la carpeta 'subtitle'",
    demandOption: false,
  })
  .option("tipo", {
    alias: "t",
    type: "string",
    describe: "Tipo de subtítulos: srt o vtt. Po defecto se exportan ambos.",
    demandOption: false,
  })
  .option("modo", {
    alias: "m",
    type: "string",
    describe:
      "Modo de los subtítulos: frases o palabras. Por defecto se exportan ambos",
    demandOption: false,
  })
  .usage(
    "Uso: $0 -k [texto] -v [ruta] -o [carpeta] -t [srt|vtt] -m [frases|palabras]"
  )
  .parse();

const key = getArguments("key");
const video = getArguments("video");
const outputDir = getArguments("salida");
const type = getArguments("tipo");
const mode = getArguments("modo");

const chosenMode = () => {
  if (mode === "frases") {
    return ["segment"];
  } else if (mode === "palabras") {
    return ["word"];
  } else {
    return ["segment", "word"];
  }
};

const main = async () => {
  const startDate = new Date();
  info("Empezando tarea");
  let message = "Procesando video...";
  const loadingInterval = setInterval(() => {
    info(message);
  }, 1000);
  try {
    const outTempDir = ".chunks/";
    const fileStreams = await splitVideo(video);
    message = "Generando subtítulos...";
    const subtitlesRaw = await Promise.all(
      fileStreams.map(
        async (fileStream) =>
          await createSubtitles({
            fileStream: fs.createReadStream(fileStream),
            key,
            mode: chosenMode(),
          })
      )
    );

    const subtitles = processSubtitles(subtitlesRaw).reduce(
      (prev, curr) => {
        prev.words = [...(prev.words || []), ...(curr.words || [])];
        prev.segments = [...(prev.segments || []), ...(curr.segments || [])];
        return prev;
      },
      { words: [], segments: [] }
    );

    clearInterval(loadingInterval);
    const directory = outputDir || "subtitles";
    fs.rmSync(outTempDir, { recursive: true });

    info(`Creando carpeta '${directory}'`);
    fs.mkdirSync(directory, { recursive: true });

    const { srt: subtitlesSrtSegments, vtt: subtitlesVttSegments } =
      await getSegmentSubtitles(subtitles.segments, chosenMode());
    const { srt: subtitlesSrtWords, vtt: subtitlesVttWords } =
      await getWordSubtitles(subtitles.words, chosenMode());

    info("Guardando archivos...");

    if (type === "srt") {
      writeSubtitleToFile(
        `${directory}/subtitles-phrase.srt`,
        subtitlesSrtSegments
      );
      writeSubtitleToFile(
        `${directory}/subtitles-words.srt`,
        subtitlesSrtWords
      );
    } else if (type === "vtt") {
      writeSubtitleToFile(
        `${directory}/subtitles-phrase.vtt`,
        subtitlesVttSegments
      );
      writeSubtitleToFile(
        `${directory}/subtitles-words.vtt`,
        subtitlesVttWords
      );
    } else {
      writeSubtitleToFile(
        `${directory}/subtitles-phrase.srt`,
        subtitlesSrtSegments
      );
      writeSubtitleToFile(
        `${directory}/subtitles-words.srt`,
        subtitlesSrtWords
      );
      writeSubtitleToFile(
        `${directory}/subtitles-phrase.vtt`,
        subtitlesVttSegments
      );
      writeSubtitleToFile(
        `${directory}/subtitles-words.vtt`,
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
    if (typeof errorText === "string") {
      error(errorText);
    } else {
      console.error({ errorText });
      // error(JSON.stringify({ error: errorText }));
    }
    return;
  }
};

main();
