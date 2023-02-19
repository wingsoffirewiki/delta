import { Command } from "fero-dc";

export default new Command()
	.setName("honk")
	.setDescription("Honk!")
	.setCategory("Fun")
	.setRun(async (client, interaction) => {
		await interaction.reply("<:honk:639271354734215178>");
	});
