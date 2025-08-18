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
import fs from "node:fs";
import path from "node:path";

// -- LOGGING --
import { configure, getConsoleSink, getLogger } from "@logtape/logtape";
import { getPrettyFormatter } from "@logtape/pretty";
import { getStreamFileSink } from "@logtape/file";
import { pathToFileURL } from "node:url";

fs.mkdirSync(".local/logs", { recursive: true });

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

await configure({
    sinks: {
        console: getConsoleSink({ formatter: prettyCustColor }),
        file: getStreamFileSink(`.local/logs/${dateRn}.log`, { formatter: prettyNoColor })
    },
    loggers: [{ category: [], lowestLevel: "debug", sinks: ["console", "file"] }]
});
const logger = getLogger(["freckle-app"]).getChild("deploy-commands");
// -------------

const __dirname = import.meta.dirname;

if (!process.env.TOKEN) {
    logger.fatal`Could not find environment variable "TOKEN"! Exiting.`;
    process.exit();
}

const commands = [];
const foldersPath = path.join(__dirname, "commands");
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith(".ts"));
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = await import(pathToFileURL(filePath).href);
        if ("data" in command && "execute" in command) {
            commands.push(command.data);
        } else {
            logger.warn`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`;
        }
    }
}

const rest = new REST().setToken(process.env.TOKEN);

(async () => {
    try {
        logger.info`Started refreshing ${commands.length} application (/) commands.`;

        if (!process.env.CLIENT_ID) {
            logger.fatal`Could not find environment variable "CLIENT_ID"! Exiting.`;
            process.exit();
        }

        // guild commands (not yet used, hence the commenting)
        // const data = await rest.put(
        // 	Routes.applicationGuildCommands(clientId, guildId),
        // 	{ body: commands },
        // );

        // app commands
        const data = (await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), {
            body: commands
        })) as ApplicationCommand[]; // ! NO IDEA IF THIS IS THE CORRECT TYPE

        logger.info`Successfully reloaded ${data.length} application (/) commands.`;
    } catch (error) {
        logger.error`${error}`;
    }
})();
