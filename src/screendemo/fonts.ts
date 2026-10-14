// Fonts are bundled in public/fonts (latin subset, variable weight) so renders don't
// fetch from Google Fonts at render time.
import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

const load = (family: string, file: string, weight: string) => {
  loadFont({ family, url: staticFile(`fonts/${file}`), weight, display: "block" });
  return `"${family}"`;
};

export const INTER = load("Inter", "Inter-latin.woff2", "500 800");
export const GROTESK = load("Space Grotesk", "SpaceGrotesk-latin.woff2", "500 700");
export const MONO = load("JetBrains Mono", "JetBrainsMono-latin.woff2", "400 700");
