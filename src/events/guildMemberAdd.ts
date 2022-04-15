/** @format */

import { MessageEmbed } from "discord.js";
import { Event } from "fero-dc";
import { Guild, IGuild } from "../models/Guild";
import messages from "../config/messages.json";

const tribes = [
  "SkyWing",
  "MudWing",
  "RainWing",
  "SandWing",
  "IceWing",
  "NightWing",
  "SeaWing",
  "SilkWing",
  "HiveWing",
  "LeafWing"
];

export default {
  event: "guildMemberAdd",
  run: async (client, member) => {
    const guild = member.guild;

    member.send(messages.welcome).catch(console.log);

    const tribe =
      tribes.find(t =>
        member.user.username.toLowerCase().includes(t.toLowerCase())
      ) || tribes[Math.floor(Math.random() * tribes.length)];

    const welcomeMessages = [
      `Everyone welcome the shiniest ${tribe} in the server, ${member}!`,
      `Bababooey`,
      `Be gay, do crime, ${member}`,
      `Hewwo, ${member}`,
      `Meowdy <:yel2:725936017567252481>`,
      `Less goo, ${member} is here.`,
      `${member}, welcome to the bread bank, we sell bread, we sell loafs.`,
      `${member}, Lesbank 4 life.`,
      // `${member}, Bev 4 Mod`,
      `the ${tribe}s welcome ${member} with open wings!`,
      `Be ace do arson, ${member}`
    ];

    const randomWelcomeMessage = welcomeMessages[
      Math.floor(Math.random() * welcomeMessages.length)
    ] as string;
    
    if (member.guild.id === "576534597697798154") {
      const verificationChannel = member.guild.channels.cache.find(ch => ch.name === "verification");
      
      const generalChannel = member.guild.channels.cache.find(ch => ch.name === "general");
      
      if (verificationChannel === undefined || generalChannel === undefined || !verificationChannel.isText() || !generalChannel.isText()) return;
      
      verificationChannel.send(`${member} Verification instructions are pinned.`);
      
      generalChannel.send(`${member} Please read the long pin in this channel.`);
    } else {
      const systemChannel = member.guild.systemChannel;

      systemChannel?.send(randomWelcomeMessage);
    }

    const guildModel: IGuild = await Guild.findOne(
      {
        _id: guild.id
      },
      null,
      { upsert: true }
    );

    const logsChannel = guild.channels.cache.get(
      guildModel?.channelIDs?.logs || ""
    );

    if (
      !logsChannel ||
      !logsChannel.isText() ||
      guildModel?.features?.logging === false
    )
      return;

    const embed = new MessageEmbed();

    embed
      .setTitle("Delta: New Member")
      .setColor("GREEN")
      .setDescription(
        `\`${member.user.username}\` has joined \`${guild.name}\``
      )
      .setAuthor({
        name: `${member.user.tag} (${member.id})`,
        iconURL: member.user.avatarURL({ dynamic: true }) || ""
      })
      .setTimestamp(member.joinedAt)
      .setFooter({
        text: "Delta, The Wings of Fire Moderation Bot",
        iconURL: client.user?.avatarURL({ dynamic: true }) || ""
      });

    logsChannel.send({ embeds: [embed] });
  }
} as Event<"guildMemberAdd">;
