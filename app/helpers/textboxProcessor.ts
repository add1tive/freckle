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

// Node
import fs from "node:fs/promises";

// canvas
import { createCanvas, loadImage, GlobalFonts, Canvas } from "@napi-rs/canvas";

// LogTape
import { getLogger } from "@logtape/logtape";
const logger = getLogger(["app"]).getChild("textboxProcessor");

// Freckle
import { getRandomIntInclusive } from "./smallUtils";
import * as f from "@freckle-a1e/shared/types/freckle.t"; // f for Freckle
import spriteInfo_ from "@freckle-a1e/shared/assets/images/utdr_talk/spriteInfo.json";
import { loadUserSettings } from "./userFiles";
const spriteInfo = spriteInfo_ as unknown as f.SpriteInfo; // s for spriteInfo

GlobalFonts.registerFromPath("assets/fonts/DeterminationMono.ttf", "Determination Mono");
GlobalFonts.registerFromPath("assets/fonts/UndertalePapyrus.ttf", "Undertale Papyrus");
GlobalFonts.registerFromPath("assets/fonts/UndertaleSans.ttf", "Undertale Sans");

// c for consts
const c = {
    FPS: 30,
    DEFAULT_FONT: "Determination Mono",
    DEFAULT_CHAR: "noelle",
    WIDTH: 275, // is 289 on the good ol' utdr tb generator site
    HEIGHT: 76,
    HEIGHT_DARK_WORLD: 84,
    ASTERISK_X: 72,
    ASTERISK_Y: 23,
    TEXT_START_X: 87,
    TEXT_START_Y: 23,
    TEXT_START_X_DW_OFFSET: 3,
    TEXT_START_Y_DW_OFFSET: 3,
    TEXT_MAX_WIDTH: 23 * 7
} as const;

type TextboxRendererArguments = {
    // chosen by user
    text: string;
    character: string | null; // we don't know what the user will give us
    expression: number | null;
    darkWorld: boolean | null;
    font: string | null; // ditto

    // internal
    userId: string;
    cachePath: string | null;
};

function processCommand(rawCmd: string): f.TextboxCommand | null {
    // turn that into an actual command
    // ${meow:ab,cd} --> { name: "meow", args: ["ab", "cd"] }
    const cmdSplit = rawCmd.split(":");
    const m = {
        // "middle"
        name: cmdSplit[0],
        args: cmdSplit[1] ? cmdSplit[1].split(",") : null // if they exist they're not null
    };

    // convert args to actual objects/interfaces/whatever
    let name = m.name as f.TextboxCommandName;
    let cmd: f.TextboxCommand | null = null;
    switch (name) {
        case "glow":
            if (m.args === null || m.args.includes("")) return null;
            cmd = {
                name,
                args: {
                    strength: m.args[0] as unknown,
                    radius: m.args[1] as unknown,
                    color: m.args[2] as unknown
                }
            } as f.TextBoxCommand_Glow;
            break;
        case "color":
            if (m.args === null || m.args[0] === "") return null;
            cmd = {
                name,
                args: {
                    color: m.args[0] as unknown
                }
            } as f.TextBoxCommand_Color;
            break;
        case "shake":
            if (m.args === null || m.args[0] === "") return null;
            cmd = {
                name,
                args: {
                    strength: m.args[0] as unknown
                }
            } as f.TextBoxCommand_Shake;
            break;
        case "reset":
            cmd = { name } as f.TextBoxCommand_Reset;
            break;
    }

    return cmd;
}

async function saveFrameIfExporting(
    frameNumber: number,
    canvas: Canvas,
    exportTo: string | null = null
) {
    if (exportTo) {
        const data = await canvas.encode("png");
        await fs.writeFile(`${exportTo}${("00" + frameNumber).slice(-3)}.png`, data);
    }
}

export async function processTextbox(args: TextboxRendererArguments) {
    const userSettings = loadUserSettings(args.userId);

    // scale. if I ever change my mind in the future, the user will be able to adjust it.
    // purposefully not in the "c" consts object
    const s = 2;

    // add missing user arguments and fix existing
    if (args.character) args.character = args.character.toLowerCase();
    // @ts-expect-error
    if (!args.character || !f.textboxChars.includes(args.character)) {
        if (userSettings) {
            if (userSettings.character) args.character = userSettings.character;
            else args.character = c.DEFAULT_CHAR;
        } else args.character = c.DEFAULT_CHAR;
    }
    let char = spriteInfo[args.character as f.TextboxChar];

    if (!args.expression) args.expression = 1;
    else if (args.expression > char.expressionCount) args.expression = 1;

    if (!args.darkWorld) {
        if (char.isDarkner) args.darkWorld = true;
        else args.darkWorld = false;
    }

    if (args.font)
        args.font = args.font
            .replace(/\s{2,}/g, " ") // remove double spaces
            .split(" ")
            .map((word) => word[0].toUpperCase() + word.substring(1)) // make Title Case
            .join(" ");
    // @ts-expect-error
    if (!args.font || !f.textboxFonts.includes(args.font)) {
        if (char.customFont) args.font = char.customFont;
        else args.font = c.DEFAULT_FONT;
    }

    // make background canvas and set it up
    const bgCanvas = createCanvas(
        c.WIDTH * s,
        args.darkWorld ? c.HEIGHT_DARK_WORLD * s : c.HEIGHT * s
    );
    const bgCtx = bgCanvas.getContext("2d");
    bgCtx.imageSmoothingEnabled = false;
    bgCtx.font = `${16 * s}px ${args.font}`;

    // default styles
    bgCtx.lineWidth = 4 * s;
    bgCtx.strokeStyle = "#ffffff";
    bgCtx.fillStyle = "#ffffff";

    // draw background
    if (!args.darkWorld) {
        bgCtx.fillStyle = "#000000";
        bgCtx.fillRect(0, 0, bgCanvas.width, bgCanvas.height);
        bgCtx.strokeRect(1, 1, bgCanvas.width - 2, bgCanvas.height - 2); // ! FIX THIS!
        bgCtx.fillStyle = "#ffffff";
    } else {
        // ! CHANGE PATH!
        const dwBox = await loadImage(
            "../shared/assets/images/utdr_talk/hud/darkworld_shrunken.png"
        );
        bgCtx.drawImage(dwBox, 0, 0, bgCanvas.width, bgCanvas.height);
    }

    // get spritesheeet (ss) rows, columns...
    const ssRow = Math.ceil(args.expression / char.spritesheetColumns);
    const ssColumn = ((args.expression - 1) % char.spritesheetColumns) + 1;
    const ssOffsetX = ssColumn * 5 + (ssColumn - 1) * char.portraitWidth;
    const ssOffsetY = ssRow * 5 + (ssRow - 1) * char.portraitHeight;

    // prepare portrait image (scale it)
    // ! CHANGE PATH HERE TOO!
    const charTalkOg = await loadImage(`../shared/assets/images/utdr_talk/${args.character}.png`);
    const charTalkCanvas = createCanvas(char.portraitWidth, char.portraitHeight);
    const charTalkCtx = charTalkCanvas.getContext("2d");
    charTalkCtx.drawImage(
        charTalkOg,
        ssOffsetX,
        ssOffsetY,
        char.portraitWidth,
        char.portraitHeight,
        0,
        0,
        char.portraitWidth,
        char.portraitHeight
    );

    // draw portrait onto main background canvas
    bgCtx.drawImage(
        charTalkCanvas,
        char.textboxOffsetX * s,
        char.textboxOffsetY * s,
        char.portraitWidth * s,
        char.portraitHeight * s
    );

    // set up text start and asterisk coordinates
    // depends on the character (Papyrus) and whether we're using the DW style
    // TODO: talking about Papyrus -- ADD ANIMATIONS!!!
    let startX = c.TEXT_START_X * s;
    let startY = c.TEXT_START_Y * s;
    let asteriskX = c.ASTERISK_X * s;
    let asteriskY = c.ASTERISK_Y * s;
    if (args.character === "papyrus") startX = asteriskX;
    if (args.darkWorld) {
        startX += c.TEXT_START_X_DW_OFFSET * s;
        startY += c.TEXT_START_Y_DW_OFFSET * s;
    }
    if (args.darkWorld) {
        asteriskX += c.TEXT_START_X_DW_OFFSET * s;
        asteriskY += c.TEXT_START_Y_DW_OFFSET * s;
    }

    // conditionally render asterisk
    if (args.character !== "papyrus") bgCtx.fillText("*", asteriskX, asteriskY);

    // get text max width
    let textMaxWidth = args.darkWorld
        ? c.TEXT_MAX_WIDTH - c.TEXT_START_X_DW_OFFSET * 8
        : c.TEXT_MAX_WIDTH;
    textMaxWidth *= s;

    let frameNumber = 0;

    // set up canvas that will actually be used for text
    const activeCanvas = createCanvas(bgCanvas.width, bgCanvas.height);
    const activeCtx = activeCanvas.getContext("2d");
    activeCtx.imageSmoothingEnabled = bgCtx.imageSmoothingEnabled;
    activeCtx.font = bgCtx.font;

    let content: f.TextboxObject[] = [];

    const actuallyRender = async () => {
        // necessary for some reason or else The Evil First Letter Bug will occur
        activeCtx.fillStyle = "#ffffff";

        const glowCanvas = createCanvas(activeCanvas.width, activeCanvas.height);
        const glowCtx = glowCanvas.getContext("2d");
        glowCtx.imageSmoothingEnabled = activeCtx.imageSmoothingEnabled;
        glowCtx.font = activeCtx.font;
        glowCtx.fillStyle = activeCtx.fillStyle;

        let glow_wasOnAtAll = false;
        let glow_isOn = false;
        let glow_lastFilter = "none";
        let glow_lastLoopLetterRender = 1;
        let shake_strength = 0;
        const execCmd = {
            glow: function (cmd: f.TextBoxCommand_Glow) {
                glow_lastFilter = `drop-shadow(0 0 ${cmd.args.radius} ${cmd.args.color})`;
                glow_lastLoopLetterRender = cmd.args.strength;
                glow_isOn = true;
                glow_wasOnAtAll = true;
            },
            color: function (cmd: f.TextBoxCommand_Color) {
                activeCtx.fillStyle = cmd.args.color;
                glowCtx.fillStyle = cmd.args.color;
            },
            shake: function (cmd: f.TextBoxCommand_Shake) {
                shake_strength = cmd.args.strength;
            },
            reset: function () {
                activeCtx.fillStyle = "#ffffff";
                glowCtx.fillStyle = "#ffffff";
                activeCtx.filter = "none";
                glow_isOn = false;
                shake_strength = 0;
            }
        };

        activeCtx.drawImage(bgCanvas, 0, 0, activeCanvas.width, activeCanvas.height);
        for (const obj of content) {
            if (obj.commands.length >= 1) {
                // unsafe? idk
                for (const cmd of obj.commands) {
                    // @ts-expect-error
                    execCmd[cmd.name](cmd);
                }
            }

            const cx =
                startX +
                obj.pos.x +
                (shake_strength
                    ? getRandomIntInclusive(-1 * shake_strength, +1 * shake_strength)
                    : 0);
            const cy =
                startY +
                obj.pos.y +
                (shake_strength
                    ? getRandomIntInclusive(-1 * shake_strength, +1 * shake_strength)
                    : 0);

            if (glow_isOn) glowCtx.fillText(obj.content, cx, cy);
            else activeCtx.fillText(obj.content, cx, cy);

            execCmd.reset();
        }

        // render glow -- LIMITATION! only one glow effect per frame; using last specified
        if (glow_wasOnAtAll) {
            const glowCanvas2 = createCanvas(activeCanvas.width, activeCanvas.height);
            const glowCtx2 = glowCanvas2.getContext("2d");

            glowCtx2.filter = glow_lastFilter;
            glowCtx2.drawImage(glowCanvas, 0, 0);

            for (let i = 0; i < glow_lastLoopLetterRender; i++)
                activeCtx.drawImage(glowCanvas2, 0, 0);
        }

        await saveFrameIfExporting(frameNumber, activeCanvas, args.cachePath);
    };

    // POSSIBLY OUTDATED TEXT BELOW:
    // light world variant:
    // 22 chars in one line, 24 for Papyrus
    // dark world variant:
    // the same minus like 1 or 2 chars

    // save first frame if animated
    if (args.cachePath) await actuallyRender();

    let x = 0;
    let y = 0; // line index
    let currCmds: f.TextboxCommand[] = [];
    let skipNextDlrSign = false;
    const salad = args.text.split("");

    for (let i = 0; i < salad.length; i++) {
        // if not entering a possible command, render text
        // TODO: figure out glow (drop-shadow)
        // TODO: figure out shaking text
        if (salad[i] !== "$" || (salad[i] === "$" && skipNextDlrSign)) {
            // figure out whether to switch to a new line
            let word = args.text.slice(i, args.text.indexOf(" ", i)); // current word
            if (word.includes("$")) word = word.slice(0, word.indexOf("$"));
            const lMetr = activeCtx.measureText(word).width; // current word width in pixels
            if (x + lMetr > textMaxWidth && lMetr <= textMaxWidth) {
                y++;
                x = 0;
            }

            // const w = 8;
            const h = 18 * s;

            content.push({
                content: salad[i],
                pos: {
                    x: x,
                    y: y * h
                },
                commands: structuredClone(currCmds)
            });

            // render and export frame if animated
            if (args.cachePath) await actuallyRender();
            frameNumber++;

            skipNextDlrSign = false;
            x = x + activeCtx.measureText(salad[i]).width;
        }
        // if entering a possible command, try to get that command and skip its chunk of text
        else if (salad[i] === "$") {
            // if the next character is "{", it's not escaped ("\") and there's a closing "}"...
            // ...we've entered a command!
            // next task: handle command and make the index (i) skip to after the command
            // otherwise:
            //     1. the "$" was escaped using "\"
            //     2. there was no "{" after "$"
            //     3. the command wasn't closed
            // yes. that's right. i am just gonna let an unclosed command pass as normal text :)
            if (
                salad[i - 1] !== "\\" &&
                salad[i + 1] === "{" &&
                args.text.indexOf("}", i + 2) !== -1
            ) {
                // extract the raw command string: index of "{" - command - index of "}"
                const rawCmd = args.text.slice(i + 2, args.text.indexOf("}", i + 2));

                const cmd = processCommand(rawCmd);
                if (cmd) {
                    if (cmd.name === "reset") currCmds = [];
                    else currCmds.push(cmd);
                }

                i = i + rawCmd.length + 2; // make i skip to after the command
            } else {
                // go back and render that $
                i--;
                skipNextDlrSign = true;
            }
        }
    }

    // add a few extra frames for a pause if animated
    if (args.cachePath) {
        for (let i = 0; i < c.FPS * 2; i++) {
            await actuallyRender();
            frameNumber++;
        }
    }
    // render once if not animated
    else await actuallyRender();

    return activeCanvas.encode("png");
}
