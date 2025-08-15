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
import { ChatInputCommandInteraction } from "discord.js";
import { exec } from "node:child_process";

const logger_ = getLogger(["freckle-app"]);
const logger = logger_.getChild("help");

let gitCommit = "unknown";
exec("git log --pretty=format:'%h' -n 1", function (error, stdout, stderr) {
  gitCommit = stdout;
});

module.exports = {
  data: {
    name: "help",
    description: "Sends you tips, useful links and all that",
    integration_types: [1],
    contexts: [0, 1, 2],
  },
  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.reply(
      `running Freckle, version \`${gitCommit}\`\nhome page is at https://add1tive.github.io/freckle/`
    );
  },
};
