/** @format */

import { Command } from "fero-dc";
import { User, IUser } from "../../models/User";

export default new Command({
  name: "togglepayments",
  description: "Toggle your setting in the database to allow payments to you.",
  category: "Scales",
  guildIDs: ["759068727047225384"],
  run: async context => {
    if (!context.interaction || !context.guild) return;

    await context.interaction.deferReply({
      ephemeral: false,
      fetchReply: false
    });

    const userModel: IUser = await User.findOne(
      { _id: context.author.id },
      "enablePayments",
      { upsert: true }
    );

    const enablePayments = !userModel.enablePayments;

    await userModel.updateOne({ enablePayments }, { upsert: true }).exec();

    context.interaction.followUp({
      ephemeral: false,
      content: `Successfully updated enablePayments to \`${enablePayments}\``
    });
  }
});
