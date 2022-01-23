/** @format */

import { Command } from "fero-dc";

export default new Command({
  name: "honk",
  description: "Honk!",
  category: "Fun",
  guildIDs: ["759068727047225384"],
  run: async context => {
    if (!context.interaction) return;

    context.interaction.reply("<:honk:639271354734215178>");
  }
});
