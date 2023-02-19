import { EventListener } from "fero-dc";
import { prisma } from "../../util/prisma-client";
import { createFunnie, getFunnieReactionCounts } from "../../util/funnies";

export default new EventListener<"messageReactionAdd">()
	.setEvent("messageReactionAdd")
	.setHandler(async (client, reaction) => {
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

		const counts = await getFunnieReactionCounts(guildModel, message);
		const [upvoteCount, modUpvoteCount] = counts;

		const funnie = await prisma.funnie.findUnique({
			where: {
				id: message.id
			}
		});
		if (funnie !== null) {
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

			return;
		}

		const isEnough = upvoteCount >= 8 || modUpvoteCount >= 1;
		if (!isEnough) {
			return;
		}

		await createFunnie(client, guildModel, message, counts);
	});
