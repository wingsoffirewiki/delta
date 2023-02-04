import { Command } from "fero-dc";
import { prisma } from "../../db";
import messages from "../../config/messages.json";

export default new Command({
  name: "init",
  description: "Initialize server settings for the database",
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

    const previousGuildModel = await prisma.guild.findUnique({
      where: {
        id: guild.id
      }
    });

    if (previousGuildModel) {
      return context.interaction.followUp({
        ephemeral: true,
        content:
          "This server already has options in the database! Use the /set command to set database values."
      });
    }

    await prisma.guild.create({
      data: {
        id: guild.id,
        channelIDs: {},
        roleIDs: {},
        messages: {},
        features: {}
      }
    });

    context.interaction.followUp({
      ephemeral: true,
      content: "Successfully initialized this server in the database."
    });
  }
});
