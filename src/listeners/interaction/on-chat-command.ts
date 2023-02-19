import { EventListener } from "fero-dc";

export default new EventListener<"interactionCreate">()
	.setEvent("interactionCreate")
	.setHandler(async (client, interaction) => {
		if (!interaction.isChatInputCommand()) {
			return;
		}

		const guild = interaction.guild;
		const member = interaction.member;
		if (guild === null || member === null) {
			return;
		}

		const command = client.commands.get(interaction.commandName);
		if (command === undefined) {
			interaction.reply({
				ephemeral: true,
				content: `Command ${interaction.commandName} does not exist on this bot!`
			});

			return;
		}

		try {
			command.executor(client, interaction);
		} catch (error) {
			await interaction.reply({
				ephemeral: true,
				content: `An error occurred while running the command: ${error}.`
			});

			console.error(error);
		}
	});
