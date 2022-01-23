/** @format */

import { LogData } from "../interfaces/LogData";
import { Log, ILog } from "../models/Log";
import { Guild as GuildModel, IGuild } from "../models/Guild";
import { Guild, GuildMember, MessageEmbed, User } from "discord.js";
import { Types } from "mongoose";
import { Client } from "fero-dc";

enum LogEnum {
  ban = 0,
  tempban,
  timeout,
  unban,
  warn
}

export async function log<LT extends keyof LogData>(
  client: Client,
  type: LT,
  guild: Guild,
  reason: string,
  moderator: User,
  ...data: LogData[LT]
): Promise<ILog | undefined> {
  const guildModel: IGuild = await GuildModel.findOne({ _id: guild.id }, null, {
    upsert: true
  });

  const logID: number =
    ((await Log.find({ guildID: guild.id }, "logID"))
      .map(v => v.logID)
      .sort((a, b) => b - a)[0] || 0) + 1;

  switch (type) {
    case "ban":
      return undefined;

    case "tempban":
      return undefined;

    case "timeout":
      return undefined;

    case "unban":
      return undefined;

    case "warn":
      const member = data[0] as GuildMember;

      const logsChannel = guild.channels.cache.get(guildModel.channelIDs.logs);

      if (!logsChannel || !logsChannel.isText()) return;

      const embed = new MessageEmbed();

      embed
        .setTitle("Delta: Warned User")
        .setDescription(`Log ID: ${logID}`)
        .setAuthor({
          name: moderator.tag,
          iconURL: moderator.avatarURL({ dynamic: true }) || ""
        })
        .setColor(0x0289d1)
        .setThumbnail(member.user.avatarURL({ dynamic: true }) || "")
        .addFields([
          {
            name: "Username",
            value: member.user.tag,
            inline: true
          },
          {
            name: "User ID",
            value: member.user.id,
            inline: true
          },
          {
            name: "Reason",
            value: reason,
            inline: false
          },
          {
            name: "Timestamp",
            value: new Date().toUTCString(),
            inline: false
          }
        ])
        .setTimestamp()
        .setFooter({
          text: "Delta, the Wings of Fire Moderation Bot",
          iconURL: client.user?.avatarURL({ dynamic: true }) || ""
        });

      const msg = await logsChannel.send({ embeds: [embed] });

      const log: ILog = await Log.create({
        _id: new Types.ObjectId(),
        guildID: guild.id,
        targetID: member.id,
        modID: moderator.id,
        logID,
        reason,
        type: LogEnum[type],
        embedID: msg.id,
        undoBy: -1,
        undone: false
      });

      console.log(log);

      return log;

    default:
      throw new Error("Invalid Type");
  }
}
