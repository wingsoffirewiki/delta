/** @format */

import { Command } from "fero-dc";
import axios from "axios";
import { MessageEmbed } from "discord.js";
import { RandomFact } from "../interfaces/RandomFact";

const apiURL = "https://uselessfacts.jsph.pl/random.json?language=en";

export default new Command({
  name: "randomfact",
  description: "Fetches a random fact from a randomfact API",
  category: "Fun",
  guildIDs: ["759068727047225384"],
  run: async context => {
    const response = await axios.get(apiURL);

    const randomFact: RandomFact = response.data;

    const embed = new MessageEmbed();

    embed
      .setTitle("Random Fact")
      .setURL(randomFact.permalink)
      .setColor("BLURPLE")
      .setDescription(
        `If this fact seems false, please refer to the [URL](${randomFact.permalink}) and verify the sources.`
      )
      .setAuthor({
        name: context.author.username,
        iconURL: context.author.avatarURL({ dynamic: true }) || ""
      })
      .addField("Fact", `\`${randomFact.text.replace(/\`/g, "'")}\``)
      .setTimestamp()
      .setFooter({
        text: "Delta, The Wings of Fire Moderation Bot",
        iconURL: context.client.user?.avatarURL({ dynamic: true }) || ""
      });

    context.interaction?.followUp({ embeds: [embed] });
  }
});
