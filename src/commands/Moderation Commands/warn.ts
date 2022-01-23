/** @format */

import { Command } from "fero-dc";
import { log } from "../../scripts/log";
import messages from "../../config/messages.json";

export default new Command({
  name: "warn",
  description: "Warn a user",
  category: "Moderation",
  options: [
    {
      name: "user",
      description: "The user to warn",
      type: "USER",
      required: true
    },
    {
      name: "reason",
      description: "The reason to warn the user",
      type: "STRING",
      required: false
    }
  ],
  guildIDs: ["759068727047225384"],
  run: async context => {
    if (!context.interaction || !context.guild || !context.member) return;

    if (!context.member.permissions.has("MODERATE_MEMBERS"))
      return context.interaction.reply({
        ephemeral: false,
        content: messages.missingPermissions
      });

    await context.interaction.deferReply({
      ephemeral: true,
      fetchReply: false
    });

    const user = context.interaction.options.getUser("member", true);

    const reason =
      context.interaction.options.getString("reason", false) ||
      "No reason provided";

    const guild = context.guild;

    if (!user)
      return context.interaction.followUp({
        ephemeral: true,
        content: messages.missingMember
      });

    await log(context.client, "warn", guild, reason, context.author, user);

    return context.interaction.followUp({
      ephemeral: true,
      content: `Successfully warned ${user} (\`${user.tag}\`) (\`${user.id}\`)`
    });
  }
});
