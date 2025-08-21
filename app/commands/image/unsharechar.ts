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
    decrypt,
    getFullUserFilePath,
    getHash,
    loadUserSettings,
    saveUserSettings
} from "helpers/userFiles";
import { makeGenericEmbed } from "helpers/genericEmbed";
import { unlinkSync } from "node:fs";

const GLOBAL_USER = "__@freckle_global";

const title = "Unshare a shared character for /textbox";

// prettier-ignore
export const data = new SlashCommandBuilder()
    .setName("unsharechar")
    .setDescription("Unshare a shared character for /textbox using its sharing link")
    .setIntegrationTypes([1])
    .setContexts([0, 1, 2])
    .addStringOption((option) =>
        option
            .setName("link")
            .setDescription("The character's sharing link.")
            .setRequired(true)
    );

export async function execute(interaction: ChatInputCommandInteraction) {
    const hash = getHash(interaction.user.id);
    logger.info`Unsharing character for user hash ${hash}`;

    // options
    const link = interaction.options.getString("link", true);
    const hashedLink = getHash(link);

    let settings = loadUserSettings(interaction.user.id);
    let globalSettings = loadUserSettings(GLOBAL_USER);

    // CHECK
    // check if user has anything shared
    if (!(settings && settings.sharedLinks)) {
        const embed = makeGenericEmbed(
            title,
            `Sharing link \`${link}\` doesn't exist -- you have nothing shared.`,
            "error"
        );
        await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
        return;
    }

    // check if character exists
    if (
        !(
            globalSettings?.customCharactersEncrypted &&
            globalSettings?.customCharactersEncrypted[hashedLink]
        )
    ) {
        const embed = makeGenericEmbed(title, `Sharing link \`${link}\` doesn't exist.`, "error");
        await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
        return;
    }

    const char = JSON.parse(
        decrypt(
            Buffer.from(globalSettings.customCharactersEncrypted[hashedLink], "base64"),
            link
        ).toString()
    );

    // check if that character really belongs to this user
    if (char.sharedBy !== hash) {
        const embed = makeGenericEmbed(
            title,
            `Sharing link \`${link}\` isn't yours. You'll have to ask its creator to take this character down.`,
            "error"
        );
        await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
        return;
    }

    // DELETE
    // OP USER SIDE
    // delete the stored link in the character's spec
    if (
        settings.customCharacters &&
        settings.customCharacters[settings.sharedLinks[link]].sharedLink
    ) {
        settings.customCharacters[settings.sharedLinks[link]].sharedLink = undefined;
    }

    // delete from user's links object
    delete settings.sharedLinks[link];

    // GLOBAL USER SIDE
    // delete character image
    unlinkSync(getFullUserFilePath(GLOBAL_USER, path.join("chars", char.fileName)));

    // delete character spec
    delete globalSettings.customCharactersEncrypted[hashedLink];
    saveUserSettings(GLOBAL_USER, globalSettings);

    const embed = makeGenericEmbed(title, `Sharing link \`${link}\` successfully removed.`, "info");
    await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
    logger.info`Successfully unshared character for user hash ${hash}`;
}
