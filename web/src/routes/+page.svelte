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

    import NoelleLanding from "$components/svg/NoelleLanding.svelte";
    import BigFancyButton from "$components/BigFancyButton.svelte";
    import { base } from "$app/paths";

    const letters = "Freckle".split("");

    let bgContCont: HTMLDivElement;
    let height = $state(0);

    const colors = ["#f3c580", "#e3ab8d", "#d69797", "#c882a3", "#bf81b1", "#b581c1", "#ae82cc"];

    $effect(() => {
        bgContCont.style.height = `${height + 100}px`;
    });
</script>

<svelte:head>
    <title>Home - Freckle</title>

    <meta property="og:title" content="Home - Freckle" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="https://add1tive.github.io/freckle/" />
    <meta property="og:image" content="https://us-east-1.tixte.net/uploads/add1tive.tixte.co/favicon.png" />
    <meta property="og:description" content="Home page for Freckle, a Discord app to make your day just a tiny bit more interesting" />
    <meta name="theme-color" content="#a380dd">
</svelte:head>

<!-- TODO: make noelle's thingy glow + fix button icon sizes -->

<div bind:this={bgContCont} id="bgContCont">
    <div id="bgCont">
        <div id="bg"></div>
    </div>
</div>

<div bind:clientHeight={height} id="main">
    <div id="noelleContainer">
        <div id="noelleContainerAgain"><NoelleLanding /></div>
    </div>
    <div id="glowyContainer">
        <div id="glowy">
            {#each letters as letter, i}
                <span
                    style="
                    color: {colors[i]};
                    filter: drop-shadow(0 0 6px {colors[i]});
                    animation-delay: -{i}s;">{letter}</span>
            {/each}
        </div>
    </div>
    <div id="thingBelowGoofy">
        <span id="subtitle">a Discord app to make your day just a tiny bit more interesting</span>
        <span id="disclaimer">in very early private access</span>
    </div>
    <div id="mainButtons">
        <BigFancyButton
            color1="#c9839b"
            color2="#a8627a"
            color3="#965068"
            icon="chat"
            text="Add or invite"
            href={`${base}/add`} />
        <BigFancyButton
            color1="#ae96d1"
            color2="#8c73b4"
            color3="#745b9c"
            icon="book_2"
            text="Read the docs"
            href={`${base}/docs/what-is-freckle`} />
    </div>
    <span id="copy">&copy; add1tive 2025</span>
</div>

<style>
    :root {
        --float-amt: -5px;
        --float-rot-start: -3deg;
        --float-rot-end: 3deg;
    }

    @keyframes float {
        50% {
            transform: rotateZ(var(--float-rot-start)) translateY(var(--float-amt));
        }
        0%,
        100% {
            transform: rotateZ(var(--float-rot-end)) translateY(0px);
        }
    }
    @keyframes float-i {
        0%,
        100% {
            transform: rotateZ(var(--float-rot-start)) translateY(var(--float-amt));
        }
        50% {
            transform: rotateZ(var(--float-rot-end)) translateY(0px);
        }
    }

    #bgContCont {
        display: flex;
        overflow: hidden;
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        min-height: 100dvh;
        z-index: -1;
    }
    #bgCont {
        margin: auto;
        min-height: 100%;
        overflow: hidden;
        display: flex;
        justify-content: center;
        pointer-events: none;
        user-select: none;
        background-repeat: no-repeat;
    }
    #bg {
        min-width: 200rem;
        min-height: 200rem;
        background: radial-gradient(
            50% 33% at 50% 0%,
            #474257 0%,
            #363242 34%,
            #292632 71%,
            #25222d 100%
        );
        background-repeat: no-repeat;
        z-index: -1;
        opacity: 75%;
    }

    #main {
        padding: 4rem 4rem 0 4rem;
        @media screen and (width >= 1280px) {
            padding: 4rem 12rem 0 12rem;
        }
        @media screen and (width <= 480px) {
            padding: 4rem 2rem 0 2rem;
        }
    }

    #noelleContainer {
        pointer-events: none;
        user-select: none;
        justify-content: right;
        min-width: 100%;
        @media screen and (width >= 800px) {
            top: 0;
            left: 0;
            padding: 4rem;
            position: absolute;
            display: flex;
        }
        @media screen and (width >= 1280px) {
            padding-right: 12rem;
        }
    }

    #noelleContainerAgain {
        margin: -2rem 0 -8rem 0;
        @media screen and (width >= 800px) {
            margin: 0;
            padding-top: 1rem;
            max-width: 50rem;
            width: 50%;
        }
        z-index: -1;
    }

    #glowyContainer {
        display: flex;
        justify-content: center;
        @media screen and (width >= 800px) {
            justify-content: left;
        }
    }
    #glowy {
        letter-spacing: 0.4rem;
        width: 21rem;
        font-family: "Fira Sans";
        font-weight: 500;
        font-size: 5rem;
        position: absolute;
        @media screen and (width >= 800px) {
            padding-top: 0;
        }
        @media screen and (width <= 480px) {
            scale: 0.85;
        }
    }
    #glowy span {
        display: inline-block;
        /* transition: 0.25s; */
    }
    /* #glowy span:hover {
        scale: 1.2;
    } */
    #glowy span:first-child {
        font-weight: 400;
        font-size: 7rem;
    }
    #glowy span:nth-child(2n-1) {
        animation: float 6s ease-in-out infinite;
    }
    #glowy span:nth-child(2n) {
        animation: float-i 6s ease-in-out infinite;
    }

    #thingBelowGoofy {
        padding-top: 9rem;
        @media screen and (width >= 800px) {
            max-width: 42rem;
        }
    }
    #subtitle {
        font-weight: bold;
        font-size: xx-large;
        line-height: 2.8rem;
        display: block;
    }
    #disclaimer {
        font-weight: bold;
        font-size: large;
        font-style: italic;
        color: rgb(255, 66, 66);
        padding-top: 1rem;
        display: block;
    }

    #mainButtons {
        display: flex;
        flex-wrap: wrap;
        gap: 2rem;
        padding-top: 2rem;
    }

    #copy {
        font-size: large;
        padding-top: 5rem;
        display: block;
        width: 100%;
        text-align: center;
    }
</style>
