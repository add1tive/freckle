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

import { Client, Events } from "discord.js";
import { getLogger } from "@logtape/logtape";

const logger = getLogger(["freckle-app"]).getChild("ready");

module.exports = {
    name: Events.ClientReady,
    once: true,
    execute(client: Client) {
        if (client.user !== null) logger.info`Ready! Logged in as ${client.user.tag}`;
    }
};
