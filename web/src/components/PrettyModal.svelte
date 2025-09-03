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

    import { fade, scale } from "svelte/transition";
    import { createEventDispatcher } from "svelte";
    import SmallCircularButton from "$components/SmallCircularButton.svelte";

    const dispatch = createEventDispatcher();

    let { children, disableContainer = false } = $props();

    const soothe = 16;
    function customBackOut(t: number) {
        const s = 1;
        return (--t * t * ((s + 1) * t + s)) / soothe + 1;
    }
    function customCubicOut(t: number) {
        const f = t - 1;
        return (f * f * f + 1) / soothe;
    }
</script>

<svelte:window
    onkeydown={(e) => {
        if (e.key === "Escape") dispatch("wantsClose");
    }} />

<!-- TODO: add these later -->
<!-- svelte-ignore a11y_interactive_supports_focus -->
<!-- svelte-ignore a11y_click_events_have_key_events -->
<div
    role="dialog"
    id="modalRoot"
    transition:fade={{ duration: 80 }}
    onclick={(e) => {
        if ((e.target as HTMLDivElement).id === "modalRoot") dispatch("wantsClose");
    }}>
    <SmallCircularButton icon="close" onclick={() => dispatch("wantsClose")} />
    {#if !disableContainer}
        <div
            id="modalContainer"
            in:scale={{ duration: 250, easing: customBackOut }}
            out:scale={{ easing: customCubicOut }}>
            {@render children()}
        </div>
    {:else}
        {@render children()}
    {/if}
</div>

<style>
    #modalRoot {
        position: fixed;
        top: 0;
        left: 0;
        width: 100dvw;
        height: 100dvh;
        background-color: rgba(0, 0, 0, 0.9);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1001;
    }
</style>
