// Static 1080x1080 version of the outreach GIF for comment sections that take images only:
// the DM flood, the punchline and the "Check your DMs" call to action in one frame.
import React from "react";
import { AbsoluteFill } from "remotion";
import { INTER, MONTSERRAT, useFonts } from "../screendemo/fonts";
import type { DmGifProps } from "./DmGif";

export const DmImage: React.FC<DmGifProps> = (p) => {
  useFonts();
  const pos: [number, number, number][] = [[70, 205, -3], [560, 190, 3], [120, 330, 2], [600, 325, -2], [60, 455, -2], [560, 460, 2]];
  return (
    <AbsoluteFill style={{ background: `linear-gradient(150deg, ${p.bg[0]}, ${p.bg[1]})`, fontFamily: INTER, overflow: "hidden" }}>
      <div style={{ position: "absolute", width: 700, height: 700, borderRadius: "50%", right: -240, top: -260, background: "rgba(255,255,255,0.10)" }} />
      <div style={{ position: "absolute", width: 520, height: 520, borderRadius: "50%", left: -180, bottom: -200, background: "rgba(255,255,255,0.08)" }} />

      {/* inbox badge */}
      <div style={{ position: "absolute", top: 70, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18, background: "#fff", borderRadius: 50, padding: "14px 30px 14px 16px", boxShadow: "0 14px 34px rgba(0,0,0,0.22)" }}>
          <div style={{ width: 62, height: 62, borderRadius: 31, background: "linear-gradient(45deg,#F58529,#DD2A7B,#8134AF)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32 }}>📩</div>
          <span style={{ fontWeight: 800, fontSize: 40, color: "#111" }}>Messages</span>
          <span style={{ background: "#FF3040", color: "#fff", fontWeight: 800, fontSize: 34, padding: "4px 18px", borderRadius: 24 }}>99+</span>
        </div>
      </div>

      {/* DM bubbles */}
      {p.bubbles.slice(0, 6).map((b, i) => {
        const [x, y, r] = pos[i];
        return (
          <div key={i} style={{ position: "absolute", left: x, top: y, transform: `rotate(${r}deg)` }}>
            <div style={{ background: "#fff", color: "#111", fontWeight: 700, fontSize: 44, padding: "16px 28px", borderRadius: 34, borderBottomLeftRadius: i % 2 ? 34 : 8, borderBottomRightRadius: i % 2 ? 8 : 34, boxShadow: "0 12px 28px rgba(0,0,0,0.22)", whiteSpace: "nowrap" }}>{b}</div>
          </div>
        );
      })}

      {/* punchline */}
      <div style={{ position: "absolute", top: 600, left: 40, right: 40, textAlign: "center" }}>
        <div style={{ fontFamily: MONTSERRAT, fontWeight: 900, fontSize: 64, lineHeight: 1.05, color: "#fff", textShadow: "0 6px 20px rgba(0,0,0,0.25)" }}>{p.emoji} {p.line1}</div>
        <div style={{ display: "inline-block", marginTop: 16, fontFamily: MONTSERRAT, fontWeight: 900, fontSize: 66, lineHeight: 1.05, color: p.ink, background: p.accent, padding: "10px 28px", borderRadius: 20, transform: "rotate(-2deg)", boxShadow: "0 12px 30px rgba(0,0,0,0.25)", whiteSpace: "nowrap" }}>{p.line2}</div>
      </div>

      {/* CTA */}
      <div style={{ position: "absolute", bottom: 64, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18, background: "#fff", color: "#111", fontFamily: MONTSERRAT, fontWeight: 900, fontSize: 52, padding: "18px 40px", borderRadius: 70, boxShadow: "0 16px 36px rgba(0,0,0,0.3)" }}>
          <span style={{ fontSize: 56 }}>📩</span>{p.cta}
          <span style={{ fontFamily: INTER, fontWeight: 700, fontSize: 30, color: "#555", borderLeft: "2px solid #ddd", paddingLeft: 18 }}>we sent you an idea</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
