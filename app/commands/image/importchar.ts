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
import { ChatInputCommandInteraction, MessageFlags, SlashCommandBuilder } from "discord.js";

// LogTape
import { getLogger } from "@logtape/logtape";
const logger = getLogger(["app"]).getChild(path.basename(import.meta.filename).replace(".ts", ""));

// Freckle
import {
    copyUserFileAndReencrypt,
    decrypt,
    getHash,
    loadUserSettings,
    saveUserSettings
} from "helpers/userFiles";
import { makeGenericEmbed } from "helpers/genericEmbed";
import { randomBytes } from "node:crypto";
import { textboxChars } from "@freckle-a1e/shared/types/freckle.t";

const GLOBAL_USER = "__@freckle_global";

const title = "Import shared custom character for /textbox";

// prettier-ignore
export const data = new SlashCommandBuilder()
    .setName("importchar")
    .setDescription("Import a shared character for /textbox")
    .setIntegrationTypes([1])
    .setContexts([0, 1, 2])
    .addStringOption((option) =>
        option
            .setName("link")
            .setDescription("The sharing link.")
            .setRequired(true)
    )
    .addStringOption((option) =>
        option
            .setName("id")
            .setDescription("The ID of your copy (a new value).")
            .setRequired(true)
    );

export async function execute(interaction: ChatInputCommandInteraction) {
    const hash = getHash(interaction.user.id);
    logger.info`Importing shared character for user hash ${hash}`;

    // options
    const link = interaction.options.getString("link", true);
    const hashedLink = getHash(link);
    const id = interaction.options.getString("id", true);

    let settings = loadUserSettings(interaction.user.id);
    let globalSettings = loadUserSettings(GLOBAL_USER);

    // check if character with the same id already exists
    if (
        (settings?.customCharacters && settings?.customCharacters[id]) ||
        (textboxChars as readonly string[]).includes(id)
    ) {
        const embed = makeGenericEmbed(title, `Character \`${id}\` already exists!`, "error");
        await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
        return;
    }

    // check if link is actually valid
    if (
        !(
            globalSettings?.customCharactersEncrypted &&
            globalSettings.customCharactersEncrypted[hashedLink]
        )
    ) {
        const embed = makeGenericEmbed(title, `Sharing link \`${link}\` doesn't exist!`, "error");
        await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
        return;
    }

    const char = JSON.parse(
        decrypt(
            Buffer.from(globalSettings.customCharactersEncrypted[hashedLink], "base64"),
            link
        ).toString()
    );

    // if the user has no settings
    settings ??= { customCharacters: {} };
    // if the user already has settings but no custom characters
    settings.customCharacters ??= {};

    // add character
    let newChar = { ...char };
    newChar.sharedBy = undefined;
    // newChar.expires = undefined;
    newChar.fileName = randomBytes(7).toString("hex") + ".png.frkl"; // new filename
    settings.customCharacters[id] = newChar;

    // todo: add stat for how many imports happened?

    copyUserFileAndReencrypt(
        GLOBAL_USER, // original user
        interaction.user.id, // destination user: this one
        path.join("chars", char.fileName), // original png
        path.join("chars", newChar.fileName), // copied and reencrypted png
        link, // custom passphrase (the whole point of a link you privately share around)
        undefined // no custom passphrase (use user id)
    );

    saveUserSettings(interaction.user.id, settings);

    const embed = makeGenericEmbed(
        title,
        `Character \`${id}\` successfully added from \`${link}\`.`,
        "info"
    );
    await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
    logger.info`Imported shared character for user hash ${hash}`;
}
