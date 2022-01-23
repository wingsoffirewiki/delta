/** @format */

import { Command } from "fero-dc";
import messages from "../../config/messages.json";

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
    if (!context.interaction || !context.guild || !context.member) return;

    if (!context.member.permissions.has("BAN_MEMBERS"))
      return context.interaction.reply({
        ephemeral: false,
        content: messages.missingPermissions
      });

    const user = context.interaction.options.getUser("user", true);

    return context.interaction.reply({
      ephemeral: true,
      content: `ID for user ${user.tag} is: \`${user.id}\``
    });
  }
});
