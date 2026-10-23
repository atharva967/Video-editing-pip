// Buildify onboarding walkthrough: the narrated screen recording, played 1:1, inside a browser
// window on a Buildify wallpaper, with an automatic camera (buildify/autocam.py), chapter labels,
// a chapter progress bar, subtitles from the SRT, and a branded intro and outro.
import React from "react";
import { AbsoluteFill, Audio, Easing, Img, OffthreadVideo, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { INTER, useFonts } from "../screendemo/fonts";

type Span = [number, number];
export type WalkthroughProps = {
  src: string;
  duration: number;
  intro: Span;
  outro: Span;
  W: number;
  H: number;
  cam: [number, number, number, number][]; // [t, x, y, w] in source px, 16:9
  chapters: { t: number; until: number; n: number; title: string }[];
  subs: { t: number; until: number; text: string }[];
};

const B = { bg: "#0D0C10", blue: "#3B7EFF", blue2: "#5B9AFF", blue3: "#8BB8FF", text: "#E9ECF2", sub: "#9AA3B2" };
const WIN = { w: 1440, h: 810, bar: 36, top: 44 };
const ease = Easing.bezier(0.45, 0, 0.15, 1);
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

const Wallpaper: React.FC<{ sec: number }> = ({ sec }) => {
  const d = (k: number, a: number) => Math.sin(sec * 0.2 + k) * a;
  return (
    <AbsoluteFill style={{ background: B.bg, overflow: "hidden" }}>
      <div style={{ position: "absolute", left: -380 + d(0, 60), top: -520 + d(1, 40), width: 1400, height: 1200, borderRadius: "50%", background: `radial-gradient(circle, ${B.blue}AA 0%, ${B.blue}00 62%)` }} />
      <div style={{ position: "absolute", right: -420 + d(2, 70), bottom: -600 + d(3, 50), width: 1500, height: 1300, borderRadius: "50%", background: "radial-gradient(circle, #6D4BFF88 0%, #6D4BFF00 60%)" }} />
      <AbsoluteFill style={{ backgroundImage: "radial-gradient(rgba(255,255,255,0.07) 1.2px, transparent 1.2px)", backgroundSize: "28px 28px" }} />
    </AbsoluteFill>
  );
};

const Logo: React.FC<{ size: number }> = ({ size }) => (
  <div style={{ width: size, height: size, borderRadius: size * 0.24, background: "#121113", border: `1.5px solid ${B.blue}66`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 18px 50px ${B.blue}40` }}>
    <Img src={staticFile("buildify/logo.svg")} style={{ width: size * 0.6 }} />
  </div>
);

export const BuildifyWalkthrough: React.FC<WalkthroughProps> = (p) => {
  useFonts();
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  const T = frame / fps;
  const pop = (t: number, cfg = { damping: 14, stiffness: 150 }) => spring({ fps, frame: frame - Math.round(t * fps), config: cfg, durationInFrames: 22 });

  // camera: ease from the previous key to the next
  let r: [number, number, number] = [p.cam[0][1], p.cam[0][2], p.cam[0][3]];
  for (const [t, x, y, w] of p.cam) {
    if (T < t) break;
    const k = ease(clamp01((T - t) / 0.9));
    r = [r[0] + (x - r[0]) * k, r[1] + (y - r[1]) * k, r[2] + (w - r[2]) * k];
  }
  const s = WIN.w / r[2];

  const winIn = spring({ fps, frame: frame - Math.round((p.intro[1] - 0.3) * fps), config: { damping: 16, stiffness: 90 }, durationInFrames: 28 });
  const winOut = interpolate(T, [p.outro[0] - 0.1, p.outro[0] + 0.5], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });
  const showWin = T > p.intro[1] - 0.4 && T < p.outro[0] + 0.6;
  const chap = p.chapters.find((c) => T >= c.t && T < c.until);
  const sub = p.subs.find((c) => T >= c.t && T < c.until);
  const left = (width - WIN.w) / 2;

  return (
    <AbsoluteFill style={{ fontFamily: INTER, color: B.text }}>
      <Wallpaper sec={T} />

      {showWin && (
        <div style={{ position: "absolute", left, top: WIN.top, width: WIN.w, height: WIN.h + WIN.bar, borderRadius: 16, overflow: "hidden", background: "#121113", boxShadow: "0 40px 100px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.12)", transform: `translateY(${(1 - winIn) * 120 + winOut * 40}px) scale(${0.92 + 0.08 * winIn - winOut * 0.05})`, opacity: Math.min(1, winIn * 1.5) * (1 - winOut) }}>
          <div style={{ height: WIN.bar, background: "#1A1A1F", display: "flex", alignItems: "center", padding: "0 16px", gap: 8, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => <div key={c} style={{ width: 12, height: 12, borderRadius: 6, background: c }} />)}
            <div style={{ margin: "0 auto", transform: "translateX(-30px)", background: "#0F0F12", color: B.sub, fontSize: 15, padding: "5px 110px", borderRadius: 8 }}>🔒 buildify.sh</div>
          </div>
          <div style={{ position: "relative", width: WIN.w, height: WIN.h, overflow: "hidden" }}>
            <div style={{ position: "absolute", left: 0, top: 0, width: p.W, height: p.H, transformOrigin: "0 0", transform: `translate(${-r[0] * s}px, ${-r[1] * s}px) scale(${s})` }}>
              <OffthreadVideo src={staticFile(p.src)} muted style={{ width: p.W, height: p.H }} />
            </div>
            {/* chapter label */}
            {chap && (() => {
              const k = pop(chap.t + 0.1);
              return (
                <div style={{ position: "absolute", left: 22, bottom: 22, display: "flex", alignItems: "center", gap: 12, background: "rgba(10,10,14,0.86)", border: `1px solid ${B.blue}55`, borderRadius: 14, padding: "9px 18px 9px 9px", boxShadow: "0 10px 30px rgba(0,0,0,0.45)", opacity: k * clamp01((chap.until - T) / 0.25), transform: `translateY(${(1 - k) * 20}px)` }}>
                  <span style={{ minWidth: 38, height: 38, borderRadius: 10, background: B.blue, color: "#fff", fontWeight: 800, fontSize: 19, display: "flex", alignItems: "center", justifyContent: "center" }}>{String(chap.n).padStart(2, "0")}</span>
                  <span style={{ fontWeight: 700, fontSize: 23 }}>{chap.title}</span>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* chapter progress */}
      {showWin && (
        <div style={{ position: "absolute", left, width: WIN.w, top: WIN.top + WIN.h + WIN.bar + 16, display: "flex", gap: 6, opacity: Math.min(1, winIn) * (1 - winOut) }}>
          {p.chapters.map((c) => {
            const f = clamp01((T - c.t) / (c.until - c.t));
            return <div key={c.n} style={{ flex: c.until - c.t, height: 5, borderRadius: 3, background: "rgba(255,255,255,0.12)", overflow: "hidden" }}><div style={{ width: `${f * 100}%`, height: "100%", background: B.blue2 }} /></div>;
          })}
        </div>
      )}

      {/* subtitles */}
      {sub && showWin && (
        <div style={{ position: "absolute", left: 0, right: 0, top: WIN.top + WIN.h + WIN.bar + 40, display: "flex", justifyContent: "center", opacity: clamp01((T - sub.t) / 0.12) * clamp01((sub.until - T) / 0.12) * (1 - winOut) }}>
          <div style={{ maxWidth: 1500, textAlign: "center", fontSize: 34, fontWeight: 600, lineHeight: 1.3, color: "#fff", textShadow: "0 2px 12px rgba(0,0,0,0.6)" }}>{sub.text}</div>
        </div>
      )}

      {/* intro */}
      {T < p.intro[1] + 0.3 && (() => {
        const o = clamp01((p.intro[1] + 0.2 - T) / 0.5);
        return (
          <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column", opacity: o }}>
            <div style={{ transform: `scale(${pop(0.1)})` }}><Logo size={150} /></div>
            <div style={{ marginTop: 34, fontSize: 30, fontWeight: 700, letterSpacing: 6, color: B.blue3, opacity: pop(0.4) }}>GETTING STARTED</div>
            <div style={{ marginTop: 10, fontSize: 104, fontWeight: 800, letterSpacing: -3, opacity: pop(0.6), transform: `translateY(${(1 - pop(0.6)) * 30}px)` }}>Buildify, step by step</div>
            <div style={{ marginTop: 14, fontSize: 36, color: B.sub, opacity: pop(1.0) }}>From an idea to a launched product, driven by AI</div>
            <div style={{ display: "flex", gap: 14, marginTop: 46 }}>
              {["Builder", "Studio", "AI Chat", "Accessibility", "Agents"].map((x, i) => { const k = pop(1.6 + i * 0.25); return <div key={x} style={{ padding: "12px 24px", borderRadius: 30, border: `1.5px solid ${B.blue}88`, background: `${B.blue}22`, fontSize: 26, fontWeight: 700, transform: `scale(${k})`, opacity: k }}>{x}</div>; })}
            </div>
          </AbsoluteFill>
        );
      })()}

      {/* outro */}
      {T >= p.outro[0] && (() => {
        const t0 = p.outro[0] + 0.3;
        return (
          <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
            <div style={{ transform: `scale(${pop(t0)})` }}><Logo size={140} /></div>
            <div style={{ marginTop: 34, fontSize: 96, fontWeight: 800, letterSpacing: -3, opacity: pop(t0 + 0.2), transform: `translateY(${(1 - pop(t0 + 0.2)) * 30}px)` }}>Build. Test. Launch.</div>
            <div style={{ fontSize: 40, color: B.sub, marginTop: 8, opacity: pop(t0 + 0.5) }}>All with AI.</div>
            <div style={{ marginTop: 44, display: "flex", alignItems: "center", gap: 16, background: B.blue, color: "#fff", fontSize: 38, fontWeight: 800, padding: "18px 40px", borderRadius: 50, boxShadow: `0 20px 50px ${B.blue}66`, transform: `scale(${pop(t0 + 0.8)})` }}>Start free at buildify.sh →</div>
          </AbsoluteFill>
        );
      })()}

      <Audio src={staticFile(p.src)} />
    </AbsoluteFill>
  );
};
