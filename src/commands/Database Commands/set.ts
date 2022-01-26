/** @format */

import { Command } from "fero-dc";
import { Guild } from "../../models/Guild";

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
          name: "feature",
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
  guildIDs: ["759068727047225384"],
  run: async context => {
    if (!context.interaction || !context.guild) return;

    await context.interaction.deferReply({
      ephemeral: true,
      fetchReply: false
    });

    const guild = context.guild;

    const subCommand = context.interaction.options.getSubcommand(true);

    switch (subCommand) {
      case "channels":
        const channelType = context.interaction.options.getString(
          "channel_type",
          true
        );

        const channel = context.interaction.options.getChannel("channel", true);

        const channelIDs: { [key: string]: string } = {};

        channelIDs[channelType] = channel.id;

        await Guild.findOneAndUpdate(
          { _id: guild.id },
          { channelIDs },
          { upsert: true }
        ).exec();

        break;

      case "add_mod_role":
        const addRole = context.interaction.options.getRole("role", true);

        await Guild.findOneAndUpdate(
          { _id: guild.id },
          { $push: { roleIDs: { mods: addRole } } },
          { upsert: true }
        ).exec();

        break;

      case "remove_mod_role":
        const removeRole = context.interaction.options.getRole("role", true);

        await Guild.findOneAndUpdate(
          { _id: guild.id },
          { $pull: { roleIDs: { mods: removeRole } } },
          { upsert: true }
        ).exec();

        break;

      case "features":
        const featureType = context.interaction.options.getString(
          "feature_type",
          true
        );

        const value = context.interaction.options.getBoolean("value", true);

        const features: { [key: string]: boolean } = {};

        features[featureType] = value;

        await Guild.findOneAndUpdate(
          { _id: guild.id },
          { features },
          { upsert: true }
        );

        break;
    }
  }
});
