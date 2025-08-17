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
const HASH_LENGTH = 12 * 2;

function getHashAndKey(userId: string) {
    const hash = crypto
        .createHash("sha256")
        .update(userId + localSettings.salt)
        .digest("hex");
    const key = crypto.scryptSync(hash, localSettings.salt, 16);

    return { hash, key };
}

function encrypt(data: crypto.BinaryLike, userId: string) {
    const cipher = crypto.createCipheriv(
        ALGORITHM,
        getHashAndKey(userId).key,
        Buffer.from(localSettings.iv, "hex")
    );

    return Buffer.concat([cipher.update(data), cipher.final()]);
}

function decrypt(data: Buffer, userId: string) {
    const decipher = crypto.createDecipheriv(
        ALGORITHM,
        getHashAndKey(userId).key,
        Buffer.from(localSettings.iv, "hex")
    );

    return Buffer.concat([decipher.update(data), decipher.final()]);
}

// sync, not async
export function saveUserSettings(userId: string, userSettings: UserSettingsC) {
    const hash = getHashAndKey(userId).hash.substring(0, HASH_LENGTH);
    const path = `./local/user_files/${hash}/`;

    try {
        fs.mkdirSync(path, { recursive: true });
        fs.writeFileSync(
            path + "settings.bin",
            Buffer.concat([
                Buffer.from("FRECKLE", "ascii"), // for flair :P
                encrypt(JSON.stringify(userSettings), userId)
            ])
        );
        logger.info`Successfully saved settings for ${hash}`;

        return true;
    } catch (error) {
        logger.error`Failed to save settings for ${hash}: ${error}`;

        return false;
    }
}
export function loadUserSettings(userId: string): UserSettingsC | null {
    const hash = getHashAndKey(userId).hash.substring(0, HASH_LENGTH);

    try {
        const file = fs.readFileSync(`./local/user_files/${hash}/settings.bin`);
        const decrypted = decrypt(file.slice(7), userId).toString();
        logger.info`Successfully loaded settings for ${hash}`;

        return JSON.parse(decrypted);
    } catch (error) {
        logger.error`Failed to load settings for ${hash}: ${error}`;

        return null;
    }
}
