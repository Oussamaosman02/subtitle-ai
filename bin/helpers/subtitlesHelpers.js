import fs from "fs";

// Function to convert seconds to SRT time format (hh:mm:ss,ms)
function secondsToSRTTime(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  const milliseconds = Math.floor(
    (remainingSeconds - Math.floor(remainingSeconds)) * 1000
  );
  return `${padZero(hours)}:${padZero(minutes)}:${padZero(
    Math.floor(remainingSeconds)
  )},${padZero(milliseconds, 3)}`;
}

/**
 * Converts a time string in the format 'HH:MM:SS,MS' to seconds.
 *
 * @param {string} timeString - the time string to convert
 * @return {number} the equivalent time in seconds
 */
export function srtTimeToSeconds(timeString) {
  const [time, milliseconds] = timeString.split(",");
  const [hours, minutes, seconds] = time.split(":").map(parseFloat);
  return (
    hours * 3600 + minutes * 60 + seconds + parseFloat(`0.${milliseconds}`)
  );
}

// Function to pad zeros
function padZero(num, size = 2) {
  let s = num + "";
  while (s.length < size) s = "0" + s;
  return s;
}

/**
 * Convert a timestamp from SRT format to VTT format.
 *
 * @param {string} timeStamp - The timestamp in SRT format
 * @return {string} The timestamp in VTT format
 */
function timeStampSrtToVtt(timeStamp) {
  return timeStamp.split(",").join(".");
}

/**
 * Retrieves the segment subtitles in SRT and VTT format based on the provided subtitles and mode.
 *
 * @param {Array} subtitles - The array of subtitle objects
 * @param {string} mode - The mode to determine how to retrieve the subtitles
 * @return {Promise<Object>} An object containing the SRT and VTT format subtitles
 */
export async function getSegmentSubtitles(subtitles = [], mode) {
  if (!mode.includes("segment")) {
    return {
      srt: undefined,
      vtt: undefined,
    };
  }

  let srtContent = "";
  let vttContent = `WEBVTT\n\n`;
  subtitles.forEach((subtitle) => {
    srtContent += `${Number(subtitle.id) + 1}\n`;
    srtContent += `${secondsToSRTTime(subtitle?.start)} --> ${secondsToSRTTime(
      subtitle?.end
    )}\n`;
    srtContent += `${subtitle.text}\n\n`;
    vttContent += `${subtitle.id}\n`;
    vttContent += timeStampSrtToVtt(
      `${secondsToSRTTime(subtitle?.start)} --> ${secondsToSRTTime(
        subtitle?.end
      )}\n`
    );
    vttContent += `${subtitle.text}\n\n`;
  });

  return { srt: srtContent, vtt: vttContent };
}

/**
 * Retrieves the word subtitles in SRT and VTT formats based on the provided subtitles and mode.
 *
 * @param {Array} subtitles - the array of subtitle objects
 * @param {string} mode - the mode for retrieving subtitles
 * @return {Object} an object containing the SRT and VTT formatted word subtitles
 */
export async function getWordSubtitles(subtitles = [], mode) {
  if (!mode.includes("word")) {
    return {
      srt: undefined,
      vtt: undefined,
    };
  }
  let srtContent = "";
  let vttContent = `WEBVTT\n\n`;
  subtitles.forEach((subtitle, idx) => {
    srtContent += `${idx + 1}\n`;
    srtContent += `${secondsToSRTTime(subtitle?.start)} --> ${secondsToSRTTime(
      subtitle?.end
    )}\n`;
    srtContent += `${subtitle.word}\n\n`;
    vttContent += `${idx}\n`;
    vttContent += timeStampSrtToVtt(
      `${secondsToSRTTime(subtitle?.start)} --> ${secondsToSRTTime(
        subtitle?.end
      )}\n`
    );
    vttContent += `${subtitle.word}\n\n`;
  });

  return { srt: srtContent, vtt: vttContent };
}

/**
 * Process the subtitles.
 *
 * @param {import("openai/resources/audio/transcriptions.js").Transcription[]} subtitles - the subtitles to be processed
 * @return {undefined}
 */
export const processSubtitles = (subtitles) => {
  const sortedSubtitles = [...subtitles].sort(
    (a, b) => Number(a.id) - Number(b.id)
  );
  if (sortedSubtitles.length === 1) {
    return sortedSubtitles;
  } else {
    for (let idx = 0; idx < sortedSubtitles.length; idx++) {
      const sub = sortedSubtitles[idx];
      const prev = sortedSubtitles[idx - 1];
      if (prev?.text) {
        sub.segments = (sub.segments || []).map((segment) => {
          const prevSegment = [...prev.segments].reverse()[0];
          if (!prevSegment) {
            return segment;
          }
          return {
            ...segment,
            id: segment.id + prevSegment.id,
            start: segment?.start + prevSegment?.end,
            end: segment?.end + prevSegment?.end,
          };
        });
        sub.words = (sub.words || []).map((word) => {
          const prevWord = [...prev.words].reverse()[0];
          if (!prevWord) {
            return word;
          }
          return {
            ...word,
            id: word.id + prevWord.id,
            start: word?.start + prevWord?.end,
            end: word?.end + prevWord?.end,
          };
        });
      }
    }
    return sortedSubtitles;
  }
};

export const writeSubtitleToFile = (path, subtitle) => {
  if (subtitle) {
    fs.writeFileSync(path, subtitle);
  }
};
