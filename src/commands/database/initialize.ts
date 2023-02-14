import { Command } from "fero-dc";
import { prisma } from "../../util/prisma-client";

export default new Command()
	.setName("initialize")
	.setDescription("Initialize server settings for the database")
	.setCategory("Database")
	.setRun(async (client, interaction) => {
		await interaction.deferReply({
			ephemeral: true
		});

		const guild = interaction.guild;
		if (guild === null) {
			await interaction.followUp({
				content: "This command can only be used in a server.",
				ephemeral: true
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
				content: "This server has already been initialized.",
				ephemeral: true
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
			content: "Successfully initialized this server in the database.",
			ephemeral: true
		});
	});
