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
import { AutocompleteInteraction, ChatInputCommandInteraction, MessageFlags, SlashCommandBuilder } from "discord.js";

// LogTape
import { getLogger } from "@logtape/logtape";
const logger = getLogger(["app"]).getChild(path.basename(import.meta.filename).replace(".ts", ""));

// Freckle
import {
    copyUserFileAndReencrypt,
    encrypt,
    getHash,
    loadUserSettings,
    saveUserSettings
} from "helpers/userFiles";
import { makeGenericEmbed } from "helpers/genericEmbed";
import { randomBytes } from "node:crypto";
import { textboxChars } from "@freckle-a1e/shared/types/freckle.t";

const GLOBAL_USER = "__@freckle_global";

const title = "Share custom character for /textbox";

// prettier-ignore
export const data = new SlashCommandBuilder()
    .setName("sharechar")
    .setDescription("Make a sharing link for your custom /textbox characters")
    .setIntegrationTypes([1])
    .setContexts([0, 1, 2])
    .addStringOption((option) =>
        option
            .setName("id")
            .setDescription("Your character's ID.")
            .setRequired(true)
            .setAutocomplete(true)
    );
// .addIntegerOption((option) =>
//     option
//         .setName("expirein")
//         .setDescription("In how many days this link will expire. Set to 0 for it to never expire. Default: 7 days.")
// );

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
    logger.info`Sharing character for user hash ${hash}`;

    // options
    const id = interaction.options.getString("id", true);
    // let expirein = interaction.options.getInteger("expirein");
    // expirein ??= 7;

    let settings = loadUserSettings(interaction.user.id);
    let globalSettings = loadUserSettings(GLOBAL_USER);

    // check if character exists
    if (!(settings?.customCharacters && settings?.customCharacters[id])) {
        const embed = makeGenericEmbed(title, `Custom character \`${id}\` doesn't exist!`, "error");
        await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
        return;
    }

    // check if the same character has already been shared
    if (settings.customCharacters[id].sharedLink) {
        const embed = makeGenericEmbed(
            title,
            `Custom character \`${id}\` was already shared.
Its sharing link is ${settings.customCharacters[id].sharedLink}.`,
            "error"
        );
        await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
        return;
    }

    // generate shared link
    const link = randomBytes(4).toString("hex");
    const hashedLink = getHash(link);

    // if the global user has no settings
    globalSettings ??= { customCharactersEncrypted: {} };
    // if the global user already has settings but no custom characters
    globalSettings.customCharactersEncrypted ??= {};

    // add character
    let globalChar = {
        ...settings.customCharacters[id],
        sharedBy: hash // so we can check if the op can delete -- maybe change to actual id??
        // expires: Date.now() + expirein * 24 * 3600 // expiration timestamp
    };
    globalChar.fileName = randomBytes(7).toString("hex") + ".png.frkl"; // new filename

    // encrypt character using its link as a password and save
    globalSettings.customCharactersEncrypted[hashedLink] = encrypt(
        JSON.stringify(globalChar),
        link
    ).toString("base64");

    // add the link to original character
    settings.customCharacters[id].sharedLink = link;
    settings.sharedLinks ??= {};
    settings.sharedLinks[link] = id;

    copyUserFileAndReencrypt(
        interaction.user.id, // original user
        GLOBAL_USER, // destination user: global
        path.join("chars", settings.customCharacters[id].fileName), // original png
        path.join("chars", globalChar.fileName), // copied and reencrypted png
        undefined, // no custom passphrase (use user id)
        link // custom passphrase (so others can't access without the link)
    );

    saveUserSettings(interaction.user.id, settings);
    saveUserSettings(GLOBAL_USER, globalSettings);

    const embed = makeGenericEmbed(
        title,
        `Character \`${id}\` successfully shared.
**The link is \`${link}\`**
You're able to unshare your character by running \`/unsharechar\`.`,
        "info"
    );
    await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
    logger.info`Shared character for user hash ${hash}`;
}
