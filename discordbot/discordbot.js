import dotenv from "dotenv";
import { Client, GatewayIntentBits } from "discord.js";
import { joinVoiceChannel, createAudioResource, createAudioPlayer } from "@discordjs/voice";
import * as libs from "../scripts/libs.js";
import downloadFromYoutube from "../scripts/youtube-to-mp3/index.js";

dotenv.config();
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMembers, GatewayIntentBits.DirectMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildVoiceStates],
});

client.login(process.env.DISCORD_TOKEN);

let connection = "";
const player = createAudioPlayer();
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
      await libs.insert("production", "convokefacts", `${message.author.username}`, `${message.content.slice(15)}`);
    }
    if (message.content.toLowerCase().startsWith("convokeplay ")) {
      const YOUTUBE_URL = message.content.slice(12);
      const OUTPUT = "media/mp3/" + YOUTUBE_URL.split("watch?v=").pop() + ".mp3";
      await downloadFromYoutube(YOUTUBE_URL, OUTPUT);
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
});

const textChannel = ['702183656357363783','714452372260388885','702183883923521696','858471638398664734']

function writeMessage() {
  const channel = textChannel[Math.floor(Math.random() * textChannel.length)];
  const message = '<@179880396362612736> SUCKS'
  client.channels.cache.get(channel).send(message);
}

function repeatMessage() {
  setTimeout(()=>{
    writeMessage()
    repeatMessage()
  }, 1000 * 60 * 60);
}

repeatMessage()
