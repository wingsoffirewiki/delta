/** @format */

import { Command } from "fero-dc";

export default new Command({
  name: "lucy",
  description: "less goo",
  category: "Fun",
  guildIDs: ["759068727047225384"],
  run: async context => {
    context.interaction?.followUp("Less goo <:lucypog:725923308486393967>");
  }
});
