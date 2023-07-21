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
  const metaInfo = {};
  try {
    if (search.includes("://www.youtube.com/")) {
      // if url
      const res = await ytdl.getBasicInfo(search);
      metaInfo.title = res.videoDetails.title;
      metaInfo.url = res.videoDetails.video_url;
    } else {
      // else search using name
      const res = await reTry(search);
      if (!res.items[0].url) {
        console.error(res);
      }
      metaInfo.title = res.items[0].title;
      metaInfo.url = res.items[0].url;
    }
  } catch (err) {
    console.error();
  }
  console.log(metaInfo);
  return metaInfo;
}

async function reTry(search, retries = 0) {
  try {
    const res = await ytsr(search, { limit: 1 });
    return res;
  } catch {
    if (retries < 10) {
      console.log("failed getting video from name. Retrying: " + retries);
      return await reTry(search, (retries += 1));
    }
  }
}

module.exports = { downloadFromYoutube, getMetaInfoFromYoutubeSearch };
