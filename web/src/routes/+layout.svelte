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

    import LogoWithText from "$components/svg/LogoWithText.svelte";
    import { page } from "$app/state";
    import { base } from "$app/paths";
    let { children } = $props();

    function linkIsCurrent(name: string) {
        return page.url.pathname.startsWith(`${base}/${name}`);
    }
</script>

{#snippet navLink(name: string, link?: string)}
    <a class={linkIsCurrent(name) ? "active" : ""} href={link ? `${base}/${link}` : `${base}/${name}`}>{name}</a>
{/snippet}

<nav>
    <div id="navLeft">
        <a href={base ? base : "/"} id="logoTextContainer">
            <LogoWithText />
        </a>
        <div id="navLeftLinks">
            {@render navLink("add")}
            {@render navLink("docs", "docs/what-is-freckle")}
            <!-- {@render navLink("builder")} -->
        </div>
    </div>
    <div id="navRight">
        {@render navLink("about")}
    </div>
</nav>

<div id="thingamajig">
    {@render children()}
</div>

<style>
    nav {
        display: flex;
        flex-direction: row;
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 4rem;
        background-color: #1e1c25cc;
        backdrop-filter: blur(16px);
        justify-items: center;
        padding: 0 1rem 0 1rem;
        z-index: 1000;
    }
    #navLeft,
    #navRight {
        display: flex;
        gap: 2rem;
    }
    #navLeftLinks {
        gap: 2rem;
        display: none;
        @media screen and (width >= 440px) {
            display: flex;
            align-items: center;
        }
    }
    #navRight {
        padding-right: 1rem;
        margin-left: auto;
        align-items: center;
    }
    #logoTextContainer {
        display: flex;
        align-items: end;
        width: 10rem;
        height: 100%;
    }
    nav a {
        color: rgb(180, 180, 180);
        text-decoration: none;
        font-size: 16pt;
        display: block;
    }
    nav a.active {
        color: white;
    }

    #thingamajig {
        padding-top: 4rem;
    }
</style>
