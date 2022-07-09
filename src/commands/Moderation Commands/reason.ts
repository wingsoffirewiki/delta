import { Command } from "fero-dc";
import { prisma } from "../../db";
import { GuildTextBasedChannel } from "discord.js";
import messages from "../../config/messages.json";

export default new Command({
  name: "reason",
  description: "Change the reason of a log entry",
  category: "Moderation",
  options: [
    {
      name: "log_id",
      description: "The id of the log to change the reason of",
      type: "INTEGER",
      required: true
    },
    {
      name: "reason",
      description: "The reason to change the log entry's reason to",
      type: "STRING",
      required: true
    }
  ],
  guildIDs: [],
  run: async (context) => {
    if (!context.interaction || !context.guild || !context.member) {
      return;
    }

    await context.interaction.deferReply({
      ephemeral: true,
      fetchReply: false
    });

    const guild = context.guild;

    const guildModel = await prisma.guild.findUnique({
      where: { id: guild.id }
    });

    if (!guildModel) {
      return context.interaction.followUp({
        ephemeral: true,
        content: messages.databaseError
      });
    }

    if (
      !context.member.permissions.has("BAN_MEMBERS") &&
      !guildModel.roleIDs.mods.some((v) => context.member?.roles.cache.has(v))
    ) {
      return context.interaction.followUp({
        ephemeral: false,
        content: messages.missingPermissions
      });
    }

    const logID = context.interaction.options.getInteger("log_id", true);

    const reason = context.interaction.options.getString("reason", true);

    const updateResult = await prisma.log.updateMany({
      where: {
        guildID: context.guild.id,
        logID
      },
      data: {
        reason
      }
    });

    if (updateResult.count === 0) {
      return context.interaction.followUp({
        ephemeral: true,
        content: "That log does not exist!"
      });
    }

    const log = await prisma.log.findFirst({
      where: {
        guildID: context.guild.id,
        logID
      }
    });

    if (!log) {
      return context.interaction.followUp({
        ephemeral: true,
        content: "That log does not exist!"
      });
    }

    const logsChannel = context.guild.channels.cache.get(
      guildModel.channelIDs.logs
    ) as GuildTextBasedChannel;

    if (!logsChannel) {
      return context.interaction.followUp({
        ephemeral: true,
        content: "This server does not have a logs channel set in the database!"
      });
    }

    const embedMessage = await logsChannel.messages.fetch(log.embedID, {
      force: true,
      cache: true
    });

    const embed = embedMessage.embeds[0];

    if (!embed) {
      return;
    }

    embed.fields[2] = {
      name: "Reason",
      value: reason,
      inline: false
    };

    embedMessage.edit({
      embeds: [embed]
    });

    return context.interaction.followUp({
      ephemeral: true,
      content: `Successfully edited the reason for log #\`${logID}\` to \`${reason}\``
    });
  }
});
