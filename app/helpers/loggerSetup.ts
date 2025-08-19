import fs from "node:fs";
import { configure, getConsoleSink } from "@logtape/logtape";
import { getPrettyFormatter } from "@logtape/pretty";
import { getStreamFileSink } from "@logtape/file";

export async function setUpLogger() {
    fs.mkdirSync(".local/logs", { recursive: true });

    const dateRn = new Date()
        .toISOString()
        .replace(/T/, "_")
        .replace(/\..+/, "")
        .replaceAll(":", "-");

    const prettyNoColor = getPrettyFormatter({
        colors: false,
        categoryWidth: 20,
        categorySeparator: " > "
    });
    const prettyCustColor = getPrettyFormatter({
        messageStyle: null,
        categoryStyle: ["italic"],
        categoryWidth: 20,
        categorySeparator: " > "
    });

    // logger
    await configure({
        sinks: {
            console: getConsoleSink({ formatter: prettyCustColor }),
            file: getStreamFileSink(`.local/logs/${dateRn}.log`, { formatter: prettyNoColor })
        },
        loggers: [
            { category: ["logtape", "meta"], sinks: [] }, // disabled
            { category: ["app"], lowestLevel: "debug", sinks: ["console", "file"] }
        ]
    });
}
