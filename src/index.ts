console.clear();

import { Client, ClientOptions } from "fero-dc";

import options from "./config/config.json";

import { config } from "dotenv";

config();

const client: Client = new Client(options as ClientOptions);

client.reload(process.env.TOKEN as string).then(console.log);
