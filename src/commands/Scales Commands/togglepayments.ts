/** @format */

import { Command } from "fero-dc";
import { prisma } from "../../db";
import messages from "../../config/messages.json";

export default new Command({
  name: "togglepayments",
  description: "Toggle your setting in the database to allow payments to you.",
  category: "Scales",
  guildIDs: [],
  run: async (context) => {
    if (!context.interaction || !context.guild) {
      return;
    }

    await context.interaction.deferReply({
      ephemeral: false,
      fetchReply: false
    });

    const userModel = await prisma.user.findUnique({
      where: {
        id: context.author.id
      },
      select: {
        enablePayments: true
      }
    });

    if (!userModel) {
      return context.interaction.followUp({
        ephemeral: true,
        content: messages.databaseError
      });
    }

    const enablePayments = !userModel.enablePayments;

    await prisma.user.update({
      where: {
        id: context.author.id
      },
      data: { enablePayments }
    });

    return context.interaction.followUp({
      ephemeral: false,
      content: `Successfully updated enablePayments to \`${enablePayments}\``
    });
  }
});
