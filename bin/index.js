#! /usr/bin/env node

import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import fs from "fs";
import { info, warning } from "./helpers/consoleHelpers.js";
import { main } from "./main.js";

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
  .option("url", {
    alias: "u",
    type: "video",
    describe: "Link del video de YouTube",
    demandOption: false,
  })
  .option("json", {
    alias: "j",
    type: "json",
    describe: "Archivo JSON para videos masivos",
    demandOption: false,
  })
  .option("video", {
    alias: "v",
    type: "video",
    describe: "Ruta del video a subtitular",
    demandOption: false,
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
    describe: "Tipo de subtítulos: srt, vtt o txt. Po defecto se exportan ambos.",
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
    "Uso: $0 -k [texto] -v [ruta] -o [carpeta] -t [srt|vtt|txt] -m [frases|palabras]"
  )
  .parse();

const key = getArguments("key");
const video = getArguments("video");
const url = getArguments("url");
const json = getArguments("json");
const outputDir = getArguments("salida");
const type = getArguments("tipo");
const mode = getArguments("modo");

const chosenMode = (thisMode) => {
  if (thisMode === "frases") {
    return ["segment"];
  } else if (thisMode === "palabras") {
    return ["word"];
  } else {
    return ["segment", "word"];
  }
};

const storeErrors = async (errors) => {
  const errorsFile = "errors.txt";
  if (fs.existsSync(errorsFile)) {
    await fs.appendFileSync(errorsFile, errors);
  } else {
    await fs.writeFileSync(errorsFile, errors);
  }
};

(async () => {
  const prefix = "subtitulos";
  if (json) {
    try {
      const startDate = new Date();
      const allVideos = JSON.parse(fs.readFileSync(json, "utf8"));
      if (!allVideos || !allVideos.length) {
        error("No se ha podido leer el archivo JSON o está vacío");
        return;
      }

      for (const videoData of allVideos) {
        try {
          await main({
            key,
            url: videoData.url, // opcional si video
            outputDir: videoData.outputDir, // opcional
            video: videoData.video, // opcional si url
            type: videoData.type, // opcional
            mode: chosenMode(videoData.mode), // opcional
            prefix: videoData.prefix || prefix, // opcional
          });
          info(
            `Procesado: ${allVideos.findIndex((v) => v === videoData) + 1} de ${
              allVideos.length
            }`
          );
        } catch (e) {
          await storeErrors(e);
          error(`Error procesando: ${videoData.url || videoData.video}`);
        }
      }
      const endDate = new Date();
      warning(
        "Tiempo total: ",
        `${new Date(endDate - startDate).getMinutes()}m ${new Date(
          endDate - startDate
        ).getSeconds()}s ${new Date(endDate - startDate).getMilliseconds()}ms`
      );
    } catch (e) {
      await storeErrors(e);
      error("Error procesando el archivo JSON");
    }
  } else {
    await main({
      key,
      url,
      video,
      outputDir,
      type,
      mode: chosenMode(mode),
      prefix,
    });
  }
})();
