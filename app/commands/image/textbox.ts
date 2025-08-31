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
import path from "node:path";
import { randomBytes } from "node:crypto";
import { spawn } from "child_process";

// discord.js + canvas
import {
    AttachmentBuilder,
    AutocompleteInteraction,
    ChatInputCommandInteraction,
    SlashCommandBuilder
} from "discord.js";

// LogTape
import { getLogger } from "@logtape/logtape";
const logger = getLogger(["app"]).getChild(path.basename(import.meta.filename).replace(".ts", ""));

// Freckle
import { processTextbox } from "helpers/textboxProcessor";
import { textboxChars } from "@freckle-a1e/shared/types/freckle.t";
import { loadUserSettings } from "helpers/userFiles";

const title = "Textbox";

// prettier-ignore
export const data = new SlashCommandBuilder()
    .setName("textbox")
    .setDescription("Generate a UTDR textbox")
    .setIntegrationTypes([1])
    .setContexts([0, 1, 2])
    .addStringOption((option) =>
        option
            .setName("text")
            .setDescription("The text the character will say")
            .setRequired(true)
    )
    .addBooleanOption((option) =>
        option
            .setName("animated")
            .setDescription("Whether to animate the text and effects. On by default.")
    )
    .addIntegerOption((option) =>
        option
            .setName("charexp")
            .setDescription("The chosen character's expression, default is 1")
    )
    .addStringOption((option) =>
        option
            .setName("character")
            .setDescription("The character to be displayed (set your default with /setdefault)")
            .setAutocomplete(true)
    )
    .addBooleanOption((option) =>
        option
            .setName("darkworld")
            .setDescription("Whether to use the Dark World style or not. Leave empty for character defaults.")
    )
    .addStringOption((option) =>
        option
            .setName("font")
            .setDescription("The font to be displayed. Leave empty for character defaults.")
            .addChoices(
                { name: "Determination Mono", value: "Determination Mono" },
                { name: "Undertale Sans", value: "Undertale Sans" },
                { name: "Undertale Papyrus", value: "Undertale Papyrus" }
            )
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
    let instanceName = randomBytes(12).toString("hex");
    logger.info`received request, assigning name ${instanceName}`;

    let cachePath = "./.local/cache/" + instanceName + "/";

    cachePath = "./.local/cache/" + instanceName + "/";
    logger.debug`cache path: ${cachePath}`;

    fs.mkdirSync(cachePath, { recursive: true });

    const text = interaction.options.getString("text", true);
    const animated = interaction.options.getBoolean("animated");
    const expression = interaction.options.getInteger("charexp");
    const character = interaction.options.getString("character");
    const darkWorld = interaction.options.getBoolean("darkworld");
    const font = interaction.options.getString("font");

    const userId = interaction.user.id;

    await interaction.deferReply();

    if (animated === null || animated === true) { // animated by default
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
    } else {
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

        await interaction.editReply({ files: [attachment] });
    }

    logger.info`done with instance ${instanceName}`;
}
