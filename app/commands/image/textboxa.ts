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
import fs from "node:fs";
import { randomBytes } from "node:crypto";
import { spawn } from "child_process";

// discord.js + canvas
import { ChatInputCommandInteraction } from "discord.js";

// LogTape
import { getLogger } from "@logtape/logtape";
const logger = getLogger(["app"]).getChild("textboxa");

// Freckle
import { processTextbox } from "helpers/textboxProcessor";

const title = "Textbox animated";

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
    name: "textboxa",
    description: "Generate an animated UTDR textbox",
    integration_types: [1],
    contexts: [0, 1, 2]
};

export async function execute(interaction: ChatInputCommandInteraction) {
    let instanceName = randomBytes(12).toString("hex");
    logger.info`received request, assigning name ${instanceName}`;

    let cachePath = "./.local/cache/" + instanceName + "/";

    cachePath = "./.local/cache/" + instanceName + "/";
    logger.debug`cache path: ${cachePath}`;

    fs.mkdirSync(cachePath, { recursive: true });

    const text = interaction.options.getString("text") as string; // required
    const expression = interaction.options.getInteger("charexp");
    const character = interaction.options.getString("character");
    const darkWorld = interaction.options.getBoolean("darkworld");
    const font = interaction.options.getString("font");

    const userId = interaction.user.id;

    await interaction.deferReply();

    await processTextbox({
        text,
        expression,
        character,
        userId,
        darkWorld,
        font,
        cachePath
    });

    // prettier-ignore
    const ffmpeg = spawn(
        "ffmpeg",
        [
            "-f", "image2",
            "-framerate", "30",
            "-i", "%003d.png",
            // Warning: Discord lossy compresses anyway
            // ...however, lossless files actually end up being smaller
            "-lossless", "1",
            "-loop", "0",
            "out.webp"
        ],
        { cwd: cachePath }
    );

    ffmpeg.on("close", (code) => {
        // console.log(`ffmpeg process exited with code ${code}`);
        interaction.editReply({ files: [`${cachePath}out.webp`] });
    });

    logger.info`done with instance ${instanceName}`;
}
