/** @format */

console.clear();

import { Client, ClientOptions } from "fero-dc";

import options from "./config/config.json";

import { connect } from "mongoose";

import { config } from "dotenv";

// import { promisify } from "util";

// import glob from "glob";

// import { readFileSync } from "fs";

// import { join } from "path";

// const globPromise = promisify(glob);

config();

const client: Client = new Client(options as ClientOptions);

client.reload(process.env.TOKEN as string).then(console.log);

// globPromise(join(__dirname, "**", "*.ts")).then(files => {
//   const fsFiles = files
//     .map(file => readFileSync(file).toString())
//     .map(data => data.split("\n").length)
//     .reduce((prev, cur) => prev + cur, 0);

//   console.log(fsFiles);
// });

// @ts-ignore
connect(options.MongoDBURI, options.MongoDB);
