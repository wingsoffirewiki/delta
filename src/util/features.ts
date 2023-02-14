import { Features, prisma } from "./prisma-client";
import { Guild } from "discord.js";

export async function isFeatureEnabled(
	guild: Guild,
	feature: keyof Features
): Promise<boolean> {
	const guildModel = await prisma.guild.findFirst({
		where: {
			id: guild.id
		},
		select: {
			features: true
		}
	});

	return guildModel?.features[feature] ?? false;
}
