/** @format */

import { Command } from "fero-dc";
import { User, IUser } from "../../models/User";
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

    const userModel: IUser | null = await User.findOne(
      { _id: context.author.id },
      "enablePayments",
      { upsert: true }
    );

    if (!userModel) {
      return context.interaction.followUp({
        ephemeral: true,
        content: messages.databaseError
      });
    }

    const enablePayments = !userModel.enablePayments;

    await userModel.updateOne({ enablePayments }, { upsert: true }).exec();

    return context.interaction.followUp({
      ephemeral: false,
      content: `Successfully updated enablePayments to \`${enablePayments}\``
    });
  }
});
