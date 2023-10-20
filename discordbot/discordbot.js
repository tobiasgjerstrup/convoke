import dotenv from "dotenv";
import { Client, GatewayIntentBits } from "discord.js";
import { joinVoiceChannel, createAudioResource, createAudioPlayer, AudioPlayerStatus } from "@discordjs/voice";
import * as libs from "../scripts/libs.js";
import { downloadFromYoutube, getMetaInfoFromYoutubeSearch } from "../scripts/youtube-to-mp3/index.js";
import fs from "fs";
import { asciiArt } from "../scripts/config.js";
import ytpl from "ytpl";

dotenv.config();
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMembers, GatewayIntentBits.DirectMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildVoiceStates],
});

client.login(process.env.DISCORD_TOKEN);

let connection = "";
const player = createAudioPlayer();
const songs = [];
let shrekMessage = null;
let downloadMessage = null;
client.on("messageCreate", async (message) => {
  try {
    // if (message.channelId === '858471638398664734'){
    //   message.delete();
    // }
    // messageReacted = await client.channels.cache.get('858471638398664734').messages.fetch('1164967664683335770')
    // messageReacted.reactions.removeAll();
    // messageReacted.react("🐸")
    if (message.author.id === "177525776256598017") {
      message.react("👺");
    }
    if (message?.author.bot) {
      return false;
    }
    await libs.logMessage("User send message", 200, { UserID: message.author.id, AdditionalInformation: message.content });
    if (message.content.toLowerCase() === "convokejoin") {
      if (!ifMessageFromUserInVoice(message, "You can't do that without being in a voicechannel")) return false;

      connection = joinVoiceChannel({
        channelId: message.member.voice.channel.id,
        guildId: message.guild.id,
        adapterCreator: message.guild.voiceAdapterCreator,
      });
    }
    if (message.content.toLowerCase() === "convokeleave" || message.content.toLowerCase() === "cocksleeve") {
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
        message.channel.send("No tagging people >:( grrrrr!!!");
        return false;
      }
      const convokefactaddRes = await libs.insert("production", "convokefacts", `${message.author.username}`, `${message.content.slice(15)}`);
      if (convokefactaddRes === true) {
        message.channel.send("message added");
      }
    }
    if (message.content.toLowerCase().startsWith("convokeplay ")) {
      if (!ifMessageFromUserInVoice(message, "You can't do that without being in a voicechannel")) return false;
      // magnus removed video
      if (message.content.slice(12).toLowerCase() === "magnus er gay") {
        playSongFromFile("gn7FiHmV9O0", message);
        return true;
      }
      const metaData = await getMetaInfoFromYoutubeSearch(message.content.slice(12));
      const OUTPUT = "media/mp3/" + metaData.url.split("watch?v=").pop() + ".mp3";
      songs.push(metaData.url);
      if (!fs.existsSync(OUTPUT)) {
        downloadMessage = await message.channel.send(`\`\`\`downloading ` + metaData.url + `\`\`\``);
        console.log("downloading " + metaData.url);
        await downloadFromYoutube(metaData.url, OUTPUT);
      }
      if (songs.length === 1) {
        if (downloadMessage !== null) {
          downloadMessage.edit(`\`\`\`now playing ${metaData.title}\`\`\``);
        } else {
          message.channel.send(`\`\`\`now playing ${metaData.title}\`\`\``);
        }
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
    /*  if (message.content.toLowerCase() === "convoke") {
      message.channel.send(`\`\`\`
      convokeplay [URL] or [SEARCH] => adds a song to the music queue
      convokeleave => kicks the bot from the voice channel
      convokejoin => makes the bot join your current voice channel
      convokefact => tells you a user added fact
      convokefactadd [fact] => adds a fact to the database 
      convokelist => gives you a list of the song currently in the queue
      convokeskip => skips the current song and starts the next one
      \`\`\``);
    } */
    if (message.content.toLowerCase().startsWith("dispy")) {
      shrekMessage = await message.channel.send(asciiArt.shrek);
    }
    if (message.content.toLowerCase().startsWith("uwu")) {
      if (shrekMessage === null) return false;
      await shrekMessage.edit(asciiArt.shrek2);
      await delay(200);
      await shrekMessage.edit(asciiArt.shrek);
    }
    if (message.content.toLowerCase() === "convokeradio") {
      if (!ifMessageFromUserInVoice(message, "You can't do that without being in a voicechannel")) return false;
      fs.readdir("media/mp3/", async (err, files) => {
        if (err) {
          console.error(err);
          return;
        }
        const randomSongFile = files[Math.floor(Math.random() * files.length)];
        playSongFromFile(randomSongFile.slice(0, -4), message);
      });
    }

    if (message.content.toLowerCase().startsWith("convokeplaylist ")) {
      if (!ifMessageFromUserInVoice(message, "You can't do that without being in a voicechannel")) return false;
      // if magnus removed video
      const playlists = await libs.select("production", "musicPlaylists", ` WHERE name = '${message.content.toLowerCase().slice(16)}' AND active = 1`);
      let data = await libs.select("production", "musicSongs", ` WHERE playlist = '${playlists[0].id}' AND active = 1`);

      data = shuffle(data);
      for (let i = 0; i < data.length; i++) {
        await convokeplaylist(message, data[i].url);
      }
    }
    if (message.content.toLowerCase().startsWith("convokeyoutubeplaylist ")) {
      if (!ifMessageFromUserInVoice(message, "You can't do that without being in a voicechannel")) return false;

      const url = message.content.slice(23);
      const playlists = await ytpl(url, { limit: 500 });
      for (const playlist of playlists.items) {
        const metaData = await getMetaInfoFromYoutubeSearch(playlist.shortUrl);
        if (typeof metaData.url !== 'string') continue;
        const OUTPUT = "media/mp3/" + metaData.url.split("watch?v=").pop() + ".mp3";

        songs.push(metaData.url);
        if (!fs.existsSync(OUTPUT)) {
          console.log("downloading " + metaData.url);
          await downloadFromYoutube(metaData.url, OUTPUT);
        }
        if (songs.length === 1) {
          connection = joinVoiceChannel({
            channelId: message.member.voice.channel.id,
            guildId: message.guild.id,
            adapterCreator: message.guild.voiceAdapterCreator,
          });
          nextSong();
        }
      }
    }
  } catch (err) {
    await libs.logError("Failed to execute command", 500, { UserID: message.author.id, AdditionalInformation: message.content });
    console.log("failed handling message from user");
    console.error(err);
    message.channel.send("something went wrong");
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

async function convokeplaylist(message, song) {
  let metaData = "";
  try {
    metaData = await getMetaInfoFromYoutubeSearch(song);
  } catch {
    return false;
  }
  if (metaData.url === undefined) {
    console.error("metadata.url is undefined!");
    return false;
  }
  const OUTPUT = "media/mp3/" + metaData.url.split("watch?v=").pop() + ".mp3";
  songs.push(metaData.url);
  if (!fs.existsSync(OUTPUT)) {
    console.log("downloading " + metaData.url);
    await downloadFromYoutube(metaData.url, OUTPUT);
  }
  if (songs.length === 1) {
    connection = joinVoiceChannel({
      channelId: message.member.voice.channel.id,
      guildId: message.guild.id,
      adapterCreator: message.guild.voiceAdapterCreator,
    });
    nextSong();
  }
}

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function shuffle(array) {
  let currentIndex = array.length;
  let randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex !== 0) {
    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
  }

  return array;
}
