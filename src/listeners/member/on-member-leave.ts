import { Colors, EmbedBuilder } from "discord.js";
import { EventListener } from "@ferod/client";
import { prisma } from "../../util/prisma-client";

export default new EventListener<"guildMemberRemove">()
	.setEvent("guildMemberRemove")
	.setHandler(async (client, member) => {
		const guild = member.guild;
		const guildModel = await prisma.guild.findUnique({
			where: {
				id: guild.id
			}
		});
		if (guildModel === null) {
			console.log("Guild not found in the database");

			return;
		}

		const logsChannel = guild.channels.cache.get(guildModel.channelIds.logs);
		if (
			logsChannel === undefined ||
			!logsChannel.isTextBased() ||
			!guildModel.features.logging
		) {
			return;
		}

		const embed = new EmbedBuilder()
			.setTitle("Delta: Member Left")
			.setColor(Colors.Red)
			.setDescription(`\`${member.user.username}\` has left \`${guild.name}\``)
			.setAuthor({
				name: `${member.user.tag} (${member.id})`,
				iconURL: member.user.avatarURL() ?? undefined
			})
			.setTimestamp()
			.setFooter({
				text: "Delta, The Wings of Fire Moderation Bot",
				iconURL: client.user.avatarURL() ?? undefined
			});
		logsChannel.send({ embeds: [embed] });
	});
