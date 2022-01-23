/** @format */

import { Command } from "fero-dc";
import { ms } from "fero-ms";
import messages from "../../config/messages.json";
import { log } from "../../scripts/log";

export default new Command({
  name: "tempban",
  description: "Bans a member from the server temporarily",
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
      description: "How long to ban the member for",
      type: "STRING",
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
      return context.interaction.reply({
        ephemeral: false,
        content: messages.missingPermissions
      });

    await context.interaction.deferReply({
      ephemeral: true,
      fetchReply: false
    });

    const user = context.interaction.options.getUser("member", true);

    const guild = context.guild;

    if (
      guild.members.cache.get(user.id) &&
      !guild.members.cache.get(user.id)?.bannable
    )
      return context.interaction.followUp({
        ephemeral: true,
        content: `I cannot ban this member!`
      });

    const time = ms(context.interaction.options.getString("time", true), {
      returnDate: false
    });

    const date = new Date(Date.now() + time);

    const reason =
      context.interaction.options.getString("reason", false) ||
      "No reason provided";

    const days =
      context.interaction.options.getBoolean("hardban", false) || false ? 7 : 0;

    await log(
      context.client,
      "tempban",
      guild,
      reason,
      context.author,
      user,
      date,
      time
    );

    const result = await guild.members.ban(user.id, { reason, days });

    if (result)
      return context.interaction.followUp({
        ephemeral: true,
        content: `Successfully banned ${user} (\`${user.tag}\`) (\`${user.id}\`) from \`${guild.name}\``
      });
    else
      return context.interaction.followUp({
        ephemeral: true,
        content: `Attempted banning ${user} (\`${user.tag}\`) (\`${user.id}\`) but unsure if it was successful.`
      });
  }
});
