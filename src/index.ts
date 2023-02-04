import { Client, ClientOptions } from "fero-dc";

import options from "./config/config.json";

import { config } from "dotenv";
config();

const client = new Client(options as ClientOptions, __dirname);

const token = process.env.TOKEN;
if (token === undefined) {
  throw new Error("Missing Discord token.");
}

client.start(token);
