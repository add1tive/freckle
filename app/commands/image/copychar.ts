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
import {
    AutocompleteInteraction,
    ChatInputCommandInteraction,
    MessageFlags,
    SlashCommandBuilder
} from "discord.js";

// LogTape
import { getLogger } from "@logtape/logtape";
const logger = getLogger(["app"]).getChild(path.basename(import.meta.filename).replace(".ts", ""));

// Freckle
import {
    copyUserFileAndReencrypt,
    getHash,
    loadUserSettings,
    saveUserSettings,
    writeUserFile
} from "helpers/userFiles";
import { makeGenericEmbed } from "helpers/genericEmbed";
import { randomBytes } from "node:crypto";
import {
    SpriteInfo,
    SpriteInfoCustomChar,
    TextboxChar,
    textboxChars
} from "@freckle-a1e/shared/types/freckle.t";
import spriteInfo_ from "@freckle-a1e/shared/assets/images/utdr_talk/spriteInfo.json";
import { readFileSync } from "node:fs";
const spriteInfo = spriteInfo_ as unknown as SpriteInfo; // s for spriteInfo

const GLOBAL_USER = "__@freckle_global";

const title = "Copy custom character for /textbox";

// prettier-ignore
export const data = new SlashCommandBuilder()
    .setName("copychar")
    .setDescription("Copy a /textbox character")
    .setIntegrationTypes([1])
    .setContexts([0, 1, 2])
    .addStringOption((option) =>
        option
            .setName("id")
            .setDescription("Your character's OR a stock character's ID.")
            .setRequired(true)
            .setAutocomplete(true)
    )
    .addStringOption((option) =>
        option
            .setName("idnew")
            .setDescription("The copy's ID.")
            .setRequired(true)
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
    logger.info`Copying character for user hash ${hash}`;

    // options
    const id = interaction.options.getString("id", true);
    const idnew = interaction.options.getString("idnew", true);

    let settings = loadUserSettings(interaction.user.id);

    const isStock = (textboxChars as readonly string[]).includes(id);

    // if the user has no settings
    settings ??= { customCharacters: {} };
    // if the user already has settings but no custom characters
    settings.customCharacters ??= {};

    // check if character exists -- original
    if (!(isStock || settings.customCharacters[id])) {
        const embed = makeGenericEmbed(title, `Character \`${id}\` doesn't exist!`, "error");
        await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
        return;
    }

    // check if character exists -- copy
    if (settings?.customCharacters && settings?.customCharacters[idnew]) {
        const embed = makeGenericEmbed(
            title,
            `Custom character \`${idnew}\` already exists!`,
            "error"
        );
        await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
        return;
    }

    // copy character spec
    let charCopy: SpriteInfoCustomChar;
    const fileName = randomBytes(7).toString("hex") + ".png.frkl"; // new filename
    if (isStock) {
        charCopy = { ...spriteInfo[id as TextboxChar], fileName };
    } else {
        charCopy = { ...settings.customCharacters[id] };
        charCopy.fileName = fileName;
        charCopy.sharedLink = undefined;
    }
    settings.customCharacters[idnew] = charCopy;

    // copy spritesheet
    if (!isStock) {
        copyUserFileAndReencrypt(
            interaction.user.id, // original user
            interaction.user.id, // destination user: same
            path.join("chars", settings.customCharacters[id].fileName), // original png
            path.join("chars", fileName) // copied and reencrypted png
        );
    } else {
        writeUserFile(
            interaction.user.id,
            path.join("chars", fileName),
            readFileSync(`../shared/assets/images/utdr_talk/${id}.png`)
        );
    }

    saveUserSettings(interaction.user.id, settings);

    const embed = makeGenericEmbed(
        title,
        `Character \`${id}\` successfully copied to \`${idnew}\`.`,
        "info"
    );
    await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
    logger.info`Successfully copied character for user hash ${hash}`;
}
