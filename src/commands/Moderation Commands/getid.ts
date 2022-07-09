/** @format */

import { Command } from "fero-dc";
import messages from "../../config/messages.json";
import { prisma } from "../../db";

export default new Command({
  name: "getid",
  description: "Gets the ID of a user",
  category: "Moderation",
  options: [
    {
      name: "user",
      description: "The user to get the ID of",
      type: "USER",
      required: true
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

    const guild = context.guild;

    const guildModel = await prisma.guild.findUnique({
      where: { id: guild.id },
      select: {
        roleIDs: {
          select: {
            mods: true
          }
        }
      }
    });

    if (!guildModel) {
      return context.interaction.followUp({
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

    const user = context.interaction.options.getUser("user", true);

    return context.interaction.followUp({
      ephemeral: true,
      content: `ID for user ${user.tag} is: \`${user.id}\``
    });
  }
});
