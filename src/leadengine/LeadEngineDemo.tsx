// LeadEngineDemo: product walkthrough of the AI Lead Intelligence Engine with voiceover.
// A screen recording plus sharp screenshots play inside a browser window on a dark wallpaper.
// Each scene lasts as long as its voiceover line (plus `pad`) and has its own eased camera.
import React from "react";
import { AbsoluteFill, Audio, Easing, Freeze, Img, OffthreadVideo, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { INTER } from "../screendemo/fonts";

type Rect = [number, number, number]; // x, y, width in source px; height = width * 9/16
type Cam = [number, Rect, number?]; // [seconds into scene, target rect, ease duration]

export type Scene = {
  key: string; // voiceover file public/scrapper/vo/<key>.wav
  vo: number; // voiceover length in seconds
  kind: "title" | "video" | "image" | "outro";
  caption?: string;
  // video: source range in seconds and playback rate (the last frame holds once the range ends)
  from?: number;
  to?: number;
  rate?: number;
  // image: file in public/ and its pixel size
  src?: string;
  w?: number;
  h?: number;
  cam?: Cam[];
};

export type LeadEngineProps = {
  fps: number;
  pad: number; // seconds of silence after each voiceover line
  video: { src: string; w: number; h: number };
  title: { tag: string; title: string; steps: string[] };
  outro: { title: string; sub: string };
  scenes: Scene[];
  musicSrc: string | null;
  musicVolume: number;
  musicStart?: number;
};

const WIN = { w: 1600, h: 900, bar: 36 };
const C = { bg: "#090C12", panel: "#0F131A", accent: "#8B8CF8", teal: "#34D399", text: "#E8EAF0", sub: "#9AA3B2" };
const ease = Easing.bezier(0.45, 0, 0.15, 1);
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

export const sceneFrames = (p: LeadEngineProps) => p.scenes.map((s) => Math.round((s.vo + p.pad) * p.fps));
export const leadEngineFrames = (p: LeadEngineProps) => sceneFrames(p).reduce((a, b) => a + b, 0);

const camAt = (cams: Cam[], t: number): Rect => {
  let r = cams[0][1];
  for (const [at, target, dur = 1.1] of cams) {
    if (t < at) break;
    const k = ease(clamp01((t - at) / dur));
    r = [r[0] + (target[0] - r[0]) * k, r[1] + (target[1] - r[1]) * k, r[2] + (target[2] - r[2]) * k];
  }
  return r;
};

const Wallpaper: React.FC<{ sec: number }> = ({ sec }) => {
  const d = (k: number, a: number) => Math.sin(sec * 0.22 + k) * a;
  return (
    <AbsoluteFill style={{ background: C.bg, overflow: "hidden" }}>
      <div style={{ position: "absolute", left: -380 + d(0, 70), top: -460 + d(1, 50), width: 1500, height: 1300, borderRadius: "50%", background: "radial-gradient(circle, #4F46E5 0%, #4F46E500 64%)", opacity: 0.75 }} />
      <div style={{ position: "absolute", right: -460 + d(2, 70), bottom: -560 + d(3, 50), width: 1500, height: 1400, borderRadius: "50%", background: "radial-gradient(circle, #0EA5A4 0%, #0EA5A400 62%)", opacity: 0.55 }} />
      <div style={{ position: "absolute", left: 640 + d(4, 80), top: 260 + d(5, 60), width: 1100, height: 900, borderRadius: "50%", background: "radial-gradient(circle, #1E1B4B 0%, #1E1B4B00 60%)", opacity: 0.9 }} />
      <AbsoluteFill style={{ background: "radial-gradient(120% 100% at 50% 40%, transparent 50%, rgba(0,0,0,0.5) 100%)" }} />
    </AbsoluteFill>
  );
};

const AppMark: React.FC<{ size: number }> = ({ size }) => (
  <div style={{ width: size, height: size, borderRadius: size * 0.24, background: "linear-gradient(135deg, #3B82F6 0%, #22D3EE 100%)", boxShadow: "0 18px 50px rgba(34,211,238,0.35)" }} />
);

// One scene's content inside the window viewport (WIN.w x WIN.h)
const SceneView: React.FC<{ s: Scene; p: LeadEngineProps; t: number }> = ({ s, p, t }) => {
  const { fps } = useVideoConfig();
  const r = camAt(s.cam ?? [[0, [0, 0, s.kind === "image" ? s.w! : p.video.w]]], t);
  const k = WIN.w / r[2];
  const W = s.kind === "image" ? s.w! : p.video.w;
  const H = s.kind === "image" ? s.h! : p.video.h;
  const style: React.CSSProperties = { position: "absolute", left: 0, top: 0, width: W, height: H, transformOrigin: "0 0", transform: `translate(${-r[0] * k}px, ${-r[1] * k}px) scale(${k})` };
  if (s.kind === "image") return <Img src={staticFile(s.src!)} style={style} />;
  const srcSec = s.from! + Math.min(t * (s.rate ?? 1), s.to! - s.from!);
  return (
    <div style={style}>
      <Freeze frame={Math.round(srcSec * fps)}>
        <OffthreadVideo src={staticFile(p.video.src)} muted style={{ width: W, height: H }} />
      </Freeze>
    </div>
  );
};

export const LeadEngineDemo: React.FC<LeadEngineProps> = (p) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const lens = sceneFrames(p);
  const starts = lens.map((_, i) => lens.slice(0, i).reduce((a, b) => a + b, 0));
  const total = starts[starts.length - 1] + lens[lens.length - 1];
  const idx = Math.max(0, starts.filter((st) => frame >= st).length - 1);
  const s = p.scenes[idx];
  const t = (frame - starts[idx]) / fps;
  const sceneLen = lens[idx] / fps;

  const firstWin = p.scenes.findIndex((x) => x.kind === "video" || x.kind === "image");
  const outroIdx = p.scenes.findIndex((x) => x.kind === "outro");
  const winIn = starts[firstWin];
  const winOut = outroIdx >= 0 ? starts[outroIdx] : total;
  const enter = spring({ fps, frame: frame - winIn + 6, config: { damping: 16, stiffness: 90 }, durationInFrames: 28 });
  const exit = interpolate(frame, [winOut - 4, winOut + 14], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });
  const winTop = (height - (WIN.h + WIN.bar)) / 2 - 38;
  const showWin = frame >= winIn - 2 && frame < winOut + 16;
  // previous window scene, cross-faded out over the first 10 frames of the next one
  const prevIdx = idx - 1;
  const fadeIn = clamp01((frame - starts[idx]) / 10);
  const prev = prevIdx >= 0 && p.scenes[prevIdx].kind !== "title" && fadeIn < 1 ? p.scenes[prevIdx] : null;
  const winScene = s.kind === "video" || s.kind === "image" ? s : idx > 0 ? p.scenes[idx - 1] : null;

  const capIn = clamp01((t - 0.25) / 0.3);
  const capOut = clamp01((sceneLen - t - 0.1) / 0.2);
  const musicVol = (f: number) => p.musicVolume * Math.min(1, f / (0.8 * fps)) * Math.min(1, Math.max(0, (total - f) / (1.5 * fps)));
  const pop = (delayF: number, at: number) => spring({ fps, frame: frame - at - delayF, config: { damping: 14, stiffness: 120 }, durationInFrames: 22 });

  return (
    <AbsoluteFill style={{ fontFamily: INTER }}>
      <Wallpaper sec={frame / fps} />

      {showWin && winScene && (
        <div style={{
          position: "absolute", left: (width - WIN.w) / 2, top: winTop, width: WIN.w, height: WIN.h + WIN.bar, borderRadius: 18, overflow: "hidden",
          boxShadow: "0 50px 120px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.12)", background: C.panel,
          transform: `translateY(${(1 - enter) * 140 + exit * 60}px) scale(${0.9 + enter * 0.1 - exit * 0.08})`, opacity: Math.min(1, enter * 1.4) * (1 - exit),
        }}>
          <div style={{ height: WIN.bar, background: "#161B24", display: "flex", alignItems: "center", padding: "0 16px", gap: 8, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => <div key={c} style={{ width: 12, height: 12, borderRadius: 6, background: c }} />)}
            <div style={{ margin: "0 auto", transform: "translateX(-30px)", background: "#0F131A", color: C.sub, fontSize: 14, padding: "5px 90px", borderRadius: 8 }}>Lead Intelligence Engine</div>
          </div>
          <div style={{ position: "relative", width: WIN.w, height: WIN.h, overflow: "hidden", background: C.panel }}>
            {s === winScene ? (
              <>
                {prev && <AbsoluteFill><SceneView s={prev} p={p} t={lens[prevIdx] / fps + (frame - starts[idx]) / fps} /></AbsoluteFill>}
                <AbsoluteFill style={{ opacity: prev ? fadeIn : 1 }}><SceneView s={s} p={p} t={t} /></AbsoluteFill>
              </>
            ) : (
              <SceneView s={winScene} p={p} t={lens[idx - 1] / fps} />
            )}
          </div>
        </div>
      )}

      {/* caption chip */}
      {s.caption && (
        <div style={{ position: "absolute", left: 0, right: 0, top: winTop + WIN.h + WIN.bar + 26, display: "flex", justifyContent: "center", opacity: Math.min(capIn, capOut), transform: `translateY(${(1 - capIn) * 12}px)` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, background: "rgba(10,12,18,0.82)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 14, padding: "12px 24px 12px 14px", color: "#fff", fontSize: 30, fontWeight: 600, letterSpacing: -0.3 }}>
            <span style={{ width: 34, height: 34, borderRadius: 9, background: C.accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 19, fontWeight: 800, color: "#0B0D14" }}>{idx - firstWin + 1}</span>
            {s.caption}
          </div>
        </div>
      )}

      {/* title card */}
      {s.kind === "title" && (() => {
        const at = starts[idx];
        const out = interpolate(frame, [at + lens[idx] - 10, at + lens[idx]], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        return (
          <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column", opacity: out }}>
            <div style={{ transform: `scale(${pop(4, at)})` }}><AppMark size={120} /></div>
            <div style={{ marginTop: 34, padding: "9px 22px", borderRadius: 40, border: "1px solid rgba(255,255,255,0.25)", background: "rgba(255,255,255,0.08)", color: "#fff", fontSize: 30, fontWeight: 600, opacity: pop(10, at), transform: `translateY(${(1 - pop(10, at)) * 20}px)` }}>{p.title.tag}</div>
            <div style={{ marginTop: 28, color: "#fff", fontSize: 84, fontWeight: 800, letterSpacing: -2.5, textAlign: "center", maxWidth: 1500, lineHeight: 1.05, opacity: pop(16, at), transform: `translateY(${(1 - pop(16, at)) * 30}px)` }}>{p.title.title}</div>
            <div style={{ marginTop: 44, display: "flex", gap: 18 }}>
              {p.title.steps.map((st, i) => {
                const k = pop(Math.round((1.7 + i * 0.55) * fps), at);
                return <div key={st} style={{ padding: "12px 26px", borderRadius: 12, background: i === p.title.steps.length - 1 ? C.accent : "rgba(255,255,255,0.1)", color: i === p.title.steps.length - 1 ? "#0B0D14" : "#fff", fontSize: 30, fontWeight: 700, opacity: k, transform: `translateY(${(1 - k) * 18}px) scale(${0.9 + k * 0.1})` }}>{st}</div>;
              })}
            </div>
          </AbsoluteFill>
        );
      })()}

      {/* outro */}
      {s.kind === "outro" && (() => {
        const at = starts[idx];
        return (
          <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
            <div style={{ transform: `scale(${pop(8, at)})` }}><AppMark size={110} /></div>
            <div style={{ marginTop: 36, color: "#fff", fontSize: 86, fontWeight: 800, letterSpacing: -2.5, opacity: pop(14, at), transform: `translateY(${(1 - pop(14, at)) * 30}px)` }}>{p.outro.title}</div>
            <div style={{ marginTop: 22, color: C.sub, fontSize: 36, fontWeight: 500, opacity: pop(22, at) }}>{p.outro.sub}</div>
          </AbsoluteFill>
        );
      })()}

      {p.scenes.map((sc, i) => (
        <Sequence key={sc.key} from={starts[i] + 4} durationInFrames={lens[i]}>
          <Audio src={staticFile(`scrapper/vo/${sc.key}.wav`)} />
        </Sequence>
      ))}
      {p.musicSrc && <Audio src={staticFile(p.musicSrc)} startFrom={Math.round((p.musicStart ?? 0) * fps)} volume={musicVol} />}
    </AbsoluteFill>
  );
};
