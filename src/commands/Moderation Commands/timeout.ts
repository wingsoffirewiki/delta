/** @format */

import { GuildMember } from "discord.js";
import { Command } from "fero-dc";
import { ms } from "fero-ms";
import messages from "../../config/messages.json";
import { log } from "../../scripts/log";

export default new Command({
  name: "timeout",
  description: "Timeout a member from the server",
  category: "Moderation",
  options: [
    {
      name: "member",
      description: "The member to ban",
      type: "USER",
      required: true
    },
    {
      name: "time",
      description: "The amount of time to ban the member",
      type: "STRING",
      required: true
    },
    {
      name: "reason",
      description: "The reason to ban the member",
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

    if (!member)
      return context.interaction.followUp({
        ephemeral: true,
        content: messages.missingMember
      });

    if (!member.moderatable)
      return context.interaction.followUp({
        ephemeral: true,
        content: `I cannot timeout this member!`
      });

    const time = ms(context.interaction.options.getString("time", true), {
      returnDate: false
    });

    const date = new Date(time + Date.now());

    if (time > 2419200000)
      return context.interaction.followUp({
        ephemeral: true,
        content: `The time you entered (${ms(time)}) is longer than 28 days.`
      });

    const reason =
      context.interaction.options.getString("reason", false) ||
      "No reason provided";

    const guild = context.guild;

    await log(
      context.client,
      "timeout",
      guild,
      reason,
      context.author,
      member.user,
      date,
      time
    );

    await member.timeout(time, reason);

    return context.interaction.followUp({
      ephemeral: true,
      content: `Successfully timed out ${member} (\`${member.user.tag}\`) (\`${
        member.id
      }\`) from \`${guild.name}\` for \`${ms(time, {
        unitTrailingSpace: true
      })}\``
    });
  }
});
