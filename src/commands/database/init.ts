import { PermissionFlagsBits } from "discord.js";
import { Command } from "fero-dc";
import { prisma } from "../../util/prisma-client";

export default new Command()
  .setName("init")
  .setDescription("Initialize server settings for the database")
  .setCategory("Database")
  .setRun(async (client, interaction) => {
    await interaction.deferReply({
      ephemeral: true,
      fetchReply: false
    });

    const guild = interaction.guild;
    if (guild === null) {
      await interaction.followUp({
        content: "This command can only be used in a server.",
        ephemeral: true
      });

      return;
    }

    const authorId = interaction.user.id;
    const member = await guild.members.fetch(authorId).catch(() => null);
    if (member === null) {
      await interaction.followUp({
        content: "Failed to get member.",
        ephemeral: true
      });

      return;
    }

    if (!member.permissions.has(PermissionFlagsBits.ManageGuild)) {
      await interaction.followUp({
        content: "You do not have permission to use this command.",
        ephemeral: true
      });

      return;
    }

    const guildModel = await prisma.guild.findUnique({
      where: {
        id: guild.id
      }
    });
    if (guildModel !== null) {
      interaction.followUp({
        content: "This server has already been initialized.",
        ephemeral: true
      });

      return;
    }

    await prisma.guild.create({
      data: {
        id: guild.id,
        channelIds: {},
        roleIds: {},
        messages: {},
        features: {}
      }
    });

    await interaction.followUp({
      content: "Successfully initialized this server in the database.",
      ephemeral: true
    });
  });
