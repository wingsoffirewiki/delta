import { Client, type ClientOptions } from "@ferod/client";

import options from "./config/config.json" assert { type: "json" };

import { config } from "dotenv";
config();

import { dirname } from "path";
import { fileURLToPath } from "url";
const __dirname = dirname(fileURLToPath(import.meta.url));

import { Partials } from "discord.js";

const client = new Client(
	{
		...(options as ClientOptions),
		partials: [
			Partials.Reaction,
			Partials.Message,
			Partials.Channel,
			Partials.GuildMember,
			Partials.ThreadMember,
			Partials.User,
			Partials.GuildScheduledEvent
		]
	},
	__dirname
);

const token = process.env.TOKEN;
if (token === undefined) {
	throw new Error("Missing Discord token.");
}

client.start(token);
