/** @format */

import { Command } from "fero-dc";
import messages from "../../config/messages.json";
import { log } from "../../scripts/log";
import { Guild, IGuild } from "../../models/Guild";

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

    const guildModel: IGuild = await Guild.findOne(
      { _id: guild.id },
      "features.moderation"
    );

    if (!guildModel.features.moderation)
      return context.interaction.followUp({
        ephemeral: true,
        content: "Moderation is not enabled in the database."
      });

    try {
      await guild.bans.fetch(user);
    } catch (err) {
      return context.interaction.followUp({
        ephemeral: true,
        content: "That user has not been banned!"
      });
    }

    await log(context.client, "unban", guild, reason, context.author, user);

    const result = await guild.members.unban(user.id, reason);

    if (result)
      return context.interaction.followUp({
        ephemeral: true,
        content: `Successfully unbanned ${user} (\`${user.tag}\`) (\`${user.id}\`) from \`${guild.name}\``
      });
    else
      return context.interaction.followUp({
        ephemeral: true,
        content: `Attempted unbanning ${user} (\`${user.tag}\`) (\`${user.id}\`) but unsure if it was successful.`
      });
  }
});
