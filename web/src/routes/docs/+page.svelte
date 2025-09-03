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

    import { base } from "$app/paths";
</script>

<!-- I can't automatically redirect with GitHub Pages -->

<svelte:head>
    <title>404 Not found &ndash; Freckle</title>
</svelte:head>

<div>
    <h1>404</h1>
    <p>not found</p>
</div>

<span>You might be looking for <a href={`${base}/docs/what-is-freckle`}>What is Freckle?</a></span>

<style>
    div {
        width: 100%;
        display: flex;
        /* align-items: center; */
        flex-direction: column;
        /* padding-top: 5rem; */
        /* @media screen and (width <= 640px) {
            padding-top: 2rem;
        } */
    }
    h1 {
        font-weight: lighter;
        font-size: 12rem;
        @media screen and (width <= 640px) {
            font-size: 8rem;
        }
    }
    p {
        font-size: 2.5rem;
        display: block;
        @media screen and (width <= 640px) {
            font-size: 1.5rem;
        }
    }
</style>
