import { ApplicationCommandOptionType } from "discord.js";
import { Command } from "fero-dc";
import { isFeatureEnabled } from "../../util/features";
import { log } from "../../util/logging";
import { LogType } from "../../util/types";

export default new Command()
	.setName("kick")
	.setDescription("Kick a user from the server")
	.setCategory("Moderation")
	.setOptions(
		{
			name: "user",
			description: "The user to kick",
			type: ApplicationCommandOptionType.User,
			required: true
		},
		{
			name: "reason",
			description: "The reason for kicking the user",
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
			interaction.options.getString("reason") ?? "No reason provided";

		const guild = interaction.guild;
		if (guild === null) {
			await interaction.followUp({
				content: "This command can only be used in a server",
				ephemeral: true
			});

			return;
		}

		if (!(await isFeatureEnabled(guild, "moderation"))) {
			await interaction.followUp({
				content: "Moderation is not enabled in this server",
				ephemeral: true
			});

			return;
		}

		const member = await guild.members.fetch(user).catch(() => null);
		if (member !== null && !member.kickable) {
			await interaction.followUp({
				content: "I cannot kick this user",
				ephemeral: true
			});

			return;
		}

		const result = await guild.members.kick(user, reason);
		if (result === null) {
			await interaction.followUp({
				content: "Failed to kick user",
				ephemeral: true
			});

			return;
		}

		await log({
			client,
			type: LogType.Kick,
			guild,
			reason,
			moderator: author,
			args: [user]
		});

		await user
			.send(`You have been kicked from \`${guild.name}\`:\n\`${reason}\``)
			.catch((error) => console.log(error.message));

		await interaction.followUp({
			content: `Successfully kicked ${user} (\`${user.tag}\`) (\`${user.id}\`) from \`${guild.name}\``,
			ephemeral: true
		});
	});
