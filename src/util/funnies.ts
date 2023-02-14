import { Guild } from "./prisma-client";
import { Collection, GuildMember, Message } from "discord.js";

export async function getFunnieReactionCounts(
	guildModel: Guild,
	message: Message<true>
): Promise<[funnieUpvoteCount: number, funnieModUpvoteCount: number]> {
	const guild = message.guild;

	const modRoleIds = guildModel.roleIds.mods;
	const funnieModUpvoteEmoji = guildModel.emojis.funnieModUpvote;
	const funnieUpvoteEmoji = guildModel.emojis.funnieUpvote;

	const funnieUpvoteReaction = message.reactions.cache.get(funnieUpvoteEmoji);
	const funnieModUpvoteReaction =
		message.reactions.cache.get(funnieModUpvoteEmoji);

	const funnieModUpvoteUsers =
		(await funnieModUpvoteReaction?.users.fetch()) ?? new Collection();

	const funnieModUpvoteMembers = (
		await Promise.all(
			funnieModUpvoteUsers.map((user) =>
				guild.members.fetch(user.id).catch(() => null)
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
