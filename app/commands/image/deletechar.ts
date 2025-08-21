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

// Node
import path from "node:path";

// discord.js
import { AutocompleteInteraction, ChatInputCommandInteraction, MessageFlags, SlashCommandBuilder } from "discord.js";

// LogTape
import { getLogger } from "@logtape/logtape";
const logger = getLogger(["app"]).getChild(path.basename(import.meta.filename).replace(".ts", ""));

// Freckle
import {
    getFullUserFilePath,
    getHash,
    loadUserSettings,
    saveUserSettings
} from "helpers/userFiles";
import { makeGenericEmbed } from "helpers/genericEmbed";
import { unlinkSync } from "node:fs";
import { textboxChars } from "@freckle-a1e/shared/types/freckle.t";

const GLOBAL_USER = "__@freckle_global";

const title = "Delete a custom character for /textbox";

// prettier-ignore
export const data = new SlashCommandBuilder()
    .setName("deletechar")
    .setDescription("Delete a custom character for /textbox (doesn't delete its shared version, if shared)")
    .setIntegrationTypes([1])
    .setContexts([0, 1, 2])
    .addStringOption((option) =>
        option
            .setName("id")
            .setDescription("The character ID.")
            .setRequired(true)
            .setAutocomplete(true)
    );

export async function autocomplete(interaction: AutocompleteInteraction) {
    const userSettings = loadUserSettings(interaction.user.id);
    let choices = textboxChars as unknown as string[];
    if (userSettings && userSettings.customCharacters)
        choices = choices.concat(Object.keys(userSettings.customCharacters));

    const focusedValue = interaction.options.getFocused();
    const filtered = choices.filter((choice) => choice.startsWith(focusedValue));
    await interaction.respond(filtered.map((choice) => ({ name: choice, value: choice })));
}

export async function execute(interaction: ChatInputCommandInteraction) {
    const hash = getHash(interaction.user.id);
    logger.info`Deleting character for user hash ${hash}`;

    // options
    const id = interaction.options.getString("id", true);

    let settings = loadUserSettings(interaction.user.id);

    // check if character exists
    if (!(settings?.customCharacters && settings?.customCharacters[id])) {
        const embed = makeGenericEmbed(title, `Custom character \`${id}\` doesn't exist!`, "error");
        await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
        return;
    }

    // delete character image
    unlinkSync(
        getFullUserFilePath(
            interaction.user.id,
            path.join("chars", settings.customCharacters[id].fileName)
        )
    );

    // delete character spec itself
    delete settings.customCharacters[id];
    saveUserSettings(interaction.user.id, settings);

    const embed = makeGenericEmbed(
        title,
        `Character \`${id}\` successfully removed.
You're still able to take down its sharing link using \`/unsharechar\``,
        "info"
    );
    await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
    logger.info`Deleted character for user hash ${hash}`;
}
