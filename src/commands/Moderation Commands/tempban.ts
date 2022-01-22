/** @format */

import { Command } from "fero-dc";
import { ms } from "fero-ms";

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
    if (!context.interaction || !context.guild) return;

    const user = context.interaction.options.getUser("member", true);

    const time = ms(context.interaction.options.getString("time", true), {
      returnDate: false
    });

    const reason =
      context.interaction.options.getString("reason", false) ||
      "No reason provided";

    const days =
      context.interaction.options.getBoolean("hardban", false) || false ? 7 : 0;

    const guild = context.guild;

    // TODO: perform logging
    console.log(time);

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
