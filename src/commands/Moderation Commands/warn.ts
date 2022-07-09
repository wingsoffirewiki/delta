import { Command } from "fero-dc";
import { log } from "../../scripts/log";
import messages from "../../config/messages.json";
import { prisma } from "../../db";

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
  guildIDs: [],
  run: async (context) => {
    if (!context.interaction || !context.guild || !context.member) {
      return;
    }

    await context.interaction.deferReply({
      ephemeral: true,
      fetchReply: false
    });

    const user = context.interaction.options.getUser("user", true);

    const guild = context.guild;

    const guildModel = await prisma.guild.findUnique({
      where: {
        id: guild.id
      },
      select: {
        features: {
          select: {
            moderation: true
          }
        },
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
      !context.member.permissions.has("MODERATE_MEMBERS") &&
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

    const reason =
      context.interaction.options.getString("reason", false) ||
      "No reason provided";

    if (!user) {
      return context.interaction.followUp({
        ephemeral: true,
        content: messages.missingMember
      });
    }

    await log(context.client, "warn", guild, reason, context.author, user);

    await user
      .send(`You have warned in \`${guild.name}\`:\n\`${reason}\``)
      .catch(console.log);

    return context.interaction.followUp({
      ephemeral: true,
      content: `Successfully warned ${user} (\`${user.tag}\`) (\`${user.id}\`)`
    });
  }
});
