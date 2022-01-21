/** @format */

import { Event } from "fero-dc";

export default {
  event: "interactionCreate",
  run: async (client, interaction) => {
    if (!interaction.isCommand()) return;

    const context = await client.getContext(interaction);

    if (!context.guild || !context.member)
      return interaction.reply("You cannot use commands outside of a server!");

    const command = client.commands.get(context.command);

    if (command)
      interaction
        .deferReply({
          ephemeral: false,
          fetchReply: false
        })
        .then(() => command.run(context));
  }
} as Event<"interactionCreate">;
