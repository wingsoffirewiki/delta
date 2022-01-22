/** @format */

import { Command } from "fero-dc";
import { ms } from "fero-ms";

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
      return context.interaction.followUp(
        "You do not have the correct permissions to run this command!"
      );

    const user = context.interaction.options.getUser("member", true);

    const member = context.guild.members.cache.get(user.id);

    if (!member)
      return context.interaction.followUp(
        "The member you provided is not a part of this server!"
      );

    const time = ms(context.interaction.options.getString("time", true), {
      returnDate: false
    });

    if (time > 2419200000)
      return context.interaction.followUp(
        `The time you entered (${ms(time)}) is longer than 28 days.`
      );

    const reason =
      context.interaction.options.getString("reason", false) ||
      "No reason provided";

    const guild = context.guild;

    // TODO: perform logging
    console.log(time);

    await member.timeout(time, reason);

    return context.interaction.followUp(
      `Successfully timed out ${user} (\`${user.tag}\`) (\`${
        user.id
      }\`) from \`${guild.name}\` for \`${ms(time, {
        unitTrailingSpace: true
      })}\``
    );
  }
});
