const ytdl = require("ytdl-core");
const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
const ffmpeg = require("fluent-ffmpeg");
const ytsr = require("ytsr");
ffmpeg.setFfmpegPath(ffmpegPath);

async function fetchVideo(url, audioFileName, maxFileSize) {
  return new Promise((resolve, reject) => {
    const videoStream = ytdl(url, { quality: "highestaudio" });

    const ffmpegCommand = ffmpeg(videoStream)
      .audioBitrate(128)
      .toFormat("mp3")
      .outputOptions("-fs", maxFileSize)
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

async function getMetaInfoFromYoutubeSearch(search) {
  console.log(search);
  const metaInfo = {}
  try {
    const res = await ytdl.getBasicInfo(search);
    metaInfo.title = res.videoDetails.title;
    metaInfo.url = res.videoDetails.video_url;
  } catch (err) {
    const res = await ytsr(search, {limit: 1});
    metaInfo.title = res.items[0].title
    metaInfo.url = res.items[0].url
  }
  console.log(metaInfo);
  return metaInfo;
}

module.exports = { downloadFromYoutube, getMetaInfoFromYoutubeSearch };
