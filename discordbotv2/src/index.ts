import dotenv from "dotenv";
import { Client, GatewayIntentBits } from "discord.js";
import { convokeplay } from "./commands.js";

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

client.login(process.env.DISCORD_TOKEN);

client.on("messageCreate", async (message) => {
  const command = getCommand(message);

  console.log(command);

  switch (command.command) {
    case "convokeplay":
      message.react("🤔");
      message.channel.send(await convokeplay());
      message.delete();
      break;
    case "convokeradio":
      message.react("🤔");
      message.delete();
      break;
    case "convokeskip":
      message.react("🤔");
      message.delete();
      break;
    case "convokeplaylist":
      message.react("🤔");
      message.delete();
      break;
    case "convokeyoutubeplaylist":
      message.react("🤔");
      message.delete();
      break;
    case "convokehelp":
      message.react("🤔");
      message.delete();
      break;
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
    command.param = message.content.split(" ")[1].toLowerCase();
  }

  return command;
}
