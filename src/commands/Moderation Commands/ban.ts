/** @format */

import { Command } from "fero-dc";
import messages from "../../config/messages.json";
import { log } from "../../scripts/log";
import { Guild, IGuild } from "../../models/Guild";

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
  guildIDs: [],
  run: async (context) => {
    if (!context.interaction || !context.guild || !context.member) {
      return;
    }

    await context.interaction.deferReply({
      ephemeral: true,
      fetchReply: false
    });

    const user = context.interaction.options.getUser("member", true);

    const guild = context.guild;

    const guildModel: IGuild | null = await Guild.findOne(
      { _id: guild.id },
      "features.moderation roleIDs.mods"
    );

    if (!guildModel) {
      return context.interaction.reply({
        ephemeral: true,
        content: messages.databaseError
      });
    }

    if (
      !context.member.permissions.has("BAN_MEMBERS") &&
      !guildModel.roleIDs.mods.some((v) => context.member?.roles.cache.has(v))
    ) {
      return context.interaction.followUp({
        ephemeral: false,
        content: messages.missingPermissions
      });
    }

    if (!guildModel.features.moderation) {
      return context.interaction.followUp({
        ephemeral: true,
        content: "Moderation is not enabled in the database."
      });
    }

    if (
      guild.members.cache.get(user.id) &&
      !guild.members.cache.get(user.id)?.bannable
    ) {
      return context.interaction.followUp({
        ephemeral: true,
        content: "I cannot ban this member!"
      });
    }

    const reason =
      context.interaction.options.getString("reason", false) ||
      "No reason provided";

    const days =
      context.interaction.options.getBoolean("hardban", false) || false ? 7 : 0;

    await log(context.client, "ban", guild, reason, context.author, user);

    await user
      .send(
        `You have been permanently banned from \`${guild.name}\`:\n\`${reason}\``
      )
      .catch(console.log);

    const result = await guild.members.ban(user.id, { reason, days });

    if (result) {
      return context.interaction.followUp({
        ephemeral: true,
        content: `Successfully banned ${user} (\`${user.tag}\`) (\`${user.id}\`) from \`${guild.name}\``
      });
    } else {
      return context.interaction.followUp({
        ephemeral: true,
        content: `Attempted banning ${user} (\`${user.tag}\`) (\`${user.id}\`) but unsure if it was successful.`
      });
    }
  }
});
