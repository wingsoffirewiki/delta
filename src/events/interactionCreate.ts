/** @format */

import { Event } from "fero-dc";
import { prisma } from "../db";

export default {
  event: "interactionCreate",
  run: async (client, interaction) => {
    if (interaction.isButton()) {
      try {
        const guild = interaction.guild;

        if (!guild || !["verify"].includes(interaction.customId)) {
          return;
        }

        const guildModel = await prisma.guild.findUnique({
          where: {
            id: guild.id
          }
        });

        if (interaction.customId === "verify") {
          if (!guildModel || !guildModel.messages?.verification) {
            return;
          }

          const verificationMessage = guildModel.messages.verification;

          if (
            interaction.channelId !== verificationMessage.channelID ||
            interaction.message.id !== verificationMessage.id
          ) {
            return;
          }

          const roleID = guildModel.roleIDs.verified;

          if (!roleID) {
            return;
          }

          const role = await guild.roles.fetch(roleID, {
            cache: true,
            force: true
          });

          const member = await guild.members.fetch(interaction.user.id);

          if (!role || !member) {
            return;
          }

          if (member.roles.cache.has(role.id)) {
            return interaction.reply({
              ephemeral: true,
              content: "You are already verified!"
            });
          }

          member.roles.add(role).catch(console.log);

          interaction.reply({
            ephemeral: true,
            content: "Successfully Verified!"
          });
        }
      } catch (err) {
        console.log(err);
      }
    }

    if (!interaction.isCommand()) {
      return;
    }

    const context = await client.getContext(interaction);

    if (!context.guild || !context.member) {
      return interaction.reply("You cannot use commands outside of a server!");
    }

    const command = client.commands.get(context.command);

    if (command) {
      command.run(context);
    } else {
      interaction.reply({
        ephemeral: true,
        fetchReply: false,
        content: `Command ${context.command} does not exist on this bot!`
      });
    }
  }
} as Event<"interactionCreate">;
