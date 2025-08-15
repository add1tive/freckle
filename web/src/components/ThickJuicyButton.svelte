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

<script lang="ts">
    import "material-symbols";

    let { icon, text, href, color1, color2, color3 }: {
        icon: string, // svg
        text: string,
        href: string,
        color1: string,
        color2: string,
        color3: string
    } = $props();
</script>

<a {href} id="main" style="background: linear-gradient(180deg, {color1} 0%, {color2} 16%, {color3} 34%);">
    <span id="leftIcon" class="material-symbols-outlined" aria-hidden="true">{icon}</span>
    <span id="text">{text}</span>
    <span id="rightIcon" class="material-symbols-outlined" aria-hidden="true">keyboard_arrow_right</span>
</a>

<style>
    a {
        text-decoration: none;
    }
    #main {
        height: 4rem;
        padding-left: 1rem;
        padding-right: 1rem;
        display: flex;
        justify-items: center;
        align-items: center;
        column-gap: 0.5rem;
        border: none;
        filter: drop-shadow(0 0 16px rgba(0, 0, 0, 0.5));
        border-radius: 16px;
        font-size: x-large;
        transition: 0.25s;
        user-select: none;
    }
    #main:hover {
        cursor: pointer;
        transform: translateY(-2px);
        filter: drop-shadow(0 0 22px rgba(0, 0, 0, 0.4));
        scale: 1.01;
    }
    #main:active {
        cursor: pointer;
        transform: translateY(2px);
        filter: drop-shadow(0 0 10px rgba(0, 0, 0, 0.6));
        scale: 0.99;
    }
    span {
        display: block;
        color: white;
    }
    #text {
        font-weight: 500;
    }
    #rightIcon {
        transform: scale(1) translateX(0.25rem);
    }
    .material-symbols-outlined {
        font-size: 30pt;
    }
</style>
