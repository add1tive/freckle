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
export type UserSettingsC = {
    character: TextboxChar;
};

// textbox
export type TextboxFont = "none" | "Determination Mono" | "Undertale Sans" | "Undertale Papyrus";

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
    readonly name: string;
    readonly textboxOffsetX: number;
    readonly textboxOffsetY: number;
    readonly portraitWidth: number;
    readonly portraitHeight: number;
    readonly spritesheetColumns: number;
    readonly expressionCount: number;
    readonly isDarkner?: boolean;
    readonly customFont?: TextboxFont;
    readonly href?: string;
    readonly hrefTitle?: string;
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
