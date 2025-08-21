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

import { getLogger } from "@logtape/logtape";
import { TextboxChar, textboxChars } from "@freckle-a1e/shared/types/freckle.t";
import { AutocompleteInteraction, ChatInputCommandInteraction, EmbedBuilder, MessageFlags, SlashCommandBuilder } from "discord.js";
import { loadUserSettings, saveUserSettings } from "helpers/userFiles";
import { makeGenericEmbed } from "helpers/genericEmbed";

import path from "node:path";
const logger = getLogger(["app"]).getChild(path.basename(import.meta.filename).replace(".ts", ""));

const title = "Set default textbox character";

export const data = new SlashCommandBuilder()
    .setName("setdefault")
    .setDescription("Sets user's default character")
    .setIntegrationTypes([1])
    .setContexts([0, 1, 2])
    .addStringOption((option) =>
        option
            .setName("character")
            .setDescription("The character.")
            .setRequired(true)
            .setAutocomplete(true)
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
    const userId = interaction.user.id;
    const character = interaction.options.getString("character");

    let embed: EmbedBuilder;

    // @ts-expect-error
    if (textboxChars.includes(character)) {
        let userSettings = loadUserSettings(userId);

        if (userSettings) userSettings.character = character as TextboxChar;
        else userSettings = { character: character as TextboxChar };

        saveUserSettings(userId, userSettings);

        embed = makeGenericEmbed(title, `Changed to \`${character}\`.`, "info");
    } else {
        embed = makeGenericEmbed(title, `Failed to change character: \`${character}\` doesn't exist.`, "error");
    }

    await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
}
