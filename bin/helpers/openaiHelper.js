import { OpenAI } from "openai";
import fs from "fs";

/**
 * Create subtitles from a file stream using OpenAI API.
 *
 * @param {Object} options - An object containing file stream, API key, and mode
 * @return {Promise<{import("openai/resources/audio/transcriptions.js").Transcription[]}>} The transcription generated by the OpenAI API
 */
export async function createSubtitles({ filePath, key, mode }) {
  const openai = new OpenAI({
    apiKey: key,
  });
  const partNumber = Number(filePath.split("-")?.[1]?.split(".")?.[0] || 1);

  try {
    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(filePath),
      model: "whisper-1",
      response_format: "verbose_json",
      timestamp_granularities: mode,
    });

    return { ...transcription, id: partNumber };
  } catch (e) {
    console.log(e);
    return {
      segments: [],
      words: [],
      text: "",
    };
  }
}
