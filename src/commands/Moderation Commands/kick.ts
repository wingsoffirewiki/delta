/** @format */

import { Command } from "fero-dc";

export default new Command({
  name: "kick",
  description: "Kicks a member from the server",
  category: "Moderation",
  options: [
    {
      name: "member",
      description: "The member to kick",
      type: "USER",
      required: true
    },
    {
      name: "reason",
      description: "The reason to kick the member",
      type: "STRING",
      required: false
    }
  ],
  guildIDs: ["759068727047225384"],
  run: async context => {
    if (!context.interaction || !context.guild || !context.member) return;

    if (!context.member.permissions.has("KICK_MEMBERS"))
      return context.interaction.followUp(
        "You do not have the correct permissions to run this command!"
      );

    const user = context.interaction.options.getUser("member", true);

    const reason =
      context.interaction.options.getString("reason", false) ||
      "No reason provided";

    const guild = context.guild;

    const result = await guild.members.kick(user.id, reason);

    if (result)
      return context.interaction.followUp(
        `Successfully kicked ${user} (\`${user.tag}\`) (\`${user.id}\`) from \`${guild.name}\``
      );
    else
      return context.interaction.followUp(
        `Attempted kicking ${user} (\`${user.tag}\`) (\`${user.id}\`) but unsure if it was successful.`
      );
  }
});
