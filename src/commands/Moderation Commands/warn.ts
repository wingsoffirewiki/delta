/** @format */

import { Command } from "fero-dc";
import { log } from "../../scripts/log";

export default new Command({
  name: "warn",
  description: "Warn a member",
  category: "Moderation",
  options: [
    {
      name: "member",
      description: "The member to warn",
      type: "USER",
      required: true
    },
    {
      name: "reason",
      description: "The reason to warn the member",
      type: "STRING",
      required: false
    }
  ],
  guildIDs: ["759068727047225384"],
  run: async context => {
    if (!context.interaction || !context.guild || !context.member) return;

    if (!context.member.permissions.has("MODERATE_MEMBERS"))
      return context.interaction.followUp(
        "You do not have the correct permissions to run this command!"
      );

    const user = context.interaction.options.getUser("member", true);

    const reason =
      context.interaction.options.getString("reason", false) ||
      "No reason provided";

    const guild = context.guild;

    const member = await guild.members.fetch(user.id);

    if (!member)
      return context.interaction.followUp(
        "The member you provided is not a part of this server!"
      );

    log(context.client, "warn", guild, reason, context.author, member);

    return context.interaction.followUp(
      `Successfully warned ${user} (\`${user.tag}\`) (\`${user.id}\`)`
    );
  }
});
