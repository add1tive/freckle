import fs from "node:fs";
import { configure, getConsoleSink } from "@logtape/logtape";
import { getPrettyFormatter } from "@logtape/pretty";
import { getStreamFileSink } from "@logtape/file";

export async function setUpLogger() {
    fs.mkdirSync(".local/logs", { recursive: true });

    // just so I can remove the milliseconds logtape has by default
    const prettyTimeFormat = (ts: number) => new Date(ts).toLocaleTimeString("en-GB");

    const dateRn = new Date()
        .toISOString()
        .replace(/T/, "_")
        .replace(/\..+/, "")
        .replaceAll(":", "-");

    const prettyFile = getPrettyFormatter({
        colors: false,
        categoryWidth: 24,
        categoryTruncate: "middle",
        timestamp: "date-time"
    });
    const prettyTerminal = getPrettyFormatter({
        messageStyle: null,
        messageColor: "white",
        categoryStyle: ["italic"],
        categoryWidth: 24,
        categoryTruncate: "middle",
        timestamp: prettyTimeFormat,
        timestampStyle: "reset"
    });

    // logger
    await configure({
        sinks: {
            console: getConsoleSink({ formatter: prettyTerminal }),
            file: getStreamFileSink(`.local/logs/${dateRn}.log`, { formatter: prettyFile })
        },
        loggers: [
            { category: ["logtape", "meta"], lowestLevel: "warning", sinks: ["console", "file"] }, // disabled
            { category: ["app"], lowestLevel: "debug", sinks: ["console", "file"] }
        ]
    });
}
