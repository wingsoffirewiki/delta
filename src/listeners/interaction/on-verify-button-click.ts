import { EventListener } from "@ferod/client";
import { prisma } from "../../util/prisma-client";
import { NULL_SNOWFLAKE } from "../../util/types";

export default new EventListener<"interactionCreate">()
	.setEvent("interactionCreate")
	.setHandler(async (client, interaction) => {
		if (!interaction.isButton()) {
			return;
		}

		const guild = interaction.guild;
		if (guild === null) {
			return;
		}

		if (interaction.customId !== "verify") {
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
		if (guildModel.messageIds.verification === NULL_SNOWFLAKE) {
			return;
		}

		if (
			interaction.channelId !== guildModel.channelIds.verification ||
			interaction.message.id !== guildModel.messageIds.verification
		) {
			return;
		}

		const roleId = guildModel.roleIds.verified;
		if (roleId === NULL_SNOWFLAKE) {
			return;
		}

		const role = await guild.roles.fetch(roleId, {
			cache: true
		});
		const member = await guild.members.fetch(interaction.user.id);
		if (role === null || member === null) {
			return;
		}
		if (member.roles.cache.has(role.id)) {
			interaction.reply({
				ephemeral: true,
				content: "You are already verified!"
			});

			return;
		}

		try {
			await member.roles.add(role);

			interaction.reply({
				ephemeral: true,
				content: "You have been verified!"
			});
		} catch (error) {
			interaction.reply({
				ephemeral: true,
				content: "An error occurred while trying to verify you."
			});

			console.error(error);
		}
	});
