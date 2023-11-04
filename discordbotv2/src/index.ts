import dotenv from "dotenv";
import { Client, GatewayIntentBits } from "discord.js";
import { Voice } from "./voice.js";
import { AudioPlayerStatus } from "@discordjs/voice";

dotenv.config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates,
  ],
});

const voice = new Voice();

client.login(process.env.DISCORD_TOKEN);

client.on("messageCreate", async (message) => {
  const command = getCommand(message);

  console.log(command);

  let res = "";
  try {
    switch (command.command) {
      case `${process.env.PREFIX}current`:
        await message.react("🤔");
        res = await voice.convokecurrent(message, command.param);
        if (res) message.channel.send(res);
        message.delete();
        break;
      case `${process.env.PREFIX}showfiles`:
        await message.react("🤔");
        res = await voice.convokeshowfile(message, command.param);
        if (res) message.channel.send(res);
        message.delete();
        break;
      case `${process.env.PREFIX}playfile`:
        await message.react("🤔");
        res = await voice.convokeplayfile(message, command.param);
        if (res) message.channel.send(res);
        message.delete();
        break;
      case `${process.env.PREFIX}radio`:
        await message.react("🤔");
        res = await voice.convokeradio(message, command.param);
        if (res) message.channel.send(res);
        message.delete();
        break;
      case `${process.env.PREFIX}skip`:
        await message.react("🤔");
        res = await voice.convokeskip(message, command.param);
        if (res) message.channel.send(res);
        message.delete();
        break;
      case `${process.env.PREFIX}yt`:
        await message.react("🤔");
        res = await voice.convokeyoutube(message, command.param);
        if (res) message.channel.send(res);
        message.delete();
        break;
      case `${process.env.PREFIX}ytnext`:
        await message.react("🤔");
        res = await voice.convokeyoutubenext(message, command.param);
        if (res) message.channel.send(res);
        message.delete();
        break;
      case `${process.env.PREFIX}list`:
        await message.react("🤔");
        res = await voice.convokelist();
        if (res) message.channel.send(res);
        message.delete();
        break;
      case `${process.env.PREFIX}help`:
        await message.react("🤔");
        res = await voice.convokehelp(message, command.param);
        if (res) message.channel.send(res);
        message.delete();
        break;
    }
  } catch (error) {
    message.channel.send(error.message);
  }
});

function getCommand(message) {
  const command = {
    command: "",
    param: "",
  };

  const content = message.content.split(" ");

  if (typeof content[0] === "string") {
    command.command = message.content.split(" ")[0].toLowerCase();
  }
  if (typeof content[1] === "string") {
    command.param = message.content.split(" ")[1];
  }

  return command;
}

voice.player.on(AudioPlayerStatus.Idle, () => {
  voice.playing = false;
  voice.songs.splice(0, 1);
  if (voice.songs.length > 0) {
    voice.playSong(voice.songs[0]);
  }
});
