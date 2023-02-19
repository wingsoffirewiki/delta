import { ApplicationCommandOptionType } from "discord.js";
import { Command } from "fero-dc";
import { isFeatureEnabled } from "../../util/features";
import { log } from "../../util/logging";
import { LogType } from "../../util/types";

export default new Command()
	.setName("warn")
	.setDescription("Warns a user")
	.setCategory("Moderation")
	.setOptions(
		{
			name: "user",
			description: "The user to warn",
			type: ApplicationCommandOptionType.User,
			required: true
		},
		{
			name: "reason",
			description: "The reason for the warning",
			type: ApplicationCommandOptionType.String,
			required: false
		}
	)
	.setRun(async (client, interaction) => {
		await interaction.deferReply({
			ephemeral: true
		});

		const author = interaction.user;

		const user = interaction.options.getUser("user", true);
		const reason =
			interaction.options.getString("reason") || "No reason provided";

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

		await log({
			client,
			type: LogType.Warn,
			guild,
			reason,
			moderator: author,
			args: [user]
		});

		await user
			.send(`You have been warned in \`${guild.name}\`:\n\`${reason}\`.`)
			.catch((error) => console.log(error.message));

		await interaction.followUp({
			ephemeral: true,
			content: `Successfully warned ${user} (\`${user.tag}\`) (\`${user.id}\`).`
		});
	});
