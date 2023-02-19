import { ApplicationCommandOptionType } from "discord.js";
import { Command } from "fero-dc";
import { ms } from "fero-ms";
import { isFeatureEnabled } from "../../util/features";
import { log } from "../../util/logging";
import { LogType } from "../../util/types";

const TWO_WEEKS = 14 * 24 * 60 * 60 * 1000;

export default new Command()
	.setName("timeout")
	.setDescription("Timeout a user")
	.setCategory("Moderation")
	.setOptions(
		{
			name: "user",
			description: "The user to timeout",
			type: ApplicationCommandOptionType.User,
			required: true
		},
		{
			name: "duration",
			description: "The duration of the timeout",
			type: ApplicationCommandOptionType.String,
			required: true
		},
		{
			name: "reason",
			description: "The reason for the timeout",
			type: ApplicationCommandOptionType.String,
			required: false
		}
	)
	.setRun(async (client, interaction) => {
		await interaction.deferReply({
			ephemeral: true
		});

		const author = interaction.user;

		const guild = interaction.guild;
		if (guild === null) {
			await interaction.followUp({
				content: "This command can only be used in a server.",
				ephemeral: true
			});

			return;
		}

		const user = interaction.options.getUser("user", true);
		const member = await guild.members.fetch(user.id);
		if (member === null) {
			await interaction.followUp({
				content: "The user is not in this server",
				ephemeral: true
			});

			return;
		}
		if (!member.moderatable) {
			await interaction.followUp({
				content: "I cannot timeout this user",
				ephemeral: true
			});

			return;
		}

		const durationString = interaction.options.getString("duration", true);
		const durationMilliseconds = ms(durationString, { returnDate: false });

		const reason =
			interaction.options.getString("reason") || "No reason provided";

		if (!(await isFeatureEnabled(guild, "moderation"))) {
			await interaction.followUp({
				content: "Moderation is not enabled in this server",
				ephemeral: true
			});

			return;
		}

		if (durationMilliseconds > TWO_WEEKS) {
			await interaction.followUp({
				content: "You cannot timeout a user for more than two weeks",
				ephemeral: true
			});

			return;
		}

		await log({
			client,
			type: LogType.Timeout,
			guild,
			reason,
			args: [user, durationMilliseconds],
			moderator: author
		});

		const formattedDuration = ms(durationMilliseconds, {
			long: true,
			unitTrailingSpace: true,
			spacedOut: true
		});

		await member
			.send(
				`You have been timed out from \`${guild.name}\` for \`${formattedDuration}\`:\n\`${reason}\``
			)
			.catch((error) => console.log(error.message));

		await member.timeout(durationMilliseconds, reason);

		await interaction.followUp(
			`Successfully timed out ${member} (\`${user.tag}\`) (\`${user.id}\`) from \`${guild.name}\` for \`${formattedDuration}\``
		);
	});
