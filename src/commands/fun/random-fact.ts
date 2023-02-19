import { Command } from "fero-dc";
import { getRandomFact } from "../../util/fact-api";
import { Colors, EmbedBuilder } from "discord.js";

export default new Command()
	.setName("random-fact")
	.setDescription("Gets a random fact")
	.setCategory("Fun")
	.setRun(async (client, interaction) => {
		await interaction.deferReply();

		const randomFact = await getRandomFact();
		if (randomFact === undefined) {
			interaction.followUp("Failed to get random fact");

			return;
		}

		const factText = randomFact.text;
		const permalink = randomFact.permalink;

		const embed = new EmbedBuilder()
			.setTitle("Delta: Random Fact")
			.setURL(permalink)
			.setColor(Colors.Blurple)
			.setDescription(
				`If this fact seems false, please refer to the [URL](${permalink}) to verify its sources.`
			)
			.addFields({
				name: "Random Fact",
				value: `\`${factText}\``
			})
			.setTimestamp()
			.setFooter({
				text: "Delta, The Wings of Fire Moderation Bot",
				iconURL: client.user.avatarURL() ?? ""
			});
		interaction.followUp({
			embeds: [embed]
		});
	});
