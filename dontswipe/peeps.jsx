// Compose Open Peeps (CC0 / MIT package @opeepsfun/open-peeps) full-body characters into standalone SVGs.
// Run: node build_peeps.mjs  (bundles this with esbuild, then executes)
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { StandingBodies, SittingBodies, Heads, Faces } from "./parts.gen.js";
import fs from "fs";

const spec = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
const outDir = process.argv[3];
const pick = (lib, name) => {
  const v = lib[name];
  if (!v) throw new Error("missing " + name);
  return v;
};
for (const c of spec) {
  const Body = pick(c.sitting ? SittingBodies : StandingBodies, c.body);
  const Hair = c.head ? pick(Heads, c.head) : null;
  const Face = c.face ? pick(Faces, c.face) : null;
  const [hx, hy, hs] = c.headAt || [0, 0, 1];
  const vb = c.viewBox || "0 0 1645 2561";
  const svg = renderToStaticMarkup(
    <svg xmlns="http://www.w3.org/2000/svg" viewBox={vb} overflow="visible">
      <g transform={`translate(${hx} ${hy}) scale(${hs})`}>
        {Hair && <g transform={`translate(${(c.hairOff || [0, 0])[0]} ${(c.hairOff || [0, 0])[1]})`}><Hair {...(c.hairOpts || {})} /></g>}
        {Face && <g transform="translate(189 176)"><Face {...(c.faceOpts || {})} /></g>}
      </g>
      <Body {...(c.bodyOpts || {})} />
    </svg>
  );
  fs.writeFileSync(`${outDir}/${c.name}.svg`, svg);
  console.log(c.name, svg.length);
}
