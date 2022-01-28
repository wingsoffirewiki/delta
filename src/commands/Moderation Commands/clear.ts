/** @format */

import { GuildTextBasedChannel, MessageEmbed } from "discord.js";
import { Command } from "fero-dc";
import configMessages from "../../config/messages.json";
import { Guild, IGuild } from "../../models/Guild";

export default new Command({
  name: "clear",
  description: "Clears messages in the current channel",
  category: "Moderation",
  options: [
    {
      name: "messages",
      description: "The number of messages to delete",
      type: "NUMBER",
      required: true,
      minValue: 1,
      maxValue: 100
    }
  ],
  guildIDs: ["759068727047225384"],
  run: async context => {
    if (
      !context.interaction ||
      !context.guild ||
      !context.member ||
      !context.channel
    )
      return;

    await context.interaction.deferReply({
      ephemeral: true,
      fetchReply: false
    });

    const guild = context.guild;

    const guildModel: IGuild = await Guild.findOne(
      { _id: guild.id },
      "features.moderation roleIDs.mods"
    );

    if (
      !context.member.permissions.has("MANAGE_MESSAGES") &&
      !guildModel.roleIDs.mods.some(v => context.member?.roles.cache.has(v))
    )
      return context.interaction.followUp({
        ephemeral: false,
        content: configMessages.missingPermissions
      });

    if (!guildModel.features.moderation)
      return context.interaction.followUp({
        ephemeral: true,
        content: "Moderation is not enabled in the database."
      });

    const messagesToDelete =
      context.interaction.options.getNumber("messages") || 1;

    const channel = context.channel as GuildTextBasedChannel;

    const messages = await channel.bulkDelete(messagesToDelete).catch(err => {
      context.interaction?.followUp({
        ephemeral: true,
        content: `Error:\n\`${err}\``
      });
      return undefined;
    });

    if (!messages) return;

    const embed = new MessageEmbed();

    embed
      .setTitle("Delta: Deleted Messages")
      .setAuthor({
        name: context.author.username || "",
        iconURL: context.author.avatarURL({ dynamic: true }) || ""
      })
      .setDescription(
        `Deleted ${messages.size} messages with these IDs:\n${
          messages.size > 5
            ? messages
                .random(5)
                .map(v => `\`${v.id}\``)
                .join("\n") + "\n..."
            : messages.map(v => `\`${v.id}\``).join("\n")
        }`
      )
      .setColor("BLURPLE")
      .setTimestamp()
      .setFooter({
        text: "Delta, The Wings of Fire Moderation Bot",
        iconURL: context.client.user?.avatarURL({ dynamic: true }) || ""
      });

    return context.interaction.followUp({
      ephemeral: true,
      embeds: [embed]
    });
  }
});
