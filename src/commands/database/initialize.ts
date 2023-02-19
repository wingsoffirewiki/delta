import { Command } from "fero-dc";
import { prisma } from "../../util/prisma-client";
import { PermissionFlagsBits } from "discord.js";

export default new Command()
	.setName("initialize")
	.setDescription("Initialize server settings for the database")
	.setCategory("Database")
	.setPermissions(PermissionFlagsBits.ManageGuild)
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
		if (guildModel !== null) {
			interaction.followUp({
				ephemeral: true,
				content: "This server has already been initialized."
			});

			return;
		}

		await prisma.guild.create({
			data: {
				id: guild.id,
				channelIds: {},
				roleIds: {},
				messageIds: {},
				emojis: {},
				features: {}
			}
		});

		await interaction.followUp({
			ephemeral: true,
			content: "Successfully initialized this server in the database."
		});
	});
