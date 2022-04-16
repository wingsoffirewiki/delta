/** @format */

console.clear();

import { Client, ClientOptions } from "fero-dc";

import options from "./config/config.json";

import { connect } from "mongoose";

import { config } from "dotenv";

config();

const client: Client = new Client(options as ClientOptions);

client.reload(process.env.TOKEN as string).then(console.log);

// eslint-disable-next-line
// @ts-ignore
connect(options.MongoDBURI, options.MongoDB);
