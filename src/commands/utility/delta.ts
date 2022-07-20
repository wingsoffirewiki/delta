import { Command } from "fero-dc";
import { MessageEmbed } from "discord.js";
import { ms } from "fero-ms";
import { version } from "../../../package.json";

export default new Command({
  name: "delta",
  description: "Shows information about the bot",
  category: "Utility",
  guildIDs: [],
  run: async (context) => {
    if (!context.interaction) {
      return;
    }

    const embed = new MessageEmbed();

    embed
      .setTitle("Delta: Bot Information")
      .setAuthor({
        name: context.author.username || "",
        iconURL: context.author.avatarURL({ dynamic: true }) || ""
      })
      .setDescription(
        "Hi there, <:deltahi:713191592789409852>! I'm Delta, the Wings of Fire Wiki mascot. I'm a SkyWing/MudWing hybrid, and I go by they/them. I work as a barista. In my free time, I like reading, hanging out with my friends, offering help and advice, and trivia! <:delta:713191673924157471>."
      )
      .setColor("BLURPLE")
      .setThumbnail(context.client.user?.avatarURL({ dynamic: true }) || "")
      .addFields([
        {
          name: "Bot Tag",
          value: context.client.user?.tag || "None",
          inline: true
        },
        {
          name: "Bot Version",
          value: version,
          inline: true
        },
        {
          name: "Ping",
          value: `\`${context.client.ws.ping}\` ms.`,
          inline: true
        },
        {
          name: "Bot Uptime",
          value: ms(context.client.uptime || 0, {
            returnDate: false,
            unitTrailingSpace: true,
            disabledUnits: ["millisecond"]
          }),
          inline: true
        },
        {
          name: "Server Count",
          value: context.client.guilds.cache.size.toString(),
          inline: true
        },
        {
          name: "User Count",
          value: context.client.users.cache.size.toString(),
          inline: true
        }
      ])
      .setTimestamp()
      .setFooter({
        text: "Delta, The Wings of Fire Moderation Bot",
        iconURL: context.client.user?.avatarURL({ dynamic: true }) || ""
      });

    context.interaction.reply({ embeds: [embed] });
  }
});
