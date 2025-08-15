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
    <p>
        <a href={args.href} target="_blank">{args.hrefTitle}</a>
    </p>
    <div style="display: flex; flex-wrap: wrap;">
        {#each { length: args.length }, i}
            <button class="exp-cont" onclick={() => navigator.clipboard.writeText((i + 1).toString())}>
                <div>
                    <img alt={args.id} src={`${base}/images/expressions/${args.id}/${i + 1}.png`} />
                </div>
                <span>{i + 1}</span>
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
<p>Most sprites are from The Sprites Resource (check the links below).</p>
<p>Click on a sprite to copy the ID.</p>

{#each chars as char}
    {@render thingy(char)}
{/each}

<style>
    img {
        image-rendering: pixelated;
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
