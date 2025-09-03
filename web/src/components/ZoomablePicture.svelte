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
    import PrettyModal from "./PrettyModal.svelte";

    let { src, alt }: { src: string; alt: string } = $props();

    // svelte-ignore non_reactive_update
    let img: HTMLImageElement | undefined;
    let opened = $state(false);
    let hoveredOver = $state(false);
    let zoomedIn = $state(false);
    let imgMouseDown = $state(false);
    let x = 0,
        y = 0,
        moved = false;

    // Worst code ever
    function imgOnMouseDown(event: MouseEvent) {
        imgMouseDown = true;
        if (img && !zoomedIn) {
            x = (img.width / 2) - event.offsetX;
            y = (img.height / 2) - event.offsetY;
        }
        if (img) img.style.transition = "none";
    }
    function imgOnMouseUp(event: MouseEvent) {
        if (!moved) zoomedIn = !zoomedIn;
        if (img) {
            img.style.transition = "0.25s cubic-bezier(0.13, 1.1, 0.71, 1.02)";
            if (!zoomedIn) {
                img.style.transform = "none";
            } else {
                img.style.transform = `translateX(${x / 2}px) translateY(${y / 2}px)`;
            }
        }
        moved = false;
        imgMouseDown = false;
    }
    function imgOnMouseMove(event: MouseEvent) {
        if (imgMouseDown) {
            moved = true;
            x += event.movementX;
            y += event.movementY;
            if (img && zoomedIn) {
                img.style.transition = "none";
                img.style.transform = `translateX(${x / 2}px) translateY(${y / 2}px)`;
            }
        }
    }
    function open() {
        reset(); // just to be safe
        opened = true;

        // for the transition
        // TODO: don't use setTimeout
        setTimeout(() => {if (img) img.style.scale = "1";}, 10);
    }
    function reset() {
        opened = false;
        hoveredOver = false;
        zoomedIn = false;
        imgMouseDown = false;
        x = 0;
        y = 0;
        moved = false;
        if (img) {
            img.style.transition = "0.25s cubic-bezier(0.13, 1.1, 0.71, 1.02)";
            img.style.transform = "none";
        }
    }
</script>

<button
    onmouseenter={() => (hoveredOver = true)}
    onmouseleave={() => (hoveredOver = false)}
    onclick={open}
    style="position: relative;">
    {#if hoveredOver}
        <span class="notice-span material-symbols-outlined" aria-hidden="true">zoom_in</span>
        <span class="alt-span" aria-hidden="true">{alt}</span>
    {/if}
    <img {src} {alt} />
</button>

{#if opened}
    <!-- We have to disable its container or else you won't be able to close the image
         by clicking on where it was when opened.
         This makes it so that a scale animation has to be done on the image itself instead.
         Check line 77. -->
    <PrettyModal on:wantsClose={reset} disableContainer={true}>
        <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
        <img
            bind:this={img}
            onmousedown={imgOnMouseDown}
            onmouseup={imgOnMouseUp}
            onmousemove={imgOnMouseMove}
            onmouseleave={() => (imgMouseDown = false)}
            class="zoomed-image {zoomedIn ? 'zoomed-in' : ''}"
            draggable="false"
            {src}
            {alt} />
    </PrettyModal>
{/if}

<style>
    button {
        border: none;
        padding: 0;
        background: none;
        min-width: min-content;
        max-width: 40rem;
    }

    button:hover {
        cursor: pointer;
    }

    .notice-span,
    .alt-span {
        position: absolute;
        right: 0.5rem;
        background-color: rgba(0, 0, 0, 0.4);
        padding: 0.5rem;
    }

    .notice-span {
        top: 0.5rem;
    }

    .alt-span {
        bottom: 0.5rem;
    }

    .zoomed-image {
        transition: 0.25s cubic-bezier(0.13, 1.1, 0.71, 1.02);
        cursor: zoom-in;
        user-select: none;
        scale: 0.9;
    }

    .zoomed-in {
        scale: 2 !important;
        cursor: zoom-out;
    }
</style>
