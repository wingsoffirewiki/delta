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
				content: "Moderation is not enabled in this server"
			});

			return;
		}

		const member = await guild.members.fetch(user).catch(() => null);
		if (member !== null && !member.kickable) {
			await interaction.followUp({
				ephemeral: true,
				content: "I cannot kick this user."
			});

			return;
		}

		const message = await user
			.send(`You have been kicked from \`${guild.name}\`:\n\`${reason}\`.`)
			.catch((error) => console.log(error.message));

		const result = await guild.members.kick(user, reason);
		if (result === null) {
			await interaction.followUp({
				ephemeral: true,
				content: "Failed to kick user."
			});

			await message?.delete();

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

		await interaction.followUp({
			ephemeral: true,
			content: `Successfully kicked ${user} (\`${user.tag}\`) (\`${user.id}\`) from \`${guild.name}\`.`
		});
	});
