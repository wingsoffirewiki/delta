import {
  ApplicationCommandOptionType,
  ChannelType,
  PermissionFlagsBits
} from "discord.js";
import { Command } from "fero-dc";
import { Channels, Emojis, Features, prisma } from "../../util/prisma-client";

export default new Command()
  .setName("set")
  .setDescription("Set server settings in the database")
  .setCategory("Database")
  .setOptions(
    {
      name: "channels",
      description: "Set a channel in the database",
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: "channel-type",
          description: "The type of channel to set",
          type: ApplicationCommandOptionType.String,
          required: true,
          choices: [
            {
              name: "logs",
              value: "logs"
            },
            {
              name: "mod-logs",
              value: "modLogs"
            },
            {
              name: "admin-logs",
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
          description: "The channel to set",
          type: ApplicationCommandOptionType.Channel,
          required: true,
          channelTypes: [ChannelType.GuildText]
        }
      ]
    },
    {
      name: "add-mod-role",
      description: "Add a moderator role to the database",
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: "role",
          description: "The role to add",
          type: ApplicationCommandOptionType.Role,
          required: true
        }
      ]
    },
    {
      name: "remove-mod-role",
      description: "Remove a moderator role from the database",
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: "role",
          description: "The role to remove",
          type: ApplicationCommandOptionType.Role,
          required: true
        }
      ]
    },
    {
      name: "verified-role",
      description: "Set the verified role in the database",
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: "role",
          description: "The role to set",
          type: ApplicationCommandOptionType.Role,
          required: true
        }
      ]
    },
    {
      name: "emojis",
      description: "Set an emoji in the database",
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: "emoji-type",
          description: "The type of emoji to set",
          type: ApplicationCommandOptionType.String,
          required: true,
          choices: [
            {
              name: "funnie-upvote",
              value: "funnieUpvote"
            },
            {
              name: "funnie-downvote",
              value: "funnieDownvote"
            }
          ]
        },
        {
          name: "emoji-id",
          description: "The emoji to set",
          type: ApplicationCommandOptionType.String,
          required: true
        }
      ]
    },
    {
      name: "features",
      description: "Enable or disable features in the database",
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: "feature",
          description: "The feature to enable or disable",
          type: ApplicationCommandOptionType.String,
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
              name: "mod-logging",
              value: "modLogging"
            },
            {
              name: "admin-logging",
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
          description: "The value to set the feature to",
          type: ApplicationCommandOptionType.Boolean,
          required: true
        }
      ]
    }
  )
  .setRun(async (client, interaction) => {
    await interaction.deferReply({
      ephemeral: true,
      fetchReply: false
    });

    const guild = interaction.guild;
    if (guild === null) {
      await interaction.followUp({
        content: "This command can only be used in a server.",
        ephemeral: true
      });

      return;
    }

    const member = await guild.members
      .fetch(interaction.user.id)
      .catch(() => null);
    if (member === null) {
      await interaction.followUp({
        content: "Failed to get member.",
        ephemeral: true
      });

      return;
    }

    if (!member.permissions.has(PermissionFlagsBits.ManageGuild)) {
      await interaction.followUp({
        content: "You do not have permission to use this command.",
        ephemeral: true
      });

      return;
    }

    const guildModel = await prisma.guild.findUnique({
      where: {
        id: guild.id
      }
    });
    if (guildModel === null) {
      await interaction.followUp({
        content: "This server has not been initialized.",
        ephemeral: true
      });

      return;
    }

    const subCommand = interaction.options.getSubcommand();
    switch (subCommand) {
      case "channels": {
        const channelType = <keyof Channels>(
          interaction.options.getString("channel-type", true)
        );
        const channel = interaction.options.getChannel("channel", true);
        if (channel.type !== ChannelType.GuildText) {
          await interaction.followUp({
            content: "This channel is not a text channel.",
            ephemeral: true
          });

          return;
        }

        await prisma.guild.update({
          where: {
            id: guild.id
          },
          data: {
            channelIds: {
              update: {
                [channelType]: channel.id
              }
            }
          }
        });

        await interaction.followUp({
          content: `Successfully set the \`${channelType}\` channel
          to <#${channel.id}>.`,
          ephemeral: true
        });

        break;
      }

      case "add-mod-role": {
        const role = interaction.options.getRole("role", true);

        await prisma.guild.update({
          where: {
            id: guild.id
          },
          data: {
            roleIds: {
              update: {
                mods: {
                  push: role.id
                }
              }
            }
          }
        });

        await interaction.followUp({
          content: `Successfully added the \`${role.name}\` role
          to the list of moderator roles.`,
          ephemeral: true
        });

        break;
      }

      case "remove-mod-role": {
        const role = interaction.options.getRole("role", true);

        // prisma doesn't have a pull operator, so we have to do this instead
        const roleIds = guildModel.roleIds;
        const index = roleIds.mods.indexOf(role.id);
        if (index === -1) {
          await interaction.followUp({
            content: "This role is not a moderator role.",
            ephemeral: true
          });

          return;
        }

        roleIds.mods.splice(index, 1);

        await prisma.guild.update({
          where: {
            id: guild.id
          },
          data: {
            roleIds
          }
        });

        await interaction.followUp({
          content: `Successfully removed the \`${role.name}\` role
          from the list of moderator roles.`,
          ephemeral: true
        });

        break;
      }

      case "emojis": {
        const emojiType = <keyof Emojis>(
          interaction.options.getString("emoji-type", true)
        );
        const emojiId = interaction.options.getString("emoji-id", true);

        const emoji = await guild.emojis.fetch(emojiId).catch(() => null);
        if (emoji === null) {
          await interaction.followUp({
            content: "Failed to get emoji.",
            ephemeral: true
          });

          return;
        }

        await prisma.guild.update({
          where: {
            id: guild.id
          },
          data: {
            emojiIds: {
              update: {
                [emojiType]: emojiId
              }
            }
          }
        });

        await interaction.followUp({
          content: `Successfully set the \`${emojiType}\` emoji
          to ${emoji}.`,
          ephemeral: true
        });

        break;
      }

      case "verified-role": {
        const role = interaction.options.getRole("role", true);

        await prisma.guild.update({
          where: {
            id: guild.id
          },
          data: {
            roleIds: {
              update: {
                verified: role.id
              }
            }
          }
        });

        await interaction.followUp({
          content: `Successfully set the verified role to ${role.name}.`,
          ephemeral: true
        });

        break;
      }

      case "features": {
        const feature = <keyof Features>(
          interaction.options.getString("feature", true)
        );
        const value = interaction.options.getBoolean("value", true);

        await prisma.guild.update({
          where: {
            id: guild.id
          },
          data: {
            features: {
              update: {
                [feature]: value
              }
            }
          }
        });

        await interaction.followUp({
          content: `Successfully set the \`${feature}\` feature to ${value}.`,
          ephemeral: true
        });

        break;
      }
    }
  });
