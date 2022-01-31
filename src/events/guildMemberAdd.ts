/** @format */

import { MessageEmbed } from "discord.js";
import { Event } from "fero-dc";
import { Guild, IGuild } from "../models/Guild";

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
      `${member}, Bev 4 Mod`,
      `the ${tribe}s welcome ${member} with open wings!`,
      `Be ace do arson, ${member}`
    ];

    const randomWelcomeMessage = welcomeMessages[
      Math.floor(Math.random() * welcomeMessages.length)
    ] as string;

    const systemChannel = member.guild.systemChannel;

    systemChannel?.send(randomWelcomeMessage);

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
