/** @format */

import { Command } from "fero-dc";
import { Guild, IGuild } from "../../models/Guild";
import { MessageEmbed } from "discord.js";
import messages from "../../config/messages.json";

export default new Command({
  name: "get",
  description: "Get server settings from the database",
  category: "Database",
  guildIDs: [],
  run: async (context) => {
    if (!context.interaction || !context.guild || !context.member) {
      return;
    }

    if (!context.member.permissions.has("MANAGE_GUILD")) {
      return context.interaction.reply({
        ephemeral: true,
        content: messages.missingPermissions
      });
    }

    await context.interaction.deferReply({
      ephemeral: true,
      fetchReply: false
    });

    const guild = context.guild;

    const guildModel: IGuild | null = await Guild.findOne(
      {
        _id: guild.id
      },
      null,
      { upsert: true }
    );

    if (!guildModel) {
      return context.interaction.followUp({
        ephemeral: true,
        content: messages.databaseError
      });
    }

    const embed = new MessageEmbed();

    embed
      .setTitle("Delta: Server Settings")
      .setDescription(
        `The following are the settings for the server \`${guild.name}\``
      )
      .setAuthor({
        name: context.author.username,
        iconURL: context.author.avatarURL({ dynamic: true }) || ""
      })
      .setColor("RANDOM")
      .setThumbnail(guild.iconURL({ dynamic: true }) || "")
      .addFields([
        {
          name: "Channels",
          value: `Logs: \`${guildModel?.channelIDs?.logs}\`\nMod Logs: \`${guildModel?.channelIDs?.modLogs}\`\nAdmin Logs: \`${guildModel?.channelIDs?.adminLogs}\`\nFunnies: \`${guildModel?.channelIDs?.funnies}\``,
          inline: true
        },
        {
          name: "Roles",
          value: `Mods: ${(
            await Promise.all(
              guildModel?.roleIDs?.mods?.map(
                async (v) =>
                  (await guild.roles.fetch(v))?.name ||
                  "`No name or role not found`"
              )
            )
          ).join("\n")}\nVerified: \`${guildModel?.roleIDs?.verified}\``,
          inline: true
        },
        {
          name: "Messages",
          value: `Verification ID: \`${guildModel?.messages?.verification?.id}\`\nVerification Channel ID: \`${guildModel?.messages?.verification?.channelID}\``,
          inline: true
        },
        {
          name: "Enabled Features",
          value: `Economy: \`${guildModel?.features?.scales}\`\nLogging: \`${guildModel?.features?.logging}\`\nMod Logging: \`${guildModel?.features?.modLogging}\`\nAdmin Logging: \`${guildModel?.features?.adminLogging}\`\nModeration: \`${guildModel?.features?.moderation}\`\nFunnies: \`${guildModel?.features?.funnies}\``,
          inline: true
        }
      ])
      .setTimestamp()
      .setFooter({
        text: "Delta, The Wings of Fire Moderation Bot",
        iconURL: context.client.user?.avatarURL({ dynamic: true }) || ""
      });

    context.interaction.followUp({
      ephemeral: true,
      embeds: [embed]
    });
  }
});
