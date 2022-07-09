import { GuildMember } from "discord.js";
import { Command } from "fero-dc";
import { ms } from "fero-ms";
import messages from "../../config/messages.json";
import { log } from "../../scripts/log";
import { prisma } from "../../db";

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

    const member = context.interaction.options.getMember(
      "member",
      true
    ) as GuildMember;

    if (!member) {
      return context.interaction.followUp({
        ephemeral: true,
        content: messages.missingMember
      });
    }

    if (!member.moderatable) {
      return context.interaction.followUp({
        ephemeral: true,
        content: `I cannot timeout this member!`
      });
    }

    const time = ms(context.interaction.options.getString("time", true), {
      returnDate: false
    });

    const date = new Date(time + Date.now());

    if (time > 2419200000) {
      return context.interaction.followUp({
        ephemeral: true,
        content: `The time you entered (${ms(time)}) is longer than 28 days.`
      });
    }

    const reason =
      context.interaction.options.getString("reason", false) ||
      "No reason provided";

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

    await member
      .send(
        `You have been timed out from \`${guild.name}\` for \`${ms(time, {
          long: true,
          unitTrailingSpace: true,
          spacedOut: true
        })}\`:\n\`${reason}\``
      )
      .catch(console.log);

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
