import { EmbedBuilder } from "@discordjs/builders";
import { Colors } from "discord.js";
import { Command } from "fero-dc";
import { ms } from "fero-ms";

export default new Command()
  .setName("delta")
  .setDescription("Shows information about the bot")
  .setCategory("Utility")
  .setRun(async (client, interaction) => {
    const author = interaction.user;

    const embed = new EmbedBuilder()
      .setTitle("Delta: Bot Information")
      .setDescription(
        "Hi there, <:deltahi:713191592789409852>! I'm Delta, the Wings of Fire Wiki mascot. I'm a SkyWing/MudWing hybrid, and I go by they/them. I work as a barista. In my free time, I like reading, hanging out with my friends, offering help and advice, and trivia! <:delta:713191673924157471>."
      )
      .setColor(Colors.Blurple)
      .setAuthor({
        name: author.username,
        iconURL: author.avatarURL() ?? ""
      })
      .setThumbnail(client.user.avatarURL() ?? "")
      .addFields(
        {
          name: "Bot Tag",
          value: client.user.tag,
          inline: true
        },
        {
          name: "Bot Version",
          value: process.env.npm_package_version ?? "Unknown",
          inline: true
        },
        {
          name: "Ping",
          value: `\`${client.ws.ping}\` ms.`,
          inline: true
        },
        {
          name: "Bot Uptime",
          value: ms(client.uptime, {
            returnDate: false,
            unitTrailingSpace: true,
            disabledUnits: ["millisecond"]
          }),
          inline: true
        },
        {
          name: "Server Count",
          value: client.guilds.cache.size.toString(),
          inline: true
        },
        {
          name: "User Count",
          value: client.users.cache.size.toString(),
          inline: true
        }
      )
      .setTimestamp()
      .setFooter({
        text: "Delta, The Wings of Fire Moderation Bot",
        iconURL: client.user.avatarURL() ?? ""
      });

    await interaction.reply({ embeds: [embed] });
  });
