import { Command } from "fero-dc";
import { prisma } from "../../../util/prisma-client";
import { Colors, EmbedBuilder } from "discord.js";

export default new Command()
  .setName("leaderboard")
  .setDescription("Gets the leaderboard for scales")
  .setCategory("Scales")
  .setRun(async (client, interaction) => {
    await interaction.deferReply({
      ephemeral: false,
      fetchReply: false
    });

    const guild = interaction.guild;
    if (guild === null) {
      interaction.followUp({
        content: "Failed to get guild"
      });

      return;
    }
    const guildModel = await prisma.guild.findUnique({
      where: {
        id: guild.id
      }
    });
    if (guildModel === null) {
      interaction.followUp({
        content: "Failed to get guild model"
      });

      return;
    }
    if (!guildModel.features.scales) {
      interaction.followUp({
        content: "Scales feature is not enabled"
      });

      return;
    }

    const userModels = await prisma.user.findMany({
      select: {
        id: true,
        scales: true
      }
    });
    userModels.sort((a, b) => b.scales - a.scales);

    const authorId = interaction.user.id;
    const authorModel = userModels.find(
      (userModel) => userModel.id === authorId
    );
    if (authorModel === undefined) {
      interaction.followUp({
        content: "Failed to get author model"
      });

      return;
    }
    const authorModelIndex = userModels.indexOf(authorModel);

    const topTenUserModels = userModels.slice(0, 10);
    const topTenFields = topTenUserModels.map((userModel, index) => {
      const user = client.users.cache.get(userModel.id);

      return {
        name: user?.username ?? user?.id ?? "Unknown",
        value: `${index + 1}: \`${userModel.scales}\` scales.`
      };
    });

    const embed = new EmbedBuilder()
      .setTitle("Delta: Scales Leaderboard")
      .setDescription(
        `The following is the leaderboard for ${client.user.username}`
      )
      .setColor(Colors.Blurple)
      .setAuthor({
        name: interaction.user.username,
        iconURL: interaction.user.avatarURL() ?? ""
      })
      .addFields(...topTenFields)
      .setTimestamp()
      .setFooter({
        text: "Delta, The Wings of Fire Moderation Bot",
        iconURL: client.user.avatarURL() ?? ""
      });
    if (authorModelIndex > 10) {
      embed.addFields({
        name: `${interaction.user.username} (You)`,
        value: `${authorModelIndex + 1}: \`${authorModel.scales}\` scales.`
      });
    }
    interaction.followUp({
      embeds: [embed]
    });
  });
