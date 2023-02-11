import { Command } from "fero-dc";
import { prisma } from "../../util/prisma-client";

export default new Command()
  .setName("toggle-payments")
  .setDescription(
    "Toggle your setting in the database to allow you to receive payments."
  )
  .setCategory("Scales")
  .setRun(async (client, interaction) => {
    await interaction.deferReply({
      ephemeral: false,
      fetchReply: false
    });

    const guild = interaction.guild;
    if (guild === null) {
      return;
    }

    const authorId = interaction.user.id;
    const authorModel = await prisma.user.findUnique({
      where: {
        id: authorId
      },
      select: {
        enablePayments: true
      }
    });
    if (authorModel === null) {
      await interaction.followUp({
        content: "Failed to get author model"
      });

      return;
    }

    const enablePayments = !authorModel.enablePayments;
    await prisma.user.update({
      where: {
        id: authorId
      },
      data: {
        enablePayments
      }
    });

    await interaction.followUp({
      content: `Successfully updated enablePayments to \`${enablePayments}\``
    });
  });
