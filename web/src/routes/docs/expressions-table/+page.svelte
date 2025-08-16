<!--
    Freckle - a Discord app and its website
    Copyright (C) 2025 add1tive

    This file is part of Freckle.

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program. If not, see <http://www.gnu.org/licenses/>.
-->

<!-- Since this isn't a .svx file, I either have to manually add header links + toc or set up jank -->
<!-- I chose the former -->

<script lang="ts">
    export const title = "Textbox character expressions table";

    import { base } from "$app/paths";
    import { chars, type Whatever } from "./characters";
    import spriteInfo from "../../../../../shared/assets/images/utdr_talk/spriteInfo.json";

    // Horrendous code. Don't even look at it.
    function getIconStyle(charId: string, exp: number): string {
        exp++;

        // @ts-expect-error
        let charWidth = spriteInfo[charId].portraitWidth;
        // @ts-expect-error
        let charHeight = spriteInfo[charId].portraitHeight;
        // @ts-expect-error
        let charPerRow = spriteInfo[charId].spritesheetColumns;

        const ssRow = Math.ceil(exp / charPerRow);
        const ssColumn = ((exp - 1) % charPerRow) + 1;

        const ssOffsetX = ssColumn * 5 + (ssColumn - 1) * charWidth;
        const ssOffsetY = ssRow * 5 + (ssRow - 1) * charHeight;

        // if (exp === 3)
        //     console.log("I'm on", exp, "! The x offset is", ssOffsetX, "and the y offset is", ssOffsetY, ".");

        const style = `
            width: ${charWidth}px;
            height: ${charHeight}px;
            scale: 2;
            background-image: url("${base}/shared/images/utdr_talk/${charId}.png");
            background-repeat: no-repeat;
            background-position: -${ssOffsetX}px -${ssOffsetY}px;
            position: absolute;
            left: calc(${charWidth}px / 2);
            top: calc(${charHeight}px / 2);
        `;

        return style;
    }

    function getIconContainerStyle(charId: string): string {
        // @ts-expect-error
        let charWidth = spriteInfo[charId].portraitWidth;
        // @ts-expect-error
        let charHeight = spriteInfo[charId].portraitHeight;

        const style = `
            width: calc(${charWidth}px * 2);
            height: calc(${charHeight}px * 2 + 2rem);
            position: relative;
        `;

        return style;
    }
</script>

<svelte:head>
    <title>{title} &ndash; Freckle</title>
</svelte:head>

<div class="toc">
    <h3>Table of Contents</h3>
    <ol>
        <li>
            <a href="#title">{title}</a>
        </li>
        {#each chars as char}
            <li>
                <a href={`#${char.id}`}>{char.name}</a>
            </li>
        {/each}
    </ol>
</div>

{#snippet thingy(args: Whatever)}
    <h2 id={args.id}>
        <a aria-hidden="true" tabindex="-1" href={`#${args.id}`}>
            <span class="material-symbols-outlined header-link">tag</span>
        </a>
        {args.name}
    </h2>
    {#if args.href && args.hrefTitle}
        <p>
            <a href={args.href} target="_blank">{args.hrefTitle}</a>
        </p>
    {/if}
    <div style="display: flex; flex-wrap: wrap;">
        {#each { length: args.length }, i}
            <button class="exp-cont" onclick={() => navigator.clipboard.writeText((i + 1).toString())}>
                <div style={getIconContainerStyle(args.id)}>
                    <div class="thumb" style={getIconStyle(args.id, i)}>
                </div>
                <div style="position: absolute; width: 100%; height: 100%; top: 83%;">
                    <span>{i + 1}</span>
                </div>
            </button>
        {/each}
    </div>
{/snippet}

<h1 id="title">
    <a aria-hidden="true" tabindex="-1" href="#title">
        <span class="material-symbols-outlined header-link">tag</span>
    </a>
    {title}
</h1>
<p>
    Sprites are from The Spriters Resource's
    <a href="https://www.spriters-resource.com/pc_computer/undertale/">Undertale</a>
    and
    <a href="https://www.spriters-resource.com/pc_computer/deltarune/">Deltarune</a>
    pages unless stated otherwise.
</p>
<p>Click on a sprite to copy the ID.</p>

{#each chars as char}
    {@render thingy(char)}
{/each}

<style>
    .thumb {
        image-rendering: pixelated;
        background-color: black;
    }
    .exp-cont {
        width: 8rem;
        display: flex;
        flex-direction: column;
        align-items: center;
        border: 1px solid #b2a7b8;
        background-color: rgba(255, 255, 255, 0.1);
        padding: 0.5rem;
        transition: 200ms;
        position: relative;
    }
    .exp-cont:hover {
        background-color: rgba(255, 255, 255, 0.4);
        cursor: pointer;
    }
    .exp-cont:active {
        background-color: rgba(255, 255, 255, 0.3);
        cursor: pointer;
    }
</style>
