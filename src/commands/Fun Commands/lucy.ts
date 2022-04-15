/** @format */

import { Command } from "fero-dc";

export default new Command({
  name: "lucy",
  description: "less goo",
  category: "Fun",
  guildIDs: [],
  run: async context => {
    if (!context.interaction) return;

    context.interaction.reply("Less goo <:lucypog:725923308486393967>");
  }
});
