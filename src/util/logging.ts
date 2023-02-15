import { GuildBasedChannel, TextBasedChannel, EmbedBuilder } from "discord.js";
import { Log, prisma } from "./prisma-client";
import { LogOptions, LogType } from "./types";
import { ms } from "fero-ms";

export async function log<T extends LogType>(
	options: LogOptions<T>
): Promise<void> {
	const { type, guild } = options;

	const guildModel = await prisma.guild.findUnique({
		where: {
			id: guild.id
		}
	});
	if (guildModel === null) {
		return;
	}

	const previousLogId =
		(
			await prisma.log.findMany({
				where: {
					guildId: guild.id
				},
				orderBy: {
					logId: "desc"
				},
				take: 1,
				select: {
					logId: true
				}
			})
		)[0]?.logId ?? 1;

	const logId = previousLogId + 1;

	switch (type) {
		case LogType.Ban: {
			if (!guildModel.features.logging) {
				return;
			}

			const channel = guild.channels.cache.get(guildModel.channelIds.logs);
			if (channel === undefined || !channel.isTextBased()) {
				return;
			}

			logBan(options as LogOptions<LogType.Ban>, channel, logId);

			break;
		}

		case LogType.TemporaryBan: {
			if (!guildModel.features.logging) {
				return;
			}

			const channel = guild.channels.cache.get(guildModel.channelIds.logs);
			if (channel === undefined || !channel.isTextBased()) {
				return;
			}

			logTemporaryBan(
				options as LogOptions<LogType.TemporaryBan>,
				channel,
				logId
			);

			break;
		}

		case LogType.Timeout: {
			if (!guildModel.features.logging) {
				return;
			}

			const channel = guild.channels.cache.get(guildModel.channelIds.logs);
			if (channel === undefined || !channel.isTextBased()) {
				return;
			}

			logTimeout(options as LogOptions<LogType.Timeout>, channel, logId);

			break;
		}

		case LogType.Unban: {
			if (!guildModel.features.logging) {
				return;
			}

			const channel = guild.channels.cache.get(guildModel.channelIds.logs);
			if (channel === undefined || !channel.isTextBased()) {
				return;
			}

			logUnban(options as LogOptions<LogType.Unban>, channel, logId);

			break;
		}

		case LogType.Warn: {
			if (!guildModel.features.logging) {
				return;
			}

			const channel = guild.channels.cache.get(guildModel.channelIds.logs);
			if (channel === undefined || !channel.isTextBased()) {
				return;
			}

			logWarn(options as LogOptions<LogType.Warn>, channel, logId);

			break;
		}

		case LogType.Kick: {
			if (!guildModel.features.logging) {
				return;
			}

			const channel = guild.channels.cache.get(guildModel.channelIds.logs);
			if (channel === undefined || !channel.isTextBased()) {
				return;
			}

			logKick(options as LogOptions<LogType.Kick>, channel, logId);

			break;
		}

		case LogType.MessageEdit: {
			if (!guildModel.features.modLogging) {
				return;
			}

			const channel = guild.channels.cache.get(guildModel.channelIds.modLogs);
			if (channel === undefined || !channel.isTextBased()) {
				return;
			}

			logMessageEdit(options as LogOptions<LogType.MessageEdit>, channel);

			break;
		}

		case LogType.MessageDelete: {
			if (!guildModel.features.modLogging) {
				return;
			}

			const channel = guild.channels.cache.get(guildModel.channelIds.modLogs);
			if (channel === undefined || !channel.isTextBased()) {
				return;
			}

			logMessageDelete(options as LogOptions<LogType.MessageDelete>, channel);

			break;
		}

		case LogType.BulkMessageDelete: {
			if (!guildModel.features.modLogging) {
				return;
			}

			const channel = guild.channels.cache.get(guildModel.channelIds.modLogs);
			if (channel === undefined || !channel.isTextBased()) {
				return;
			}

			logBulkMessageDelete(
				options as LogOptions<LogType.BulkMessageDelete>,
				channel
			);

			break;
		}
	}
}

async function logBan(
	options: LogOptions<LogType.Ban>,
	channel: GuildBasedChannel & TextBasedChannel,
	logId: number
): Promise<Log> {
	const { client, type, guild, reason, moderator, args } = options;
	const [user] = args;

	const embed = new EmbedBuilder()
		.setTitle("Delta: Banned User")
		.setDescription(`Log ID: ${logId}`)
		.setColor(0xe74d3c)
		.setAuthor({
			name: moderator.tag,
			iconURL: moderator.avatarURL() ?? ""
		})
		.setThumbnail(user.avatarURL() ?? "")
		.addFields(
			{
				name: "Username",
				value: user.tag,
				inline: true
			},
			{
				name: "User ID",
				value: user.id,
				inline: true
			},
			{
				name: "Reason",
				value: reason
			},
			{
				name: "Timestamp",
				value: new Date(Date.now()).toUTCString()
			}
		)
		.setTimestamp()
		.setFooter({
			text: "Delta, The Wings of Fire Moderation Bot",
			iconURL: client.user.avatarURL() ?? ""
		});

	const message = await channel.send({ embeds: [embed] });

	const log = await prisma.log.create({
		data: {
			guildId: guild.id,
			targetId: user.id,
			moderatorId: moderator.id,
			logId,
			reason,
			type,
			embedMessageId: message.id,
			undone: false
		}
	});

	return log;
}

async function logTemporaryBan(
	options: LogOptions<LogType.TemporaryBan>,
	channel: GuildBasedChannel & TextBasedChannel,
	logId: number
): Promise<Log> {
	const { client, type, guild, reason, moderator, args } = options;
	const [user, expires, duration] = args;

	const embed = new EmbedBuilder()
		.setTitle("Delta: Temporarily Banned User")
		.setDescription(`Log ID: ${logId}`)
		.setColor(0xe67e22)
		.setAuthor({
			name: moderator.tag,
			iconURL: moderator.avatarURL() ?? ""
		})
		.setThumbnail(user.avatarURL() ?? "")
		.addFields(
			{
				name: "Username",
				value: user.tag,
				inline: true
			},
			{
				name: "User ID",
				value: user.id,
				inline: true
			},
			{
				name: "Reason",
				value: reason
			},
			{
				name: "Duration",
				value: ms(duration, { unitTrailingSpace: true }),
				inline: true
			},
			{
				name: "Resolved By",
				value: expires.toUTCString(),
				inline: true
			},
			{
				name: "Timestamp",
				value: new Date(Date.now()).toUTCString()
			}
		)
		.setTimestamp()
		.setFooter({
			text: "Delta, The Wings of Fire Moderation Bot",
			iconURL: client.user.avatarURL() ?? ""
		});

	const message = await channel.send({ embeds: [embed] });

	const log = await prisma.log.create({
		data: {
			guildId: guild.id,
			targetId: user.id,
			moderatorId: moderator.id,
			logId,
			reason,
			type,
			embedMessageId: message.id,
			undoBy: expires,
			undone: false
		}
	});

	return log;
}

async function logTimeout(
	options: LogOptions<LogType.Timeout>,
	channel: GuildBasedChannel & TextBasedChannel,
	logId: number
): Promise<Log> {
	const { client, type, guild, reason, moderator, args } = options;
	const [user, expires, duration] = args;

	const embed = new EmbedBuilder()
		.setTitle("Delta: Timed Out User")
		.setDescription(`Log ID: ${logId}`)
		.setColor(0x27346f)
		.setAuthor({
			name: moderator.tag,
			iconURL: moderator.avatarURL() ?? ""
		})
		.setThumbnail(user.avatarURL() ?? "")
		.addFields(
			{
				name: "Username",
				value: user.tag,
				inline: true
			},
			{
				name: "User ID",
				value: user.id,
				inline: true
			},
			{
				name: "Reason",
				value: reason
			},
			{
				name: "Duration",
				value: ms(duration, { unitTrailingSpace: true }),
				inline: true
			},
			{
				name: "Resolved By",
				value: expires.toUTCString(),
				inline: true
			},
			{
				name: "Timestamp",
				value: new Date(Date.now()).toUTCString()
			}
		)
		.setTimestamp()
		.setFooter({
			text: "Delta, The Wings of Fire Moderation Bot",
			iconURL: client.user.avatarURL() ?? ""
		});

	const message = await channel.send({ embeds: [embed] });

	const log = await prisma.log.create({
		data: {
			guildId: guild.id,
			targetId: user.id,
			moderatorId: moderator.id,
			logId,
			reason,
			type,
			embedMessageId: message.id,
			undoBy: expires
		}
	});

	return log;
}

async function logUnban(
	options: LogOptions<LogType.Unban>,
	channel: GuildBasedChannel & TextBasedChannel,
	logId: number
): Promise<Log> {
	const { client, reason, moderator, args } = options;
	const [user] = args;

	const banLog = await prisma.log.findFirst({
		where: {
			type: {
				in: [LogType.Ban, LogType.TemporaryBan]
			},
			targetId: user.id,
			undone: false
		},
		select: {
			id: true,
			createdAt: true,
			undone: true
		},
		orderBy: {
			createdAt: "desc"
		},
		take: 1
	});
	if (banLog === null) {
		throw new Error("Ban log is not in the database or is already undone.");
	}

	const unbanLog = await prisma.log.update({
		where: {
			id: banLog.id
		},
		data: {
			undone: true
		}
	});
	if (unbanLog === null) {
		throw new Error("Failed to update ban log.");
	}

	const embed = new EmbedBuilder()
		.setTitle("Delta: Unbanned User")
		.setDescription(`Log ID: ${logId}`)
		.setColor(0x388e3c)
		.setAuthor({
			name: moderator.tag,
			iconURL: moderator.avatarURL() ?? ""
		})
		.setThumbnail(user.avatarURL() ?? "")
		.addFields(
			{
				name: "Username",
				value: user.tag,
				inline: true
			},
			{
				name: "User ID",
				value: user.id,
				inline: true
			},
			{
				name: "Reason",
				value: reason
			},
			{
				name: "Timestamp",
				value: new Date(Date.now()).toUTCString()
			}
		)
		.setTimestamp()
		.setFooter({
			text: "Delta, The Wings of Fire Moderation Bot",
			iconURL: client.user.avatarURL() ?? ""
		});

	await channel.send({ embeds: [embed] });

	return unbanLog;
}

async function logWarn(
	options: LogOptions<LogType.Warn>,
	channel: GuildBasedChannel & TextBasedChannel,
	logId: number
): Promise<Log> {
	const { client, type, guild, reason, moderator, args } = options;
	const [user] = args;

	const embed = new EmbedBuilder()
		.setTitle("Delta: Warned User")
		.setDescription(`Log ID: ${logId}`)
		.setColor(0x0289d1)
		.setAuthor({
			name: moderator.tag,
			iconURL: moderator.avatarURL() ?? ""
		})
		.setThumbnail(user.avatarURL() ?? "")
		.addFields(
			{
				name: "Username",
				value: user.tag,
				inline: true
			},
			{
				name: "User ID",
				value: user.id,
				inline: true
			},
			{
				name: "Reason",
				value: reason
			},
			{
				name: "Timestamp",
				value: new Date(Date.now()).toUTCString()
			}
		)
		.setTimestamp()
		.setFooter({
			text: "Delta, The Wings of Fire Moderation Bot",
			iconURL: client.user.avatarURL() ?? ""
		});

	const message = await channel.send({ embeds: [embed] });

	const log = await prisma.log.create({
		data: {
			guildId: guild.id,
			targetId: user.id,
			moderatorId: moderator.id,
			logId,
			reason,
			type,
			embedMessageId: message.id
		}
	});

	return log;
}

async function logKick(
	options: LogOptions<LogType.Kick>,
	channel: GuildBasedChannel & TextBasedChannel,
	logId: number
): Promise<Log> {
	const { client, type, guild, reason, moderator, args } = options;
	const [user] = args;

	const embed = new EmbedBuilder()
		.setTitle("Delta: Kicked User")
		.setDescription(`Log ID: ${logId}`)
		.setColor(0xfdd835)
		.setAuthor({
			name: moderator.tag,
			iconURL: moderator.avatarURL() ?? ""
		})
		.setThumbnail(user.avatarURL() ?? "")
		.addFields(
			{
				name: "Username",
				value: user.tag,
				inline: true
			},
			{
				name: "User ID",
				value: user.id,
				inline: true
			},
			{
				name: "Reason",
				value: reason
			},
			{
				name: "Timestamp",
				value: new Date(Date.now()).toUTCString()
			}
		)
		.setTimestamp()
		.setFooter({
			text: "Delta, The Wings of Fire Moderation Bot",
			iconURL: client.user.avatarURL() ?? ""
		});

	const message = await channel.send({ embeds: [embed] });

	const log = await prisma.log.create({
		data: {
			guildId: guild.id,
			targetId: user.id,
			moderatorId: moderator.id,
			logId,
			reason,
			type,
			embedMessageId: message.id
		}
	});

	return log;
}

async function logMessageEdit(
	options: LogOptions<LogType.MessageEdit>,
	channel: GuildBasedChannel & TextBasedChannel
): Promise<void> {
	const { client, args } = options;
	const [oldMessage, newMessage] = args;

	const embed = new EmbedBuilder()
		.setTitle("Delta: Edited Message")
		.setDescription(
			[
				`Channel: ${newMessage.channel}`,
				`Channel ID: ${newMessage.channelId}`,
				`Author: ${newMessage.author}`,
				`Author ID: ${newMessage.author?.id ?? "Unknown"}`
			].join("\n")
		)
		.setURL(newMessage.url)
		.setColor(0x388e3c)
		.setAuthor({
			name: newMessage.author?.tag ?? "Unknown",
			iconURL: newMessage.author?.avatarURL() ?? ""
		})
		.setThumbnail(newMessage.author?.avatarURL() ?? "")
		.addFields(
			{
				name: "Old Message",
				value: limitStringLength(oldMessage.content ?? "No content.", 1000),
				inline: true
			},
			{
				name: "New Message",
				value: limitStringLength(newMessage.content ?? "No content.", 1000),
				inline: true
			},
			{
				name: "Attachments",
				value:
					newMessage.attachments
						.map(
							(attachment) =>
								`${attachment.name ?? "no_name"}: ${attachment.url}`
						)
						.join("\n") || "None"
			},
			{
				name: "Timestamp",
				value: new Date(Date.now()).toUTCString()
			}
		)
		.setTimestamp()
		.setFooter({
			text: "Delta, The Wings of Fire Moderation Bot",
			iconURL: client.user.avatarURL() ?? ""
		});

	await channel.send({ embeds: [embed] });
}

async function logMessageDelete(
	options: LogOptions<LogType.MessageDelete>,
	channel: GuildBasedChannel & TextBasedChannel
): Promise<void> {
	const { client, args } = options;
	const [message] = args;

	const embed = new EmbedBuilder()
		.setTitle("Delta: Deleted Message")
		.setDescription(
			[
				`Channel: ${message.channel}`,
				`Channel ID: ${message.channelId}`,
				`Author: ${message.author}`,
				`Author ID: ${message.author?.id ?? "Unknown"}`
			].join("\n")
		)
		.setColor(0x388e3c)
		.setAuthor({
			name: message.author?.tag ?? "Unknown",
			iconURL: message.author?.avatarURL() ?? ""
		})
		.setThumbnail(message.author?.avatarURL() ?? "")
		.addFields(
			{
				name: "Message",
				value: limitStringLength(message.content ?? "No content.", 1000),
				inline: true
			},
			{
				name: "Attachments",
				value:
					message.attachments
						.map(
							(attachment) =>
								`${attachment.name ?? "no_name"}: ${attachment.url}`
						)
						.join("\n") || "None"
			},
			{
				name: "Timestamp",
				value: new Date(Date.now()).toUTCString()
			}
		)
		.setTimestamp()
		.setFooter({
			text: "Delta, The Wings of Fire Moderation Bot",
			iconURL: client.user.avatarURL() ?? ""
		});

	await channel.send({ embeds: [embed] });
}

async function logBulkMessageDelete(
	options: LogOptions<LogType.BulkMessageDelete>,
	channel: GuildBasedChannel & TextBasedChannel
): Promise<void> {
	const { client, args } = options;
	const [messages] = args;

	const embed = new EmbedBuilder()
		.setTitle("Delta: Messages Deleted in Bulk")
		.setDescription(
			[
				`Channels: ${[
					...new Set(messages.map((message) => message.channel))
				].join("\n")}`,
				`Channel IDs: ${[
					...new Set(messages.map((message) => message.channelId))
				].join("\n")}`,
				`Authors: ${[
					...new Set(messages.map((message) => message.author))
				].join("\n")}`,
				`Author IDs: ${[
					...new Set(
						messages
							.filter((message) => message.author !== null)
							.map((message) => message.author?.id)
					)
				].join("\n")}`
			].join("\n")
		)
		.setColor(0x388e3c)
		.addFields(
			...messages.slice(0, 23).map((message) => ({
				name: message.id,
				value: [
					`${message.channel} | ${message.author}`,
					`${limitStringLength(message.content ?? "No content.")}`
				].join("\n")
			})),
			{
				name: "Attachments",
				value:
					messages
						.filter((message) => message.attachments.size > 0)
						.map(
							(message) =>
								`${message.id}: ${message.attachments
									.map((attachment) => attachment.name ?? "no_name")
									.join(", ")}`
						)
						.join("\n") || "None"
			},
			{
				name: "Timestamp",
				value: new Date(Date.now()).toUTCString()
			}
		)
		.setTimestamp()
		.setFooter({
			text: "Delta, The Wings of Fire Moderation Bot",
			iconURL: client.user.avatarURL() ?? ""
		});

	await channel.send({ embeds: [embed] });
}

function limitStringLength(string: string, length = 200): string {
	return string.length > length ? `${string.substring(0, length)}...` : string;
}
