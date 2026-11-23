import { registerRoot } from "remotion";
import { FlowReelRoot } from "./Root";

// Separate entry so FlowReel renders don't load ScreenDemo's Google Fonts (system Inter only).
registerRoot(FlowReelRoot);
