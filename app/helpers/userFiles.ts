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

// fUser = Freckle user
const GLOBAL_USER = "__@freckle_global";

interface Cache {
    [hash: string]: UserSettingsC;
}

let cache: Cache = {};

function getKey(passphrase: string) {
    return crypto
        .createHash("sha256")
        .update(passphrase + (process.env.SECRET as string))
        .digest();
}

export function getHash(userId: string) {
    return crypto.createHash("sha256").update(userId).digest("hex").substring(0, HASH_LENGTH);
}

function encrypt(data: crypto.BinaryLike, passphrase: string) {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, getKey(passphrase), iv);

    return Buffer.concat([FILE_HEADER, iv, cipher.update(data), cipher.final()]);
}

function decrypt(data: Buffer, passphrase: string) {
    const iv = data.subarray(FILE_HEADER.length, IV_LENGTH + FILE_HEADER.length);
    const decipher = crypto.createDecipheriv(ALGORITHM, getKey(passphrase), iv);

    return Buffer.concat([
        decipher.update(data.subarray(FILE_HEADER.length + IV_LENGTH)),
        decipher.final()
    ]);
}

export function getFullUserFilePath(userId: string, relPath: string) {
    const fUser = userId !== GLOBAL_USER ? getHash(userId) : GLOBAL_USER;
    return path.join("./.local/user_files/", fUser, relPath);
}

// writes a Frkl file in the user's folder
// I don't even really know what "View" means here, but this is what writeFileSync uses
export function writeUserFile(
    userId: string,
    relPath: string,
    file: NodeJS.ArrayBufferView,
    customPassphrase?: string
) {
    const fUser = userId !== GLOBAL_USER ? getHash(userId) : GLOBAL_USER;

    const fullPath = getFullUserFilePath(userId, relPath);
    const dirName = path.dirname(fullPath);

    if (!process.env.SECRET) {
        logger.error`Failed to write Frkl file: could not find environment variable "SECRET"!`;
        return false;
    }

    try {
        fs.mkdirSync(dirName, { recursive: true });
        fs.writeFileSync(fullPath, encrypt(file, customPassphrase ?? userId));
        logger.info`Successfully saved Frkl file at ${relPath} for ${fUser}`;
        return true;
    } catch (error) {
        logger.error`Failed to save Frkl file at ${relPath} for ${fUser}: ${error}`;
        return false;
    }
}

// ditto, but read
export function readUserFile(userId: string, relPath: string, customPassphrase?: string) {
    const fUser = userId !== GLOBAL_USER ? getHash(userId) : GLOBAL_USER;

    const fullPath = getFullUserFilePath(userId, relPath);

    if (!process.env.SECRET) {
        logger.error`Failed to read Frkl file: could not find environment variable "SECRET"!`;
        return null;
    }

    try {
        if (fs.existsSync(fullPath)) {
            const decrypted = decrypt(fs.readFileSync(fullPath), customPassphrase ?? userId);
            logger.info`Successfully read Frkl file at ${relPath} for ${fUser}`;
            return decrypted;
        } else {
            logger.error`Failed to read Frkl file at ${relPath} for ${fUser}: File doesn't exist`;
            return null;
        }
    } catch (error) {
        logger.error`Failed to read Frkl file at ${relPath} for ${fUser}: ${error}`;
        return null;
    }
}

export function copyUserFileAndReencrypt(
    userId1: string,
    userId2: string,
    relPath1: string,
    relPath2: string,
    customPassphrase1?: string,
    customPassphrase2?: string
) {
    const fUser1 = userId1 !== GLOBAL_USER ? getHash(userId1) : GLOBAL_USER;
    const fUser2 = userId2 !== GLOBAL_USER ? getHash(userId2) : GLOBAL_USER;

    const fullPath1 = getFullUserFilePath(userId1, relPath1);
    // const fileName1 = path.basename(fullPath1);
    // const dirName1 = path.dirname(fullPath1);

    const fullPath2 = getFullUserFilePath(userId2, relPath2);
    // const fileName2 = path.basename(fullPath1);
    const dirName2 = path.dirname(fullPath2);

    if (!process.env.SECRET) {
        logger.error`Failed to copy Frkl file: could not find environment variable "SECRET"!`;
        return false;
    }

    const unencryptedFile = readUserFile(userId1, relPath1, customPassphrase1);
    if (!unencryptedFile) {
        logger.error`Failed to copy Frkl file: "${relPath1}" does not exist!`;
        return;
    }

    try {
        fs.mkdirSync(dirName2, { recursive: true });
        fs.writeFileSync(fullPath2, encrypt(unencryptedFile, customPassphrase2 ?? userId2));
        logger.info`Successfully copied Frkl file "${relPath1}" from user ${fUser1} to file "${relPath2}" for user ${fUser2}.`;
        return true;
    } catch (error) {
        logger.error`Failed to copy Frkl file "${relPath1}" from user ${fUser1} to file "${relPath2}" for user ${fUser2}: ${error}`;
        return false;
    }
}

// sync, not async
export function saveUserSettings(
    userId: string,
    userSettings: UserSettingsC,
    customPassphrase?: string
) {
    const fUser = userId !== GLOBAL_USER ? getHash(userId) : GLOBAL_USER;

    if (!process.env.SECRET) {
        logger.error`Failed to save user settings: could not find environment variable "SECRET"!`;
        return false;
    }

    try {
        writeUserFile(
            userId,
            "settings.json.frkl",
            Buffer.from(JSON.stringify(userSettings)),
            customPassphrase
        );
        logger.info`Successfully saved settings for ${fUser}.`;
        cache[fUser] = userSettings;
        console.log(userSettings);
        logger.debug`Cached settings for ${fUser}.`;
        return true;
    } catch (error) {
        logger.error`Failed to save settings for ${fUser}: ${error}`;
        return false;
    }
}
export function loadUserSettings(userId: string, customPassphrase?: string) {
    const fUser = userId !== GLOBAL_USER ? getHash(userId) : GLOBAL_USER;

    if (!Object.keys(cache).includes(fUser)) {
        if (!process.env.SECRET) {
            logger.error`Failed to load user settings: could not find environment variable "SECRET"!`;
            return null;
        }

        const fileName = "settings.json.frkl";
        const fullPath = getFullUserFilePath(userId, fileName);

        try {
            if (fs.existsSync(fullPath)) {
                // we know it's there so it's not null
                const file = (
                    readUserFile(
                        userId,
                        "settings.json.frkl",
                        customPassphrase
                    ) as Buffer<ArrayBuffer>
                ).toString();
                logger.info`Successfully loaded settings for ${fUser} from file.`;
                const parsed = JSON.parse(file) as UserSettingsC;
                cache[fUser] = parsed;
                console.log(parsed);
                return parsed;
            } else {
                logger.info`User ${fUser} has no settings file`;
                return null;
            }
        } catch (error) {
            logger.error`Failed to load settings for ${fUser}: ${error}`;
            return null;
        }
    } else {
        logger.info`Successfully loaded settings for ${fUser} from cache (memory).`;
        return cache[fUser];
    }
}
