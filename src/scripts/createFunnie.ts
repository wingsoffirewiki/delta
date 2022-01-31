/** @format */

import {
  Message,
  MessageEmbed,
  NewsChannel,
  TextChannel,
  ThreadChannel
} from "discord.js";
import { Client } from "fero-dc";
import { Types } from "mongoose";
import { Funnie, IFunnie } from "../models/Funnie";

export async function createFunnie(
  client: Client,
  message: Message,
  normalCount: number,
  modCount: number,
  ch: TextChannel
): Promise<IFunnie | undefined> {
  const id = message.id;

  const channel = message.channel;

  const guild = message.guild;

  const member = message.member;

  if (
    !member ||
    !guild ||
    !channel ||
    !channel.isText ||
    !(
      channel instanceof TextChannel ||
      channel instanceof NewsChannel ||
      channel instanceof ThreadChannel
    )
  )
    return;

  const color = member.displayColor ?? "BLURPLE";

  const content = message.content;

  const attachments = message.attachments;

  const embed = new MessageEmbed();

  embed
    .setTitle(`${guild.name}: #${channel.name}`)
    .setURL(message.url)
    .setColor(color)
    .setDescription(
      `${content || "No Content."}\n\n[Jump to Message](${message.url})`
    )
    .setAuthor({
      name: member.user.username,
      iconURL: member.user.avatarURL({ dynamic: true }) || ""
    })
    .addFields([
      {
        name: "<:deltaplead:713458652127952917>",
        value: modCount.toString(),
        inline: true
      },
      {
        name: "<:deltapog:713458681538281502>",
        value: normalCount.toString(),
        inline: true
      }
    ])
    .setTimestamp()
    .setFooter({
      text: "Delta, The Wings of Fire Moderation Bot",
      iconURL: client.user?.avatarURL({ dynamic: true }) || ""
    });

  if (attachments.size > 0) embed.setImage(attachments.first()?.url || "");

  const msg = await ch.send({ embeds: [embed] });

  const funnieModel: IFunnie = await Funnie.create({
    _id: new Types.ObjectId(),
    guildID: guild.id,
    userID: member.id,
    normalCount,
    modCount,
    message: {
      id,
      channelID: channel.id,
      embedID: msg.id
    }
  });

  return funnieModel;
}
