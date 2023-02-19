import { EventListener } from "fero-dc";
import { getFunnieReactionCounts } from "../../util/funnies";
import { prisma } from "../../util/prisma-client";

export default new EventListener<"messageReactionRemove">()
	.setEvent("messageReactionRemove")
	.setListener(async (client, reaction) => {
		const message = reaction.message;
		const guild = message.guild;
		if (guild === null) {
			return;
		}
		const guildModel = await prisma.guild.findUnique({
			where: {
				id: guild.id
			}
		});
		if (guildModel === null) {
			return;
		}

		const emoji = reaction.emoji.toString();
		const funnieUpvoteEmoji = guildModel.emojis.funnieUpvote;
		const funnieModUpvoteEmoji = guildModel.emojis.funnieModUpvote;
		if (emoji !== funnieUpvoteEmoji && emoji !== funnieModUpvoteEmoji) {
			return;
		}

		const [upvoteCount, modUpvoteCount] = await getFunnieReactionCounts(
			guildModel,
			message
		);

		const funnie = await prisma.funnie.findUnique({
			where: {
				id: message.id
			}
		});
		if (funnie === null) {
			return;
		}

		const funnieChannel = await guild.channels.fetch(
			guildModel.channelIds.funnies
		);
		if (funnieChannel === null || !funnieChannel.isTextBased()) {
			return;
		}

		const embedMessage = await funnieChannel.messages.fetch(
			funnie.embedMessageId
		);

		const embed = embedMessage.embeds[0];
		const upvoteField = embed.fields.find(
			(field) => field.name === funnieUpvoteEmoji
		);
		const upvoteModField = embed.fields.find(
			(field) => field.name === funnieModUpvoteEmoji
		);

		if (upvoteField !== undefined) {
			upvoteField.value = upvoteCount.toString();
		}
		if (upvoteModField !== undefined) {
			upvoteModField.value = modUpvoteCount.toString();
		}

		await embedMessage.edit({ embeds: [embed] });
	});
