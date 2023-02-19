import { ApplicationCommandOptionType } from "discord.js";
import { Command } from "fero-dc";
import { prisma } from "../../util/prisma-client";

export default new Command()
	.setName("update-reason")
	.setDescription("Update the reason of a log entry")
	.setCategory("Moderation")
	.setOptions(
		{
			name: "log-id",
			description: "The ID of the log entry",
			type: ApplicationCommandOptionType.Integer,
			required: true
		},
		{
			name: "reason",
			description: "The new reason",
			type: ApplicationCommandOptionType.String,
			required: true
		}
	)
	.setRun(async (client, interaction) => {
		await interaction.deferReply({
			ephemeral: true
		});

		const guild = interaction.guild;
		if (guild === null) {
			await interaction.followUp("This command can only be used in a server.");

			return;
		}
		const guildModel = await prisma.guild.findUnique({
			where: {
				id: guild.id
			}
		});
		if (guildModel === null) {
			await interaction.followUp(
				"This server is not initialized in the database."
			);

			return;
		}
		if (!guildModel.features.moderation) {
			await interaction.followUp({
				content: "Moderation is not enabled in this server",
				ephemeral: true
			});

			return;
		}

		const logId = interaction.options.getInteger("log-id", true);
		const reason = interaction.options.getString("reason", true);

		const logModel = await prisma.log.findFirst({
			where: {
				guildId: guild.id,
				logId
			}
		});
		if (logModel === null) {
			await interaction.followUp("That log entry does not exist.");

			return;
		}

		await prisma.log.update({
			where: {
				id: logModel.id
			},
			data: {
				reason
			}
		});

		const logsChannel = await guild.channels.fetch(guildModel.channelIds.logs);
		if (logsChannel === null || !logsChannel.isTextBased()) {
			await interaction.followUp(
				"The logs channel is not a text channel or does not exist."
			);

			return;
		}

		const logMessage = await logsChannel.messages.fetch(
			logModel.embedMessageId
		);
		if (logMessage === null) {
			await interaction.followUp("The log message does not exist.");

			return;
		}

		const embed = logMessage.embeds[0];
		const reasonFieldIndex = embed.fields.findIndex(
			(field) => field.name === "Reason"
		);
		if (reasonFieldIndex === -1) {
			await interaction.followUp(
				"The log message does not have a reason field."
			);

			return;
		}
		embed.fields[reasonFieldIndex].value = reason;

		await logMessage.edit({
			embeds: [embed]
		});

		await interaction.followUp("Updated the reason of that log entry.");
	});
