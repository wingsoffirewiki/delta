import { EventListener } from "@ferod/client";
import messages from "../../config/messages.json" assert { type: "json" };
import { prisma } from "../../util/prisma-client";
import { Colors, EmbedBuilder } from "discord.js";
import { randomElement } from "../../util/random";

const tribes = [
	"SkyWing",
	"MudWing",
	"RainWing",
	"SandWing",
	"IceWing",
	"NightWing",
	"SeaWing",
	"SilkWing",
	"HiveWing",
	"LeafWing"
];

export default new EventListener<"guildMemberAdd">()
	.setEvent("guildMemberAdd")
	.setHandler(async (client, member) => {
		const guild = member.guild;

		member.send(messages.welcome).catch((error) => console.log(error.message));

		const username = member.user.username.toLowerCase();

		const tribe =
			tribes.find((tribe) => username.includes(tribe.toLowerCase())) ??
			randomElement(tribes);

		const welcomeMessages = [
			`Everyone welcome the shiniest ${tribe} in the server, ${member}!`,
			`Be gay, do crime, ${member}`,
			`Be ace do arson, ${member}`,
			"Meowdy <:yel2:725936017567252481>",
			`${member}, welcome to the bread bank, we sell bread, we sell loafs.`,
			`the ${tribe}s welcome ${member} with open wings!`
		];
		const welcomeMessage = randomElement(welcomeMessages);

		const systemChannel = member.guild.systemChannel;
		systemChannel
			?.send(welcomeMessage)
			.catch((error) => console.log(error.message));

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
			.setTitle("Delta: New Member")
			.setColor(Colors.Green)
			.setDescription(
				`\`${member.user.username}\` has joined \`${guild.name}\``
			)
			.setAuthor({
				name: `${member.user.tag} (${member.id})`,
				iconURL: member.user.avatarURL() ?? undefined
			})
			.setTimestamp(member.joinedAt)
			.setFooter({
				text: "Delta, The Wings of Fire Moderation Bot",
				iconURL: client.user.avatarURL() ?? undefined
			});
		logsChannel
			.send({ embeds: [embed] })
			.catch((error) => console.log(error.message));
	});
