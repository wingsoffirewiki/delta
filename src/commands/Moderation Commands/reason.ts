/** @format */

import { Command } from "fero-dc";
import { ILog, Log } from "../../models/Log";
import { Guild, IGuild } from "../../models/Guild";
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
  guildIDs: ["759068727047225384"],
  run: async context => {
    if (!context.interaction || !context.guild || !context.member) return;

    if (!context.member.permissions.has("BAN_MEMBERS"))
      return context.interaction.reply({
        ephemeral: false,
        content: messages.missingPermissions
      });

    await context.interaction.deferReply({
      ephemeral: true,
      fetchReply: false
    });

    const logID = context.interaction.options.getInteger("log_id", true);

    const reason = context.interaction.options.getString("reason", true);

    const log: ILog = await Log.findOneAndUpdate(
      {
        guildID: context.guild.id,
        logID
      },
      {
        reason
      },
      { upsert: false }
    );

    if (!log)
      return context.interaction.followUp({
        ephemeral: true,
        content: `It appears log #\`${logID}\` does not exist in the database.`
      });

    const guildModel: IGuild = await Guild.findOne({
      _id: context.guild.id
    });

    const logsChannel = context.guild.channels.cache.get(
      guildModel.channelIDs.logs
    ) as GuildTextBasedChannel;

    if (!logsChannel)
      return context.interaction.followUp({
        ephemeral: true,
        content: "This server does not have a logs channel set in the database!"
      });

    const embedMessage = await logsChannel.messages.fetch(log.embedID, {
      force: true,
      cache: true
    });

    const embed = embedMessage.embeds[0];

    if (!embed) return;

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
