import { PermissionFlagsBits } from "discord.js";
import { Command } from "@ferod/client";

export default new Command()
	.setName("honk")
	.setDescription("Honk!")
	.setCategory("Fun")
	.setPermissions(PermissionFlagsBits.SendMessages)
	.setExecutor(async (client, interaction) => {
		await interaction.reply("<:honk:639271354734215178>");
	});
