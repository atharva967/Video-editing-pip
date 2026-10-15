import { Composition } from "remotion";
import { LeadEngineDemo, leadEngineFrames, type LeadEngineProps } from "./leadengine/LeadEngineDemo";
import { ScreenDemo, totalFrames as screenDemoFrames, type ScreenDemoProps } from "./screendemo/ScreenDemo";

// Defaults only matter in Studio before a props file is picked; renders always pass --props.
const SCREENDEMO_DEFAULTS: ScreenDemoProps = {
  id: "screendemo", fps: 30, src: "", srcW: 1260, srcH: 684,
  win: { w: 1440, h: 860, bar: 44, url: "rekroots.com" }, segs: [{ a: 0, b: 1 }], camera: [{ o: 0, rect: [182, 42, 1075] }],
  clicks: [], spots: [], captions: [], intro: { sec: 1.5, title: "Title", sub: "Sub" }, outro: { sec: 2.2, title: "Title", sub: "Sub", url: "rekroots.com" },
  brand: { name: "Rekroots", logoSrc: "brand/rekroots-mark.svg", accent: "#DC2626", ink: "#1A0B0B", paper: "#F6F1EC" }, musicSrc: null, musicVolume: 0.3,
};

export const RemotionRoot: React.FC = () => (
  <>
  <Composition
    id="ScreenDemo"
    component={ScreenDemo}
    durationInFrames={300}
    fps={30}
    width={1920}
    height={1080}
    defaultProps={SCREENDEMO_DEFAULTS}
    calculateMetadata={({ props }) => ({ durationInFrames: screenDemoFrames(props), fps: props.fps })}
  />
  <Composition
    id="LeadEngineDemo"
    component={LeadEngineDemo}
    durationInFrames={300}
    fps={30}
    width={1920}
    height={1080}
    defaultProps={{ fps: 30, pad: 0.5, video: { src: "", w: 1280, h: 720 }, title: { tag: "", title: "", steps: [] }, outro: { title: "", sub: "" }, scenes: [], musicSrc: null, musicVolume: 0 } as LeadEngineProps}
    calculateMetadata={({ props }) => ({ durationInFrames: Math.max(1, leadEngineFrames(props)), fps: props.fps })}
  />
  </>
);
