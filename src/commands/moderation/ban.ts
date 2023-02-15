import { ApplicationCommandOptionType } from "discord.js";
import { Command } from "fero-dc";
import { isFeatureEnabled } from "../../util/features";
import { log } from "../../util/logging";
import { LogType } from "../../util/types";

const SECONDS_IN_DAY = 24 * 60 * 60;

export default new Command()
	.setName("ban")
	.setDescription("Bans a user from the server.")
	.setCategory("Moderation")
	.setOptions(
		{
			name: "user",
			description: "The user to ban",
			type: ApplicationCommandOptionType.User,
			required: true
		},
		{
			name: "reason",
			description: "The reason for banning the user",
			type: ApplicationCommandOptionType.String,
			required: false
		},
		{
			name: "days",
			description: "The number of days of messages to delete",
			type: ApplicationCommandOptionType.Integer,
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
		const days = interaction.options.getInteger("days") ?? 0;

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
		if (member !== null && !member.bannable) {
			await interaction.followUp({
				content: "I cannot ban this user",
				ephemeral: true
			});

			return;
		}

		const ban = await guild.bans.fetch(user).catch(() => null);
		if (ban !== null) {
			await interaction.followUp({
				content: "This user is already banned",
				ephemeral: true
			});

			return;
		}

		const result = await guild.members.ban(user, {
			reason,
			deleteMessageSeconds: days * SECONDS_IN_DAY
		});
		if (result === null) {
			await interaction.followUp({
				content: "Failed to ban user",
				ephemeral: true
			});

			return;
		}

		await log({
			client,
			type: LogType.Ban,
			guild,
			reason,
			moderator: author,
			args: [user]
		});

		await user
			.send(`You have been banned from \`${guild.name}\`:\n\`${reason}\``)
			.catch((error) => console.log(error.message));

		await interaction.followUp({
			content: `Successfully banned ${user} (\`${user.tag}\`) (\`${user.id}\`) from \`${guild.name}\``,
			ephemeral: true
		});
	});
