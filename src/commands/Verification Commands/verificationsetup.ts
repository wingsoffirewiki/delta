import { Command } from "fero-dc";
import { prisma } from "../../db";
import messages from "../../config/messages.json";
import { MessageActionRow, MessageButton, MessageEmbed } from "discord.js";
import { MessageButtonStyles } from "discord.js/typings/enums";

const emojiID = "713458681538281502";

export default new Command({
  name: "verificationsetup",
  description: "Set up the verification message",
  category: "Verification",
  options: [
    {
      name: "role",
      description: "The role to give when the button is clicked",
      type: "ROLE",
      required: true
    }
  ],
  guildIDs: [],
  run: async (context) => {
    if (
      !context.interaction ||
      !context.guild ||
      !context.member ||
      !context.channel
    ) {
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
        roleIDs: true
      }
    });

    if (!guildModel) {
      return context.interaction.followUp({
        ephemeral: true,
        content: messages.databaseError
      });
    }

    if (
      !context.member.permissions.has("MANAGE_GUILD") &&
      !guildModel.roleIDs.mods.some((v) => context.member?.roles.cache.has(v))
    ) {
      return context.interaction.followUp({
        ephemeral: true,
        content: messages.missingPermissions
      });
    }

    const channel = context.channel;

    const role = context.interaction.options.getRole("role", true);

    const embed = new MessageEmbed();

    // setup embed
    embed
      .setTitle("Delta: Verification")
      .setColor("BLURPLE")
      .setDescription("Click the button below to verify!")
      .setTimestamp()
      .setFooter({
        text: "Delta, The Wings of Fire Moderation Bot",
        iconURL: context.client.user?.avatarURL({ dynamic: true }) || ""
      });

    const row = new MessageActionRow();

    const button = new MessageButton();

    button
      .setCustomId("verify")
      .setLabel("Verify!")
      .setStyle(MessageButtonStyles.PRIMARY)
      .setEmoji(emojiID);

    row.addComponents(button);

    const message = await channel.send({ embeds: [embed], components: [row] });

    await prisma.guild.update({
      where: {
        id: guild.id
      },
      data: {
        roleIDs: {
          update: {
            verified: role.id
          }
        },
        messages: {
          update: {
            verification: {
              set: {
                id: message.id,
                channelID: channel.id
              }
            }
          }
        }
      }
    });

    return context.interaction.followUp({
      ephemeral: true,
      content: "Created verification embed"
    });
  }
});
