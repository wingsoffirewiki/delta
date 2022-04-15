/** @format */

import { Command } from "fero-dc";
import { User, IUser } from "../../models/User";
import { Guild, IGuild } from "../../models/Guild";

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
  run: async context => {
    if (!context.interaction || !context.guild) return;

    await context.interaction.deferReply({
      ephemeral: false,
      fetchReply: false
    });

    const guildModel: IGuild = await Guild.findOne({ _id: context.guild.id });

    if (!(guildModel?.features?.scales ?? true))
      return context.interaction.followUp({
        ephemeral: false,
        content: "Scales are not enabled in the database."
      });

    const subCommand = context.interaction.options.getSubcommand(true);
    try {
      if (subCommand === "pay") {
        const user = context.interaction.options.getUser("user", true);

        const amount = context.interaction.options.getInteger("amount", true);

        if (user.id === context.author.id) throw "You cannot pay yourself!";

        if (amount < 1) throw "You cannot pay less than one scale!";

        const userModel: IUser = await User.findOneAndUpdate(
          {
            _id: user.id,
            enablePayments: true,
            banned: false
          },
          {
            $inc: {
              scales: amount
            }
          }
        );

        if (!userModel)
          throw `${user.tag} is not accepting payments or is banned from the scales system.`;

        const authorModel: IUser = await User.findOneAndUpdate(
          {
            _id: context.author.id,
            banned: false
          },
          {
            $inc: {
              scales: -amount
            }
          }
        );

        if (!authorModel) throw `You are banned from the scales system.`;

        context.interaction.followUp({
          ephemeral: false,
          content: `Successfully paid \`${user.tag}\` \`${amount}\` scales!`
        });
      } else if (subCommand === "balance") {
        const user =
          context.interaction.options.getUser("user", false) || context.author;

        const userModel: IUser = await User.findOne(
          {
            _id: user.id
          },
          "scales",
          { upsert: true }
        );

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
