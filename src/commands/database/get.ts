import { EmbedBuilder } from "discord.js";
import { Command } from "fero-dc";
import { prisma } from "../../util/prisma-client";

export default new Command()
  .setName("get")
  .setDescription("Get server settings from the database")
  .setCategory("Database")
  .setRun(async (client, interaction) => {
    await interaction.deferReply({
      ephemeral: true
    });

    const guild = interaction.guild;
    if (guild === null) {
      await interaction.followUp({
        content: "This command can only be used in a server.",
        ephemeral: true
      });

      return;
    }

    const guildModel = await prisma.guild.findUnique({
      where: {
        id: guild.id
      }
    });
    if (guildModel === null) {
      await interaction.followUp({
        content: "This server has not been initialized.",
        ephemeral: true
      });

      return;
    }

    const channelIds = guildModel.channelIds;
    const roleIds = guildModel.roleIds;
    const modRoles = roleIds.mods.map((id) => `<@&${id}> (\`${id}\`)`);
    const messageIds = guildModel.messageIds;
    const emojis = guildModel.emojis;
    const funnieUpvoteEmoji = await guild.emojis
      .fetch(emojis.funnieUpvote)
      .catch(() => emojis.funnieUpvote);
    const funnieModUpvote = await guild.emojis
      .fetch(emojis.funnieModUpvote)
      .catch(() => emojis.funnieModUpvote);
    const features = guildModel.features;

    const author = interaction.user;
    const embed = new EmbedBuilder()
      .setTitle("Delta: Server Settings")
      .setDescription(
        `The following are the current settings for \`${guild.name}\``
      )
      .setColor("Random")
      .setAuthor({
        name: author.username,
        iconURL: author.avatarURL() ?? ""
      })
      .setThumbnail(guild.iconURL())
      .addFields(
        {
          name: "Channels",
          value: [
            `Logs: <#${channelIds.logs}> (\`${channelIds.logs}\`)`,
            `Mod Logs: <#${channelIds.modLogs}> (\`${channelIds.modLogs}\`)`,
            `Admin Logs: <#${channelIds.adminLogs}> (\`${channelIds.adminLogs}\`)`,
            `Funnies: <#${channelIds.funnies}> (\`${channelIds.funnies}\`)`,
            `Verification: <#${channelIds.verification}> (\`${channelIds.verification}\`)`
          ].join("\n"),
          inline: true
        },
        {
          name: "Roles",
          value: [
            `Verified: <@&${roleIds.verified}> (\`${roleIds.verified}\`)`,
            `Mods: ${modRoles.join(", ") || "None"}`
          ].join("\n"),
          inline: true
        },
        {
          name: "Messages",
          value: `Verification: \`${messageIds.verification}\``,
          inline: true
        },
        {
          name: "Emojis",
          value: [
            `Funnie Upvote: \`${funnieUpvoteEmoji}\``,
            `Funnie Mod Upvote: \`${funnieModUpvote}\``
          ].join("\n"),
          inline: true
        },
        {
          name: "Enabled Features",
          value: [
            `Scales: \`${features.scales ? "Yes" : "No"}\``,
            `Logging: \`${features.logging ? "Yes" : "No"}\``,
            `Mod Logging: \`${features.modLogging ? "Yes" : "No"}\``,
            `Admin Logging: \`${features.adminLogging ? "Yes" : "No"}\``,
            `Moderation: \`${features.moderation ? "Yes" : "No"}\``,
            `Funnies: \`${features.funnies ? "Yes" : "No"}\``
          ].join("\n"),
          inline: true
        }
      )
      .setTimestamp()
      .setFooter({
        text: "Delta, The Wings of Fire Moderation Bot",
        iconURL: client.user.avatarURL() ?? ""
      });
    await interaction.followUp({
      embeds: [embed],
      ephemeral: true
    });
  });
