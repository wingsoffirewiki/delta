console.clear();

import { Client, ClientOptions } from "fero-dc";

import options from "./config/config.json";

import { config } from "dotenv";

config();

const client = new Client(options as ClientOptions, __dirname);

client.start(process.env.TOKEN as string);
