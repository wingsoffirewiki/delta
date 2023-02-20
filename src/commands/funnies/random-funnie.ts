import { Command } from "fero-dc";
import { prisma } from "../../util/prisma-client";
import { randomElement } from "../../util/random";
import { Colors, EmbedBuilder, PermissionFlagsBits } from "discord.js";
import { getFunnieReactionCounts } from "../../util/funnies";

export default new Command()
	.setName("random-funnie")
	.setDescription("Get a random funnie (starboard) from the database")
	.setCategory("Funnies")
	.setPermissions(PermissionFlagsBits.SendMessages)
	.setExecutor(async (client, interaction) => {
		await interaction.deferReply();

		const guild = interaction.guild;
		if (guild === null) {
			await interaction.followUp("This command can only be used in a server.");

			return;
		}
		const guildModel = await prisma.guild.findUnique({
			where: {
				id: guild.id
			}
		});
		if (guildModel === null) {
			await interaction.followUp("This server has not been initialized.");

			return;
		}
		if (!guildModel.features.funnies) {
			await interaction.followUp("Funnies are not enabled in this server.");

			return;
		}

		const funnieUpvoteEmoji = guildModel.emojis.funnieUpvote;
		const funnieModUpvoteEmoji = guildModel.emojis.funnieModUpvote;

		const funnies = await prisma.funnie.findMany({
			where: {
				guildId: guild.id
			}
		});
		if (funnies.length === 0) {
			await interaction.followUp("There are no funnies in this server.");

			return;
		}

		const funnie = randomElement(funnies);
		const funnieChannel = await guild.channels
			.fetch(funnie.channelId)
			.catch(() => null);
		if (funnieChannel === null || !funnieChannel.isTextBased()) {
			await interaction.followUp("Failed to get funnie channel.");

			return;
		}
		const funnieMessage = await funnieChannel.messages
			.fetch(funnie.id)
			.catch(() => null);
		if (funnieMessage === null) {
			await interaction.followUp("Failed to get funnie message.");

			return;
		}
		const funnieMember = funnieMessage.member;

		const [funnieUpvoteCount, funnieModUpvoteCount] =
			await getFunnieReactionCounts(guildModel, funnieMessage);

		const author = interaction.user;

		const embed = new EmbedBuilder()
			.setTitle(`${guild.name}: #${funnieChannel.name}`)
			.setDescription(
				`${funnieMessage.content ?? "No Content."}
        
        [Jump to Message](${funnieMessage.url})`
			)
			.setURL(funnieMessage.url)
			.setColor(funnieMember?.displayColor || Colors.Blurple)
			.setAuthor({
				name: funnieMember?.displayName ?? author.username,
				iconURL:
					funnieMember?.user.displayAvatarURL() ?? author.avatarURL() ?? ""
			})
			.addFields(
				{
					name: funnieUpvoteEmoji,
					value: funnieUpvoteCount.toString(),
					inline: true
				},
				{
					name: funnieModUpvoteEmoji,
					value: funnieModUpvoteCount.toString(),
					inline: true
				}
			)
			.setTimestamp(funnieMessage.createdAt)
			.setFooter({
				text: "Delta, The Wings of Fire Moderation Bot",
				iconURL: client.user.avatarURL() ?? ""
			});

		if (funnieMessage.attachments.size > 0) {
			const firstAttachment = funnieMessage.attachments.first();
			if (firstAttachment !== undefined) {
				embed.setImage(firstAttachment.url);
			}
		}

		await interaction.followUp({
			embeds: [embed]
		});
	});
