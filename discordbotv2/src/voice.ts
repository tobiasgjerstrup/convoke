import {
  createAudioPlayer,
  createAudioResource,
  joinVoiceChannel,
} from "@discordjs/voice";
import * as fs from "fs/promises";
import * as fss from "fs";
import ytpl from "ytpl";
import ytdl from "ytdl-core";

export class Voice {
  public player: any;
  public songs: Array<String> = [];
  public playing = false;
  private connection: any;

  public constructor() {
    this.player = createAudioPlayer();
  }

  public async convokeradio(message, param) {
    if (message.member.voice.channel === null)
      return `You can't use that command without being in a voice channel`;
    if (isNaN(Number(param))) return `2nd arguement is not a valid number`;

    const mediaFiles = await fs.readdir("media/mp3");

    let radioAmount = 1;
    if (Number(param) > 0) radioAmount = Number(param);
    for (let i = 0; i < radioAmount; i++) {
      const random = Math.floor(Math.random() * mediaFiles.length);
      this.songs[this.songs.length] = mediaFiles[random];
    }
    this.playMusic(message);
  }

  public async convokehelp(message, param) {
    return `\`\`\`
;radio [number]
;skip [number]
;yt [youtubeLink]
;playfile [filename]
;showfiles
;list
;current\`\`\`
    `;
  }

  public async convokecurrent(message, param) {
    return `https://www.youtube.com/watch?v=${this.songs[0]}`;
  }

  public async convokeplayfile(message, param) {
    if (message.member.voice.channel === null)
      return `You can't use that command without being in a voice channel`;

    this.songs[this.songs.length] = param;
    this.playMusic(message, `media/mp3custom/`);
  }

  public async convokeshowfile(message, param) {
    const mediaFiles = await fs.readdir("media/mp3custom");

    return JSON.stringify(mediaFiles);
  }

  public async convokeskip(message, param) {
    if (message.member.voice.channel === null)
      return `You can't use that command without being in a voice channel`;
    if (isNaN(Number(param))) return `2nd arguement is not a valid number`;

    let skipAmount = 1;
    if (Number(param) > 0) skipAmount = Number(param);

    this.songs.splice(0, skipAmount);
    this.playSong(this.songs[0]);
  }

  public async convokeyoutube(message, param: string) {
    if (message.member.voice.channel === null)
      return `You can't use that command without being in a voice channel`;

    if (!param.includes("https://www.youtube.com/watch?v="))
      return `that's not a valid youtube URL`;

    if (param.includes("&list=")) {
      // ytpl's first param is case sensitive
      const playlists = await ytpl(param, { limit: 10000 });
      for (const playlist of playlists.items) {
        await this.playAndDownloadFromYt(playlist.shortUrl);
        this.playMusic(message);
      }
    } else {
      await this.playAndDownloadFromYt(param);
      this.playMusic(message);
    }
  }

  public async convokeyoutubenext(message, param: string) {
    return `TODO`;
    if (message.member.voice.channel === null)
      return `You can't use that command without being in a voice channel`;

    if (!param.includes("https://www.youtube.com/watch?v="))
      return `that's not a valid youtube URL`;

    if (param.includes("&list=")) {
      // ytpl's first param is case sensitive
      const playlists = await ytpl(param, { limit: 10000 });
      for (const playlist of playlists.items) {
        await this.playAndDownloadFromYt(playlist.shortUrl);
        this.playMusic(message);
      }
    } else {
      await this.playAndDownloadFromYt(param);
      this.playMusic(message);
    }
  }

  public async convokelist() {
    return `current playing ${this.songs.length} songs`;
  }

  private async playAndDownloadFromYt(url: string) {
    const metaData = await this.getMetaInfoFromYoutubeUrl(url);
    if (typeof metaData.videoDetails.video_url !== "string") return;
    const OUTPUT =
      "media/mp3/" +
      metaData.videoDetails.video_url.split("watch?v=").pop() +
      ".mp3";

    this.songs[this.songs.length] =
      metaData.videoDetails.video_url.split("watch?v=").pop() + ".mp3";
    if (!fss.existsSync(OUTPUT)) {
      await this.downloadFromYoutube(metaData, OUTPUT);
    }
  }

  private playMusic(message: any, folder = `media/mp3/`) {
    this.joinVoice(message);
    if (this.playing === false && this.songs.length > 0) {
      this.playSong(this.songs[0], folder);
    }
  }

  private joinVoice(message) {
    if (this.connection) return;
    this.connection = joinVoiceChannel({
      channelId: message.member.voice.channel.id,
      guildId: message.guild.id,
      adapterCreator: message.guild.voiceAdapterCreator,
    });
  }

  public playSong(param: String, folder = `media/mp3/`) {
    const resource = createAudioResource(`${folder}${param}`);
    this.player.play(resource);
    this.connection.subscribe(this.player);
    this.playing = true;
  }

  private async getMetaInfoFromYoutubeUrl(url: string) {
    try {
      return await ytdl.getInfo(url);
    } catch (err) {
      // we dont console err because this fails often. Should probably add some retries on this one
      console.log(err);
    }
  }

  private async downloadFromYoutube(metainfo: any, output: string) {
    try {
      await new Promise<void>((resolve) => {
        ytdl(metainfo.videoDetails.video_url, {
          quality: "highestaudio",
          filter: "audioonly",
        }).pipe(
          fss.createWriteStream(output).on("finish", () => {
            resolve();
          })
        );
      });
    } catch (err) {
      console.error(err);
    }
  }
}
