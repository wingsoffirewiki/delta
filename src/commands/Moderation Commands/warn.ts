/** @format */

import { GuildMember } from "discord.js";
import { Command } from "fero-dc";
import { log } from "../../scripts/log";
import messages from "../../config/messages.json";

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
      return context.interaction.reply({
        ephemeral: false,
        content: messages.missingPermissions
      });

    await context.interaction.deferReply({
      ephemeral: true,
      fetchReply: false
    });

    const member = context.interaction.options.getMember(
      "member",
      true
    ) as GuildMember;

    const reason =
      context.interaction.options.getString("reason", false) ||
      "No reason provided";

    const guild = context.guild;

    if (!member)
      return context.interaction.followUp({
        ephemeral: true,
        content: messages.missingMember
      });

    log(context.client, "warn", guild, reason, context.author, member);

    return context.interaction.followUp({
      ephemeral: true,
      content: `Successfully warned ${member} (\`${member.user.tag}\`) (\`${member.id}\`)`
    });
  }
});
