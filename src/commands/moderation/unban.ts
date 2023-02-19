import { ApplicationCommandOptionType } from "discord.js";
import { Command } from "fero-dc";
import { isFeatureEnabled } from "../../util/features";
import { LogType } from "../../util/types";
import { log } from "../../util/logging";

export default new Command()
	.setName("unban")
	.setDescription("Unbans a user from the server.")
	.setCategory("Moderation")
	.setOptions(
		{
			name: "user",
			description: "The user to unban",
			type: ApplicationCommandOptionType.User,
			required: true
		},
		{
			name: "reason",
			description: "The reason for unbanning the user",
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
				content: "This command can only be used in a server"
			});

			return;
		}

		if (!(await isFeatureEnabled(guild, "moderation"))) {
			await interaction.followUp({
				ephemeral: true,
				content: "Moderation is not enabled in this server"
			});

			return;
		}

		const ban = await guild.bans.fetch(user).catch(() => null);
		if (ban === null) {
			await interaction.followUp({
				ephemeral: true,
				content: "This user is not banned"
			});

			return;
		}

		const result = await guild.members.unban(user, reason);
		if (result === null) {
			await interaction.followUp({
				ephemeral: true,
				content: "Failed to unban user"
			});

			return;
		}

		await log({
			client,
			type: LogType.Unban,
			guild,
			reason,
			moderator: author,
			args: [user]
		});

		await interaction.followUp({
			ephemeral: true,
			content: `Successfully unbanned ${user} (\`${user.tag}\`) (\`${user.id}\`) from \`${guild.name}\``
		});
	});
