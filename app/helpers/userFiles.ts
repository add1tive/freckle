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

import crypto from "crypto";
import fs from "node:fs";
import { UserSettingsC } from "@freckle-a1e/shared/types/freckle.t";

// LogTape
import { getLogger } from "@logtape/logtape";
import path from "node:path";
const logger = getLogger(["app"]).getChild(path.basename(import.meta.filename).replace(".ts", ""));

const ALGORITHM = "aes-256-cbc";
const IV_LENGTH = 16; // in bytes
const HASH_LENGTH = 12 * 2;

// FRKL in ASCII followed by three reserved bytes (all zeros)
const FILE_HEADER = Buffer.concat([Buffer.from("FRKL", "ascii"), Buffer.from([0x00, 0x00, 0x00])]);

interface Cache {
    [hash: string]: UserSettingsC;
}

let cache: Cache = {};

function getKey(userId: string) {
    return crypto
        .createHash("sha256")
        .update(userId + (process.env.SECRET as string))
        .digest();
}

export function getHash(userId: string) {
    return crypto.createHash("sha256").update(userId).digest("hex").substring(0, HASH_LENGTH);
}

function encrypt(data: crypto.BinaryLike, userId: string) {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, getKey(userId), iv);

    return Buffer.concat([FILE_HEADER, iv, cipher.update(data), cipher.final()]);
}

function decrypt(data: Buffer, userId: string) {
    const iv = data.subarray(FILE_HEADER.length, IV_LENGTH + FILE_HEADER.length);
    const decipher = crypto.createDecipheriv(ALGORITHM, getKey(userId), iv);

    return Buffer.concat([
        decipher.update(data.subarray(FILE_HEADER.length + IV_LENGTH)),
        decipher.final()
    ]);
}

export function getFullUserFilePath(userId: string, relPath: string) {
    return path.join("./.local/user_files/", getHash(userId), relPath);
}

// writes a Frkl file in the user's folder
// I don't even really know what "View" means here, but this is what writeFileSync uses
export function writeUserFile(userId: string, relPath: string, file: NodeJS.ArrayBufferView) {
    const hash = getHash(userId);

    const fullPath = getFullUserFilePath(userId, relPath);
    const dirName = path.dirname(fullPath);

    if (!process.env.SECRET) {
        logger.error`Failed to write Frkl file: could not find environment variable "SECRET"!`;
        return false;
    }

    try {
        fs.mkdirSync(dirName, { recursive: true });
        fs.writeFileSync(fullPath, encrypt(file, userId));
        logger.info`Successfully saved Frkl file at ${relPath} for ${hash}`;
        return true;
    } catch (error) {
        logger.error`Failed to save Frkl file at ${relPath} for ${hash}: ${error}`;
        return false;
    }
}

// ditto, but read
export function readUserFile(userId: string, relPath: string) {
    const hash = getHash(userId);

    const fullPath = getFullUserFilePath(userId, relPath);

    if (!process.env.SECRET) {
        logger.error`Failed to read Frkl file: could not find environment variable "SECRET"!`;
        return null;
    }

    try {
        if (fs.existsSync(fullPath)) {
            const decrypted = decrypt(fs.readFileSync(fullPath), userId);
            logger.info`Successfully read Frkl file at ${relPath} for ${hash}`;
            return decrypted;
        } else {
            logger.error`Failed to read Frkl file at ${relPath} for ${hash}: File doesn't exist`;
            return null;
        }
    } catch (error) {
        logger.error`Failed to read Frkl file at ${relPath} for ${hash}: ${error}`;
        return null;
    }
}

// sync, not async
export function saveUserSettings(userId: string, userSettings: UserSettingsC) {
    const hash = getHash(userId);

    if (!process.env.SECRET) {
        logger.error`Failed to save user settings: could not find environment variable "SECRET"!`;
        return false;
    }

    try {
        writeUserFile(userId, "settings.json.frkl", Buffer.from(JSON.stringify(userSettings)));
        logger.info`Successfully saved settings for ${hash}.`;
        cache[hash] = userSettings;
        logger.debug`Cached settings for ${hash}.`;
        return true;
    } catch (error) {
        logger.error`Failed to save settings for ${hash}: ${error}`;
        return false;
    }
}
export function loadUserSettings(userId: string): UserSettingsC | null {
    const hash = getHash(userId);

    if (!Object.keys(cache).includes(hash)) {
        if (!process.env.SECRET) {
            logger.error`Failed to load user settings: could not find environment variable "SECRET"!`;
            return null;
        }

        const fileName = "settings.json.frkl"
        const fullPath = getFullUserFilePath(userId, fileName);

        try {
            if (fs.existsSync(fullPath)) {
                // we know it's there so it's not null
                const file = (readUserFile(userId, "settings.json.frkl") as Buffer<ArrayBuffer>).toString();
                logger.info`Successfully loaded settings for ${hash} from file.`;
                const parsed = JSON.parse(file) as UserSettingsC;
                cache[hash] = parsed;
                return parsed;
            } else {
                logger.info`User ${hash} has no settings file`;
                return null;
            }
        } catch (error) {
            logger.error`Failed to load settings for ${hash}: ${error}`;
            return null;
        }
    } else {
        logger.info`Successfully loaded settings for ${hash} from cache (memory).`;
        return cache[hash];
    }
}
