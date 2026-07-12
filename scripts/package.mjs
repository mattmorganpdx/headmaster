// Build the extension and zip dist/ into headmaster-v<version>.zip, ready for
// Chrome Web Store upload. Version is read from the manifest (the shipped
// source of truth). Requires the `zip` CLI. Run: npm run package
import { execSync } from "node:child_process";
import { readFileSync, rmSync } from "node:fs";

const manifestUrl = new URL("../public/manifest.json", import.meta.url);
const { version } = JSON.parse(readFileSync(manifestUrl, "utf8"));
const out = `headmaster-v${version}.zip`;

execSync("npm run build", { stdio: "inherit" });
// Remove any prior archive first — `zip` updates in place otherwise, which
// would leave stale/removed files inside a re-run of the same version.
rmSync(out, { force: true });
// -r recurse, -X strip extra file attributes for a reproducible archive.
execSync(`cd dist && zip -r -X ../${out} .`, { stdio: "inherit" });

console.log(`\nWrote ${out}`);
