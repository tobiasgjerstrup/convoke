const ytdl = require("ytdl-core");
const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
const ffmpeg = require("fluent-ffmpeg");
ffmpeg.setFfmpegPath(ffmpegPath);

async function fetchVideo(url, audioFileName, maxFileSize) {
  return new Promise((resolve, reject) => {
    const videoStream = ytdl(url, { quality: "highestaudio" });

    const ffmpegCommand = ffmpeg(videoStream)
      .audioBitrate(128)
      .toFormat("mp3")
      .outputOptions('-fs', maxFileSize)
      .save(audioFileName)
      .on("end", () => {
        resolve();
      })
      .on("error", (err) => {
        reject(err);
      });

    ffmpegCommand.run();
  });
}

async function downloadFromYoutube(YOUTUBE_URL, audioFileName, maxFileSize = 10000000) {
  await fetchVideo(YOUTUBE_URL, audioFileName, maxFileSize)
    .then(() => {
      console.log("Done");
    })
    .catch((err) => {
      console.log("Error", err);
    });
}

module.exports = downloadFromYoutube;
