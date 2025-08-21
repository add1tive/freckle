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

// general
export type SpriteInfoCustomChar = SpriteInfoChar & {
    fileName: string;
    sharedLink?: string; // only for private users, so user can remove by id
    sharedBy?: string; // only for the global user
    // expires?: number; // only for the global user
};

export interface CustomCharCollection {
    [id: string]: SpriteInfoCustomChar;
}

export interface StringMap {
    [id: string]: string;
}

export type UserSettingsC = {
    character?: TextboxChar;
    customCharacters?: CustomCharCollection; // only for private users
    customCharactersEncrypted?: StringMap; // only for the global user
    sharedLinks?: StringMap; // so user can remove by link
};

// textbox
export const textboxFonts = ["Determination Mono", "Undertale Sans", "Undertale Papyrus"] as const;

export type TextboxFont = (typeof textboxFonts)[number];

export const textboxChars = [
    "noelle",
    "susie",
    "ralsei",
    "papyrus",
    "berdly",
    "carol",
    "asgore",
    "sans"
] as const;

export type TextboxChar = (typeof textboxChars)[number];

export type SpriteInfoChar = {
    name: string;
    textboxOffsetX: number;
    textboxOffsetY: number;
    portraitWidth: number;
    portraitHeight: number;
    spritesheetColumns: number;
    expressionCount: number;
    isDarkner?: boolean;
    customFont?: TextboxFont;
    href?: string;
    hrefTitle?: string;
};

export type SpriteInfo = {
    [T in TextboxChar]: SpriteInfoChar;
};

export type TextboxCommandName = "glow" | "color" | "shake" | "reset";

interface TextboxCommandBase {
    name: TextboxCommandName;
}

export interface TextBoxCommand_Glow extends TextboxCommandBase {
    args: {
        strength: number;
        radius: string;
        color: string;
    };
}

export interface TextBoxCommand_Color extends TextboxCommandBase {
    args: {
        color: string;
    };
}

export interface TextBoxCommand_Shake extends TextboxCommandBase {
    args: {
        strength: number;
    };
}

export interface TextBoxCommand_Reset extends TextboxCommandBase {}

export type TextboxCommand = TextBoxCommand_Glow | TextBoxCommand_Color | TextBoxCommand_Reset;

export interface TextboxObject {
    content: string;
    pos: {
        x: number;
        y: number;
    };
    commands: TextboxCommand[];
}
