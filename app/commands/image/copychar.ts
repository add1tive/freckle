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
    getHash,
    loadUserSettings,
    saveUserSettings
} from "helpers/userFiles";
import { makeGenericEmbed } from "helpers/genericEmbed";
import { randomBytes } from "node:crypto";

const GLOBAL_USER = "__@freckle_global";

const title = "Copy custom character for /textbox";

// prettier-ignore
export const data = new SlashCommandBuilder()
    .setName("copychar")
    .setDescription("Copy your custom /textbox characters")
    .setIntegrationTypes([1])
    .setContexts([0, 1, 2])
    .addStringOption((option) =>
        option
            .setName("id")
            .setDescription("Your character's ID.")
            .setRequired(true)
    )
    .addStringOption((option) =>
        option
            .setName("idnew")
            .setDescription("Your character's copy's ID.")
            .setRequired(true)
    );

export async function execute(interaction: ChatInputCommandInteraction) {
    const hash = getHash(interaction.user.id);
    logger.info`Copying character for user hash ${hash}`;

    // options
    const id = interaction.options.getString("id", true);
    const idnew = interaction.options.getString("idnew", true);

    let settings = loadUserSettings(interaction.user.id);

    // check if character exists -- original
    if (!(settings?.customCharacters && settings?.customCharacters[id])) {
        const embed = makeGenericEmbed(title, `Custom character \`${id}\` doesn't exist!`, "error");
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
    let charCopy = { ...settings.customCharacters[id] };
    charCopy.fileName = randomBytes(7).toString("hex") + ".png.frkl"; // new filename
    settings.customCharacters[idnew] = charCopy;

    // copy spritesheet
    copyUserFileAndReencrypt(
        interaction.user.id, // original user
        interaction.user.id, // destination user: same
        path.join("chars", settings.customCharacters[id].fileName), // original png
        path.join("chars", charCopy.fileName) // copied and reencrypted png
    );

    saveUserSettings(interaction.user.id, settings);

    const embed = makeGenericEmbed(
        title,
        `Character \`${id}\` successfully copied to ${idnew}.`,
        "info"
    );
    await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
    logger.info`Successfully copied character for user hash ${hash}`;
}
