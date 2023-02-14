import { Command } from "fero-dc";
import { prisma } from "../../util/prisma-client";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Colors,
  EmbedBuilder
} from "discord.js";

export default new Command()
  .setName("verification-setup")
  .setDescription("Sets up the verification system")
  .setCategory("Verification")
  .setRun(async (client, interaction) => {
    await interaction.deferReply({
      ephemeral: true
    });

    const guild = interaction.guild;
    if (guild === null) {
      await interaction.followUp({
        content: "This command can only be used in a server.",
        ephemeral: true
      });

      return;
    }
    const guildModel = await prisma.guild.findUnique({
      where: {
        id: guild.id
      }
    });
    if (guildModel === null) {
      await interaction.followUp({
        content: "This server has not been initialized.",
        ephemeral: true
      });

      return;
    }

    const verificationChannel = await guild.channels
      .fetch(guildModel.channelIds.verification)
      .catch(() => null);
    if (verificationChannel === null || !verificationChannel.isTextBased()) {
      await interaction.followUp({
        content: "Failed to get verification channel.",
        ephemeral: true
      });

      return;
    }

    const embed = new EmbedBuilder()
      .setTitle("Delta: Verification")
      .setDescription("Click the button below to verify!")
      .setColor(Colors.Blurple)
      .setTimestamp()
      .setFooter({
        text: "Delta, The Wings of Fire Moderation Bot",
        iconURL: client.user.avatarURL() ?? ""
      });

    const row = new ActionRowBuilder<ButtonBuilder>();
    const button = new ButtonBuilder()
      .setCustomId("verify")
      .setLabel("Verify!")
      .setStyle(ButtonStyle.Primary)
      .setEmoji(guildModel.emojis.verificationButton);
    row.addComponents(button);

    const message = await verificationChannel.send({
      embeds: [embed],
      components: [row]
    });

    await prisma.guild.update({
      where: {
        id: guild.id
      },
      data: {
        messageIds: {
          update: {
            verification: message.id
          }
        }
      }
    });

    await interaction.followUp({
      content: "Verification message sent!",
      ephemeral: true
    });
  });
