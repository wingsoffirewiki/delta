import { Client } from "fero-dc";
import { Guild, prisma } from "./prisma-client";
import {
	Collection,
	EmbedBuilder,
	GuildMember,
	Message,
	MessageReaction,
	PartialMessage
} from "discord.js";

type FunnieReactionCounts = [
	funnieUpvoteCount: number,
	funnieModUpvoteCount: number
];

interface ReactionFilter {
	(reaction: MessageReaction): boolean;
}

function filterReaction(emoji: string): ReactionFilter {
	return (reaction) =>
		emoji === reaction.emoji.id ||
		emoji === reaction.emoji.name ||
		emoji === reaction.emoji.toString();
}

export async function getFunnieReactionCounts(
	guildModel: Guild,
	message: Message<boolean> | PartialMessage
): Promise<FunnieReactionCounts> {
	const guild = message.guild;

	const modRoleIds = guildModel.roleIds.mods;
	const funnieModUpvoteEmoji = guildModel.emojis.funnieModUpvote;
	const funnieUpvoteEmoji = guildModel.emojis.funnieUpvote;

	const funnieUpvoteReaction = message.reactions.cache.find(
		filterReaction(funnieUpvoteEmoji)
	);
	const funnieModUpvoteReaction = message.reactions.cache.find(
		filterReaction(funnieModUpvoteEmoji)
	);

	const funnieModUpvoteUsers =
		(await funnieModUpvoteReaction?.users.fetch()) ?? new Collection();

	const funnieModUpvoteMembers = (
		await Promise.all(
			funnieModUpvoteUsers.map((user) =>
				guild?.members.fetch(user.id).catch(() => null)
			)
		)
	).filter((member): member is GuildMember => member !== null);

	const funnieModUpvoteMembersFiltered = funnieModUpvoteMembers.filter(
		(member) => modRoleIds.some((roleId) => member.roles.cache.has(roleId))
	);

	const funnieUpvoteCount = funnieUpvoteReaction?.count ?? 0;
	const funnieModUpvoteCount = funnieModUpvoteMembersFiltered.length;

	return [funnieUpvoteCount, funnieModUpvoteCount];
}

export async function createFunnie(
	client: Client<true>,
	guildModel: Guild,
	message: Message | PartialMessage,
	counts: FunnieReactionCounts
): Promise<void> {
	const channel = message.channel;
	const member = await message.member?.fetch();
	const guild = await message.guild?.fetch();
	if (guild === undefined || member === undefined) {
		return;
	}

	const funnieChannel = await guild.channels.fetch(
		guildModel.channelIds.funnies
	);
	if (funnieChannel === null || !funnieChannel.isTextBased()) {
		return;
	}

	const funnieUpvoteEmoji = guildModel.emojis.funnieUpvote;
	const funnieModUpvoteEmoji = guildModel.emojis.funnieModUpvote;
	const [funnieUpvoteCount, funnieModUpvoteCount] = counts;

	const embed = new EmbedBuilder()
		.setTitle(`${guild.name}: ${channel}`)
		.setDescription(`${message.content}\n\n[Jump to Message](${message.url})`)
		.setColor(member.displayColor)
		.setAuthor({
			name: member.user.tag,
			iconURL: member.displayAvatarURL()
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
		.setImage(message.attachments.first()?.url ?? null)
		.setTimestamp()
		.setFooter({
			text: "Delta, The Wings of Fire Moderation Bot",
			iconURL: client.user.avatarURL() ?? ""
		});

	const embedMessage = await funnieChannel.send({ embeds: [embed] });

	await prisma.funnie.create({
		data: {
			id: message.id,
			guildId: guild.id,
			channelId: channel.id,
			embedMessageId: embedMessage.id
		}
	});
}
