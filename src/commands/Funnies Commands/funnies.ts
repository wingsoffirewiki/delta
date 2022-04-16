/** @format */

import { MessageEmbed } from "discord.js";
import { Command } from "fero-dc";
import { Funnie, IFunnie } from "../../models/Funnie";
import { Guild, IGuild } from "../../models/Guild";

export default new Command({
  name: "funnies",
  description: "Retrieve a random funnie (starboard) from the database",
  category: "Funnies",
  guildIDs: [],
  run: async (context) => {
    if (!context.interaction || !context.guild) {
      return;
    }

    await context.interaction.deferReply({
      ephemeral: false,
      fetchReply: false
    });

    const guild = context.guild;

    const guildModel: IGuild = await Guild.findOne(
      { _id: guild.id },
      "features.funnies"
    );

    if (!guildModel.features.funnies) {
      return context.interaction.followUp({
        ephemeral: true,
        content: "Funnies are not enabled in the database."
      });
    }

    const funnies: IFunnie[] = await Funnie.find({ guildID: guild.id });

    if (funnies.length === 0) {
      return context.interaction.followUp({
        ephemeral: false,
        content: "There are no funnies in the database"
      });
    }

    const randomFunnie = funnies[
      Math.floor(Math.random() * funnies.length)
    ] as IFunnie;

    const funnieChannel = guild.channels.cache.get(
      randomFunnie.message.channelID
    );

    if (!funnieChannel || !funnieChannel.isText()) {
      return;
    }

    const funnieMessage = await funnieChannel.messages
      .fetch(randomFunnie.message.id, { cache: true, force: true })
      .catch(console.log);

    if (!funnieMessage) {
      return;
    }

    const embed = new MessageEmbed();

    embed
      .setTitle(`${guild.name}: #${funnieChannel.name}`)
      .setURL(funnieMessage.url)
      .setColor(funnieMessage.member?.displayColor ?? "BLURPLE")
      .setDescription(
        `${funnieMessage.content || "No Content."}\n\n[Jump to Message](${
          funnieMessage.url
        })`
      )
      .setAuthor({
        name: context.author.username,
        iconURL: context.author.avatarURL({ dynamic: true }) || ""
      })
      .addFields([
        {
          name: "<:deltaplead:713458652127952917>",
          value: randomFunnie.modCount.toString(),
          inline: true
        },
        {
          name: "<:deltapog:713458681538281502>",
          value: randomFunnie.normalCount.toString(),
          inline: true
        }
      ])
      .setTimestamp()
      .setFooter({
        text: "Delta, The Wings of Fire Moderation Bot",
        iconURL: context.client.user?.avatarURL({ dynamic: true }) || ""
      });

    if (funnieMessage.attachments.size > 0) {
      embed.setImage(funnieMessage.attachments.first()?.url || "");
    }

    context.interaction.followUp({
      ephemeral: true,
      embeds: [embed]
    });

    return;
  }
});
