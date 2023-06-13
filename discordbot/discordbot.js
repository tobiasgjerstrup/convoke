import dotenv from "dotenv";
import { Client, GatewayIntentBits } from "discord.js";
import { joinVoiceChannel, createAudioResource, createAudioPlayer, AudioPlayerStatus } from "@discordjs/voice";
import * as libs from "../scripts/libs.js";
import { downloadFromYoutube, getMetaInfoFromYoutubeSearch } from "../scripts/youtube-to-mp3/index.js";
import fs from "fs";
import { asciiArt } from "../scripts/config.js";

dotenv.config();
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMembers, GatewayIntentBits.DirectMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildVoiceStates],
});

client.login(process.env.DISCORD_TOKEN);

let connection = "";
const player = createAudioPlayer();
const songs = [];
let shrekMessage = null;
client.on("messageCreate", async (message) => {
  try {
    if (message?.author.bot) {
      return false;
    }
    if (message.content.toLowerCase() === "convokejoin") {
      if (!ifMessageFromUserInVoice(message, "You can't do that without being in a voicechannel")) return false;

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
      if (!ifMessageFromUserInVoice(message, "You can't do that without being in a voicechannel")) return false;
      // if magnus removed video
      if (message.content.slice(12).toLowerCase() === "magnus er gay") {
        playSongFromFile("gn7FiHmV9O0", message);
        return true;
      }
      const metaData = await getMetaInfoFromYoutubeSearch(message.content.slice(12));
      const OUTPUT = "media/mp3/" + metaData.url.split("watch?v=").pop() + ".mp3";
      songs.push(metaData.url);
      if (!fs.existsSync(OUTPUT)) {
        console.log("downloading " + metaData.url);
        await downloadFromYoutube(metaData.url, OUTPUT);
      }
      if (songs.length === 1) {
        message.channel.send(`\`\`\`now playing ${metaData.title}\`\`\``);
        connection = joinVoiceChannel({
          channelId: message.member.voice.channel.id,
          guildId: message.guild.id,
          adapterCreator: message.guild.voiceAdapterCreator,
        });
        nextSong();
      } else {
        message.channel.send(`\`\`\`added ${metaData.title} to the queue\`\`\``);
      }
    }
    if (message.content.toLowerCase() === "convokeskip") {
      songs.splice(0, 1);
      if (songs.length > 0) {
        nextSong();
      }
    }
    if (message.content.toLowerCase() === "convokelist") {
      let songList = "";
      songs.forEach((song) => {
        songList += "\n" + song;
      });
      message.channel.send("```" + songList + "```");
    }
    if (message.content.toLowerCase() === "convoke") {
      message.channel.send(`\`\`\`
convokeplay [URL] or [SEARCH] => adds a song to the music queue
convokeleave => kicks the bot from the voice channel
convokejoin => makes the bot join your current voice channel
convokefact => tells you a user added fact
convokefactadd [fact] => adds a fact to the database 
convokelist => gives you a list of the song currently in the queue
convokeskip => skips the current song and starts the next one
\`\`\``);
    }
    if (message.content.toLowerCase().startsWith("dispy")) {
      shrekMessage = await message.channel.send(asciiArt.shrek);
    }
    if (message.content.toLowerCase().startsWith("uwu")) {
      if (shrekMessage === null) return false;
      await shrekMessage.edit(asciiArt.shrek2);
      await delay(200);
      await shrekMessage.edit(asciiArt.shrek);
    }
  } catch (err) {
    console.log("failed handling message from user");
    console.error(err);
  }
});

function nextSong() {
  const resource = createAudioResource("media/mp3/" + songs[0].split("watch?v=").pop() + ".mp3");
  player.play(resource);
  connection.subscribe(player);
}

player.on(AudioPlayerStatus.Idle, () => {
  songs.splice(0, 1);
  if (songs.length > 0) {
    nextSong();
  }
});

function ifMessageFromUserInVoice(message, errorMsg) {
  if (message.member.voice.channel === null) {
    message.channel.send(errorMsg);
    return false;
  }
  return true;
}

function playSongFromFile(filename, message) {
  songs.push(filename);
  console.log(songs);
  if (songs.length === 1) {
    message.channel.send(`\`\`\`now playing ${filename}\`\`\``);
    connection = joinVoiceChannel({
      channelId: message.member.voice.channel.id,
      guildId: message.guild.id,
      adapterCreator: message.guild.voiceAdapterCreator,
    });
    nextSong();
    return true;
  } else {
    message.channel.send(`\`\`\`added ${filename} to the queue\`\`\``);
    return true;
  }
}

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
