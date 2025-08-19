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

import { ColorResolvable, EmbedBuilder } from "discord.js";

export function makeGenericEmbed(title: string, description: string, type?: "info" | "error") {
    let color: ColorResolvable;
    if (!type) type = "info";
    switch (type) {
        case "info":
            color = "#00b0f4";
            break;
        case "error":
            color = "#ff5555";
            break;
    }

    return new EmbedBuilder()
        .setAuthor({
            name: "Freckle",
            url: "https://add1tive.github.io/freckle/"
        })
        .setTitle(title)
        .setDescription(description)
        .setColor(color)
        .setFooter({
            text: "Freckle",
            iconURL: "https://us-east-1.tixte.net/uploads/add1tive.tixte.co/favicon.png"
        })
        .setTimestamp();
}
