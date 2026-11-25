// Bundle peeps.jsx with esbuild (node_modules path via PEEPS_NODE_MODULES) and run it on peeps.json.
import { build } from "esbuild";
import { execFileSync } from "child_process";
import fs from "fs";
const nm = process.env.PEEPS_NODE_MODULES;
const base = `${nm}/@opeepsfun/open-peeps/build`;
let gen = "";
for (const [exp, dir] of [["StandingBodies", "body/standing"], ["SittingBodies", "body/sitting"], ["Heads", "head"], ["Faces", "face"]]) {
  const names = fs.readdirSync(`${base}/${dir}`).filter((f) => f.endsWith(".js") && f !== "index.js").map((f) => f.slice(0, -3));
  names.forEach((n) => (gen += `import ${exp}_${n} from "@opeepsfun/open-peeps/build/${dir}/${n}.js";\n`));
  gen += `export const ${exp} = { ${names.map((n) => `${n}: ${exp}_${n}`).join(", ")} };\n`;
}
fs.writeFileSync("parts.gen.js", gen);
await build({ entryPoints: ["peeps.jsx"], bundle: true, platform: "node", format: "cjs", outfile: "/tmp/peeps.cjs", nodePaths: [nm], jsx: "automatic", logLevel: "error" });
execFileSync("node", ["/tmp/peeps.cjs", process.argv[2] || "peeps.json", process.argv[3] || "peeps"], { stdio: "inherit" });
