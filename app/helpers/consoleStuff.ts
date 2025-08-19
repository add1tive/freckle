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

import util from "node:util";
import child_process from "node:child_process";
const exec = util.promisify(child_process.exec);
import { hex, bold, gray, italic } from "ansis";

let gitCommit = "unknown";
const { stdout } = await exec("git log --pretty=format:'%h' -n 1");
gitCommit = stdout.replaceAll("'", "");

const colors = ["#f3c580", "#e3ab8d", "#d69797", "#c882a3", "#bf81b1", "#b581c1", "#ae82cc"];
const nameGradient = "Freckle"
    .split("")
    .map((element, index) => hex(colors[index]).bold(element))
    .join("");

export function printWelcome() {
    console.log(gray("┌" + "─".repeat(24) + "┐"));
    console.log(`${gray("│")} 🦌 Welcome to ${nameGradient}! ${gray("│")}`);
    console.log(gray(`│    ${italic("Um, excheese me?")}    │`));
    console.log(gray(`│ 🕑 ${bold(process.env.npm_package_version)} · ${bold(gitCommit)}     │`));
    console.log(gray("└" + "─".repeat(24) + "┘\n"));
}
