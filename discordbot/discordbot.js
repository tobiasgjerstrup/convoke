import dotenv from "dotenv";
import { Client, GatewayIntentBits } from "discord.js";
import { joinVoiceChannel } from "@discordjs/voice";
import * as libs from "../scripts/libs.js";

dotenv.config();
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMembers, GatewayIntentBits.DirectMessages, GatewayIntentBits.MessageContent],
});

client.login(process.env.DISCORD_TOKEN);

let connection = "";
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
      const data = await libs.select('production', 'convokefacts');
      const convokeFactMessageID = Math.floor(Math.random() * data.length);
      const convokeFactRealID = convokeFactMessageID+1
      message.channel.send(data[convokeFactMessageID].fact + " [message " + convokeFactRealID + "/" + data.length + "]");
    }
    if (message.content.toLowerCase().startsWith("convokefactadd ")) {
      await libs.insert('production', 'convokefacts', `${message.author.username}`, `${message.content.slice(15)}`);
    }
  }
});
