import {
  createAudioPlayer,
  createAudioResource,
  joinVoiceChannel,
} from "@discordjs/voice";
import * as fs from "fs/promises";
import * as fss from "fs";
import ytpl from "ytpl";
import {
  downloadFromYoutube,
  getMetaInfoFromYoutubeSearch,
} from "../../scripts/youtube-to-mp3/index.js";

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

    for (let i = 0; i < Number(param); i++) {
      const random = Math.floor(Math.random() * mediaFiles.length);
      this.songs[this.songs.length] = mediaFiles[random];
    }
    this.playMusic(message);
  }

  public async convokeplayfile(message, param) {
    if (message.member.voice.channel === null)
      return `You can't use that command without being in a voice channel`;

    this.songs[this.songs.length] = param;
    this.playMusic(message);
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
      return 'can only handle playlists for now'
    }
  }

  public async convokelist(){
    return `current playing ${this.songs.length} songs`;
  }

  private async playAndDownloadFromYt(url: string) {
    const metaData = await getMetaInfoFromYoutubeSearch(url);
    if (typeof metaData.url !== "string") return;
    const OUTPUT = "media/mp3/" + metaData.url.split("watch?v=").pop() + ".mp3";

    this.songs[this.songs.length] = metaData.url.split("watch?v=").pop() + ".mp3";
    if (!fss.existsSync(OUTPUT)) {
      await downloadFromYoutube(metaData.url, OUTPUT);
    }
  }

  private playMusic(message: any) {
    this.joinVoice(message);
    if (this.playing === false && this.songs.length > 0) {
      this.playSong(this.songs[0]);
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

  public playSong(param: String) {
    const resource = createAudioResource(`media/mp3/${param}`);
    this.player.play(resource);
    this.connection.subscribe(this.player);
    this.playing = true;
  }
}
