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
// import fs from "node:fs";
import { randomBytes } from "node:crypto";

// discord.js + canvas
import { AttachmentBuilder, ChatInputCommandInteraction } from "discord.js";

// LogTape
import { getLogger } from "@logtape/logtape";
const logger = getLogger(["app"]).getChild("textbox");

// Freckle
import { processTextbox } from "helpers/textboxProcessor";

const title = "Textbox";

export const data = {
    options: [
        {
            type: 3,
            name: "text",
            description: "The text the character will say",
            required: true
        },
        {
            type: 4,
            name: "charexp",
            description: "The chosen character's expression, default is 1",
            required: false
        },
        {
            type: 3,
            name: "character",
            description: "The character to be displayed (set your default with /setdefault)",
            required: false
        },
        {
            type: 5,
            name: "darkworld",
            description:
                "Whether to use the Dark World style or not. Leave empty for character defaults.",
            required: false
        },
        {
            type: 3,
            name: "font",
            description: "The font to be displayed. Leave empty for character defaults.",
            required: false
        }
    ],
    name: "textbox",
    description: "Generate a UTDR textbox",
    integration_types: [1],
    contexts: [0, 1, 2]
};

export async function execute(interaction: ChatInputCommandInteraction) {
    let instanceName = randomBytes(12).toString("hex");
    logger.info`received request, assigning name ${instanceName}`;

    const text = interaction.options.getString("text") as string; // required
    const expression = interaction.options.getInteger("charexp");
    const character = interaction.options.getString("character");
    const darkWorld = interaction.options.getBoolean("darkworld");
    const font = interaction.options.getString("font");

    const userId = interaction.user.id;

    const attachment = new AttachmentBuilder(
        await processTextbox({
            text,
            userId,
            character,
            darkWorld,
            expression,
            font,
            cachePath: null
        }),
        { name: "image.png" }
    );

    await interaction.reply({ files: [attachment] });
}
