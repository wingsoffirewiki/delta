/** @format */

import { Command } from "fero-dc";
import { prisma } from "../../db";
import messages from "../../config/messages.json";

export default new Command({
  name: "scales",
  description: "Show and manage your scales",
  category: "Scales",
  options: [
    {
      name: "pay",
      description: "Pay a user some scales",
      type: "SUB_COMMAND",
      options: [
        {
          name: "user",
          description: "The user to pay scales to",
          type: "USER",
          required: true
        },
        {
          name: "amount",
          description: "The amount of scales to pay to the user",
          type: "INTEGER",
          required: true
        }
      ]
    },
    {
      name: "balance",
      description: "Get the balance of yourself or of another user",
      type: "SUB_COMMAND",
      options: [
        {
          name: "user",
          description: "The user to get the balance for",
          type: "USER",
          required: false
        }
      ]
    }
  ],
  guildIDs: [],
  run: async (context) => {
    if (!context.interaction || !context.guild) {
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
        ephemeral: false,
        content: messages.databaseError
      });
    }

    if (!(guildModel?.features?.scales ?? true)) {
      return context.interaction.followUp({
        ephemeral: false,
        content: "Scales are not enabled in the database."
      });
    }

    const subCommand = context.interaction.options.getSubcommand(true);
    try {
      if (subCommand === "pay") {
        const user = context.interaction.options.getUser("user", true);

        const amount = context.interaction.options.getInteger("amount", true);

        if (user.id === context.author.id) {
          throw "You cannot pay yourself!";
        }

        if (amount < 1) {
          throw "You cannot pay less than one scale!";
        }

        const userUpdateResponse = await prisma.user.updateMany({
          where: {
            id: user.id,
            enablePayments: true,
            banned: false
          },
          data: {
            scales: {
              increment: amount
            }
          }
        });

        if (userUpdateResponse.count === 0) {
          throw `${user.tag} is not accepting payments or is banned from the scales system.`;
        }

        const authorUpdateResponse = await prisma.user.updateMany({
          where: {
            id: context.author.id,
            banned: false
          },
          data: {
            scales: {
              decrement: amount
            }
          }
        });

        if (!authorUpdateResponse.count) {
          throw `You are banned from the scales system.`;
        }

        context.interaction.followUp({
          ephemeral: false,
          content: `Successfully paid \`${user.tag}\` \`${amount}\` scales!`
        });
      } else if (subCommand === "balance") {
        const user =
          context.interaction.options.getUser("user", false) || context.author;

        const userModel = await prisma.user.findUnique({
          where: {
            id: user.id
          },
          select: {
            scales: true
          }
        });

        if (!userModel) {
          return context.interaction.followUp({
            ephemeral: false,
            content: "An error occurred while fetching the user's scales."
          });
        }

        context.interaction.followUp({
          ephemeral: false,
          content:
            user.id === context.author.id
              ? `You have \`${userModel.scales}\` scales!`
              : `\`${user.tag}\` has \`${userModel.scales}\` scales!`
        });
      }
    } catch (err) {
      context.interaction.followUp({
        ephemeral: false,
        content: `Error:\n\`${err}\``
      });
    }
    return;
  }
});
