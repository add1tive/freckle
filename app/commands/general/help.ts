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

import { getLogger } from "@logtape/logtape";
import { ChatInputCommandInteraction, MessageFlags, SlashCommandBuilder } from "discord.js";
import { makeGenericEmbed } from "helpers/genericEmbed";
import { exec } from "node:child_process";

import path from "node:path";
const logger = getLogger(["app"]).getChild(path.basename(import.meta.filename).replace(".ts", ""));

let gitCommit = "unknown";
exec("git log --pretty=format:'%h' -n 1", function (error, stdout, stderr) {
    gitCommit = stdout.replaceAll("'", "");
});

const title = "Help and info";

// prettier-ignore
export const data = new SlashCommandBuilder()
    .setName("help")
    .setDescription("Sends you tips, useful links and all that")
    .setIntegrationTypes([1])
    .setContexts([0, 1, 2]);

export async function execute(interaction: ChatInputCommandInteraction) {
    const embed = makeGenericEmbed(
        title,
        `Running Freckle version \`${gitCommit}\`.\nVisit the website [here](https://add1tive.github.io/freckle/).`,
        "info"
    );

    await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
}
