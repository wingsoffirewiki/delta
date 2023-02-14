import { Command } from "fero-dc";
import { prisma } from "../../util/prisma-client";
import { ApplicationCommandOptionType } from "discord.js";

export default new Command()
	.setName("enable-payments")
	.setDescription(
		"Set whether or not you want to be able to receive payments from other users"
	)
	.setCategory("Scales")
	.setOptions({
		name: "value",
		description: "Set the enablePayments property of your user model",
		type: ApplicationCommandOptionType.Boolean,
		required: true
	})
	.setRun(async (client, interaction) => {
		await interaction.deferReply();

		const guild = interaction.guild;
		if (guild === null) {
			return;
		}

		const enablePayments = interaction.options.getBoolean("value", true);

		const authorId = interaction.user.id;
		const authorModel = await prisma.user.update({
			where: {
				id: authorId
			},
			data: {
				enablePayments
			}
		});
		if (authorModel === null) {
			await interaction.followUp({
				content: "An error occurred while updating your user model"
			});

			return;
		}

		await interaction.followUp({
			content: `Successfully updated enablePayments to \`${enablePayments}\``
		});
	});
