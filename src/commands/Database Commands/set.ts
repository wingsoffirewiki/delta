import { Command } from "fero-dc";
import { Features, prisma } from "../../db";
import messages from "../../config/messages.json";

export default new Command({
  name: "set",
  description: "Set server data in the database",
  category: "Database",
  options: [
    {
      name: "channels",
      description: "Set a channel in the database",
      type: "SUB_COMMAND",
      options: [
        {
          name: "channel_type",
          description: "The type of channel to set",
          type: "STRING",
          required: true,
          choices: [
            {
              name: "logs",
              value: "logs"
            },
            {
              name: "mod_logs",
              value: "modLogs"
            },
            {
              name: "admin_logs",
              value: "adminLogs"
            },
            {
              name: "funnies",
              value: "funnies"
            }
          ]
        },
        {
          name: "channel",
          description: "The channel to set in the database",
          type: "CHANNEL",
          required: true,
          channelTypes: ["GUILD_TEXT"]
        }
      ]
    },
    {
      name: "add_mod_role",
      description: "Add a mod role to the database",
      type: "SUB_COMMAND",
      options: [
        {
          name: "role",
          description: "The role to add to the database",
          type: "ROLE",
          required: true
        }
      ]
    },
    {
      name: "remove_mod_role",
      description: "Remove a mod role from the database",
      type: "SUB_COMMAND",
      options: [
        {
          name: "role",
          description: "The role to remove from the database",
          type: "ROLE",
          required: true
        }
      ]
    },
    {
      name: "features",
      description: "Enable/Disable features in the database",
      type: "SUB_COMMAND",
      options: [
        {
          name: "feature_type",
          description: "The feature to set in the database",
          type: "STRING",
          required: true,
          choices: [
            {
              name: "scales",
              value: "scales"
            },
            {
              name: "logging",
              value: "logging"
            },
            {
              name: "mod_logging",
              value: "modLogging"
            },
            {
              name: "admin_logging",
              value: "adminLogging"
            },
            {
              name: "moderation",
              value: "moderation"
            },
            {
              name: "funnies",
              value: "funnies"
            }
          ]
        },
        {
          name: "value",
          description: "Whether to enable this feature or not",
          type: "BOOLEAN",
          required: true
        }
      ]
    }
  ],
  guildIDs: [],
  run: async (context) => {
    if (!context.interaction || !context.guild || !context.member) {
      return;
    }

    if (!context.member.permissions.has("MANAGE_GUILD")) {
      return context.interaction.reply({
        ephemeral: true,
        content: messages.missingPermissions
      });
    }

    await context.interaction.deferReply({
      ephemeral: true,
      fetchReply: false
    });

    const guild = context.guild;

    const subCommand = context.interaction.options.getSubcommand(true);

    switch (subCommand) {
      case "channels": {
        const channelType = context.interaction.options.getString(
          "channel_type",
          true
        );

        const channel = context.interaction.options.getChannel("channel", true);

        const channelIDs: { [key: string]: string } = {};

        channelIDs[`channelIDs.${channelType}`] = channel.id;

        await prisma.guild.update({
          where: {
            id: guild.id
          },
          data: {
            channelIDs
          }
        });

        context.interaction.followUp({
          ephemeral: true,
          content: `Successfully updated the \`${channelType}\` to ${channel}.`
        });

        break;
      }

      case "add_mod_role": {
        const addRole = context.interaction.options.getRole("role", true);

        await prisma.guild.update({
          where: {
            id: guild.id
          },
          data: {
            roleIDs: {
              update: {
                mods: {
                  push: addRole.id
                }
              }
            }
          }
        });

        context.interaction.followUp({
          ephemeral: true,
          content: `Successfully added ${addRole} to mod roles.`
        });

        break;
      }

      case "remove_mod_role": {
        const removeRole = context.interaction.options.getRole("role", true);

        const fetchedGuild = await prisma.guild.findUnique({
          where: {
            id: guild.id
          }
        });

        if (!fetchedGuild) {
          return context.interaction.reply({
            ephemeral: true,
            content: messages.missingPermissions
          });
        }

        const newRoles = fetchedGuild.roleIDs.mods.filter(
          (roleID) => roleID !== removeRole.id
        );

        await prisma.guild.update({
          where: {
            id: guild.id
          },
          data: {
            roleIDs: {
              update: {
                mods: {
                  set: newRoles
                }
              }
            }
          }
        });

        context.interaction.followUp({
          ephemeral: true,
          content: `Successfully removed ${removeRole} from mod roles.`
        });

        break;
      }

      case "features": {
        const featureType = context.interaction.options.getString(
          "feature_type",
          true
        ) as keyof Features;

        const value = context.interaction.options.getBoolean("value", true);

        const features: Partial<Features> = {};

        features[featureType] = value;

        await prisma.guild.update({
          where: {
            id: guild.id
          },
          data: {
            features
          }
        });

        context.interaction.followUp({
          ephemeral: true,
          content: `Successfully updated the \`${featureType}\` feature to \`${value}\`.`
        });

        break;
      }
    }
  }
});
