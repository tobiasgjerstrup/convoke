import dotenv from "dotenv";
import { Client, GatewayIntentBits } from "discord.js";
import { joinVoiceChannel, createAudioResource, createAudioPlayer, AudioPlayerStatus } from "@discordjs/voice";
import * as libs from "../scripts/libs.js";
import downloadFromYoutube from "../scripts/youtube-to-mp3/index.js";

dotenv.config();
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMembers, GatewayIntentBits.DirectMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildVoiceStates],
});

client.login(process.env.DISCORD_TOKEN);

let connection = "";
const player = createAudioPlayer();
let songs = [];
client.on("messageCreate", async (message) => {
  if (!message?.author.bot) {
    if (message.content.toLowerCase() === "convokejoin") {
      connection = joinVoiceChannel({
        channelId: message.member.voice.channel.id,
        guildId: message.guild.id,
        adapterCreator: message.guild.voiceAdapterCreator,
      });
    }
    if (message.content.toLowerCase() === "convokeleave") {
      if (connection && connection._state.status !== "destroyed") connection.destroy();
    }
    if (message.content.toLowerCase() === "convokefact") {
      const data = await libs.select("production", "convokefacts");
      const convokeFactMessageID = Math.floor(Math.random() * data.length);
      const convokeFactRealID = convokeFactMessageID + 1;
      message.channel.send(data[convokeFactMessageID].fact + " [message " + convokeFactRealID + "/" + data.length + "]");
    }
    if (message.content.toLowerCase().startsWith("convokefactadd ")) {
      const fact = message.content.slice(15);
      if (fact.includes("<@")) {
        message.channel.send("No tagging people >:(");
        return false;
      }
      await libs.insert("production", "convokefacts", `${message.author.username}`, `${message.content.slice(15)}`);
    }
    if (message.content.toLowerCase().startsWith("convokeplay ")) {
      const YOUTUBE_URL = message.content.slice(12);
      const OUTPUT = "media/mp3/" + YOUTUBE_URL.split("watch?v=").pop() + ".mp3";
      songs.push(YOUTUBE_URL);
      await downloadFromYoutube(YOUTUBE_URL, OUTPUT);
      if (songs.length === 1) {
        connection = joinVoiceChannel({
          channelId: message.member.voice.channel.id,
          guildId: message.guild.id,
          adapterCreator: message.guild.voiceAdapterCreator,
        });
        const resource = createAudioResource(OUTPUT);
        player.play(resource);
        connection.subscribe(player);
      }
    }
  }
});

player.on(AudioPlayerStatus.Idle, () => {
  songs.splice(0, 1);
  if (songs.length > 0) {
    const resource = createAudioResource("media/mp3/" + songs[0].split("watch?v=").pop() + ".mp3");
    player.play(resource);
    connection.subscribe(player);
  }
});
