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

import { escapeSvelty, isNumeric, replaceLastOccurrenceInString } from "./miniUtils.js";

// adds a little hash icon next to headers
// ? to self: consider adding automatic clipboard-copying
export const autolinkHeadingsOptions = {
    content: {
        type: "element",
        tagName: "span",
        properties: {
            className: ["material-symbols-outlined", "header-link"]
        },
        children: [{ type: "text", value: "tag" }]
    }
};

export const tocOptions = {
    customizeTOC: (toc) => {
        toc.children.unshift({
            type: "element",
            tagName: "h3",
            properties: {},
            children: [{ type: "text", value: "Table of Contents" }]
        });
    },
    customizeTOCItem: (toc, heading) => {
        for (const a of toc.children[0].children) {
            // remove "tag" (the copy icon) from titles
            // TODO: don't make this a hardcoded 3...
            a.value = a.value.substring(3);
        }
    }
};

function actualFreckleHighlighter(code, isDemo) {
    let start, end;

    let processedCode = code;

    const takesArgs = code.includes(":");

    // highlight $
    processedCode = processedCode.replace("$", `<span class="token keyword">$</span>`);

    // highlight function
    start = "{";
    end = takesArgs ? ":" : "}";
    const funcName = code.substring(code.indexOf(start) + 1, code.indexOf(end));
    processedCode = processedCode.replace(
        funcName,
        `<span class="token function">${funcName}</span>`
    );

    if (takesArgs) {
        // get arguments substring
        start = ":";
        end = "}";
        const argsStr = code.substring(code.indexOf(start) + 1, code.indexOf(end));

        let args = argsStr.split(",");
        for (let i = 0; i < args.length; i++)
            args[i] =
                `<span class="token ${isDemo ? "keyword" : isNumeric(args[i]) ? "number" : "string"}">${args[i]}</span>`;

        processedCode = replaceLastOccurrenceInString(processedCode, argsStr, args.toString(","));
    }

    return processedCode;
}

// custom highlighter + button inject
// * PLEASE DO NOT QUESTION THIS CODE
export function highlighter(code, lang) {
    lang = lang.toLowerCase();

    let processedCode = code;

    if (lang === "freckle" || lang === "freckledemo")
        processedCode = actualFreckleHighlighter(code, lang === "freckledemo");

    const tooltip = `<span class="code-block-copy-btn-tooltip">Copy</span>`;

    const copybuttonOnClick = `(event) => {
        navigator.clipboard.writeText("${code}");
        event.target.children[1].innerText = "Copied!";

        if (event.target.dataset.timeoutid !== "-1") clearTimeout(event.target.dataset.timeoutid);
        event.target.dataset.timeoutid = setTimeout(() => {
            event.target.children[1].innerText = "Copy";
            event.target.dataset.timeoutid = "-1";
        }, 2000);
    }`;
    const copybuttonOnMouseOut = `(event) => {
        if (event.target.dataset.timeoutid !== "-1") clearTimeout(event.target.dataset.timeoutid);
        event.target.dataset.timeoutid = setTimeout(() => {
            event.target.children[1].innerText = "Copy";
            event.target.dataset.timeoutid = "-1";
        }, 210);
    }`;
    const copybutton = `<button class="code-block-copy-btn" data-timeoutid="-1" on:click={${copybuttonOnClick}} on:mouseout={${copybuttonOnMouseOut}} on:blur={${copybuttonOnMouseOut}}><span class="material-symbols-outlined">content_copy</span>${tooltip}</button>`;

    return `<pre class="language-${lang} code-block"><code class="language-${lang}">${escapeSvelty(processedCode)}</code>${copybutton}</pre>`;
}
