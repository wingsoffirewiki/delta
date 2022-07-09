/** @format */

import { MessageEmbed } from "discord.js";
import { Event } from "fero-dc";
import { prisma } from "../db";

export default {
  event: "guildMemberRemove",
  run: async (client, member) => {
    const guild = member.guild;

    const guildModel = await prisma.guild.findUnique({
      where: {
        id: guild.id
      }
    });

    if (!guildModel) {
      console.log("Guild not found in database");
      return;
    }

    const logsChannel = guild.channels.cache.get(
      guildModel?.channelIDs?.logs || ""
    );

    if (
      !logsChannel ||
      !logsChannel.isText() ||
      guildModel?.features?.logging === false
    ) {
      return;
    }

    const embed = new MessageEmbed();

    embed
      .setTitle("Delta: Member Left")
      .setColor("RED")
      .setDescription(`\`${member.user.username}\` has left \`${guild.name}\``)
      .setAuthor({
        name: `${member.user.tag} (${member.id})`,
        iconURL: member.user.avatarURL({ dynamic: true }) || ""
      })
      .setTimestamp()
      .setFooter({
        text: "Delta, The Wings of Fire Moderation Bot",
        iconURL: client.user?.avatarURL({ dynamic: true }) || ""
      });

    logsChannel.send({ embeds: [embed] });
  }
} as Event<"guildMemberRemove">;
