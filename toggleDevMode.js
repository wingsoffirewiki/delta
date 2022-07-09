

const { promisify } = require("util");

const globPromise = promisify(require("glob"));

const { readFileSync, writeFileSync } = require("fs");

const guildID = "759068727047225384";

(async () => {
  const paths = await globPromise("./src/commands/**/*.ts", { absolute: true });

  for (const path of paths) {
    let data = readFileSync(path).toString();

    data = data.includes(`guildIDs: ["${guildID}"],`)
      ? data.replace(`guildIDs: ["${guildID}"],`, "guildIDs: [],")
      : data.replace("guildIDs: [],", `guildIDs: ["${guildID}"],`);

    writeFileSync(path, data);
  }
})();
