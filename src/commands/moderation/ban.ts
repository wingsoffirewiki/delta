import { ApplicationCommandOptionType } from "discord.js";
import { Command } from "fero-dc";
import { isFeatureEnabled } from "../../util/features";
import { log } from "../../util/logging";
import { LogType } from "../../util/types";
import { ms } from "fero-ms";

const SECONDS_IN_WEEK = 7 * 24 * 60 * 60;

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
			name: "duration",
			description: "The duration to ban the user for",
			type: ApplicationCommandOptionType.String,
			required: false
		},
		{
			name: "reason",
			description: "The reason for banning the user",
			type: ApplicationCommandOptionType.String,
			required: false
		},
		{
			name: "delete-messages",
			description: "Whether or not to delete messages from the user",
			type: ApplicationCommandOptionType.Boolean,
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
		const deleteMessages =
			interaction.options.getBoolean("delete-messages") ?? false;

		const durationString = interaction.options.getString("duration");
		const durationMilliseconds =
			durationString !== null
				? ms(durationString, { returnDate: false })
				: null;
		const durationLongString =
			durationMilliseconds !== null
				? ms(durationMilliseconds, {
						long: true,
						unitTrailingSpace: true,
						spacedOut: true
				  })
				: null;

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

		const durationAddition =
			durationLongString !== null ? ` for \`${durationLongString}\`` : "";
		const banMessage = `You have been banned from \`${guild.name}\`${durationAddition}:\n\`${reason}\``;

		const message = await user
			.send(banMessage)
			.catch((error) => console.log(error.message));

		const result = await guild.members.ban(user, {
			reason,
			deleteMessageSeconds: deleteMessages ? SECONDS_IN_WEEK : 0
		});
		if (result === null) {
			await interaction.followUp({
				content: "Failed to ban user",
				ephemeral: true
			});

			await message?.delete();

			return;
		}

		await log(
			durationMilliseconds === null
				? {
						client,
						type: LogType.Ban,
						guild,
						reason,
						moderator: author,
						args: [user]
				  }
				: {
						client,
						type: LogType.TemporaryBan,
						guild,
						reason,
						moderator: author,
						args: [user, durationMilliseconds]
				  }
		);

		let followUpMessage = `Successfully banned ${user} (\`${user.tag}\`) (\`${user.id}\`) from \`${guild.name}\``;
		if (durationLongString !== null) {
			followUpMessage += ` for \`${durationLongString}\``;
		}

		await interaction.followUp({
			content: followUpMessage,
			ephemeral: true
		});
	});
