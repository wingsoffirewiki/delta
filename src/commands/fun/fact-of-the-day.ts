import { Command } from "@ferod/client";
import { getFactOfTheDay } from "../../util/fact-api";
import { Colors, PermissionFlagsBits, EmbedBuilder } from "discord.js";

export default new Command()
	.setName("fact-of-the-day")
	.setDescription("Gets the fact of the day")
	.setCategory("Fun")
	.setPermissions(PermissionFlagsBits.SendMessages)
	.setExecutor(async (client, interaction) => {
		await interaction.deferReply();

		const factOfTheDay = await getFactOfTheDay();
		if (factOfTheDay === undefined) {
			interaction.followUp("Failed to get fact of the day.");

			return;
		}

		const factText = factOfTheDay.text;
		const permalink = factOfTheDay.permalink;

		const embed = new EmbedBuilder()
			.setTitle("Delta: Fact of the Day")
			.setURL(permalink)
			.setColor(Colors.Blurple)
			.setDescription(
				`If this fact seems false, please refer to the [URL](${permalink}) to verify its sources.`
			)
			.addFields({
				name: "Fact of the Day",
				value: `\`${factText}\``
			})
			.setTimestamp()
			.setFooter({
				text: "Delta, The Wings of Fire Moderation Bot",
				iconURL: client.user.avatarURL() ?? undefined
			});
		interaction.followUp({
			embeds: [embed]
		});
	});
