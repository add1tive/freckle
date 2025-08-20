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
    getFullUserFilePath,
    getHash,
    loadUserSettings,
    saveUserSettings
} from "helpers/userFiles";
import { makeGenericEmbed } from "helpers/genericEmbed";
import { unlinkSync } from "node:fs";
import { TextboxFont } from "@freckle-a1e/shared/types/freckle.t";

const GLOBAL_USER = "__@freckle_global";

const title = "Edit a custom character for /textbox";

// prettier-ignore
export const data = new SlashCommandBuilder()
    .setName("editchar")
    .setDescription("Edit a custom character for /textbox")
    .setIntegrationTypes([1])
    .setContexts([0, 1, 2])
    .addStringOption((option) =>
        option
            .setName("id")
            .setDescription("The character ID.")
            .setRequired(true)
    )
    // .addAttachmentOption((option) =>
    //     option
    //         .setName("spritesheet")
    //         .setDescription("The character spritesheet. Check docs on how to format it.")
    // )
    .addStringOption((option) =>
        option
            .setName("name")
            .setDescription("The character's name.")
    )
    .addIntegerOption((option) =>
        option
            .setName("width")
            .setDescription("The width of the portrait sprites (all of them have to be the same size).")
    )
    .addIntegerOption((option) =>
        option
            .setName("height")
            .setDescription("The height of the portrait sprites (all of them have to be the same size).")
    )
    .addIntegerOption((option) =>
        option
            .setName("columns")
            .setDescription("The amount of columns in the spritesheet.")
    )
    .addIntegerOption((option) =>
        option
            .setName("expressions")
            .setDescription("The amount of expressions in the spritesheet.")
    )
    .addIntegerOption((option) =>
        option
            .setName("offsetx")
            .setDescription("The horizontal offset of the sprites from the textbox's top left corner. Default: 10.")
    )
    .addIntegerOption((option) =>
        option
            .setName("offsety")
            .setDescription("The vertical offset of the sprites from the textbox's top left corner. Default: 10.")
    )
    .addBooleanOption((option) =>
        option
            .setName("isdarkner")
            .setDescription("Whether the character is a Darkner or not. Default: False.")
    )
    .addStringOption((option) =>
        option
            .setName("font")
            .setDescription("The font the character will use. Default: Determination Mono.")
            .addChoices(
                { name: "Determination Mono", value: "Determination Mono" },
                { name: "Undertale Sans", value: "Undertale Sans" },
                { name: "Undertale Papyrus", value: "Undertale Papyrus" }
            )
    );

export async function execute(interaction: ChatInputCommandInteraction) {
    const hash = getHash(interaction.user.id);
    logger.info`Editing character for user hash ${hash}`;

    // options
    const id = interaction.options.getString("id", true);
    // const spritesheet = interaction.options.getAttachment("spritesheet");
    const name = interaction.options.getString("name");
    const offsetx = interaction.options.getInteger("offsetx");
    const offsety = interaction.options.getInteger("offsety");
    const width = interaction.options.getInteger("width");
    const height = interaction.options.getInteger("height");
    const columns = interaction.options.getInteger("columns");
    const expressions = interaction.options.getInteger("expressions");
    const isdarkner = interaction.options.getBoolean("isdarkner");
    const font = interaction.options.getString("font") as TextboxFont | null; // is a choicer

    let settings = loadUserSettings(interaction.user.id);

    // check if character exists
    if (!(settings?.customCharacters && settings?.customCharacters[id])) {
        const embed = makeGenericEmbed(title, `Custom character \`${id}\` doesn't exist!`, "error");
        await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
        return;
    }

    // edit settings
    // if (spritesheet) settings.customCharacters[id].fileName = ...;
    if (name) settings.customCharacters[id].name = name;
    if (offsetx) settings.customCharacters[id].textboxOffsetX = offsetx;
    if (offsety) settings.customCharacters[id].textboxOffsetY = offsety;
    if (width) settings.customCharacters[id].portraitWidth = width;
    if (height) settings.customCharacters[id].portraitHeight = height;
    if (columns) settings.customCharacters[id].spritesheetColumns = columns;
    if (expressions) settings.customCharacters[id].expressionCount = expressions;
    if (isdarkner) settings.customCharacters[id].isDarkner = isdarkner;
    if (font) settings.customCharacters[id].customFont = font;

    saveUserSettings(interaction.user.id, settings);

    const embed = makeGenericEmbed(title, `Character \`${id}\` successfully edited.`, "info");
    await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
    logger.info`Editing character for user hash ${hash}`;
}
