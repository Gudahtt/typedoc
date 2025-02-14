import { ok } from "assert";
import { existsSync } from "fs";
import { join } from "path";
import type * as ts from "typescript";
import type { ProjectReflection } from "../lib/models";
import { behaviorTests } from "./behaviorTests";
import { issueTests } from "./issueTests";
import {
    getConverter2App,
    getConverter2Base,
    getConverter2Program,
} from "./programs";

const base = getConverter2Base();
const app = getConverter2App();
let program: ts.Program;

function runTest(
    title: string,
    entry: string,
    check: (project: ProjectReflection) => void
) {
    it(title, () => {
        const entryPoint = [
            join(base, `${entry}.ts`),
            join(base, `${entry}.d.ts`),
            join(base, `${entry}.tsx`),
            join(base, `${entry}.js`),
            join(base, entry, "index.ts"),
        ].find(existsSync);

        ok(entryPoint, `No entry point found for ${entry}`);
        const sourceFile = program.getSourceFile(entryPoint);
        ok(sourceFile, `No source file found for ${entryPoint}`);

        const project = app.converter.convert([
            {
                displayName: entry,
                program,
                sourceFile,
            },
        ]);
        check(project);
    });
}

describe("Converter2", () => {
    it("Compiles", () => {
        program = getConverter2Program();
    });

    for (const [entry, check] of Object.entries(issueTests)) {
        const link = `https://github.com/TypeStrong/typedoc/issues/${entry.substr(
            2
        )}`;

        runTest(
            `Issue ${entry.substr(2).padEnd(4)} (${link})`,
            join("issues", entry),
            check
        );
    }

    for (const [entry, check] of Object.entries(behaviorTests)) {
        const title = `Handles ${entry.replace(
            /([a-z][A-Z])/g,
            (x) => `${x[0]} ${x[1].toLowerCase()}`
        )}`;

        runTest(title, join("behavior", entry), check);
    }
});
