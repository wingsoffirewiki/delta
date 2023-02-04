import { MessageEmbed } from "discord.js";
import { Command } from "fero-dc";
import bannedWords from "../../config/bannedWords.json";

export default new Command({
  name: "bannedwords",
  description: "Get the list of banned words",
  category: "Utility",
  guildIDs: [],
  run: async (context) => {
    if (!context.interaction || !context.author) {
      return;
    }

    const embed = new MessageEmbed();

    embed
      .setTitle("Delta: Banned Words")
      .setColor("BLURPLE")
      .setDescription(
        "This is a list of words\nthat I will automatically\ndelete and log."
      )
      .addField(
        "Banned Words",
        Object.entries(bannedWords)
          .map(
            (entry) => `\`${entry[0].replace(/[aiou]/g, "/")}\` - ${entry[1]}`
          )
          .join("\n")
      )
      .setFooter({
        text: "Delta, The Wings of Fire Moderation Bot",
        iconURL: context.client.user?.avatarURL({ dynamic: true }) || ""
      });

    await context.interaction.reply({
      ephemeral: true,
      content: "Sending you an embed now..."
    });

    context.author.send({ embeds: [embed] }).catch(async (err) => {
      console.log(err);

      context.interaction?.followUp({
        ephemeral: true,
        content:
          "I could not send you a message via DM. Are your DMs on for this server?"
      });
    });
  }
});
