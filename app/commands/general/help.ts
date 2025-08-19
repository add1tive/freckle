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
import { ChatInputCommandInteraction, EmbedBuilder, MessageFlags } from "discord.js";
import { exec } from "node:child_process";

const logger = getLogger(["app"]).getChild("help");

let gitCommit = "unknown";
exec("git log --pretty=format:'%h' -n 1", function (error, stdout, stderr) {
    gitCommit = stdout.replaceAll("'", "");
});

export const data = {
    name: "help",
    description: "Sends you tips, useful links and all that",
    integration_types: [1],
    contexts: [0, 1, 2]
};

export async function execute(interaction: ChatInputCommandInteraction) {
    const embed = new EmbedBuilder()
        .setAuthor({
            name: "Freckle",
            url: "https://add1tive.github.io/freckle/"
        })
        .setTitle("Help and info")
        .setDescription(
            `Running Freckle version \`${gitCommit}\`.\nVisit the website [here](https://add1tive.github.io/freckle/).`
        )
        .setColor("#00b0f4")
        .setFooter({
            text: "Freckle",
            iconURL: "https://us-east-1.tixte.net/uploads/add1tive.tixte.co/favicon.png"
        })
        .setTimestamp();

    await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
}
