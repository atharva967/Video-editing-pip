// Square looping GIF for Instagram comment outreach: a burst of the DMs this kind of business
// gets every day, a punchline about the pain, then "Check your DMs" pointing to our message.
import React from "react";
import { AbsoluteFill, spring, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { INTER, MONTSERRAT, useFonts } from "../screendemo/fonts";

export type DmGifProps = {
  bg: [string, string]; // gradient
  accent: string; // punchline highlight + pill
  ink: string; // text on the pill
  emoji: string;
  bubbles: string[];
  line1: string; // punchline, first line
  line2: string; // punchline, highlighted second line
  cta: string;
};

// SLOW stretches the timeline (holds, delays) so the text is readable; pops keep their speed
const SLOW = 1.35;
export const DM_GIF_FRAMES = Math.round(120 * SLOW); // 5.4 s at 30 fps

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

export const DmGif: React.FC<DmGifProps> = (p) => {
  useFonts();
  const raw = useCurrentFrame();
  const f = raw / SLOW; // timeline position on the original 120-frame plan
  const { fps } = useVideoConfig();
  const pop = (at: number, cfg = { damping: 12, stiffness: 200 }) => spring({ fps, frame: raw - at * SLOW, config: cfg, durationInFrames: 14 });

  // phase 1: DMs flood in (0-52), phase 2: punchline (50-88), phase 3: CTA (86-120)
  const flood = 1 - clamp01((f - 48) / 8);
  const unread = Math.min(99, Math.round(interpolate(f, [0, 48], [3, 99], { extrapolateRight: "clamp" })));
  const shake = f > 40 && f < 50 ? Math.sin(f * 2.4) * 5 : 0;
  const pl = pop(52), pl2 = pop(60);
  const plOut = 1 - clamp01((f - 86) / 6);
  const cta = pop(88, { damping: 10, stiffness: 180 });
  const pulse = f > 96 ? 1 + 0.05 * Math.sin((f - 96) * 0.45) : 1;
  const fadeLoop = clamp01((120 - f) / 4); // soft loop back to the start

  const pos = [[40, 70], [210, 135], [30, 205], [190, 270], [60, 340], [205, 400]];

  return (
    <AbsoluteFill style={{ background: `linear-gradient(150deg, ${p.bg[0]}, ${p.bg[1]})`, fontFamily: INTER, overflow: "hidden", opacity: f < 3 ? 0.6 + f * 0.13 : fadeLoop }}>
      {/* soft shapes */}
      <div style={{ position: "absolute", width: 360, height: 360, borderRadius: "50%", right: -120, top: -120, background: "rgba(255,255,255,0.10)" }} />
      <div style={{ position: "absolute", width: 260, height: 260, borderRadius: "50%", left: -90, bottom: -90, background: "rgba(255,255,255,0.08)" }} />

      {/* phase 1: inbox flood */}
      {flood > 0 && (
        <AbsoluteFill style={{ opacity: flood, transform: `translateX(${shake}px)` }}>
          <div style={{ position: "absolute", top: 18, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, background: "#fff", borderRadius: 30, padding: "8px 18px 8px 10px", boxShadow: "0 8px 20px rgba(0,0,0,0.2)", transform: `scale(${pop(0)})` }}>
              <div style={{ width: 34, height: 34, borderRadius: 17, background: "linear-gradient(45deg,#F58529,#DD2A7B,#8134AF)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>📩</div>
              <span style={{ fontWeight: 800, fontSize: 22, color: "#111" }}>Messages</span>
              <span style={{ background: "#FF3040", color: "#fff", fontWeight: 800, fontSize: 18, padding: "2px 10px", borderRadius: 14, minWidth: 44, textAlign: "center" }}>{unread === 99 ? "99+" : unread}</span>
            </div>
          </div>
          {p.bubbles.map((b, i) => {
            const at = 4 + i * 7;
            const k = pop(at);
            const [x, y] = pos[i % pos.length];
            return f >= at && (
              <div key={i} style={{ position: "absolute", left: x, top: y + 20, transform: `scale(${k}) rotate(${i % 2 ? 2 : -2}deg)`, transformOrigin: i % 2 ? "100% 100%" : "0 100%" }}>
                <div style={{ background: "#fff", color: "#111", fontWeight: 700, fontSize: 30, padding: "12px 20px", borderRadius: 24, borderBottomLeftRadius: i % 2 ? 24 : 6, borderBottomRightRadius: i % 2 ? 6 : 24, boxShadow: "0 10px 24px rgba(0,0,0,0.22)", whiteSpace: "nowrap" }}>{b}</div>
              </div>
            );
          })}
        </AbsoluteFill>
      )}

      {/* phase 2: punchline */}
      {f >= 50 && plOut > 0 && (
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column", padding: 30, opacity: plOut, textAlign: "center" }}>
          <div style={{ fontSize: 70, transform: `scale(${pl}) rotate(${(1 - pl) * -30}deg)` }}>{p.emoji}</div>
          <div style={{ fontFamily: MONTSERRAT, fontWeight: 900, fontSize: 42, lineHeight: 1.08, color: "#fff", marginTop: 8, transform: `translateY(${(1 - pl) * 30}px)`, opacity: pl, textShadow: "0 4px 14px rgba(0,0,0,0.25)" }}>{p.line1}</div>
          <div style={{ fontFamily: MONTSERRAT, fontWeight: 900, fontSize: 40, lineHeight: 1.08, whiteSpace: "nowrap", color: p.ink, background: p.accent, padding: "8px 18px", borderRadius: 14, marginTop: 12, transform: `scale(${pl2}) rotate(-2deg)`, boxShadow: "0 8px 20px rgba(0,0,0,0.25)" }}>{p.line2}</div>
        </AbsoluteFill>
      )}

      {/* phase 3: CTA */}
      {f >= 88 && (
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
          <div style={{ fontSize: 76, transform: `scale(${cta}) translateY(${Math.sin(f * 0.5) * 5}px)` }}>📩</div>
          <div style={{ fontFamily: MONTSERRAT, fontWeight: 800, fontSize: 30, color: "rgba(255,255,255,0.92)", marginTop: 6, opacity: cta, transform: `translateY(${(1 - cta) * 20}px)` }}>We sent you an idea</div>
          <div style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 12, background: p.accent, color: p.ink, fontFamily: MONTSERRAT, fontWeight: 900, fontSize: 46, whiteSpace: "nowrap", padding: "16px 32px", borderRadius: 60, boxShadow: "0 14px 30px rgba(0,0,0,0.3)", transform: `scale(${cta * pulse})` }}>{p.cta}</div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
