/** @format */

import { MessageEmbed } from "discord.js";
import { Command } from "fero-dc";
import { Funnie, IFunnie } from "../../models/Funnie";
import { Guild, IGuild } from "../../models/Guild";

export default new Command({
  name: "funnies",
  description: "Retrieve a random funnie (starboard) from the database",
  category: "Funnies",
  guildIDs: ["759068727047225384"],
  run: async context => {
    if (!context.interaction || !context.guild) return;

    await context.interaction.deferReply({
      ephemeral: false,
      fetchReply: false
    });

    const guild = context.guild;

    const guildModel: IGuild = await Guild.findOne(
      { _id: guild.id },
      "features.funnies"
    );

    if (!guildModel.features.funnies)
      return context.interaction.followUp({
        ephemeral: true,
        content: "Funnies are not enabled in the database."
      });

    const funnies: IFunnie[] = await Funnie.find({ guildID: guild.id });

    if (funnies.length === 0)
      return context.interaction.followUp({
        ephemeral: false,
        content: "There are no funnies in the database"
      });

    const randomFunnie = funnies[
      Math.floor(Math.random() * funnies.length)
    ] as IFunnie;

    const funnieChannel = guild.channels.cache.get(
      randomFunnie.message.channelID
    );

    if (!funnieChannel || !funnieChannel.isText()) return;

    const funnieMessage = await funnieChannel.messages
      .fetch(randomFunnie.message.id, { cache: true, force: true })
      .catch(console.log);

    if (!funnieMessage) return;

    const embed = new MessageEmbed();

    console.log(embed);

    return;
  }
});
