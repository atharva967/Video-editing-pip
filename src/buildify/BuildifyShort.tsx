// Buildify walkthrough, short cut (~60 s): one voiceover line per step, the matching footage from
// the narrated rough cut jump-cut and sped up to fit, framed at no more than 1:1 (sharp UI), a
// Buildify-blue chapter swipe between steps and a zoom punch on jump cuts.
import React from "react";
import { AbsoluteFill, Audio, Easing, OffthreadVideo, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { INTER, useFonts } from "../screendemo/fonts";
import { Logo, Wallpaper } from "./BuildifyWalkthrough";

type Sub = { at: number; dur: number; a: number; rate: number };
type Seg = { key: string; t: number; dur: number; n: number | null; title: string | null; rect: [number, number, number] | null; subs: Sub[]; text: string };
export type ShortProps = { src: string; duration: number; segs: Seg[] };

const B = { blue: "#3B7EFF", blue2: "#5B9AFF", blue3: "#8BB8FF", sub: "#9AA3B2" };
const SW = 1920, SH = 1080; // source size
const WIN = { w: 1600, h: 900, bar: 34, top: 22 };
const ease = Easing.bezier(0.45, 0, 0.15, 1);
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const SWIPE = 0.62; // seconds the chapter swipe takes

export const BuildifyShort: React.FC<ShortProps> = (p) => {
  useFonts();
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  const T = frame / fps;
  const pop = (t: number, cfg = { damping: 14, stiffness: 150 }) => spring({ fps, frame: frame - Math.round(t * fps), config: cfg, durationInFrames: 22 });

  const segIdx = Math.max(0, p.segs.filter((s) => T >= s.t).length - 1);
  const seg = p.segs[segIdx];
  const intro = p.segs[0], outro = p.segs[p.segs.length - 1];
  const footSegs = p.segs.filter((s) => s.subs.length);
  // the swipe covers the window around each step boundary; the picture switches at its midpoint
  const swipeSeg = footSegs.find((s) => Math.abs(T - s.t) < SWIPE / 2);
  const shown = footSegs.filter((s) => s.t <= T + (swipeSeg && swipeSeg.t > T ? 0 : 0)).pop() ?? footSegs[0];
  const sub = shown.subs.filter((x) => T >= x.at).pop() ?? shown.subs[0];
  const local = Math.max(0, T - sub.at);
  // zoom punch on a jump cut inside a step, slow drift otherwise
  const punch = sub !== shown.subs[0] ? 0.035 * (1 - ease(clamp01(local / 0.3))) : 0;
  const drift = 0.018 * clamp01((T - shown.t) / shown.dur);
  const [rx, ry, rw] = shown.rect!;
  const s = (WIN.w / rw) * (1 + punch + drift);
  const cx = rx + rw / 2, cy = ry + (rw * 9) / 16 / 2;

  const winIn = spring({ fps, frame: frame - Math.round((intro.t + intro.dur - 0.35) * fps), config: { damping: 16, stiffness: 95 }, durationInFrames: 26 });
  const winOut = interpolate(T, [outro.t - 0.1, outro.t + 0.45], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });
  const showWin = T > intro.t + intro.dur - 0.45 && T < outro.t + 0.5;
  const left = (width - WIN.w) / 2;

  return (
    <AbsoluteFill style={{ fontFamily: INTER, color: "#E9ECF2" }}>
      <Wallpaper sec={T} />

      {showWin && (
        <div style={{ position: "absolute", left, top: WIN.top, width: WIN.w, height: WIN.h + WIN.bar, borderRadius: 16, overflow: "hidden", background: "#121113", boxShadow: "0 40px 100px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.12)", transform: `translateY(${(1 - winIn) * 120 + winOut * 40}px) scale(${0.92 + 0.08 * winIn - winOut * 0.05})`, opacity: Math.min(1, winIn * 1.5) * (1 - winOut) }}>
          <div style={{ height: WIN.bar, background: "#1A1A1F", display: "flex", alignItems: "center", padding: "0 16px", gap: 8, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => <div key={c} style={{ width: 12, height: 12, borderRadius: 6, background: c }} />)}
            <div style={{ margin: "0 auto", transform: "translateX(-30px)", background: "#0F0F12", color: B.sub, fontSize: 15, padding: "5px 110px", borderRadius: 8 }}>🔒 buildify.sh</div>
          </div>
          <div style={{ position: "relative", width: WIN.w, height: WIN.h, overflow: "hidden" }}>
            <div style={{ position: "absolute", left: 0, top: 0, width: SW, height: SH, transformOrigin: "0 0", transform: `translate(${WIN.w / 2 - cx * s}px, ${WIN.h / 2 - cy * s}px) scale(${s})` }}>
              {/* one trimmed, speed-ramped video per jump cut (a Freeze frame past the
                  composition's own length gets clamped, so seek with trimBefore instead) */}
              <Sequence key={`${shown.key}-${sub.at}`} from={Math.round(sub.at * fps)} durationInFrames={Math.round((sub.dur + 0.5) * fps)} layout="none">
                <OffthreadVideo src={staticFile(p.src)} trimBefore={Math.round(sub.a * fps)} playbackRate={sub.rate} muted style={{ width: SW, height: SH }} />
              </Sequence>
            </div>

            {/* chapter chip */}
            {shown.title && (() => {
              const k = pop(shown.t + SWIPE / 2);
              return (
                <div style={{ position: "absolute", left: 22, bottom: 22, display: "flex", alignItems: "center", gap: 12, background: "rgba(10,10,14,0.88)", border: `1px solid ${B.blue}66`, borderRadius: 14, padding: "9px 18px 9px 9px", boxShadow: "0 10px 30px rgba(0,0,0,0.45)", opacity: k, transform: `translateY(${(1 - k) * 20}px)` }}>
                  <span style={{ minWidth: 38, height: 38, borderRadius: 10, background: B.blue, color: "#fff", fontWeight: 800, fontSize: 19, display: "flex", alignItems: "center", justifyContent: "center" }}>{String(shown.n).padStart(2, "0")}</span>
                  <span style={{ fontWeight: 700, fontSize: 23 }}>{shown.title}</span>
                </div>
              );
            })()}

            {/* chapter swipe transition */}
            {swipeSeg && swipeSeg.title && (() => {
              const k = clamp01((T - (swipeSeg.t - SWIPE / 2)) / SWIPE); // 0..1
              const x = interpolate(ease(k), [0, 1], [-1.35, 1.35]) * WIN.w;
              return (
                <div style={{ position: "absolute", top: -60, bottom: -60, left: x - 200, width: WIN.w + 400, transform: "skewX(-14deg)", background: `linear-gradient(90deg, ${B.blue}00, ${B.blue} 14%, #2E5FD6 50%, ${B.blue} 86%, ${B.blue}00)`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 0 80px ${B.blue}88` }}>
                  <div style={{ transform: "skewX(14deg)", textAlign: "center", color: "#fff" }}>
                    <div style={{ fontSize: 30, fontWeight: 700, letterSpacing: 6, opacity: 0.85 }}>STEP {String(swipeSeg.n).padStart(2, "0")}</div>
                    <div style={{ fontSize: 84, fontWeight: 800, letterSpacing: -2 }}>{swipeSeg.title}</div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* progress */}
      {showWin && (
        <div style={{ position: "absolute", left, width: WIN.w, top: WIN.top + WIN.h + WIN.bar + 14, display: "flex", gap: 6, opacity: Math.min(1, winIn) * (1 - winOut) }}>
          {footSegs.map((c) => {
            const f = clamp01((T - c.t) / c.dur);
            return <div key={c.key} style={{ flex: c.dur, height: 5, borderRadius: 3, background: "rgba(255,255,255,0.12)", overflow: "hidden" }}><div style={{ width: `${f * 100}%`, height: "100%", background: B.blue2 }} /></div>;
          })}
        </div>
      )}

      {/* subtitle: the voiceover line */}
      {showWin && seg.subs.length > 0 && (
        <div style={{ position: "absolute", left: 0, right: 0, top: WIN.top + WIN.h + WIN.bar + 30, display: "flex", justifyContent: "center", opacity: clamp01((T - seg.t - 0.15) / 0.2) * clamp01((seg.t + seg.dur - T) / 0.15) * (1 - winOut) }}>
          <div style={{ maxWidth: 1600, textAlign: "center", fontSize: 32, fontWeight: 600, lineHeight: 1.25, color: "#fff", textShadow: "0 2px 12px rgba(0,0,0,0.6)" }}>{seg.text.replace(/A I/g, "AI").replace(/P D F/g, "PDF").replace(/buildify dot s h/g, "buildify.sh")}</div>
        </div>
      )}

      {/* intro */}
      {T < intro.t + intro.dur + 0.3 && (() => {
        const o = clamp01((intro.t + intro.dur + 0.2 - T) / 0.45);
        return (
          <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column", opacity: o, transform: `scale(${1 + (1 - o) * 0.06})` }}>
            <div style={{ transform: `scale(${pop(0.05)}) rotate(${(1 - pop(0.05)) * -20}deg)` }}><Logo size={150} /></div>
            <div style={{ marginTop: 30, fontSize: 112, fontWeight: 800, letterSpacing: -3, opacity: pop(0.35), transform: `translateY(${(1 - pop(0.35)) * 30}px)` }}>Meet Buildify</div>
            <div style={{ marginTop: 10, fontSize: 40, color: B.sub, opacity: pop(0.8) }}>Your AI team, from idea to launch</div>
            <div style={{ display: "flex", gap: 14, marginTop: 40 }}>
              {["Builder", "Studio", "AI Chat", "Accessibility", "Agents"].map((x, i) => { const k = pop(1.3 + i * 0.18); return <div key={x} style={{ padding: "12px 24px", borderRadius: 30, border: `1.5px solid ${B.blue}88`, background: `${B.blue}22`, fontSize: 26, fontWeight: 700, transform: `scale(${k})`, opacity: k }}>{x}</div>; })}
            </div>
          </AbsoluteFill>
        );
      })()}

      {/* outro */}
      {T >= outro.t && (() => {
        const t0 = outro.t + 0.25;
        return (
          <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
            <div style={{ transform: `scale(${pop(t0)})` }}><Logo size={140} /></div>
            <div style={{ marginTop: 30, fontSize: 100, fontWeight: 800, letterSpacing: -3, opacity: pop(t0 + 0.2), transform: `translateY(${(1 - pop(t0 + 0.2)) * 30}px)` }}>Build. Test. Launch.</div>
            <div style={{ fontSize: 40, color: B.sub, marginTop: 8, opacity: pop(t0 + 0.6) }}>All with AI.</div>
            <div style={{ marginTop: 44, background: B.blue, color: "#fff", fontSize: 40, fontWeight: 800, padding: "18px 42px", borderRadius: 50, boxShadow: `0 20px 50px ${B.blue}66`, transform: `scale(${pop(t0 + 1.0)})` }}>Start free at buildify.sh →</div>
          </AbsoluteFill>
        );
      })()}

      {/* voiceover, one line per step; whoosh under each chapter swipe */}
      {p.segs.map((sg) => (
        <Sequence key={sg.key} from={Math.round((sg.t + (sg.subs.length ? 0.2 : 0.15)) * fps)}>
          <Audio src={staticFile(`buildify/vo/${sg.key}.wav`)} />
        </Sequence>
      ))}
      {footSegs.filter((x) => x.title).map((sg) => (
        <Sequence key={`w${sg.key}`} from={Math.max(0, Math.round((sg.t - SWIPE / 2) * fps))}>
          <Audio src={staticFile("travel/whoosh.wav")} volume={0.3} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
