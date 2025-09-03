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
</script>

<svelte:head>
    <title>About - Freckle</title>

    <meta property="og:title" content="About - Freckle" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="https://add1tive.github.io/freckle/about" />
    <meta property="og:image" content="https://us-east-1.tixte.net/uploads/add1tive.tixte.co/favicon.png" />
    <meta property="og:description" content="About Freckle, a Discord app to make your day just a tiny bit more interesting" />
    <meta name="theme-color" content="#a380dd">
</svelte:head>

<div id="main">
    <div id="logoDiv">
        <div id="logoContainer"><LogoWithText /></div>
    </div>
    <div>
        <p>a Discord app to make your day just a tiny bit more interesting</p>
        <p>&copy; add1tive 2025</p>
    </div>
    <div>
        <p>
            Home page character: <a href="https://deltarune.wiki/w/Noelle_Holiday" target="_blank"
                >Noelle Holiday</a> from DELTARUNE
        </p>
        <p>
            GitHub repo: <a href="https://github.com/add1tive/freckle" target="_blank">freckle</a>
        </p>
    </div>
</div>

<style>
    #main {
        display: flex;
        flex-direction: column;
        gap: 3rem;
        padding-left: 2rem;
        padding-right: 2rem;
    }
    #main div:not(:first-child) {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }
    #main div:last-child p {
        opacity: 0.5;
    }

    #logoDiv {
        display: flex;
        width: 100%;
        justify-content: center;
        padding-top: 2rem;
    }

    #logoContainer {
        width: 20rem;
    }

    p {
        display: block;
        width: 100%;
        text-align: center;
    }
</style>
