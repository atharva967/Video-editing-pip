// Fonts are bundled in public/fonts (latin subset, variable weight) so renders don't
// fetch from Google Fonts at render time.
// The faces are registered when this module loads, but the render only waits for them inside
// the composition (useFonts). A delayRender at module scope (what @remotion/fonts does) was
// never cleared in long renders and failed them with a timeout.
import { useEffect, useState } from "react";
import { continueRender, delayRender, staticFile } from "remotion";

const faces: FontFace[] = [];
const load = (family: string, file: string, weight: string) => {
  if (typeof FontFace !== "undefined" && typeof document !== "undefined") {
    const font = new FontFace(family, `url('${staticFile(`fonts/${file}`)}') format('woff2')`, { weight, display: "block" });
    document.fonts.add(font);
    font.load().catch((e) => console.error(`Font ${family} failed to load`, e));
    faces.push(font);
  }
  return `"${family}"`;
};

export const INTER = load("Inter", "Inter-latin.woff2", "500 800");
export const GROTESK = load("Space Grotesk", "SpaceGrotesk-latin.woff2", "500 700");
export const MONO = load("JetBrains Mono", "JetBrainsMono-latin.woff2", "400 700");
export const MONTSERRAT = load("Montserrat", "Montserrat-latin.woff2", "600 900");

// Call once at the top of a composition: holds the frame until the bundled fonts are ready.
export const useFonts = () => {
  const [handle] = useState(() => delayRender("Loading bundled fonts"));
  useEffect(() => {
    Promise.allSettled(faces.map((f) => f.loaded)).then(() => continueRender(handle));
  }, [handle]);
};
