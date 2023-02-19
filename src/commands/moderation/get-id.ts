import { ApplicationCommandOptionType } from "discord.js";
import { Command } from "fero-dc";
import { isFeatureEnabled } from "../../util/features";

export default new Command()
	.setName("get-id")
	.setDescription("Gets the ID of a user")
	.setCategory("Moderation")
	.setOptions({
		name: "user",
		description: "The user to get the ID of",
		type: ApplicationCommandOptionType.User,
		required: true
	})
	.setRun(async (client, interaction) => {
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

		const user = interaction.options.getUser("user", true);

		await interaction.followUp({
			ephemeral: true,
			content: `The ID of ${user.tag} is \`${user.id}\`.`
		});
	});
