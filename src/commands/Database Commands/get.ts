import { Command } from "fero-dc";
import { Guild, IGuild } from "../../models/Guild";
import { MessageEmbed } from "discord.js";

// TODO optional chaining on the guildModel

export default new Command({
  name: "get",
  description: "Get server settings from the database",
  category: "Database",
  guildIDs: ["759068727047225384"],
  run: async context => {
    if (!context.interaction || !context.guild) return;

    await context.interaction.deferReply({
      ephemeral: true,
      fetchReply: false
    });

    const guild = context.guild;

    const guildModel: IGuild = await Guild.findOne({
      _id: guild.id
    }, null, { upsert: true });

    const embed = new MessageEmbed();

    embed.setTitle("Delta: Server Settings")
      .setDescription(`The following are the settings for the server \`${guild.name}\``)
      .setAuthor({
        name: context.author.username,
        iconURL: context.author.avatarURL({ dynamic: true }) || ""
      })
      .setColor("RANDOM")
      .setThumbnail(guild.iconURL({ dynamic: true }) || "")
      .addFields(
        [
          {
            name: "Channels",
            value: `Logs: \`${guildModel.channelIDs.logs}\`\nMod Logs: \`${guildModel.channelIDs.modLogs}\`\nAdmin Logs: \`${guildModel.channelIDs.adminLogs}\`\nFunnies: \`${guildModel.channelIDs.funnies}\``,
            inline: true
          },
          {
            name: "Roles",
            value: `Mods: ${guildModel.roleIDs.mods.map(v => guild.roles.cache.get(v)?.name || "`No name or role doesn't exist`").join("\n")}`,
            inline: true
          },
          {
            name: "Messages",
            value: `Verification ID: \`${guildModel.messages.verification.id}\`\nVerification Channel ID: \`${guildModel.messages.verification.id}\``,
            inline: true
          },
          {
            name: "Enabled Features",
            value: `Economy: \`${guildModel.features.scales}\`\nLogging: \`${guildModel.features.logging}\`\nMod Logging: \`${guildModel.features.modLogging}\`\nAdmin Logging: \`${guildModel.features.adminLogging}\`\nModeration: \`${guildModel.features.moderation}\`\nFunnies: \`${guildModel.features.funnies}\``,
            inline: true
          }
        ]
      )
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
