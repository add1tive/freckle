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

import fs from "node:fs";
import path from "node:path";
import { Client, Collection, GatewayIntentBits } from "discord.js";
import { token } from "./local/private.json";

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

// logger
configure({
    sinks: {
        console: getConsoleSink({ formatter: prettyCustColor }),
        file: getStreamFileSink(`local/logs/${dateRn}.log`, { formatter: prettyNoColor })
    },
    loggers: [{ category: [], lowestLevel: "debug", sinks: ["console", "file"] }]
});
const logger = getLogger(["freckle-app"]).getChild("index");
// -------------

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.commands = new Collection();
const foldersPath = path.join(__dirname, "commands");
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith(".ts"));
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        if ("data" in command && "execute" in command) {
            client.commands.set(command.data.name, command);
        } else {
            logger.warn`The command at ${filePath} is missing a required "data" or "execute" property.`;
        }
    }
}

const eventsPath = path.join(__dirname, "events");
const eventFiles = fs.readdirSync(eventsPath).filter((file) => file.endsWith(".ts"));

for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
    } else {
        client.on(event.name, (...args) => event.execute(...args));
    }
}

client.login(token);
