import {
	ActivityType,
	ApplicationCommandOptionType,
	Colors,
	EmbedBuilder,
	EmbedField
} from "discord.js";
import { Command } from "fero-dc";
import { toPascalCase } from "../../util/strings";

export default new Command()
	.setName("info")
	.setDescription("Gets information of a user")
	.setCategory("Utility")
	.setOptions({
		name: "user",
		description: "The user to get information of",
		type: ApplicationCommandOptionType.User,
		required: false
	})
	.setRun(async (client, interaction) => {
		await interaction.deferReply();

		const guild = interaction.guild;
		if (guild === null) {
			await interaction.followUp("This command can only be used in a server");

			return;
		}

		const author = interaction.user;
		const user = interaction.options.getUser("user") ?? author;

		const member = await guild.members.fetch(user.id).catch(() => null);
		if (member === null) {
			await interaction.followUp("Failed to get member");

			return;
		}

		const clientStatus = member.presence?.clientStatus ?? undefined;
		const statuses = [];
		if (clientStatus?.desktop !== undefined) {
			statuses.push(`Desktop: \`${toPascalCase(clientStatus.desktop)}\``);
		}
		if (clientStatus?.mobile !== undefined) {
			statuses.push(`Mobile: \`${toPascalCase(clientStatus.mobile)}\``);
		}
		if (clientStatus?.web !== undefined) {
			statuses.push(
				`${user.bot ? "Bot Portal" : "Web"}: \`${toPascalCase(
					clientStatus.web
				)}\``
			);
		}

		const presences: EmbedField[] =
			member.presence?.activities.map((activity) => {
				switch (activity.type) {
					case ActivityType.Custom:
						return {
							name: "Custom Status",
							value: activity.state ?? "No status set",
							inline: true
						};

					case ActivityType.Listening:
						return {
							name: "Listening to a Song",
							value: `__${activity.details}__\nby ***${activity.state}***`,
							inline: true
						};

					default:
						return {
							name: `${toPascalCase(ActivityType[activity.type])} ${
								activity.name
							}`,
							value: [
								`Details: \`${activity.details ?? "None"}\``,
								`State: \`${activity.state ?? "None"}\``,
								`Time Start: \`${
									activity.timestamps?.start?.toUTCString() ?? "None"
								}\``,
								`Time End: \`${
									activity.timestamps?.end?.toUTCString() ?? "None"
								}\``
							].join("\n"),
							inline: true
						};
				}
			}) ?? [];

		const embed = new EmbedBuilder()
			.setTitle("Delta: User Information")
			.setDescription(
				[
					`ID: \`${member.id}\``,
					`Username: \`${user.username}\``,
					`Tag: \`#${user.discriminator}\``,
					`Nickname: \`${member.nickname ?? "None"}\``
				].join("\n")
			)
			.setColor(member.displayColor || Colors.Blurple)
			.setAuthor({
				name: author.username,
				iconURL: author.avatarURL() ?? ""
			})
			.setThumbnail(user.avatarURL() ?? "")
			.addFields(
				{
					name: "Account Creation Date",
					value: user.createdAt.toUTCString(),
					inline: true
				},
				{
					name: "In Server Since",
					value: member.joinedAt?.toUTCString() ?? "Unknown",
					inline: true
				},
				{
					name: "Server Booster Since",
					value: member.premiumSince?.toUTCString() ?? "Not a booster",
					inline: true
				},
				{
					name: "Status",
					value: toPascalCase(member.presence?.status ?? "Offline"),
					inline: true
				},
				{
					name: "Devices",
					value: statuses.join("\n") || "None",
					inline: true
				},
				...presences
			)
			.setTimestamp()
			.setFooter({
				text: "Delta, The Wings of Fire Moderation Bot",
				iconURL: client.user.avatarURL() ?? ""
			});

		await interaction.followUp({
			embeds: [embed]
		});
	});
