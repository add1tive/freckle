<script lang="ts">
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

    import "material-symbols";
    import type { MouseEventHandler } from "svelte/elements";

    // TODO: add types
    let {
        icon,
        onclick,
        isLink,
        href,
        isAtBottom
    }: {
        icon: string;
        onclick?: MouseEventHandler<HTMLButtonElement>;
        isLink?: boolean;
        href?: string;
        isAtBottom?: boolean;
    } = $props();
</script>

{#snippet btnCont()}
    <span class="material-symbols-outlined" aria-hidden="true">{icon}</span>
{/snippet}

<div id="sBtnDiv" style={!isAtBottom ? "top: 2rem;" : "bottom: 2rem;"}>
    {#if !isLink}
        <button {onclick}>{@render btnCont()}</button>
    {:else}
        <a {href}>{@render btnCont()}</a>
    {/if}
</div>

<style>
    #sBtnDiv {
        position: fixed;
        bottom: 2rem;
        right: 2rem;
        width: 4rem;
        height: 4rem;
        z-index: 1000;
        display: flex;
    }
    button,
    a {
        border: none;
        text-decoration: none;
        padding: 0;
        background: none;
        cursor: pointer;
        flex-grow: 1;
        display: flex;
        justify-content: center;
        align-items: center;
        background-color: #514957;
        box-shadow: 0 0 20px #131218;
        border-radius: 2rem;
        width: 4rem;
        height: 4rem;
    }
    span {
        font-size: 40pt;
        color: white;
    }
</style>
