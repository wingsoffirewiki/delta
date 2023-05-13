import { Command } from "@ferod/client";
import { prisma } from "../../util/prisma-client";
import { ApplicationCommandOptionType, PermissionFlagsBits } from "discord.js";

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
	.setPermissions(PermissionFlagsBits.SendMessages)
	.setExecutor(async (client, interaction) => {
		await interaction.deferReply();

		const guild = interaction.guild;
		if (guild === null) {
			return;
		}

		const enablePayments = interaction.options.getBoolean("value", true);

		const author = interaction.user;
		const authorModel = await prisma.user.update({
			where: {
				id: author.id
			},
			data: {
				enablePayments
			}
		});
		if (authorModel === null) {
			await interaction.followUp(
				"An error occurred while updating your user model."
			);

			return;
		}

		await interaction.followUp(
			`Successfully updated enablePayments to \`${enablePayments}\`.`
		);
	});
