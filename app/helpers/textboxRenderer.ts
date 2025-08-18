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
import { createCanvas, loadImage, GlobalFonts, Canvas, SKRSContext2D } from "@napi-rs/canvas";

// LogTape
import { getLogger } from "@logtape/logtape";
const logger_ = getLogger(["freckle-app"]);
const logger = logger_.getChild("textboxRender");

// Freckle
import { getRandomIntInclusive } from "./smallUtils";
import * as f from "$shared/types/freckle.t"; // f for Freckle
import spriteInfo_ from "$shared/assets/images/utdr_talk/spriteInfo.json";
import { loadUserSettings } from "./userFiles";
const spriteInfo = spriteInfo_ as unknown as f.SpriteInfo;

GlobalFonts.registerFromPath("assets/fonts/DeterminationMono.ttf", "Determination Mono");
GlobalFonts.registerFromPath("assets/fonts/UndertalePapyrus.ttf", "Undertale Papyrus");
GlobalFonts.registerFromPath("assets/fonts/UndertaleSans.ttf", "Undertale Sans");

const FPS = 30;
const DEFAULT_FONT = "Determination Mono";
const DEFAULT_CHAR = "noelle";
const W = 275; // is 289 on the good ol' utdr tb generator site
const H = 76;
const H_DW = 84;
const ASTERISK_X = 72;
const ASTERISK_Y = 23;
const TEXT_START_X = 87;
const TEXT_START_Y = 23;
const TEXT_START_X_DW_OFFSET = 3;
const TEXT_START_Y_DW_OFFSET = 3;
const TEXT_MAX_WIDTH = 23 * 7;

// THIS FUNCTION IS NOT MEANT TO BE READABLE
// don't laugh at how "bad" this code is
// it's not meant to be good
function processCommand(rawCmd: string): f.TextboxCommand | null {
    // turn that into an actual command
    // ${meow:ab,cd} --> { name: "meow", args: ["ab", "cd"] }
    // FORMAT CHANGE: $meow:ab;cd$ --> ${meow:ab,cd}
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
            if (m.args === null || m.args[0] === null || m.args[1] === null || m.args[2] === null)
                return null;
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
            if (m.args === null || m.args[0] === null) return null;
            cmd = {
                name,
                args: {
                    color: m.args[0] as unknown
                }
            } as f.TextBoxCommand_Color;
            break;
        case "shake":
            if (m.args === null || m.args[0] === null) return null;
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

async function actuallyRender(
    canvas: Canvas,
    ogCanvas: Canvas,
    ctx: SKRSContext2D,
    content: f.TextboxObject[],
    exportTo: string | null,
    font: f.TextboxFont, // currently unused
    startX: number,
    startY: number,
    frameNumber: number,
    size: number
) {
    // necessary for some reason or else The Evil First Letter Bug will occur
    ctx.fillStyle = "#ffffff";

    const glowCanvas = createCanvas(canvas.width, canvas.height);
    const glowCtx = glowCanvas.getContext("2d");
    glowCtx.imageSmoothingEnabled = false;
    glowCtx.font = 16 * size + "px " + font;
    glowCtx.fillStyle = "#ffffff";

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
            ctx.fillStyle = cmd.args.color;
            glowCtx.fillStyle = cmd.args.color;
        },
        shake: function (cmd: f.TextBoxCommand_Shake) {
            shake_strength = cmd.args.strength;
        },
        reset: function () {
            ctx.fillStyle = "#ffffff";
            glowCtx.fillStyle = "#ffffff";
            ctx.filter = "none";
            glow_isOn = false;
            shake_strength = 0;
        }
    };

    ctx.drawImage(ogCanvas, 0, 0, canvas.width, canvas.height);
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
            (shake_strength ? getRandomIntInclusive(-1 * shake_strength, +1 * shake_strength) : 0);
        const cy =
            startY +
            obj.pos.y +
            (shake_strength ? getRandomIntInclusive(-1 * shake_strength, +1 * shake_strength) : 0);

        if (glow_isOn) glowCtx.fillText(obj.content, cx, cy);
        else ctx.fillText(obj.content, cx, cy);

        execCmd.reset();
    }

    // render glow -- LIMITATION! only one glow effect per frame; using last specified
    if (glow_wasOnAtAll) {
        const glowCanvas2 = createCanvas(canvas.width, canvas.height);
        const glowCtx2 = glowCanvas2.getContext("2d");

        glowCtx2.filter = glow_lastFilter;
        glowCtx2.drawImage(glowCanvas, 0, 0);

        for (let i = 0; i < glow_lastLoopLetterRender; i++) ctx.drawImage(glowCanvas2, 0, 0);
    }

    await saveFrameIfExporting(frameNumber, canvas, exportTo);
}

async function render(
    canvas_: Canvas,
    ctx_: SKRSContext2D,
    text: string,
    exportTo: string | null,
    font: f.TextboxFont,
    startX: number,
    startY: number,
    maxWidth: number,
    size: number
): Promise<Canvas> {
    let frameNumber = 0;

    const canvas = createCanvas(canvas_.width, canvas_.height);
    const ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = false;
    ctx.font = 16 * size + "px " + font;

    // light world variant:
    // 22 chars in one line, 24 for Papyrus
    // dark world variant:
    // the same minus like 1 or 2 chars

    // save first frame if animated
    if (exportTo !== null)
        await actuallyRender(canvas, canvas_, ctx, [], exportTo, font, startX, startY, 0, size);

    let objList: f.TextboxObject[] = [];

    let x = 0;
    let y = 0; // line index
    let currCmds: f.TextboxCommand[] = [];
    let skipNextDlrSign = false;
    const salad = text.split("");

    for (let i = 0; i < salad.length; i++) {
        // if not entering a possible command, render text
        // TODO: figure out glow (drop-shadow)
        // TODO: figure out shaking text
        if (salad[i] !== "$" || (salad[i] === "$" && skipNextDlrSign)) {
            // figure out whether to switch to a new line
            let word = text.slice(i, text.indexOf(" ", i)); // current word
            if (word.includes("$")) word = word.slice(0, word.indexOf("$"));
            const lMetr = ctx.measureText(word).width; // current word width in pixels
            if (x + lMetr > maxWidth && lMetr <= maxWidth) {
                y++;
                x = 0;
            }

            // const w = 8;
            const h = 18 * size;

            objList.push({
                content: salad[i],
                pos: {
                    x: x,
                    y: y * h
                },
                commands: structuredClone(currCmds)
            });

            // render and export frame if animated
            if (exportTo !== null) {
                await actuallyRender(
                    canvas,
                    canvas_,
                    ctx,
                    objList,
                    exportTo,
                    font,
                    startX,
                    startY,
                    frameNumber,
                    size
                );
            }
            frameNumber++;

            skipNextDlrSign = false;
            x = x + ctx.measureText(salad[i]).width;
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
            if (salad[i - 1] !== "\\" && salad[i + 1] === "{" && text.indexOf("}", i + 2) !== -1) {
                // extract the raw command string: index of "{" - command - index of "}"
                const rawCmd = text.slice(i + 2, text.indexOf("}", i + 2));

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
    if (exportTo !== null) {
        for (let i = 0; i < FPS * 2; i++) {
            await actuallyRender(
                canvas,
                canvas_,
                ctx,
                objList,
                exportTo,
                font,
                startX,
                startY,
                frameNumber,
                size
            );
            frameNumber++;
        }
    }
    // render once if not animated
    else
        await actuallyRender(
            canvas,
            canvas_,
            ctx,
            objList,
            exportTo,
            font,
            startX,
            startY,
            0,
            size
        );

    return canvas;
}

export async function makeImageNew(
    text: string | null,
    exp: number | null,
    size: number | null,
    character: f.TextboxChar | null,
    userId: string,
    cachePath: string | null = null
): Promise<Buffer<ArrayBufferLike>> {
    // the final frame
    if (text === null) text = ""; // TODO: change this...?

    let userSettings = loadUserSettings(userId);

    if (exp === null) exp = 1;
    if (size === null) size = 2;
    if (character === null) {
        if (userSettings) {
            if (userSettings.character) character = userSettings.character;
            else character = DEFAULT_CHAR;
        } else character = DEFAULT_CHAR;
    }

    let charWidth = spriteInfo[character].portraitWidth;
    let charHeight = spriteInfo[character].portraitHeight;
    let charTBoffsetX = spriteInfo[character].textboxOffsetX;
    let charTBoffsetY = spriteInfo[character].textboxOffsetY;
    let charPerRow = spriteInfo[character].spritesheetColumns;
    let usingDW = spriteInfo[character].isDarkner;
    let charFont = spriteInfo[character].customFont;

    let fontInUse = charFont ? charFont : DEFAULT_FONT;

    if (exp > spriteInfo[character].expressionCount) exp = 1;

    const dwBox = await loadImage("../shared/assets/images/utdr_talk/hud/darkworld_shrunken.png");

    const canvas = createCanvas(W * size, usingDW ? H_DW * size : H * size);
    const ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = false;

    ctx.font = 16 * size + "px " + DEFAULT_FONT;

    if (!usingDW) {
        ctx.lineWidth = 4 * size;
        ctx.strokeStyle = "#ffffff";
        ctx.fillStyle = "#000000";
        ctx.fillRect(size, size, W * size, H * size);
        ctx.strokeRect(1, 1, canvas.width - 2, canvas.height - 2);
    } else {
        ctx.drawImage(dwBox, 0, 0);
    }

    ctx.fillStyle = "#ffffff";

    const ssRow = Math.ceil(exp / charPerRow);
    const ssColumn = ((exp - 1) % charPerRow) + 1;

    const ssOffsetX = ssColumn * 5 + (ssColumn - 1) * charWidth;
    const ssOffsetY = ssRow * 5 + (ssRow - 1) * charHeight;

    const charTalkOg = await loadImage(`../shared/assets/images/utdr_talk/${character}.png`);
    const charTalkCanvas = createCanvas(charWidth, charHeight);
    const charTalkCtx = charTalkCanvas.getContext("2d");
    charTalkCtx.drawImage(
        charTalkOg,
        ssOffsetX,
        ssOffsetY,
        charWidth,
        charHeight,
        0,
        0,
        charWidth,
        charHeight
    );

    ctx.drawImage(
        charTalkCanvas,
        charTBoffsetX * size,
        charTBoffsetY * size,
        charWidth * size,
        charHeight * size
    );

    let startX = TEXT_START_X * size;
    let startY = TEXT_START_Y * size;
    let asteriskX = ASTERISK_X * size;
    let asteriskY = ASTERISK_Y * size;

    if (character === "papyrus") startX = asteriskX;
    if (usingDW) {
        startX += TEXT_START_X_DW_OFFSET * size;
        startY += TEXT_START_Y_DW_OFFSET * size;
    }
    if (usingDW) {
        asteriskX += TEXT_START_X_DW_OFFSET * size;
        asteriskY += TEXT_START_Y_DW_OFFSET * size;
    }
    if (character !== "papyrus") ctx.fillText("*", asteriskX, asteriskY);

    let textMaxWidth = usingDW ? TEXT_MAX_WIDTH - TEXT_START_X_DW_OFFSET * 8 : TEXT_MAX_WIDTH;
    const finalCanvas = await render(
        canvas,
        ctx,
        text,
        cachePath,
        fontInUse,
        startX,
        startY,
        textMaxWidth * size,
        size
    );

    return finalCanvas.encode("png");
}
