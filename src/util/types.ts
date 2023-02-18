import type {
	ActivityType,
	User,
	Message,
	PartialMessage,
	Guild
} from "discord.js";
import { Client } from "fero-dc";

export const NULL_SNOWFLAKE = "0000000000000000000";

export enum LogType {
	Ban,
	TemporaryBan,
	Timeout,
	Unban,
	Warn,
	Kick,
	MessageEdit,
	MessageDelete,
	BulkMessageDelete
}

type MessageLogType =
	| LogType.MessageEdit
	| LogType.MessageDelete
	| LogType.BulkMessageDelete;

export interface LogData {
	[LogType.Ban]: [User];
	[LogType.TemporaryBan]: [User, number];
	[LogType.Timeout]: [User, number];
	[LogType.Unban]: [User];
	[LogType.Warn]: [User];
	[LogType.Kick]: [User];
	[LogType.MessageEdit]: [Message | PartialMessage, Message | PartialMessage];
	[LogType.MessageDelete]: [Message | PartialMessage];
	[LogType.BulkMessageDelete]: [(Message | PartialMessage)[]];
}

export interface MessageLogOptions<T extends LogType> {
	client: Client<true>;
	type: T;
	guild: Guild;
	args: LogData[T];
}

export interface InfractionLogOptions<T extends LogType>
	extends MessageLogOptions<T> {
	reason: string;
	moderator: User;
}

export type LogOptions<T extends LogType> = T extends MessageLogType
	? MessageLogOptions<T>
	: InfractionLogOptions<T>;

export interface UselessFactsResponse {
	id: string;
	text: string;
	source: string;
	source_url: string;
	language: string;
	permalink: string;
}

export interface JsonActivity {
	type: Exclude<keyof typeof ActivityType, "Custom">;
	text: string;
}
