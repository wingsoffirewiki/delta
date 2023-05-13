import { ApplicationCommandOptionType, PermissionFlagsBits } from "discord.js";
import { Command } from "@ferod/client";
import { isFeatureEnabled } from "../../util/features";

export default new Command()
	.setName("clear")
	.setDescription("Clears messages in the current channel")
	.setCategory("Moderation")
	.setPermissions(PermissionFlagsBits.ManageMessages)
	.setOptions({
		name: "amount",
		description: "The amount of messages to delete",
		type: ApplicationCommandOptionType.Integer,
		required: true,
		minValue: 1,
		maxValue: 100
	})
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

		if (!(await isFeatureEnabled(guild, "moderation"))) {
			await interaction.followUp({
				ephemeral: true,
				content: "Moderation is not enabled in this server."
			});

			return;
		}

		const amount = interaction.options.getInteger("amount", true);

		const channel = interaction.channel;
		if (channel === null || !channel.isTextBased() || channel.isDMBased()) {
			await interaction.followUp({
				ephemeral: true,
				content: "This command can only be used in a text channel."
			});

			return;
		}

		const messages = await channel.messages.fetch({
			limit: amount
		});

		const deletedMessages = await channel.bulkDelete(messages, true);

		await interaction.followUp({
			ephemeral: true,
			content: `Deleted ${deletedMessages.size} messages.`
		});
	});
