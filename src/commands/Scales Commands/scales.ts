/** @format */

import { Command } from "fero-dc";
import User from "../../models/User";

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
  guildIDs: ["759068727047225384"],
  run: async context => {
    if (!context.interaction) return;

    const subCommand = context.interaction.options.getSubcommand(true);

    if (subCommand === "pay") {
      const user = context.interaction.options.getUser("user", true);

      const amount = context.interaction.options.getInteger("amount", true);

      if (user.id === context.author.id)
        return context.interaction.followUp("You cannot pay yourself!");

      if (amount < 1)
        return context.interaction.followUp(
          "You cannot pay less than one scale!"
        );

      // @ts-ignore
      const userModel = await User.findOneAndUpdate(
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

      // @ts-ignore
      const authorModel = await User.findOneAndUpdate(
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

      context.interaction.followUp(
        `Successfully paid \`${user.tag}\` \`${amount}\` scales!`
      );
    } else if (subCommand === "balance") {
      const user =
        context.interaction.options.getUser("user", false) || context.author;

      const userModel = await User.findOne(
        {
          _id: user.id
        },
        "scales",
        { upsert: true }
      );

      context.interaction.followUp(
        user.id === context.author.id
          ? `You have \`${userModel.scales}\` scales!`
          : `\`${user.tag}\` has \`${userModel.scales}\` scales!`
      );
    }

    return;
  }
});
