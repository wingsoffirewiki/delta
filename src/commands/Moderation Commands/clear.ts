/** @format */

import { GuildTextBasedChannel, MessageEmbed } from "discord.js";
import { Command } from "fero-dc";

export default new Command({
  name: "clear",
  description: "Clears messages in the current channel",
  category: "Moderation",
  options: [
    {
      name: "messages",
      description: "The number of messages to delete",
      type: "NUMBER",
      required: true,
      minValue: 1,
      maxValue: 100
    }
  ],
  guildIDs: ["759068727047225384"],
  run: async context => {
    if (
      !context.guild ||
      !context.member ||
      !context.channel ||
      !context.interaction
    )
      return;

    if (!context.member.permissions.has("MANAGE_MESSAGES"))
      return context.interaction.followUp(
        "You do not have the correct permissions to run this command!"
      );

    const messagesToDelete =
      context.interaction.options.getNumber("messages") || 1;

    const channel = context.channel as GuildTextBasedChannel;

    const messages = await channel.bulkDelete(messagesToDelete).catch(err => {
      context.interaction?.followUp(`Error:\n\`${err}\``);
      return undefined;
    });

    if (!messages) return;

    const embed = new MessageEmbed();

    embed
      .setTitle("Delta: Deleted Messages")
      .setAuthor({
        name: context.author.username || "",
        iconURL: context.author.avatarURL({ dynamic: true }) || ""
      })
      .setDescription(
        `Deleted ${messages.size} messages with these IDs:\n${
          messages.size > 5
            ? messages
                .random(5)
                .map(v => `\`${v.id}\``)
                .join("\n") + "\n..."
            : messages.map(v => `\`${v.id}\``).join("\n")
        }`
      )
      .setColor("BLURPLE")
      .setTimestamp()
      .setFooter({
        text: "Delta, The Wings of Fire Moderation Bot",
        iconURL: context.client.user?.avatarURL({ dynamic: true }) || ""
      });

    return context.channel.send({
      embeds: [embed]
    });
  }
});
