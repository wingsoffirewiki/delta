/** @format */

import { Command } from "fero-dc";
import axios from "axios";
import { MessageEmbed } from "discord.js";
import { RandomFact } from "../../interfaces/RandomFact";

const apiURL = "https://uselessfacts.jsph.pl/today.json?language=en";

export default new Command({
  name: "factoftheday",
  description: "Gets the random fact of the day",
  category: "Fun",
  guildIDs: ["759068727047225384"],
  run: async context => {
    const response = await axios.get(apiURL);

    const randomFact: RandomFact = response.data;

    const embed = new MessageEmbed();

    embed
      .setTitle("Delta: Fact of the Day")
      .setURL(randomFact.permalink)
      .setColor("BLURPLE")
      .setDescription(
        `If this fact seems false, please refer to the [URL](${randomFact.permalink}) and verify the sources.`
      )
      .setAuthor({
        name: context.author.username,
        iconURL: context.author.avatarURL({ dynamic: true }) || ""
      })
      .addField("Fact of the Day", `\`${randomFact.text.replace(/\`/g, "'")}\``)
      .setTimestamp()
      .setFooter({
        text: "Delta, The Wings of Fire Moderation Bot",
        iconURL: context.client.user?.avatarURL({ dynamic: true }) || ""
      });

    context.interaction?.followUp({ embeds: [embed] });
  }
});
