import { MessageEmbed } from "discord.js";
import { Command } from "fero-dc";
import { prisma } from "../../db";
import messages from "../../config/messages.json";

export default new Command({
  name: "leaderboard",
  description: "Get a list of the top 10 people in the economy",
  category: "Scales",
  guildIDs: [],
  run: async (context) => {
    if (!context.interaction || !context.guild || !context.member) {
      return;
    }

    await context.interaction.deferReply({
      ephemeral: false,
      fetchReply: false
    });

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

    if (!(guildModel?.features?.scales ?? true)) {
      return context.interaction.followUp({
        ephemeral: false,
        content: "Scales are not enabled in the database."
      });
    }

    const userModels = (
      await prisma.user.findMany({
        select: {
          id: true,
          scales: true
        }
      })
    ).sort((a, b) => b.scales - a.scales);

    const authorModel = userModels.find(
      (userModel) => userModel.id === context.author.id
    );

    const authorModelIndex = authorModel
      ? userModels.indexOf(authorModel)
      : undefined;

    const embed = new MessageEmbed();

    embed
      .setTitle("Delta: Scales Leaderboard")
      .setAuthor({
        name: context.author.username || "",
        iconURL: context.author.avatarURL({ dynamic: true }) || ""
      })
      .setDescription(
        `The following is the leaderboard for ${context.client.user?.username}`
      )
      .setColor("BLURPLE")
      .addFields([
        ...userModels.slice(0, 10).map((userModel, i) => ({
          name:
            context.client.users.cache.get(userModel.id)?.username ||
            userModel.id,
          value: `${i + 1}: \`${userModel.scales}\` scales.`,
          inline: false
        })),
        {
          name: `${context.author.username} (You)`,
          value: `${(authorModelIndex || userModels.length - 1) + 1}: \`${
            authorModel?.scales || 0
          }\` scales`
        }
      ])
      .setTimestamp()
      .setFooter({
        text: "Delta, The Wings of Fire Moderation Bot",
        iconURL: context.client.user?.avatarURL({ dynamic: true }) || ""
      });

    context.interaction.followUp({ ephemeral: true, embeds: [embed] });

    return;
  }
});
