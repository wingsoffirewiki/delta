import { EventListener } from "fero-dc";
import { prisma } from "../db";

export default new EventListener<"interactionCreate">()
  .setEvent("interactionCreate")
  .setListener(async (client, interaction) => {
    if (!interaction.isButton()) {
      return;
    }

    const guild = interaction.guild;

    if (guild === null) {
      return;
    }

    if (interaction.customId !== "verify") {
      return;
    }

    const guildModel = await prisma.guild.findUnique({
      where: {
        id: guild.id
      }
    });

    if (guildModel === null) {
      return;
    }

    if (guildModel.messages.verification.id === "000000000000000000") {
      return;
    }

    const verificationMessage = guildModel.messages.verification;

    if (
      interaction.channelId !== verificationMessage.channelId ||
      interaction.message.id !== verificationMessage.id
    ) {
      return;
    }

    const roleID = guildModel.roleIds.verified;

    if (roleID === "000000000000000000") {
      return;
    }

    const role = await guild.roles.fetch(roleID, {
      cache: true
    });

    const member = await guild.members.fetch(interaction.user.id);

    if (role === null || member === null) {
      return;
    }

    if (member.roles.cache.has(role.id)) {
      interaction.reply({
        ephemeral: true,
        content: "You are already verified!"
      });

      return;
    }

    try {
      await member.roles.add(role);

      interaction.reply({
        ephemeral: true,
        content: "You have been verified!"
      });
    } catch (error) {
      interaction.reply({
        ephemeral: true,
        content: "An error occurred while trying to verify you."
      });

      console.error(error);
    }
  });
