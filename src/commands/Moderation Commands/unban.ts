/** @format */

import { Command } from "fero-dc";

export default new Command({
  name: "unban",
  description: "Unbans a member from the server",
  category: "Moderation",
  options: [
    {
      name: "member",
      description: "The member to unban",
      type: "USER",
      required: true
    },
    {
      name: "reason",
      description: "The reason to unban the member",
      type: "STRING",
      required: false
    }
  ],
  guildIDs: ["759068727047225384"],
  run: async context => {
    if (!context.interaction || !context.guild || !context.member) return;

    if (!context.member.permissions.has("BAN_MEMBERS"))
      return context.interaction.followUp(
        "You do not have the correct permissions to run this command!"
      );

    const user = context.interaction.options.getUser("member", true);

    const reason =
      context.interaction.options.getString("reason", false) ||
      "No reason provided";

    const guild = context.guild;

    const result = await guild.members.unban(user.id, reason);

    if (result)
      return context.interaction.followUp(
        `Successfully unbanned ${user} (\`${user.tag}\`) (\`${user.id}\`) from \`${guild.name}\``
      );
    else
      return context.interaction.followUp(
        `Attempted unbanning ${user} (\`${user.tag}\`) (\`${user.id}\`) but unsure if it was successful.`
      );
  }
});
