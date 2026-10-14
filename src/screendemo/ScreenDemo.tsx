// ScreenDemo: turns a raw screen recording into a polished product walkthrough
// (Screen Studio look): the recording sits in a rounded browser window on a brand
// wallpaper, a virtual camera eases between zoom targets, dead time is sped up,
// clicks get a ripple, key areas get a spotlight outline, step captions explain each
// stage, with a logo intro and outro. Everything is driven by a props JSON:
// timings are in SOURCE seconds and mapped through the speed-ramp segments.
import React from "react";
import { AbsoluteFill, Audio, Easing, Freeze, Img, OffthreadVideo, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";

import { RekrootsApp, rekrootsScript, type RekrootsData } from "./RekrootsApp";
import { GROTESK, INTER, MONO } from "./fonts";


type Rect = [number, number, number]; // x, y, width in source px (height follows the window aspect)
type Seg = { a: number; b: number; speed?: number; hold?: number }; // hold = freeze frame at `a` for N seconds
type At = { at?: number; o?: number }; // source second, or absolute seconds into the demo
type Cam = At & { rect: Rect; dur?: number };
type Click = At & { x: number; y: number };
type Spot = At & { until?: number; len?: number; box: [number, number, number, number]; label?: string };
type Cap = At & { until?: number; len?: number; n?: number; text: string };
// Text patch: repaints a piece of on-screen text (e.g. the company name, to personalise a
// demo for a lead). Times are SOURCE seconds. `box` is filled with `bg`, then `text` is
// drawn at (x, baseline). `track` = [[sourceSec, dy], ...] follows the page when it scrolls.
type Patch = { from: number; until: number; box: [number, number, number, number]; bg: string; text: string; font: "grotesk" | "mono" | "inter"; size: number; weight?: number; color: string; ls?: number; x: number; baseline: number; track?: [number, number][] };

export type ScreenDemoProps = {
  id: string;
  fps: number;
  src: string;
  srcW: number;
  srcH: number;
  win: { w: number; h: number; bar: number; url: string };
  segs: Seg[];
  camera: Cam[];
  clicks: Click[];
  spots: Spot[];
  captions: Cap[];
  patches?: Patch[];
  app?: RekrootsData; // render the native UI replica instead of the recording (segs = one {a:0,b:length})
  intro: { sec: number; title: string; sub: string; tag?: string };
  outro: { sec: number; title: string; sub: string; url: string };
  brand: { name: string; logoSrc: string; accent: string; ink: string; paper: string };
  musicSrc: string | null;
  musicVolume: number;
  musicStart?: number;
};

// ---- timeline helpers (shared with calculateMetadata) ----
export const segLayout = (segs: Seg[], fps: number) => {
  let f = 0;
  return segs.map((s) => {
    const durF = Math.max(1, Math.round((s.hold ?? (s.b - s.a) / (s.speed ?? 1)) * fps));
    const out = { ...s, fromF: f, durF };
    f += durF;
    return out;
  });
};
// native app mode: timeline, camera, clicks, spotlights and captions come from the app's own script
export const withScript = (p: ScreenDemoProps): ScreenDemoProps => {
  if (!p.app) return p;
  const sc = rekrootsScript(p.app);
  return { ...p, segs: [{ a: 0, b: sc.dur }], camera: sc.camera, clicks: sc.clicks, spots: sc.spots, captions: sc.captions };
};
export const demoFrames = (p0: ScreenDemoProps) => { const p = withScript(p0); return segLayout(p.segs, p.fps).reduce((n, s) => n + s.durF, 0); };
export const totalFrames = (p: ScreenDemoProps) => Math.round(p.intro.sec * p.fps) + demoFrames(p) + Math.round(p.outro.sec * p.fps);

const ease = Easing.bezier(0.45, 0, 0.15, 1);
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

const Wallpaper: React.FC<{ accent: string; ink: string; sec: number }> = ({ accent, ink, sec }) => {
  const d = (k: number, a: number) => Math.sin(sec * 0.25 + k) * a;
  return (
    <AbsoluteFill style={{ background: ink, overflow: "hidden" }}>
      <div style={{ position: "absolute", left: -300 + d(0, 60), top: -420 + d(1, 40), width: 1500, height: 1300, borderRadius: "50%", background: `radial-gradient(circle, ${accent} 0%, ${accent}00 65%)`, opacity: 0.95 }} />
      <div style={{ position: "absolute", right: -420 + d(2, 70), bottom: -520 + d(3, 50), width: 1500, height: 1400, borderRadius: "50%", background: "radial-gradient(circle, #FF7A45 0%, #FF7A4500 62%)", opacity: 0.8 }} />
      <div style={{ position: "absolute", left: 620 + d(4, 80), top: 300 + d(5, 60), width: 1100, height: 900, borderRadius: "50%", background: "radial-gradient(circle, #7A1022 0%, #7A102200 60%)", opacity: 0.9 }} />
      <AbsoluteFill style={{ background: "radial-gradient(120% 100% at 50% 40%, transparent 50%, rgba(0,0,0,0.42) 100%)" }} />
    </AbsoluteFill>
  );
};

const Mark: React.FC<{ brand: ScreenDemoProps["brand"]; size: number }> = ({ brand, size }) => (
  <Img src={staticFile(brand.logoSrc)} style={{ width: size, height: size, borderRadius: size * 0.2, boxShadow: "0 18px 50px rgba(0,0,0,0.45)" }} />
);

export const ScreenDemo: React.FC<ScreenDemoProps> = (raw) => {
  const p = withScript(raw);
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const layout = segLayout(p.segs, fps);
  const introF = Math.round(p.intro.sec * fps);
  const demoF = layout.reduce((n, s) => n + s.durF, 0);
  const outroAt = introF + demoF;
  const total = outroAt + Math.round(p.outro.sec * fps);
  const T = (frame - introF) / fps; // seconds into the demo (negative during the intro)
  const demoSec = demoF / fps;

  // source second -> seconds into the demo
  const srcToOut = (t: number) => {
    let last = 0;
    for (const s of layout) {
      if (s.hold == null && t >= s.a && t <= s.b) return (s.fromF + ((t - s.a) / (s.speed ?? 1)) * fps) / fps;
      if (s.hold == null && t > s.b) last = (s.fromF + s.durF) / fps;
    }
    return last;
  };
  // seconds into the demo -> source second currently on screen
  const srcNow = (() => {
    const f = Math.max(0, frame - introF);
    const sg = layout.find((x) => f >= x.fromF && f < x.fromF + x.durF) ?? layout[layout.length - 1];
    return sg.hold != null ? sg.a : sg.a + (Math.floor(f - sg.fromF) / fps) * (sg.speed ?? 1);
  })();
  const when = (e: At) => (e.o != null ? e.o : srcToOut(e.at ?? 0));
  const span = (e: At & { until?: number; len?: number }) => {
    const a = when(e);
    return [a, e.len != null ? a + e.len : e.until != null ? srcToOut(e.until) : a + 2] as const;
  };

  // ---- camera: ease from the previous target to the next ----
  const aspect = p.win.w / p.win.h;
  const cams = p.camera.map((c) => ({ ...c, t: when(c), dur: c.dur ?? 0.8 })).sort((a, b) => a.t - b.t);
  let rect: Rect = cams[0].rect;
  for (const c of cams) {
    if (T < c.t) break;
    const k = ease(clamp01((T - c.t) / c.dur));
    rect = [rect[0] + (c.rect[0] - rect[0]) * k, rect[1] + (c.rect[1] - rect[1]) * k, rect[2] + (c.rect[2] - rect[2]) * k];
  }
  const s = p.win.w / rect[2];
  const camStyle: React.CSSProperties = { position: "absolute", left: 0, top: 0, width: p.srcW, height: p.srcH, transformOrigin: "0 0", transform: `translate(${-rect[0] * s}px, ${-rect[1] * s}px) scale(${s})` };

  // ---- window entrance / exit ----
  const enter = spring({ fps, frame: frame - introF + 8, config: { damping: 16, stiffness: 90 }, durationInFrames: 28 });
  const exit = interpolate(frame, [outroAt - 4, outroAt + 14], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });
  const winTop = (height - (p.win.h + p.win.bar)) / 2 - 34;
  const winStyle: React.CSSProperties = {
    position: "absolute", left: (width - p.win.w) / 2, top: winTop, width: p.win.w, height: p.win.h + p.win.bar, borderRadius: 22, overflow: "hidden",
    boxShadow: "0 50px 120px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.14)", background: p.brand.paper,
    transform: `translateY(${(1 - enter) * 140 + exit * 60}px) scale(${0.9 + enter * 0.1 - exit * 0.08})`, opacity: Math.min(1, enter * 1.4) * (1 - exit),
  };

  const cap = p.captions.find((c) => { const [a, b] = span(c); return T >= a && T < b; });
  const capIn = cap ? clamp01((T - span(cap)[0]) / 0.3) : 0;
  const capOut = cap ? clamp01((span(cap)[1] - T) / 0.2) : 0;

  const introK = interpolate(frame, [introF - 10, introF + 4], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const outroK = interpolate(frame, [outroAt + 6, outroAt + 22], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });
  const pop = (delayF: number, at = 0) => spring({ fps, frame: frame - at - delayF, config: { damping: 13, stiffness: 130 }, durationInFrames: 20 });
  const musicVol = (f: number) => p.musicVolume * Math.min(1, f / (0.8 * fps)) * Math.min(1, Math.max(0, (total - f) / (1.2 * fps)));

  return (
    <AbsoluteFill style={{ fontFamily: INTER }}>
      <Wallpaper accent={p.brand.accent} ink={p.brand.ink} sec={frame / fps} />

      {/* browser window */}
      <div style={winStyle}>
        <div style={{ height: p.win.bar, background: "#F3EEE6", borderBottom: "1px solid rgba(0,0,0,0.08)", display: "flex", alignItems: "center", padding: "0 20px", gap: 9 }}>
          {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => <span key={c} style={{ width: 14, height: 14, borderRadius: 7, background: c }} />)}
          <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
            <div style={{ background: "#fff", border: "1px solid rgba(0,0,0,0.08)", borderRadius: 10, padding: "6px 60px", fontSize: 17, fontWeight: 600, color: "#5B544C", display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 13 }}>🔒</span>{p.win.url}
            </div>
          </div>
          <span style={{ width: 60 }} />
        </div>
        <div style={{ position: "relative", width: p.win.w, height: p.win.h, overflow: "hidden", background: p.brand.paper }}>
          <div style={camStyle}>
            {p.app && <RekrootsApp t={Math.min(Math.max(T, 0), demoSec)} data={p.app} w={p.srcW} h={p.srcH} />}
            {!p.app && layout.map((sg, i) => (
              <Sequence key={i} from={introF + sg.fromF} durationInFrames={sg.durF + (i === layout.length - 1 ? total : 0)} layout="none">
                {sg.hold != null ? (
                  <Freeze frame={0}>
                    <OffthreadVideo src={staticFile(p.src)} trimBefore={Math.round(sg.a * fps)} muted style={{ position: "absolute", left: 0, top: 0, width: p.srcW, height: p.srcH }} />
                  </Freeze>
                ) : (
                  <OffthreadVideo src={staticFile(p.src)} trimBefore={Math.round(sg.a * fps)} playbackRate={sg.speed ?? 1} muted style={{ position: "absolute", left: 0, top: 0, width: p.srcW, height: p.srcH }} />
                )}
              </Sequence>
            ))}
            {/* text patches (personalisation), in source coordinates under the spotlights */}
            {(p.patches ?? []).map((pt, i) => {
              if (srcNow < pt.from || srcNow >= pt.until) return null;
              let dy = 0;
              if (pt.track?.length) dy = interpolate(srcNow, pt.track.map((k) => k[0]), pt.track.map((k) => k[1]), { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
              const fam = pt.font === "grotesk" ? GROTESK : pt.font === "mono" ? MONO : INTER;
              return (
                <React.Fragment key={`p${i}`}>
                  <div style={{ position: "absolute", left: pt.box[0], top: pt.box[1] + dy, width: pt.box[2], height: pt.box[3], background: pt.bg }} />
                  <div style={{ position: "absolute", left: pt.x, top: pt.baseline + dy - pt.size * 2, height: pt.size * 2, display: "flex", alignItems: "flex-end", fontFamily: fam, fontWeight: pt.weight ?? 500, fontSize: pt.size, lineHeight: 1, letterSpacing: pt.ls ?? 0, color: pt.color, whiteSpace: "nowrap", filter: "blur(0.18px)" }}>
                    <span style={{ display: "inline-block", transform: "translateY(0.21em)" }}>{pt.text}</span>
                  </div>
                </React.Fragment>
              );
            })}
            {/* spotlights: outline + soft dim around a region (source coordinates) */}
            {p.spots.map((sp, i) => {
              const [a, b] = span(sp);
              if (T < a || T > b) return null;
              const k = clamp01((T - a) / 0.55) * clamp01((b - T) / 0.45); // linear: a full-screen dim must not snap
              const [x, y, w, h] = sp.box;
              return (
                <div key={i} style={{ position: "absolute", left: x, top: y, width: w, height: h, borderRadius: 10, boxShadow: `0 0 0 ${2.5}px ${p.brand.accent}, 0 0 0 2000px rgba(20,12,8,${0.34 * k})`, opacity: k, transform: `scale(${1.04 - 0.04 * k})` }}>
                  {sp.label && <div style={{ position: "absolute", left: 0, top: -30, background: p.brand.accent, color: "#fff", fontWeight: 700, fontSize: 13, padding: "4px 10px", borderRadius: 7, whiteSpace: "nowrap" }}>{sp.label}</div>}
                </div>
              );
            })}
            {/* click ripples */}
            {p.clicks.map((c, i) => {
              const dt = T - when(c);
              if (dt < 0 || dt > 0.5) return null;
              const k = dt / 0.5;
              return (
                <React.Fragment key={i}>
                  <div style={{ position: "absolute", left: c.x - 34, top: c.y - 34, width: 68, height: 68, borderRadius: 34, border: `3px solid ${p.brand.accent}`, transform: `scale(${0.3 + k * 1.1})`, opacity: 1 - k }} />
                  <div style={{ position: "absolute", left: c.x - 13, top: c.y - 13, width: 26, height: 26, borderRadius: 13, background: p.brand.accent, opacity: 0.55 * (1 - k), transform: `scale(${1 - k * 0.4})` }} />
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>

      {/* step caption */}
      {cap && T >= 0 && T < demoSec && (
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 44, display: "flex", justifyContent: "center", opacity: capIn * capOut, transform: `translateY(${(1 - capIn) * 16}px)` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, background: "rgba(16,10,8,0.82)", border: "1px solid rgba(255,255,255,0.16)", borderRadius: 18, padding: "13px 26px 13px 14px", boxShadow: "0 16px 40px rgba(0,0,0,0.4)" }}>
            {cap.n != null && <span style={{ width: 40, height: 40, borderRadius: 12, background: p.brand.accent, color: "#fff", fontWeight: 800, fontSize: 22, display: "flex", alignItems: "center", justifyContent: "center" }}>{cap.n}</span>}
            <span style={{ color: "#fff", fontWeight: 600, fontSize: 30, letterSpacing: "-0.01em" }}>{cap.text}</span>
          </div>
        </div>
      )}

      {/* intro */}
      {frame < introF + 6 && (
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column", opacity: introK }}>
          <div style={{ transform: `scale(${pop(2)})` }}><Mark brand={p.brand} size={150} /></div>
          {p.intro.tag && <div style={{ marginTop: 30, background: "rgba(255,255,255,0.14)", border: "1px solid rgba(255,255,255,0.3)", color: "#fff", fontWeight: 700, fontSize: 30, padding: "9px 26px", borderRadius: 40, opacity: pop(5) }}>{p.intro.tag}</div>}
          <div style={{ color: "#fff", fontWeight: 800, fontSize: 92, letterSpacing: "-0.035em", marginTop: 38, opacity: pop(8), transform: `translateY(${(1 - pop(8)) * 30}px)` }}>{p.intro.title}</div>
          <div style={{ color: "rgba(255,255,255,0.78)", fontWeight: 500, fontSize: 38, marginTop: 12, opacity: pop(14) }}>{p.intro.sub}</div>
        </AbsoluteFill>
      )}

      {/* outro */}
      {frame >= outroAt && (
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column", opacity: outroK }}>
          <div style={{ display: "flex", alignItems: "center", gap: 26, transform: `scale(${0.85 + 0.15 * pop(8, outroAt)})` }}>
            <Mark brand={p.brand} size={120} />
            <span style={{ color: "#fff", fontWeight: 800, fontSize: 96, letterSpacing: "-0.04em" }}>{p.brand.name}</span>
          </div>
          <div style={{ color: "#fff", fontWeight: 700, fontSize: 56, letterSpacing: "-0.02em", marginTop: 44, opacity: pop(14, outroAt) }}>{p.outro.title}</div>
          <div style={{ color: "rgba(255,255,255,0.78)", fontWeight: 500, fontSize: 34, marginTop: 14, opacity: pop(18, outroAt) }}>{p.outro.sub}</div>
          <div style={{ marginTop: 46, background: "#fff", color: p.brand.ink, fontWeight: 800, fontSize: 36, padding: "16px 44px", borderRadius: 60, opacity: pop(22, outroAt), transform: `scale(${0.8 + 0.2 * pop(22, outroAt)})` }}>{p.outro.url}</div>
        </AbsoluteFill>
      )}

      {p.musicSrc && <Audio src={staticFile(p.musicSrc)} volume={musicVol} trimBefore={Math.round((p.musicStart ?? 0) * fps)} />}
      {p.clicks.map((c, i) => (
        <Sequence key={`s${i}`} from={Math.max(0, introF + Math.round(when(c) * fps))} durationInFrames={Math.round(0.4 * fps)}>
          <Audio src={staticFile("sfx/pop.wav")} volume={0.28} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
