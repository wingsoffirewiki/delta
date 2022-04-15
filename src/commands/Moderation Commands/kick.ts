/** @format */

import { Command } from "fero-dc";
import messages from "../../config/messages.json";
import { log } from "../../scripts/log";
import { Guild, IGuild } from "../../models/Guild";

export default new Command({
  name: "kick",
  description: "Kicks a member from the server",
  category: "Moderation",
  options: [
    {
      name: "member",
      description: "The member to kick",
      type: "USER",
      required: true
    },
    {
      name: "reason",
      description: "The reason to kick the member",
      type: "STRING",
      required: false
    }
  ],
  guildIDs: [],
  run: async context => {
    if (!context.interaction || !context.guild || !context.member) return;

    await context.interaction.deferReply({
      ephemeral: true,
      fetchReply: false
    });

    const user = context.interaction.options.getUser("member", true);

    const guild = context.guild;

    const guildModel: IGuild = await Guild.findOne(
      { _id: guild.id },
      "features.moderation roleIDs.mods"
    );

    if (
      !context.member.permissions.has("KICK_MEMBERS") &&
      !guildModel.roleIDs.mods.some(v => context.member?.roles.cache.has(v))
    )
      return context.interaction.followUp({
        ephemeral: false,
        content: messages.missingPermissions
      });

    if (!guildModel.features.moderation)
      return context.interaction.followUp({
        ephemeral: true,
        content: "Moderation is not enabled in the database."
      });

    if (!guild.members.cache.get(user.id)?.kickable)
      return context.interaction.followUp({
        ephemeral: true,
        content: "I cannot kick this member!"
      });

    const reason =
      context.interaction.options.getString("reason", false) ||
      "No reason provided";

    await log(context.client, "kick", guild, reason, context.author, user);

    await user
      .send(`You have been kicked from \`${guild.name}\`:\n\`${reason}\``)
      .catch(console.log);

    const result = await guild.members.kick(user.id, reason);

    if (result)
      return context.interaction.followUp({
        ephemeral: true,
        content: `Successfully kicked ${user} (\`${user.tag}\`) (\`${user.id}\`) from \`${guild.name}\``
      });
    else
      return context.interaction.followUp({
        ephemeral: true,
        content: `Attempted kicking ${user} (\`${user.tag}\`) (\`${user.id}\`) but unsure if it was successful.`
      });
  }
});
