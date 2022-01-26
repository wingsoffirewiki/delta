/** @format */

import { LogData } from "../interfaces/LogData";
import { Log, ILog } from "../models/Log";
import { Guild as GuildModel, IGuild } from "../models/Guild";
import { Guild, Message, MessageEmbed, User } from "discord.js";
import { Types } from "mongoose";
import { Client } from "fero-dc";
import { ms } from "fero-ms";
import { getBannedWord } from "./getBannedWord";
import bannedWords from "../config/bannedWords.json";

export enum LogEnum {
  ban,
  tempban,
  timeout,
  unban,
  warn,
  kick,
  messageEdit,
  messageDelete,
  bulkDelete,
  bannedWordDetected
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

  if (
    !(guildModel?.features?.logging ?? true) &&
    !(guildModel?.features?.modLogging ?? true) &&
    !(guildModel?.features?.adminLogging ?? true)
  )
    return;

  const logsChannel = guild.channels.cache.get(guildModel.channelIDs.logs);

  const modLogsChannel = guild.channels.cache.get(
    guildModel.channelIDs.modLogs
  );

  const adminLogsChannel = client.channels.cache.get(
    guildModel.channelIDs.adminLogs
  );

  const logID: number =
    ((await Log.find({ guildID: guild.id }, "logID"))
      .map(v => v.logID)
      .sort((a, b) => b - a)[0] || 0) + 1;

  const embed = new MessageEmbed();

  switch (type) {
    case "ban":
      if (
        !logsChannel ||
        !logsChannel.isText() ||
        !(guildModel?.features?.logging ?? true)
      )
        return;

      const banUser = data[0] as User;

      embed
        .setTitle("Delta: Banned User")
        .setDescription(`Log ID: ${logID}`)
        .setAuthor({
          name: moderator.tag,
          iconURL: moderator.avatarURL({ dynamic: true }) || ""
        })
        .setColor(0xe74d3c)
        .setThumbnail(banUser.avatarURL({ dynamic: true }) || "")
        .addFields([
          {
            name: "Username",
            value: banUser.tag,
            inline: true
          },
          {
            name: "User ID",
            value: banUser.id,
            inline: true
          },
          {
            name: "Reason",
            value: reason,
            inline: false
          },
          {
            name: "Timestamp",
            value: new Date(Date.now()).toUTCString(),
            inline: false
          }
        ])
        .setTimestamp()
        .setFooter({
          text: "Delta, The Wings of Fire Moderation Bot",
          iconURL: client.user?.avatarURL({ dynamic: true }) || ""
        });

      const banMessage = await logsChannel.send({ embeds: [embed] });

      const banLog: ILog = await Log.create({
        _id: new Types.ObjectId(),
        guildID: guild.id,
        targetID: banUser.id,
        modID: moderator.id,
        logID,
        reason,
        type: LogEnum[type],
        embedID: banMessage.id,
        undone: false
      });

      return banLog;

    case "tempban":
      if (
        !logsChannel ||
        !logsChannel.isText() ||
        !(guildModel?.features?.logging ?? true)
      )
        return;

      const tempbanUser = data[0] as User;

      const tempbanDate = data[1] as Date;

      const tempbanTime = data[2] as number;

      embed
        .setTitle("Delta: Temporarily Banned User")
        .setDescription(`Log ID: ${logID}`)
        .setAuthor({
          name: moderator.tag,
          iconURL: moderator.avatarURL({ dynamic: true }) || ""
        })
        .setColor(0xe67e22)
        .setThumbnail(tempbanUser.avatarURL({ dynamic: true }) || "")
        .addFields([
          {
            name: "Username",
            value: tempbanUser.tag,
            inline: true
          },
          {
            name: "User ID",
            value: tempbanUser.id,
            inline: true
          },
          {
            name: "Reason",
            value: reason,
            inline: false
          },
          {
            name: "Duration",
            value: ms(tempbanTime, { unitTrailingSpace: true }),
            inline: true
          },
          {
            name: "Resolved By",
            value: tempbanDate.toUTCString(),
            inline: true
          },
          {
            name: "Timestamp",
            value: new Date(Date.now()).toUTCString(),
            inline: false
          }
        ])
        .setTimestamp()
        .setFooter({
          text: "Delta, The Wings of Fire Moderation Bot",
          iconURL: client.user?.avatarURL({ dynamic: true }) || ""
        });

      const tempbanMessage = await logsChannel.send({ embeds: [embed] });

      const tempbanLog: ILog = await Log.create({
        _id: new Types.ObjectId(),
        guildID: guild.id,
        targetID: tempbanUser.id,
        modID: moderator.id,
        logID,
        reason,
        type: LogEnum[type],
        embedID: tempbanMessage.id,
        undoBy: tempbanDate,
        undone: false
      });

      return tempbanLog;

    case "timeout":
      if (
        !logsChannel ||
        !logsChannel.isText() ||
        !(guildModel?.features?.logging ?? true)
      )
        return;

      const timeoutUser = data[0] as User;

      const timeoutDate = data[1] as Date;

      const timeoutTime = data[2] as number;

      embed
        .setTitle("Delta: Timed Out User")
        .setDescription(`Log ID: ${logID}`)
        .setAuthor({
          name: moderator.tag,
          iconURL: moderator.avatarURL({ dynamic: true }) || ""
        })
        .setColor(0x27346f)
        .setThumbnail(timeoutUser.avatarURL({ dynamic: true }) || "")
        .addFields([
          {
            name: "Username",
            value: timeoutUser.tag,
            inline: true
          },
          {
            name: "User ID",
            value: timeoutUser.id,
            inline: true
          },
          {
            name: "Reason",
            value: reason,
            inline: false
          },
          {
            name: "Duration",
            value: ms(timeoutTime, { unitTrailingSpace: true }),
            inline: true
          },
          {
            name: "Resolved By",
            value: timeoutDate.toUTCString(),
            inline: true
          },
          {
            name: "Timestamp",
            value: new Date(Date.now()).toUTCString(),
            inline: false
          }
        ])
        .setTimestamp()
        .setFooter({
          text: "Delta, The Wings of Fire Moderation Bot",
          iconURL: client.user?.avatarURL({ dynamic: true }) || ""
        });

      const timeoutMessage = await logsChannel.send({ embeds: [embed] });

      const timeoutLog: ILog = await Log.create({
        _id: new Types.ObjectId(),
        guildID: guild.id,
        targetID: timeoutUser.id,
        modID: moderator.id,
        logID,
        reason,
        type: LogEnum[type],
        embedID: timeoutMessage.id,
        undone: false
      });

      return timeoutLog;

    case "unban":
      if (
        !logsChannel ||
        !logsChannel.isText() ||
        !(guildModel?.features?.logging ?? true)
      )
        return;

      const unbanUser = data[0] as User;

      const banLogs: ILog = (
        await Log.find(
          {
            targetID: unbanUser.id,
            type: {
              $in: [LogEnum["ban"], LogEnum["tempban"]]
            }
          },
          "_id createdAt",
          { upsert: false }
        ).sort({ createdAt: -1 })
      )[0];

      if (banLogs.undone) return;

      const unbanLog: ILog = await Log.findOneAndUpdate(
        { _id: banLogs._id },
        { undone: true },
        { upsert: false }
      );

      embed
        .setTitle("Delta: Unbanned User")
        .setDescription(`Log ID: ${unbanLog.logID}`)
        .setAuthor({
          name: moderator.tag,
          iconURL: moderator.avatarURL({ dynamic: true }) || ""
        })
        .setColor(0x388e3c)
        .setThumbnail(unbanUser.avatarURL({ dynamic: true }) || "")
        .addFields([
          {
            name: "Username",
            value: unbanUser.tag,
            inline: true
          },
          {
            name: "User ID",
            value: unbanUser.id,
            inline: true
          },
          {
            name: "Reason",
            value: reason,
            inline: false
          },
          {
            name: "Timestamp",
            value: new Date(Date.now()).toUTCString(),
            inline: false
          }
        ])
        .setTimestamp()
        .setFooter({
          text: "Delta, The Wings of Fire Moderation Bot",
          iconURL: client.user?.avatarURL({ dynamic: true }) || ""
        });

      /*const unbanMessage = */ await logsChannel.send({ embeds: [embed] });

      return unbanLog;

    case "warn":
      if (
        !logsChannel ||
        !logsChannel.isText() ||
        !(guildModel?.features?.logging ?? true)
      )
        return;

      const warnUser = data[0] as User;

      embed
        .setTitle("Delta: Warned User")
        .setDescription(`Log ID: ${logID}`)
        .setAuthor({
          name: moderator.tag,
          iconURL: moderator.avatarURL({ dynamic: true }) || ""
        })
        .setColor(0x0289d1)
        .setThumbnail(warnUser.avatarURL({ dynamic: true }) || "")
        .addFields([
          {
            name: "Username",
            value: warnUser.tag,
            inline: true
          },
          {
            name: "User ID",
            value: warnUser.id,
            inline: true
          },
          {
            name: "Reason",
            value: reason,
            inline: false
          },
          {
            name: "Timestamp",
            value: new Date(Date.now()).toUTCString(),
            inline: false
          }
        ])
        .setTimestamp()
        .setFooter({
          text: "Delta, The Wings of Fire Moderation Bot",
          iconURL: client.user?.avatarURL({ dynamic: true }) || ""
        });

      const warnMessage = await logsChannel.send({ embeds: [embed] });

      const warnLog: ILog = await Log.create({
        _id: new Types.ObjectId(),
        guildID: guild.id,
        targetID: warnUser.id,
        modID: moderator.id,
        logID,
        reason,
        type: LogEnum[type],
        embedID: warnMessage.id,
        undone: false
      });

      return warnLog;

    case "kick":
      if (
        !logsChannel ||
        !logsChannel.isText() ||
        !(guildModel?.features?.logging ?? true)
      )
        return;

      const kickUser = data[0] as User;

      embed
        .setTitle("Delta: Kicked User")
        .setDescription(`Log ID: ${logID}`)
        .setAuthor({
          name: moderator.tag,
          iconURL: moderator.avatarURL({ dynamic: true }) || ""
        })
        .setColor(0xfdd835)
        .setThumbnail(kickUser.avatarURL({ dynamic: true }) || "")
        .addFields([
          {
            name: "Username",
            value: kickUser.tag,
            inline: true
          },
          {
            name: "User ID",
            value: kickUser.id,
            inline: true
          },
          {
            name: "Reason",
            value: reason,
            inline: false
          },
          {
            name: "Timestamp",
            value: new Date(Date.now()).toUTCString(),
            inline: false
          }
        ])
        .setTimestamp()
        .setFooter({
          text: "Delta, The Wings of Fire Moderation Bot",
          iconURL: client.user?.avatarURL({ dynamic: true }) || ""
        });

      const kickMessage = await logsChannel.send({ embeds: [embed] });

      const kickLog: ILog = await Log.create({
        _id: new Types.ObjectId(),
        guildID: guild.id,
        targetID: kickUser.id,
        modID: moderator.id,
        logID,
        reason,
        type: LogEnum[type],
        embedID: kickMessage.id,
        undone: false
      });

      return kickLog;

    case "messageEdit":
      if (
        !modLogsChannel ||
        !modLogsChannel.isText() ||
        !(guildModel?.features?.modLogging ?? true)
      )
        return;

      const oldMessage = data[0] as Message;

      const newMessage = data[1] as Message;

      embed
        .setTitle("Delta: Edited Message")
        .setDescription(
          `Channel: ${newMessage.channel}\nChannel ID: ${newMessage.channel.id}\nAuthor: ${newMessage.author}\n Author ID: ${newMessage.author.id}`
        )
        .setURL(newMessage.url)
        .setAuthor({
          name: client.user?.tag || "",
          iconURL: client.user?.avatarURL({ dynamic: true }) || ""
        })
        .setColor(0x388e3c)
        .setThumbnail(newMessage.author.avatarURL({ dynamic: true }) || "")
        .addFields([
          {
            name: "Old Message",
            value: oldMessage.content || "None",
            inline: true
          },
          {
            name: "New Message",
            value: newMessage.content || "None",
            inline: true
          },
          {
            name: "Attachments",
            value:
              newMessage.attachments.map(v => v.name || "no_name").join("\n") ||
              "None",
            inline: false
          },
          {
            name: "Timestamp",
            value: new Date(Date.now()).toUTCString(),
            inline: false
          }
        ])
        .setTimestamp()
        .setFooter({
          text: "Delta, The Wings of Fire Moderation Bot",
          iconURL: client.user?.avatarURL({ dynamic: true }) || ""
        });

      modLogsChannel.send({
        embeds: [embed],
        attachments: newMessage.attachments.map(v => v)
      });

      return;

    case "messageDelete":
      if (
        !modLogsChannel ||
        !modLogsChannel.isText() ||
        !(guildModel?.features?.modLogging ?? true)
      )
        return;

      const message = data[0] as Message;

      embed
        .setTitle("Delta: Deleted Message")
        .setDescription(
          `Channel: ${message.channel}\nChannel ID: ${message.channel.id}\nAuthor: ${message.author}\nAuthor ID: ${message.author.id}`
        )
        .setAuthor({
          name: client.user?.tag || "",
          iconURL: client.user?.avatarURL({ dynamic: true }) || ""
        })
        .setColor(0x388e3c)
        .setThumbnail(message.author.avatarURL({ dynamic: true }) || "")
        .addFields([
          {
            name: "Message",
            value: message.content,
            inline: true
          },
          {
            name: "Attachments",
            value:
              message.attachments.map(v => v.name || "no_name").join("\n") ||
              "None",
            inline: false
          },
          {
            name: "Timestamp",
            value: new Date(Date.now()).toUTCString(),
            inline: false
          }
        ])
        .setTimestamp()
        .setFooter({
          text: "Delta, The Wings of Fire Moderation Bot",
          iconURL: client.user?.avatarURL({ dynamic: true }) || ""
        });

      modLogsChannel.send({
        embeds: [embed],
        attachments: message.attachments.map(v => v)
      });

      return;

    case "bulkDelete":
      if (
        !modLogsChannel ||
        !modLogsChannel.isText() ||
        !(guildModel?.features?.modLogging ?? true)
      )
        return;

      const messages = data as Message[];

      embed
        .setTitle("Delta: Messages Deleted In Bulk")
        .setDescription(
          `Channels: ${[
            ...new Set(messages.map(v => v.channel.toString()))
          ].join(", ")}\nChannel IDs: ${[
            ...new Set(messages.map(v => v.channel.id))
          ].join(", ")}\nAuthors: ${[
            ...new Set(messages.map(v => v.author.toString()))
          ].join(", ")}\nAuthor IDs: ${[
            ...new Set(messages.map(v => v.author.id))
          ].join(", ")}`
        )
        .setAuthor({
          name: client.user?.tag || "",
          iconURL: client.user?.avatarURL({ dynamic: true }) || ""
        })
        .setColor(0x388e3c)
        .addFields([
          ...messages
            .map(v => ({
              name: v.id,
              value: `${v.channel} | ${v.author}\n${
                v.content.length > 200
                  ? `${v.content.substring(0, 200)}...`
                  : `${v.content}`
              }`
            }))
            .slice(0, 25),
          {
            name: "Attachments",
            value:
              messages
                .filter(v => v.attachments.size > 0)
                .map(
                  v => `${v.id}: ${v.attachments.map(v2 => v2.name).join(", ")}`
                )
                .join("\n") || "None",
            inline: false
          },
          {
            name: "Timestamp",
            value: new Date(Date.now()).toUTCString(),
            inline: false
          }
        ])
        .setTimestamp()
        .setFooter({
          text: "Delta, The Wings of Fire Moderation Bot",
          iconURL: client.user?.avatarURL({ dynamic: true }) || ""
        });

      modLogsChannel.send({
        embeds: [embed],
        attachments: messages.map(v => v.attachments.map(v2 => v2)).flat()
      });

      return;

    case "bannedWordDetected":
      if (
        !modLogsChannel ||
        !modLogsChannel.isText() ||
        !(guildModel?.features?.modLogging ?? true)
      )
        return;

      const bannedWordMessage = data[0] as Message;

      const bannedWord = getBannedWord(
        bannedWordMessage
      ) as keyof typeof bannedWords;

      embed
        .setTitle("Delta: Slur Detected")
        .setDescription(
          `Channel: ${bannedWordMessage.channel}\nChannel ID: ${bannedWordMessage.channel.id}\nUser: ${bannedWordMessage.author.tag}\nUser: ${bannedWordMessage.author.id}\nMessage URL${bannedWordMessage.url}`
        )
        .setAuthor({
          name: bannedWordMessage.author.tag,
          iconURL: bannedWordMessage.author.avatarURL({ dynamic: true }) || ""
        })
        .setColor(0xff0000)
        .setThumbnail(
          bannedWordMessage.author.avatarURL({ dynamic: true }) || ""
        )
        .addFields([
          {
            name: "Slur",
            value: bannedWord,
            inline: false
          },
          {
            name: "Message Content",
            value: bannedWordMessage.content,
            inline: false
          },
          {
            name: "Attachments",
            value:
              bannedWordMessage.attachments
                .map(v => v.name || "no_name")
                .join("\n") || "None",
            inline: false
          }
        ])
        .setTimestamp()
        .setFooter({
          text: "Delta, The Wings of Fire Moderation Bot",
          iconURL: client.user?.avatarURL({ dynamic: true }) || ""
        });

      await modLogsChannel.send({ embeds: [embed] });

      if (
        adminLogsChannel &&
        adminLogsChannel.isText() &&
        (guildModel?.features?.adminLogging ?? true)
      )
        await adminLogsChannel.send({ embeds: [embed] });

      await bannedWordMessage.channel.send(
        `${bannedWordMessage.author}, Your message contains a(n) ${
          bannedWords[bannedWord]
        } (${bannedWord.replace(
          /[aeiou]/g,
          "/"
        )}). It will be deleted and logged.`
      );

      if (bannedWordMessage.deletable) await bannedWordMessage.delete();

      return;

    default:
      throw new Error("Invalid Type");
  }
}
