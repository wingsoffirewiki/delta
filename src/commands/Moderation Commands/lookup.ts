import { MessageEmbed } from "discord.js";
import { Command, toPascalCase } from "fero-dc";
import { prisma } from "../../db";
import { LogType } from "../../scripts/log";
import messages from "../../config/messages.json";

export default new Command({
  name: "lookup",
  description: "Lookup a user or a log",
  category: "Moderation",
  options: [
    {
      name: "user",
      description: "Lookup a user and see their logs",
      type: "SUB_COMMAND",
      options: [
        {
          name: "user",
          description: "The user to lookup",
          type: "USER",
          required: true
        }
      ]
    },
    {
      name: "log",
      description: "Lookup a log and see its information",
      type: "SUB_COMMAND",
      options: [
        {
          name: "log",
          description: "The log to lookup",
          type: "INTEGER",
          required: true
        }
      ]
    }
  ],
  guildIDs: [],
  run: async (context) => {
    if (!context.interaction || !context.guild || !context.member) {
      return;
    }

    if (!context.member.permissions.has("BAN_MEMBERS")) {
      return context.interaction.reply({
        ephemeral: false,
        content: messages.missingPermissions
      });
    }

    await context.interaction.deferReply({
      ephemeral: true,
      fetchReply: false
    });

    const subCommand = context.interaction.options.getSubcommand(true);

    if (subCommand === "user") {
      const user = context.interaction.options.getUser("user", true);

      const logModels = await prisma.log.findMany({
        where: {
          guildID: context.guild.id,
          targetID: user.id
        },
        select: {
          type: true,
          reason: true,
          logID: true
        }
      });

      const embed = new MessageEmbed();

      embed
        .setTitle("Delta: User Logs")
        .setAuthor({
          name: context.author.username || "",
          iconURL: context.author.avatarURL({ dynamic: true }) || ""
        })
        .setDescription(`${user.tag} has ${logModels.length} entries!`)
        .setColor("BLURPLE")
        .addFields([
          {
            name: "Currently Banned",
            value: (await context.guild.bans.cache.get(user.id)) ? "Yes" : "No",
            inline: false
          },
          ...logModels.map((v) => ({
            name: `${v.logID} - ${toPascalCase(LogType[v.type] as string)}`,
            value: v.reason,
            inline: false
          }))
        ])
        .setTimestamp()
        .setFooter({
          text: "Delta, The Wings of Fire Moderation Bot",
          iconURL: context.client.user?.avatarURL({ dynamic: true }) || ""
        });

      return context.interaction.followUp({ ephemeral: true, embeds: [embed] });
    } else if (subCommand === "log") {
      const logID = context.interaction.options.getInteger("log", true);

      const logModel = await prisma.log.findFirst({
        where: {
          guildID: context.guild.id,
          logID
        }
      });

      if (!logModel) {
        return context.interaction.reply({
          ephemeral: true,
          content: "That log does not exist!"
        });
      }

      const guildModel = await prisma.guild.findUnique({
        where: {
          id: context.guild.id
        }
      });

      if (!guildModel) {
        return context.interaction.followUp({
          ephemeral: true,
          content: messages.databaseError
        });
      }

      const logsChannel = context.guild.channels.cache.get(
        guildModel.channelIDs.logs
      );

      if (!logsChannel || !logsChannel.isText()) {
        return;
      }

      const embedMessage = await logsChannel.messages.fetch(logModel.embedID);

      context.interaction.followUp({
        ephemeral: true,
        embeds: [embedMessage.embeds[0] as MessageEmbed]
      });
    }

    return;
  }
});
