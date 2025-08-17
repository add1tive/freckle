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
import { getLogger } from "@logtape/logtape";
import { TextboxChar } from "$shared/types/freckle.t";
import { ChatInputCommandInteraction } from "discord.js";

const logger_ = getLogger(["freckle-app"]);
const logger = logger_.getChild("changechar");

async function dothis(username: string, character: TextboxChar) {
    let userSettings = JSON.parse(fs.readFileSync("./local/userconfig.json", "utf8")); // is utf8 necessary?
    userSettings["users"][username] = {
        character: character
    };
    fs.writeFileSync("./local/userconfig.json", JSON.stringify(userSettings, null, 2));
}

module.exports = {
	data: {
        options: [
        {
            type: 3,
            name: "character",
            description: "The character",
            required: true
        }
        ],
        name: "setdefault",
        description: "Sets user's default character",
        "integration_types": [1],
        "contexts": [0, 1, 2]
    },
	async execute(interaction: ChatInputCommandInteraction) {
        const username = interaction.user.username;
        const character = interaction.options.getString("character") as TextboxChar;

        await dothis(username, character);
        await interaction.reply("changed to " + character);
	},
};
