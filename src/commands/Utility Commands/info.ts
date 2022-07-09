import { GuildMember, MessageEmbed } from "discord.js";
import { Command, toPascalCase } from "fero-dc";
import messages from "../../config/messages.json";

export default new Command({
  name: "info",
  description: "Gets info of a user",
  category: "Utility",
  options: [
    {
      name: "user",
      description: "The user to get info from",
      type: "USER",
      required: false
    }
  ],
  guildIDs: [],
  run: async (context) => {
    if (
      !context.interaction ||
      !context.guild ||
      !context.member ||
      !context.author ||
      !context.channel
    ) {
      return;
    }

    await context.interaction.deferReply({
      ephemeral: false,
      fetchReply: false
    });

    const member =
      (context.interaction.options.getMember("user", false) as GuildMember) ||
      context.member;

    if (!member) {
      return context.interaction.followUp(messages.missingMember);
    }

    const clientStatus = member.presence?.clientStatus;

    const statuses = [];

    if (clientStatus?.desktop) {
      statuses.push(`Desktop: \`${toPascalCase(clientStatus.desktop)}\``);
    }

    if (clientStatus?.mobile) {
      statuses.push(`Mobile: \`${toPascalCase(clientStatus.mobile)}\``);
    }

    if (clientStatus?.web) {
      statuses.push(`Web: \`${toPascalCase(clientStatus.web)}\``);
    }

    const presences =
      member.presence?.activities.map((v) => {
        if (v.type === "CUSTOM") {
          return {
            name: "Custom Status",
            value: v.state || "None",
            inline: true
          };
        } else if (v.type === "LISTENING") {
          return {
            name: "Listening to a Song",
            value: `__${v.details}__\nBy ***${v.state}***`,
            inline: true
          };
        } else {
          return {
            name: `${toPascalCase(v.type)} ${v.name}`,
            value: `Details: \`${v.details || "None"}\`\nState: \`${
              v.state || "None"
            }\`\nTime: \`${v.timestamps?.start?.toUTCString()}\` \`${
              v.timestamps?.end?.toUTCString() ? v.timestamps?.end : "None"
            }\``,
            inline: true
          };
        }
      }) || [];

    const embed = new MessageEmbed();

    embed
      .setTitle("Delta: User Information")
      .setAuthor({
        name: context.author.username || "",
        iconURL: context.author.avatarURL({ dynamic: true }) || ""
      })
      .setDescription(
        `ID: ${member.id},\nUsername: ${member.user.username},\nTag: ${member.user.discriminator},\nNickname: ${member.nickname}`
      )
      .setColor("BLURPLE")
      .addFields(
        [
          {
            name: "Account Creation",
            value: member.user.createdAt.toUTCString(),
            inline: true
          },
          {
            name: "Been In Server Since",
            value: member.joinedAt?.toUTCString() || "N/A",
            inline: true
          },
          {
            name: "Boosting Since",
            value: member.premiumSinceTimestamp
              ? member.premiumSince?.toUTCString() || "Not boosing"
              : "Not boosting",
            inline: true
          },
          {
            name: "Status",
            value: toPascalCase(member.presence?.status || "Offline"),
            inline: true
          },
          {
            name: "Devices",
            value: statuses.join("\n") || "None",
            inline: true
          }
        ].concat(presences)
      )
      .setImage(member.user.avatarURL({ dynamic: true }) || "")
      .setTimestamp()
      .setFooter({
        text: "Delta, The Wings of Fire Moderation Bot",
        iconURL: context.client.user?.avatarURL({ dynamic: true }) || ""
      });

    return context.interaction.followUp({
      ephemeral: false,
      embeds: [embed]
    });
  }
});
