// Buildify Instagram series (1080x1920), one feature per part. Each line of voiceover gets its
// footage from the narrated rough cut; the window shows the whole screen for context, then
// glides to a 1:1 crop around the action (fx) so the UI is readable on a phone.
import React from "react";
import { AbsoluteFill, Audio, Easing, OffthreadVideo, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { INTER, useFonts } from "../screendemo/fonts";
import { Logo, Wallpaper } from "./BuildifyWalkthrough";

type Sub = { at: number; dur: number; a: number; rate: number };
type Line = { key: string; t: number; dur: number; text: string; fx: number | null; subs: Sub[] };
export type ReelProps = { src: string; part: number; parts: number; title: [string, string]; duration: number; lines: Line[] };

const B = { blue: "#3B7EFF", blue2: "#5B9AFF", blue3: "#8BB8FF", sub: "#9AA3B2" };
const SW = 1920, SH = 1080;
const WIN = { x: 40, y: 400, w: 1000, h: 1050, bar: 30 };
const ease = Easing.bezier(0.45, 0, 0.15, 1);
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

// camera states: full screen (fit width) or a 1:1 crop starting at source x = fx
const cam = (fx: number | null) => (fx == null ? { s: WIN.w / SW, tx: 0, ty: (WIN.h - SH * (WIN.w / SW)) / 2 } : { s: 1, tx: -Math.min(Math.max(fx, 0), SW - WIN.w), ty: (WIN.h - SH) / 2 });

export const BuildifyReel: React.FC<ReelProps> = (p) => {
  useFonts();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const T = frame / fps;
  const pop = (t: number, cfg = { damping: 13, stiffness: 160 }) => spring({ fps, frame: frame - Math.round(t * fps), config: cfg, durationInFrames: 20 });

  const li = Math.max(0, p.lines.filter((l) => T >= l.t).length - 1);
  const line = p.lines[li];
  const sub = line.subs.filter((x) => T >= x.at).pop() ?? line.subs[0];
  const prev = cam(li > 0 ? p.lines[li - 1].fx : null), next = cam(line.fx);
  const k = ease(clamp01((T - line.t - 0.15) / 0.8));
  const c = { s: prev.s + (next.s - prev.s) * k, tx: prev.tx + (next.tx - prev.tx) * k, ty: prev.ty + (next.ty - prev.ty) * k };
  const punch = 1 + 0.02 * (1 - ease(clamp01((T - line.t) / 0.3)));
  const last = li === p.lines.length - 1;
  const titleK = pop(0.1);

  return (
    <AbsoluteFill style={{ fontFamily: INTER, color: "#E9ECF2" }}>
      <Wallpaper sec={T} />

      {/* header */}
      <div style={{ position: "absolute", top: 96, left: 60, right: 60, display: "flex", alignItems: "center", justifyContent: "space-between", opacity: pop(0) }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}><Logo size={68} /><span style={{ fontSize: 40, fontWeight: 800 }}>Buildify</span></div>
        <div style={{ background: B.blue, color: "#fff", fontWeight: 800, fontSize: 30, padding: "10px 22px", borderRadius: 30, letterSpacing: 1 }}>PART {p.part}/{p.parts}</div>
      </div>
      <div style={{ position: "absolute", top: 200, left: 50, right: 50, textAlign: "center", opacity: titleK, transform: `translateY(${(1 - titleK) * 30}px)` }}>
        <div style={{ fontSize: 76, fontWeight: 800, lineHeight: 1.02, letterSpacing: -2 }}>{p.title[0]}</div>
        <div style={{ fontSize: 76, fontWeight: 800, lineHeight: 1.08, letterSpacing: -2, color: B.blue3 }}>{p.title[1]}</div>
      </div>

      {/* window */}
      <div style={{ position: "absolute", left: WIN.x, top: WIN.y, width: WIN.w, height: WIN.h + WIN.bar, borderRadius: 26, overflow: "hidden", background: "#121113", boxShadow: "0 40px 100px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.14)", transform: `scale(${0.94 + 0.06 * pop(0.25)})`, opacity: pop(0.25) }}>
        <div style={{ height: WIN.bar, background: "#1A1A1F", display: "flex", alignItems: "center", padding: "0 18px", gap: 8 }}>
          {["#FF5F57", "#FEBC2E", "#28C840"].map((cc) => <div key={cc} style={{ width: 11, height: 11, borderRadius: 6, background: cc }} />)}
          <div style={{ margin: "0 auto", transform: "translateX(-25px)", color: B.sub, fontSize: 16 }}>🔒 buildify.sh</div>
        </div>
        <div style={{ position: "relative", width: WIN.w, height: WIN.h, overflow: "hidden", background: "#0D0C10" }}>
          <div style={{ position: "absolute", left: 0, top: 0, width: SW, height: SH, transformOrigin: "0 0", transform: `translate(${c.tx}px, ${c.ty}px) scale(${c.s * punch})` }}>
            <Sequence key={`${line.key}-${sub.at}`} from={Math.round(sub.at * fps)} durationInFrames={Math.round((sub.dur + 0.5) * fps)} layout="none">
              <OffthreadVideo src={staticFile(p.src)} trimBefore={Math.round(sub.a * fps)} playbackRate={sub.rate} muted style={{ width: SW, height: SH }} />
            </Sequence>
          </div>
        </div>
      </div>

      {/* subtitle */}
      <div style={{ position: "absolute", top: WIN.y + WIN.h + WIN.bar + 40, left: 60, right: 60, textAlign: "center", opacity: clamp01((T - line.t) / 0.2) * clamp01((line.t + line.dur - T) / 0.15) }}>
        <span style={{ fontSize: 48, fontWeight: 700, lineHeight: 1.25, color: "#fff", textShadow: "0 3px 14px rgba(0,0,0,0.7)" }}>{line.text}</span>
      </div>

      {/* end card sticker */}
      {last && (() => {
        const kk = pop(line.t + 0.2, { damping: 10, stiffness: 170 });
        const isLast = p.part === p.parts;
        return (
          <div style={{ position: "absolute", top: WIN.y + WIN.h / 2 - 130, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
            <div style={{ background: B.blue, color: "#fff", borderRadius: 40, padding: "34px 52px", textAlign: "center", boxShadow: `0 30px 80px ${B.blue}88`, transform: `scale(${kk}) rotate(-2deg)` }}>
              <div style={{ fontSize: 34, fontWeight: 700, letterSpacing: 4, opacity: 0.9 }}>{isLast ? "TRY IT FREE" : "UP NEXT"}</div>
              <div style={{ fontSize: 64, fontWeight: 800, marginTop: 6 }}>{isLast ? "buildify.sh" : `Part ${p.part + 1} →`}</div>
              <div style={{ fontSize: 30, fontWeight: 600, marginTop: 6, opacity: 0.92 }}>{isLast ? "100 free credits on signup" : "Follow so you don't miss it"}</div>
            </div>
          </div>
        );
      })()}

      {p.lines.map((l) => (
        <Sequence key={l.key} from={Math.round((l.t + 0.15) * fps)}><Audio src={staticFile(`buildify/reels/${l.key}.wav`)} /></Sequence>
      ))}
    </AbsoluteFill>
  );
};
