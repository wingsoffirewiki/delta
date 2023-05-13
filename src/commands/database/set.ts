import {
	ApplicationCommandOptionType,
	ChannelType,
	PermissionFlagsBits
} from "discord.js";
import { Command } from "@ferod/client";
import {
	type Channels,
	type Emojis,
	type Features,
	prisma
} from "../../util/prisma-client";

export default new Command()
	.setName("set")
	.setDescription("Set server settings in the database")
	.setCategory("Database")
	.setPermissions(PermissionFlagsBits.ManageGuild)
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
						},
						{
							name: "verification",
							value: "verification"
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
							name: "funnie-mod-upvote",
							value: "funnieModUpvote"
						},
						{
							name: "verification-button",
							value: "verificationButton"
						}
					]
				},
				{
					name: "emoji",
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
	.setExecutor(async (client, interaction) => {
		await interaction.deferReply({
			ephemeral: true
		});

		const guild = interaction.guild;
		if (guild === null) {
			await interaction.followUp({
				ephemeral: true,
				content: "This command can only be used in a server."
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
				ephemeral: true,
				content: "This server has not been initialized."
			});

			return;
		}

		const subcommand = interaction.options.getSubcommand(true);
		switch (subcommand) {
			case "channels": {
				const channelType = <keyof Channels>(
					interaction.options.getString("channel-type", true)
				);
				const channel = interaction.options.getChannel("channel", true);
				if (channel.type !== ChannelType.GuildText) {
					await interaction.followUp({
						ephemeral: true,
						content: "This channel is not a text channel."
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
					ephemeral: true,
					content: `Successfully set the \`${channelType}\` channel to <#${channel.id}>.`
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
					ephemeral: true,
					content: `Successfully added the \`${role.name}\` role to the list of moderator roles.`
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
						ephemeral: true,
						content: "This role is not a moderator role."
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
					ephemeral: true,
					content: `Successfully removed the \`${role.name}\` role from the list of moderator roles.`
				});

				break;
			}

			case "emojis": {
				const emojiType = <keyof Emojis>(
					interaction.options.getString("emoji-type", true)
				);
				const emoji = interaction.options.getString("emoji", true);
				const isGuildEmoji = await guild.emojis
					.fetch(emoji)
					.then(() => true)
					.catch(() => false);
				const isUnicodeEmoji = emoji.length === 1; // TODO: better unicode emoji detection
				if (!isGuildEmoji && !isUnicodeEmoji) {
					await interaction.followUp({
						ephemeral: true,
						content: "This is not a valid emoji."
					});

					return;
				}

				await prisma.guild.update({
					where: {
						id: guild.id
					},
					data: {
						emojis: {
							update: {
								[emojiType]: emoji
							}
						}
					}
				});

				await interaction.followUp({
					ephemeral: true,
					content: `Successfully set the \`${emojiType}\` emoji to ${emoji}.`
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
					ephemeral: true,
					content: `Successfully set the verified role to ${role.name}.`
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
					ephemeral: true,
					content: `Successfully set the \`${feature}\` feature to ${value}.`
				});

				break;
			}
		}
	});
