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
import { SpriteInfoCustomChar, textboxChars, TextboxFont } from "@freckle-a1e/shared/types/freckle.t";
import { getHash, loadUserSettings, saveUserSettings, writeUserFile } from "helpers/userFiles";
import { makeGenericEmbed } from "helpers/genericEmbed";
import { randomBytes } from "node:crypto";

const title = "Add custom character for /textbox";

// prettier-ignore
export const data = new SlashCommandBuilder()
    .setName("addchar")
    .setDescription("Add your own custom (private) character for the /textbox command")
    .setIntegrationTypes([1])
    .setContexts([0, 1, 2])
    .addAttachmentOption((option) =>
        option
            .setName("spritesheet")
            .setDescription("The character spritesheet. Check docs on how to format it.")
            .setRequired(true)
    )
    .addStringOption((option) =>
        option
            .setName("id")
            .setDescription("The character's ID. You'll use this to select the character.")
            .setRequired(true)
    )
    .addStringOption((option) =>
        option
            .setName("name")
            .setDescription("The character's name.")
            .setRequired(true)
    )
    .addIntegerOption((option) =>
        option
            .setName("width")
            .setDescription("The width of the portrait sprites (all of them have to be the same size).")
            .setRequired(true)
    )
    .addIntegerOption((option) =>
        option
            .setName("height")
            .setDescription("The height of the portrait sprites (all of them have to be the same size).")
            .setRequired(true)
    )
    .addIntegerOption((option) =>
        option
            .setName("columns")
            .setDescription("The amount of columns in the spritesheet.")
            .setRequired(true)
    )
    .addIntegerOption((option) =>
        option
            .setName("expressions")
            .setDescription("The amount of expressions in the spritesheet.")
            .setRequired(true)
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
    logger.info`Adding character for user hash ${hash}`;

    // options
    const spritesheet = interaction.options.getAttachment("spritesheet", true);
    const id = interaction.options.getString("id", true);
    const name = interaction.options.getString("name", true);
    let offsetx = interaction.options.getInteger("offsetx");
    offsetx ??= 10;
    let offsety = interaction.options.getInteger("offsety");
    offsety ??= 10;
    const width = interaction.options.getInteger("width", true);
    const height = interaction.options.getInteger("height", true);
    const columns = interaction.options.getInteger("columns", true);
    const expressions = interaction.options.getInteger("expressions", true);
    let isdarkner = interaction.options.getBoolean("isdarkner");
    let font = interaction.options.getString("font") as TextboxFont | null; // is a choicer

    // --- CHECKS BELOW ---
    // if any fail, the command fails

    // check if id is alphanumeric
    if (!/^[a-z0-9]+$/i.test(id)) {
        const embed = makeGenericEmbed(
            title,
            `\`${id}\` isn't a valid ID!
            Make sure it's English alphanumeric (A-Z, a-z and 0-9).
            Underlines (_) and hyphens (-) are allowed.`,
            "error"
        );
        await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
        return;
    }

    // check if character already exists
    let settings = loadUserSettings(interaction.user.id);
    if (
        (settings?.customCharacters && settings?.customCharacters[id]) ||
        (textboxChars as readonly string[]).includes(id)
    ) {
        const embed = makeGenericEmbed(title, `Character \`${id}\` already exists!`, "error");
        await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
        return;
    }

    // check if attachment is an image
    logger.debug`Attachment type: ${spritesheet.contentType}`;
    if (!spritesheet.contentType?.includes("image")) {
        const embed = makeGenericEmbed(title, `Attached file isn't an image!`, "error");
        await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
        return;
    }

    // --- CHECKS DONE ---

    // get image
    const response = await fetch(spritesheet.url);
    const ssImage = Buffer.from(await response.arrayBuffer());

    // actually build the character
    const newChar: SpriteInfoCustomChar = {
        name,
        fileName: randomBytes(7).toString("hex") + ".png.frkl",
        expressionCount: expressions,
        portraitHeight: height,
        portraitWidth: width,
        spritesheetColumns: columns,
        textboxOffsetX: offsetx,
        textboxOffsetY: offsety,
        customFont: font ?? undefined,
        isDarkner: isdarkner ?? undefined
    };

    // if the user has no settings
    settings ??= { customCharacters: {} };
    // if the user already has settings but no custom characters
    settings.customCharacters ??= {};

    settings.customCharacters[id] = newChar;

    saveUserSettings(interaction.user.id, settings);
    writeUserFile(interaction.user.id, path.join("char", newChar.fileName), ssImage);

    const embed = makeGenericEmbed(title, `Character \`${id}\` successfully added!`, "info");
    await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
    logger.info`Added character for user hash ${hash}`;
}
