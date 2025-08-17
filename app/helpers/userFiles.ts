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

import localSettings from "../local/private.json";
import crypto from "crypto";
import fs from "node:fs";
import { UserSettingsC } from "$shared/types/freckle.t";

// LogTape
import { getLogger } from "@logtape/logtape";
const logger_ = getLogger(["freckle-app"]);
const logger = logger_.getChild("userFiles");

const ALGORITHM = "aes-128-cbc";
const IV_LENGTH = 16; // in bytes
const HASH_LENGTH = 12 * 2;
const FILE_HEADER = "FRECKLE";

const key = Buffer.from(localSettings.key, "hex");

function getHash(userId: string) {
    return crypto.createHash("sha256").update(userId).digest("hex").substring(0, HASH_LENGTH);
}

function encrypt(data: crypto.BinaryLike, userId: string) {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    return Buffer.concat([
        Buffer.from(FILE_HEADER, "ascii"),
        iv,
        cipher.update(data),
        cipher.final()
    ]);
}

function decrypt(data: Buffer, userId: string) {
    const iv = data.slice(FILE_HEADER.length, IV_LENGTH + FILE_HEADER.length);
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);

    return Buffer.concat([
        decipher.update(data.slice(FILE_HEADER.length + IV_LENGTH)),
        decipher.final()
    ]);
}

// sync, not async
export function saveUserSettings(userId: string, userSettings: UserSettingsC) {
    const hash = getHash(userId);
    const path = `./local/user_files/${hash}/`;

    try {
        fs.mkdirSync(path, { recursive: true });
        fs.writeFileSync(path + "settings.bin", encrypt(JSON.stringify(userSettings), userId));
        logger.info`Successfully saved settings for ${hash}`;

        return true;
    } catch (error) {
        logger.error`Failed to save settings for ${hash}: ${error}`;

        return false;
    }
}
export function loadUserSettings(userId: string): UserSettingsC | null {
    const hash = getHash(userId);
    const fpath = `./local/user_files/${hash}/settings.bin`;

    try {
        if (fs.existsSync(fpath)) {
            const file = fs.readFileSync(`./local/user_files/${hash}/settings.bin`);
            const decrypted = decrypt(file, userId).toString();
            logger.info`Successfully loaded settings for ${hash}`;

            return JSON.parse(decrypted);
        } else {
            logger.info`User ${hash} has no settings file`;

            return null;
        }
    } catch (error) {
        logger.error`Failed to load settings for ${hash}: ${error}`;

        return null;
    }
}
