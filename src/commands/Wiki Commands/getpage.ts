/** @format */

import { Command } from "fero-dc";
import axios from "axios";
import { MessageActionRow, MessageButton, MessageEmbed } from "discord.js";

interface WikiPageResult {
  batchcomplete: string;
  warnings: {
    extracts: {
      [key: string]: string;
    };
  };
  query: {
    pages: {
      [key: string]: {
        pageid: number;
        ns: number;
        title: string;
        extract: string;
      };
    };
  };
}

export default new Command({
  name: "getpage",
  description: "Get a page from the Wings of Fire Wiki",
  category: "Wiki",
  options: [
    {
      name: "page",
      description: "The page to get",
      type: "STRING",
      required: true
    }
  ],
  guildIDs: [],
  run: async (context) => {
    if (!context.interaction) {
      return;
    }

    const title = context.interaction.options.getString("page", true);

    const result = await axios
      .get("wingsoffire.fandom.com/api.php", {
        params: {
          action: "query",
          prop: "extracts",
          titles: title,
          explaintext: "1",
          exlimit: "1",
          format: "json"
        }
      })
      .catch(console.log);

    if (!result) {
      return;
    }

    const data = result.data as WikiPageResult;

    const page =
      data.query.pages[
        Object.keys(
          data.query.pages
        )[0] as keyof WikiPageResult["query"]["pages"]
      ];

    if (!page) {
      return;
    }

    console.log(page);

    const pages = page.extract.match(/.{1,500}?/);

    if (!pages || !pages.length) {
      return;
    }

    console.log(pages);

    const pageNumber = 0;

    const embed = new MessageEmbed();

    embed
      .setTitle("Delta: Wiki Page")
      .setDescription(
        `This is the wiki page [[[${page.title}](https://wingsoffire.fandom.com/wiki/${page.title})]]`
      )
      .addField("Text", pages[pageNumber] as string);

    const row = new MessageActionRow();

    const buttonLeft = new MessageButton();

    buttonLeft.setCustomId("buttonLeft").setLabel("<").setStyle("DANGER");

    const buttonPageCount = new MessageButton();

    buttonPageCount
      .setCustomId("buttonPageCount")
      .setLabel((pageNumber + 1).toString())
      .setDisabled(true)
      .setStyle("SECONDARY");

    const buttonRight = new MessageButton();

    buttonRight.setCustomId("buttonRight").setLabel(">").setStyle("SUCCESS");

    row.addComponents(buttonLeft, buttonPageCount, buttonRight);

    context.interaction.reply({ embeds: [embed], components: [row] });
  }
});
