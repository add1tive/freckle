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
    import { base } from "$app/paths";
    import { page } from "$app/state";
    let { children } = $props();

    function linkIsCurrentDocs(id: string) {
        // don't ask
        return page.url.pathname === `${base}/docs${id ? "/" + id : ""}`;
    }

    const articleNameMap = {
        "what-is-freckle": "What is Freckle?",
        "intro-to-textboxes": "Intoduction to Textboxes",
        "textbox-commands": "Textbox commands",
        "expressions-table": "Expressions table"
    };

    // don't ask, again
    type ArticleId = keyof typeof articleNameMap;
</script>

{#snippet docsNavLink(articleId: ArticleId)}
    <li class={linkIsCurrentDocs(articleId) ? "active" : ""}>
        <a href={`${base}/docs/${articleId}`}>{articleNameMap[articleId]}</a>
    </li>
{/snippet}

<div id="main">
    <aside>
        <ul>
            <h3>Introduction</h3>
            {@render docsNavLink("what-is-freckle")}
            <h3>Textbox</h3>
            {@render docsNavLink("intro-to-textboxes")}
            {@render docsNavLink("textbox-commands")}
            {@render docsNavLink("expressions-table")}
        </ul>
    </aside>
    <div id="docArticle">
        {@render children()}
    </div>
</div>

<div id="toTopBtnDiv">
    <a href="#top" id="toTopBtn"
        ><span class="material-symbols-outlined" aria-hidden="true">keyboard_arrow_up</span></a>
</div>

<style>
    :root {
        --sidebar-width: 18rem;
        --whatever-this-is: max(var(--sidebar-width), calc(0.5 * 100vw - 30rem));
    }
    #main {
        min-height: calc(100dvh - 4rem);
        @media screen and (width <= 1200px) {
            flex-direction: column;
        }
    }
    aside {
        min-width: none;
        width: 100%;
        background-color: #1f1d27;
        display: flex;
        @media screen and (width > 1200px) {
            position: fixed;
            justify-content: end;
            /* thanks svelte docs */
            width: var(--whatever-this-is);
        }
    }
    #docArticle {
        display: flex;
        flex-direction: column;
        gap: 0.9rem;
        padding: 2rem calc(var(--whatever-this-is) + 4rem) 4rem calc(var(--whatever-this-is) + 4rem);
        width: 100%;
        @media screen and (width <= 1200px) {
            padding: 2rem 2rem 4rem 3rem;
        }
    }
    ul {
        overflow-y: auto;
        list-style: none;
        margin: 0;
        top: 4rem;
        left: 0;
        padding: 2rem 2rem 2rem 2rem;
        @media screen and (width > 1200px) {
            min-width: var(--sidebar-width);
            height: calc(100dvh - 4rem);
            padding-right: 4rem;
        }
    }
    a {
        text-decoration: none;
    }
    ul a {
        border-radius: 0.5rem;
        color: #b2a7b8;
    }
    ul h3:not(:first-child) {
        padding-top: 1rem;
    }
    li.active > a {
        color: white;
        border-color: #dee2e6 #dee2e6 #fff;
    }

    #toTopBtnDiv {
        position: fixed;
        bottom: 2rem;
        right: 2rem;
        z-index: 1000;
    }
    #toTopBtn {
        height: 5rem;
    }
    #toTopBtn > span {
        font-size: 40pt;
        color: white;
        background-color: #495057;
        border-radius: 2rem;
    }
</style>
