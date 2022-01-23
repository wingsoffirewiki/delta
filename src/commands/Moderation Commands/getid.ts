/** @format */

import { Command } from "fero-dc";

export default new Command({
  name: "getid",
  description: "Gets the ID of a user",
  category: "Moderation",
  options: [
    {
      name: "user",
      description: "The user to get the ID of",
      type: "USER",
      required: true
    }
  ],
  guildIDs: ["759068727047225384"],
  run: async context => {
    if (!context.guild || !context.member || !context.interaction) return;

    if (!context.member.permissions.has("BAN_MEMBERS"))
      return context.interaction.followUp(
        "You do not have the correct permissions to run this command!"
      );

    const user = context.interaction.options.getUser("user", true);

    return context.interaction.followUp(
      `ID for user ${user.tag} is: \`${user.id}\``
    );
  }
});
