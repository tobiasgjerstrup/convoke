import dotenv from "dotenv";
import { Client, GatewayIntentBits } from "discord.js";
import { joinVoiceChannel } from "@discordjs/voice";

dotenv.config();
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMembers, GatewayIntentBits.DirectMessages, GatewayIntentBits.MessageContent],
});

const convokeFacts = [
  "Dispy's last name is burger",
  "If you bring dispy to your key, it statistically has a 90% chance of depleting",
  'Did you know ahead of the "Curve" refers to Dispy',
  "Did you know, that Dispy doesn't play a Goblin since he doesn't want to constantly look at himself",
  "Dispy has the same amount of braincells as he has completed keys",
  "Did you know Dispy hasn't seen sunlight for 7 years",
  "Scientists have concluded that your DPS is multiplied by the amount of UwUs you use daily",
  "Your c### size is based on the amount of druids you have",
  "Not getting loot is a 'skill issue'",
  "Better t-mog, better damage",
  "Robot depletes more keys than dispy!",
  "Malx blows up powerplants",
  "If you're gambling and you're down, gamble more",
  "Robot is the only warlock without a soulstone",
  "Dispy is a dwarf... /point /laugh",
  "Did you know, that Dispy has a mouth on the back of his neck",
  "Did you know, Robot tried to offer his body to science, but science declined",
  "Did you know, Tobias is a very economical option as an escort service.",
];

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
      console.log(connection);
    }
    if (message.content.toLowerCase() === "convokeleave") {
      console.log(connection);
      if (connection && connection._state.status !== 'destroyed') connection.destroy();
      console.log(connection);
    }
    if (message.content.toLowerCase() === "convokefact") {
      const convokeFactMessageID = Math.floor(Math.random() * convokeFacts.length);
      message.channel.send(convokeFacts[convokeFactMessageID] + " [message " + convokeFactMessageID + "/" + convokeFacts.length + "]");
    }
  }
});
