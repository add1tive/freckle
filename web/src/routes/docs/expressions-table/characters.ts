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

export interface Whatever {
    id: string;
    name: string;
    href?: string;
    hrefTitle?: string;
    length: number;
}

export const chars: Whatever[] = [
    {
        id: "noelle",
        name: "Noelle",
        length: 51
    },
    {
        id: "ralsei",
        name: "Ralsei",
        length: 53
    },
    {
        id: "susie",
        name: "Susie",
        length: 70
    },
    {
        id: "sans",
        name: "Sans",
        length: 7
    },
    {
        id: "sansboss",
        name: "Sans (boss)",
        length: 22
    },
    {
        id: "papyrus",
        name: "Papyrus",
        length: 19
    },
    {
        id: "berdly",
        name: "Berdly",
        length: 25
    },
    {
        id: "carol",
        name: "Carol",
        length: 10
    }
];
