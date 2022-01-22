/** @format */

import { Command } from "fero-dc";

export default new Command({
  name: "ban",
  description: "Bans a member from the server permanently",
  category: "Moderation",
  options: [
    {
      name: "member",
      description: "The member to ban",
      type: "USER",
      required: true
    },
    {
      name: "reason",
      description: "The reason to ban the member",
      type: "STRING",
      required: false
    },
    {
      name: "hardban",
      description: "Delete messages the member has sent in the past seven days",
      type: "BOOLEAN",
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

    const days =
      context.interaction.options.getBoolean("hardban", false) || false ? 7 : 0;

    const guild = context.guild;

    const result = await guild.members.ban(user.id, { reason, days });

    if (result)
      return context.interaction.followUp(
        `Successfully banned ${user} (\`${user.tag}\`) (\`${user.id}\`) from \`${guild.name}\``
      );
    else
      return context.interaction.followUp(
        `Attempted banning ${user} (\`${user.tag}\`) (\`${user.id}\`) but unsure if it was successful.`
      );
  }
});
