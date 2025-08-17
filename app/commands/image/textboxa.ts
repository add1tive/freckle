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
const logger_ = getLogger(["freckle-app"]);
const logger = logger_.getChild("textboxa");

// Freckle
import { makeImageNew } from "helpers/textboxRenderer";
import { TextboxChar } from "$shared/types/freckle.t";

module.exports = {
	data: {
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
            }
        ],
        name: "textboxa",
        description: "Generate an animated UTDR textbox",
        integration_types: [1],
        contexts: [0, 1, 2]
    },
	async execute(interaction: ChatInputCommandInteraction) {
        let instanceName = randomBytes(12).toString("hex");
        logger.info `received request, assigning name ${instanceName}`;

        let cachePath = "./local/cache/" + instanceName + "/";

        cachePath = "./local/cache/" + instanceName + "/";
        logger.debug `cache path: ${cachePath}`;

        fs.mkdirSync(cachePath, {recursive: true});

        const text = interaction.options.getString("text");
        const charexp = interaction.options.getInteger("charexp");
        let character = interaction.options.getString("character") as TextboxChar | null;
        const size = 2; // used to be customisable, disabled probably forever
        const userId = interaction.user.id;

        if (character !== null) character = character.toLowerCase() as TextboxChar;

        await interaction.deferReply();
        await makeImageNew(text, charexp, size, character, userId, cachePath);

        const ffmpeg = spawn("ffmpeg", [
            "-f", "image2",
            "-framerate", "30",
            "-i", "%003d.png",
            "-lossless", "1",
            "-loop", "0",
            "out.webp"
        ], { cwd: cachePath });

        ffmpeg.on("close", (code) => {
            // console.log(`ffmpeg process exited with code ${code}`);
            interaction.editReply({ files: [`${cachePath}out.webp`] });
        });

        logger.info `done with instance ${instanceName}`;
	},
};
