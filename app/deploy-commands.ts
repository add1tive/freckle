/*
 * Freckle - a Discord app and its website
 * Copyright (C) 2025 add1tive
 *
 * This file is part of Freckle.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

import { ApplicationCommand, REST, Routes } from "discord.js";
import { clientId, token } from "./local/private.json";
import fs from "node:fs";
import path from "node:path";

// -- LOGGING --
import { configure, getConsoleSink, getLogger } from "@logtape/logtape";
import { getPrettyFormatter } from "@logtape/pretty";
import { getStreamFileSink } from "@logtape/file";

fs.mkdirSync("local/logs", { recursive: true });

const dateRn = new Date().toISOString().replace(/T/, "_").replace(/\..+/, "").replaceAll(":", "-");

const prettyNoColor = getPrettyFormatter({
    colors: false,
    categoryWidth: 25,
    categorySeparator: " > "
});
const prettyCustColor = getPrettyFormatter({
    messageStyle: null,
    categoryStyle: ["italic"],
    categoryWidth: 25,
    categorySeparator: " > "
});

configure({
    sinks: {
        console: getConsoleSink({ formatter: prettyCustColor }),
        file: getStreamFileSink(`local/logs/${dateRn}.log`, { formatter: prettyNoColor })
    },
    loggers: [{ category: [], lowestLevel: "debug", sinks: ["console", "file"] }]
});
const logger_ = getLogger(["freckle-app"]);
const logger = logger_.getChild("deploy-commands");
// -------------

const commands = [];
const foldersPath = path.join(__dirname, "commands");
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith(".ts"));
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        if ("data" in command && "execute" in command) {
            commands.push(command.data);
        } else {
            logger.warn`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`;
        }
    }
}

const rest = new REST().setToken(token);

(async () => {
    try {
        logger.info`Started refreshing ${commands.length} application (/) commands.`;

        // guild commands (not yet used, hence the commenting)
        // const data = await rest.put(
        // 	Routes.applicationGuildCommands(clientId, guildId),
        // 	{ body: commands },
        // );

        // app commands
        const data = (await rest.put(Routes.applicationCommands(clientId), {
            body: commands
        })) as ApplicationCommand[]; // ! NO IDEA IF THIS IS THE CORRECT TYPE

        logger.info`Successfully reloaded ${data.length} application (/) commands.`;
    } catch (error) {
        logger.error`${error}`;
    }
})();
