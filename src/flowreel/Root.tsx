import { Composition } from "remotion";
import { FlowReel, totalFrames, type FlowReelProps } from "./FlowReel";

const DEFAULTS: FlowReelProps = {
  id: "flowreel", fps: 30, scenes: [], captions: [],
  end: { sec: 4, keyword: "WORD", line: "Line", tag: "#BuildWithManjot" },
  musicSrc: null, musicStart: 0, musicVolume: 0.3, sfxSrc: null,
};

export const FlowReelRoot: React.FC = () => (
  <Composition
    id="FlowReel"
    component={FlowReel}
    durationInFrames={300}
    fps={30}
    width={1080}
    height={1920}
    defaultProps={DEFAULTS}
    calculateMetadata={({ props }) => ({ durationInFrames: totalFrames(props), fps: props.fps })}
  />
);
