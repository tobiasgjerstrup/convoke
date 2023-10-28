import { createAudioPlayer, createAudioResource, joinVoiceChannel } from "@discordjs/voice";

const player = createAudioPlayer();

export async function convokeplay(message, param) {
  if (message.member.voice.channel === null)
    return `You can't use that command without being in a voice channel`;

  const connection = joinVoiceChannel({
    channelId: message.member.voice.channel.id,
    guildId: message.guild.id,
    adapterCreator: message.guild.voiceAdapterCreator,
  });

  const resource = createAudioResource(`media/mp3/${param}.mp3`);
  player.play(resource);
  connection.subscribe(player);
  
  return "TODO";
}