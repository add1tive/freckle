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
import { loadUserSettings } from "helpers/userFiles";
import { exec } from "node:child_process";

import path from "node:path";
const logger = getLogger(["app"]).getChild(path.basename(import.meta.filename).replace(".ts", ""));

const title = "List custom characters for /textbox";

// prettier-ignore
export const data = new SlashCommandBuilder()
    .setName("listchars")
    .setDescription(title)
    .setIntegrationTypes([1])
    .setContexts([0, 1, 2]);

export async function execute(interaction: ChatInputCommandInteraction) {
    let settings = loadUserSettings(interaction.user.id);

    // check if characters exist
    if (
        !settings ||
        !settings.customCharacters ||
        Object.keys(settings.customCharacters).length === 0
    ) {
        const embed = makeGenericEmbed(title, `You don't have any custom characters.`, "error");
        await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
        return;
    }

    const embed = makeGenericEmbed(
        title,
        `Your characters: ${Object.keys(settings.customCharacters)
            .map((value) => `\`${value}\``)
            .join(", ")}`,
        "info"
    );

    await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
}
