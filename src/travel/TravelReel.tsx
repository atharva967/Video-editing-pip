// Re-edit of a travel agent's finished promo reel (Pardhan Holidayz, Char Dham by helicopter).
// The source has captions baked in, so the edit keeps his voice track and good B-roll, adds a
// hook, captions on talking parts, and covers the roughest overlays with designed cards.
// All times are seconds on the source timeline (no cuts).
import React from "react";
import { AbsoluteFill, Audio, OffthreadVideo, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { INTER, MONTSERRAT, useFonts } from "../screendemo/fonts";

type Span = { t: number; until: number };
export type TravelProps = {
  duration: number;
  handle: string;
  hook: Span & { kicker: string; title: string; sub: string; badges: string[] };
  captions: (Span & { text: string })[];
  dates: Span & { title: string; months: string[]; note: string };
  price: Span & { lead: string; priceAt: number; label: string; amount: string; per: string; note: string };
  included: Span & { title: string; items: { at: number; icon: string; text: string }[] };
  cta: Span & { title: string; lines: string[]; numbers: string[]; foot: string };
  blur: Span[]; // ranges where the source picture is blurred behind a full card
  sfx: { t: number; src: string; vol?: number }[];
};

const SAFF = "#FF9933", MAROON = "#6E1423", CREAM = "#FFF6E5", GOLD = "#F5C542";
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

export const TravelReel: React.FC<TravelProps> = (p) => {
  useFonts();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const T = frame / fps;
  const vis = (s: Span) => T >= s.t && T < s.until;
  const pop = (t: number, cfg = { damping: 13, stiffness: 170 }) => spring({ fps, frame: frame - Math.round(t * fps), config: cfg, durationInFrames: 18 });
  const fade = (s: Span, d = 0.18) => Math.min(clamp01((T - s.t) / d), clamp01((s.until - T) / d));

  // blur amount for full-card moments (eased in/out)
  const blurK = Math.max(0, ...p.blur.map((b) => fade(b, 0.3)));
  // slow push-in, restarting every 6 s so it never sits still
  const push = 1 + 0.035 * ((T % 6) / 6);

  return (
    <AbsoluteFill style={{ background: "#000", fontFamily: INTER }}>
      <AbsoluteFill style={{ transform: `scale(${push + blurK * 0.06})`, filter: blurK > 0.01 ? `blur(${blurK * 18}px) brightness(${1 - blurK * 0.5}) saturate(${1 - blurK * 0.5})` : undefined }}>
        <OffthreadVideo src={staticFile("travel/ref.mp4")} muted style={{ width: 1080, height: 1920 }} />
      </AbsoluteFill>

      {/* handle badge */}
      <div style={{ position: "absolute", top: 70, left: 0, right: 0, display: "flex", justifyContent: "center", opacity: T > p.cta.t ? 0 : clamp01(T / 0.5) }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, background: "rgba(20,10,12,0.62)", border: "1.5px solid rgba(255,255,255,0.25)", backdropFilter: "blur(8px)", padding: "10px 24px 10px 12px", borderRadius: 40, color: "#fff", fontWeight: 700, fontSize: 30 }}>
          <div style={{ width: 44, height: 44, borderRadius: 22, background: `linear-gradient(135deg, ${SAFF}, ${MAROON})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>🛕</div>
          {p.handle}
        </div>
      </div>

      {/* hook */}
      {vis(p.hook) && (() => {
        const k = pop(p.hook.t + 0.05), k2 = pop(p.hook.t + 0.3);
        return (
          <div style={{ position: "absolute", left: 50, right: 50, bottom: 430, opacity: fade(p.hook, 0.2), textAlign: "center" }}>
            <div style={{ display: "inline-block", background: SAFF, color: "#2A0A0F", fontFamily: MONTSERRAT, fontWeight: 900, fontSize: 34, letterSpacing: 2, padding: "8px 22px", borderRadius: 10, transform: `scale(${k}) rotate(-2deg)` }}>{p.hook.kicker}</div>
            <div style={{ marginTop: 18, background: `linear-gradient(160deg, ${MAROON}, #2A0A0F)`, borderRadius: 36, padding: "34px 30px 30px", boxShadow: "0 30px 80px rgba(0,0,0,0.5)", border: `2px solid ${GOLD}80`, transform: `translateY(${(1 - k2) * 80}px)`, opacity: k2 }}>
              <div style={{ fontFamily: MONTSERRAT, fontWeight: 900, fontSize: 92, lineHeight: 0.98, color: "#fff", letterSpacing: -1 }}>{p.hook.title}</div>
              <div style={{ fontFamily: MONTSERRAT, fontWeight: 900, fontSize: 66, color: GOLD, marginTop: 10 }}>{p.hook.sub}</div>
              <div style={{ display: "flex", justifyContent: "center", gap: 14, marginTop: 24, flexWrap: "wrap" }}>
                {p.hook.badges.map((b, i) => { const kb = pop(p.hook.t + 0.7 + i * 0.18); return <div key={b} style={{ background: "rgba(255,255,255,0.12)", border: "1.5px solid rgba(255,255,255,0.3)", color: "#fff", fontWeight: 700, fontSize: 30, padding: "8px 20px", borderRadius: 30, transform: `scale(${kb})` }}>{b}</div>; })}
              </div>
            </div>
          </div>
        );
      })()}

      {/* captions on talking parts */}
      {p.captions.filter(vis).map((c) => {
        const k = pop(c.t, { damping: 14, stiffness: 240 });
        return (
          <div key={c.t} style={{ position: "absolute", left: 60, right: 60, bottom: 330, textAlign: "center", opacity: fade(c, 0.12), transform: `scale(${0.85 + 0.15 * k})` }}>
            <span style={{ fontFamily: MONTSERRAT, fontWeight: 900, fontSize: 72, lineHeight: 1.12, color: "#fff", WebkitTextStroke: "9px #000", paintOrder: "stroke", textShadow: "0 8px 24px rgba(0,0,0,0.5)" }}>{c.text}</span>
          </div>
        );
      })}

      {/* travel dates */}
      {vis(p.dates) && (() => {
        const k = pop(p.dates.t);
        return (
          <div style={{ position: "absolute", left: 60, right: 60, bottom: 280, opacity: fade(p.dates), transform: `translateY(${(1 - k) * 60}px)` }}>
            <div style={{ background: CREAM, borderRadius: 34, padding: "30px 34px", boxShadow: "0 24px 60px rgba(0,0,0,0.45)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14, fontFamily: MONTSERRAT, fontWeight: 900, fontSize: 44, color: MAROON }}>📅 {p.dates.title}</div>
              <div style={{ display: "flex", gap: 18, marginTop: 20 }}>
                {p.dates.months.map((m, i) => { const km = pop(p.dates.t + 0.25 + i * 0.25); return <div key={m} style={{ flex: 1, background: i ? SAFF : MAROON, color: i ? "#2A0A0F" : "#fff", textAlign: "center", fontFamily: MONTSERRAT, fontWeight: 900, fontSize: 64, padding: "18px 0", borderRadius: 22, transform: `scale(${km})` }}>{m}</div>; })}
              </div>
              <div style={{ marginTop: 16, fontSize: 30, fontWeight: 600, color: "#5A3B2E", textAlign: "center" }}>{p.dates.note}</div>
            </div>
          </div>
        );
      })()}

      {/* price card */}
      {vis(p.price) && (() => {
        const k = pop(p.price.t, { damping: 15, stiffness: 150 });
        const showPrice = T >= p.price.priceAt;
        const kp = spring({ fps, frame: frame - Math.round(p.price.priceAt * fps), config: { damping: 9, stiffness: 200 }, durationInFrames: 16 });
        return (
          <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: fade(p.price, 0.25) }}>
            <div style={{ width: 900, background: `linear-gradient(160deg, ${MAROON}, #2A0A0F)`, borderRadius: 44, padding: "56px 50px", textAlign: "center", border: `3px solid ${GOLD}`, boxShadow: "0 40px 100px rgba(0,0,0,0.6)", transform: `scale(${0.9 + 0.1 * k})`, opacity: k }}>
              <div style={{ fontSize: 90 }}>🚁</div>
              <div style={{ fontFamily: MONTSERRAT, fontWeight: 900, fontSize: 58, color: "#fff", lineHeight: 1.1, marginTop: 10 }}>{p.price.lead}</div>
              {showPrice && (
                <div style={{ marginTop: 34, transform: `scale(${kp})` }}>
                  <div style={{ fontSize: 34, fontWeight: 700, color: GOLD, letterSpacing: 4, textTransform: "uppercase" }}>{p.price.label}</div>
                  <div style={{ fontFamily: MONTSERRAT, fontWeight: 900, fontSize: 150, color: "#fff", lineHeight: 1.05, letterSpacing: -3 }}>{p.price.amount}</div>
                  <div style={{ fontSize: 40, fontWeight: 700, color: "#FFD9B0" }}>{p.price.per}</div>
                  <div style={{ display: "inline-block", marginTop: 26, background: SAFF, color: "#2A0A0F", fontWeight: 800, fontSize: 34, padding: "12px 28px", borderRadius: 40 }}>{p.price.note}</div>
                </div>
              )}
            </div>
          </AbsoluteFill>
        );
      })()}

      {/* everything included */}
      {vis(p.included) && (() => {
        const k = pop(p.included.t, { damping: 15, stiffness: 150 });
        return (
          <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: fade(p.included, 0.25) }}>
            <div style={{ width: 900, background: CREAM, borderRadius: 44, padding: "50px 46px", boxShadow: "0 40px 100px rgba(0,0,0,0.6)", transform: `scale(${0.9 + 0.1 * k})`, opacity: k }}>
              <div style={{ fontFamily: MONTSERRAT, fontWeight: 900, fontSize: 64, color: MAROON, textAlign: "center", lineHeight: 1.05 }}>{p.included.title}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 18, marginTop: 34 }}>
                {p.included.items.map((it) => {
                  const ki = pop(it.at);
                  return T >= it.at && (
                    <div key={it.text} style={{ display: "flex", alignItems: "center", gap: 22, background: "#fff", borderRadius: 24, padding: "18px 24px", boxShadow: "0 6px 18px rgba(110,20,35,0.12)", transform: `translateX(${(1 - ki) * -60}px)`, opacity: ki }}>
                      <div style={{ fontSize: 54 }}>{it.icon}</div>
                      <div style={{ flex: 1, fontFamily: MONTSERRAT, fontWeight: 800, fontSize: 44, color: "#2A0A0F" }}>{it.text}</div>
                      <div style={{ width: 54, height: 54, borderRadius: 27, background: "#22C55E", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 34, fontWeight: 900, transform: `scale(${pop(it.at + 0.12)})` }}>✓</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </AbsoluteFill>
        );
      })()}

      {/* CTA end card */}
      {T >= p.cta.t && (() => {
        const k = pop(p.cta.t, { damping: 15, stiffness: 150 });
        return (
          <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: clamp01((T - p.cta.t) / 0.25) }}>
            <div style={{ width: 920, textAlign: "center", transform: `scale(${0.9 + 0.1 * k})` }}>
              <div style={{ fontFamily: MONTSERRAT, fontWeight: 900, fontSize: 76, lineHeight: 1.02, color: "#fff", WebkitTextStroke: "8px #000", paintOrder: "stroke" }}>{p.cta.title}</div>
              <div style={{ marginTop: 22, display: "flex", flexDirection: "column", gap: 6 }}>{p.cta.lines.map((l) => <div key={l} style={{ fontSize: 36, fontWeight: 700, color: "#FFE7C7" }}>{l}</div>)}</div>
              <div style={{ marginTop: 36, background: CREAM, borderRadius: 40, padding: "34px 30px", boxShadow: "0 30px 80px rgba(0,0,0,0.55)" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 14, fontSize: 34, fontWeight: 800, color: "#15803D" }}><span style={{ fontSize: 44 }}>📞</span>Call / WhatsApp</div>
                {p.cta.numbers.map((n, i) => { const kn = pop(p.cta.t + 0.35 + i * 0.25); return <div key={n} style={{ fontFamily: MONTSERRAT, fontWeight: 900, fontSize: 92, color: MAROON, letterSpacing: 1, lineHeight: 1.15, transform: `scale(${kn})` }}>{n}</div>; })}
                <div style={{ marginTop: 16, display: "inline-flex", alignItems: "center", gap: 12, background: `linear-gradient(135deg, ${SAFF}, ${MAROON})`, color: "#fff", fontWeight: 800, fontSize: 38, padding: "12px 30px", borderRadius: 40 }}>🛕 {p.handle}</div>
              </div>
              <div style={{ marginTop: 26, fontSize: 32, fontWeight: 700, color: "#fff", opacity: pop(p.cta.t + 0.9) }}>{p.cta.foot}</div>
            </div>
          </AbsoluteFill>
        );
      })()}

      <Audio src={staticFile("travel/audio.m4a")} />
      {p.sfx.map((s, i) => (
        <Sequence key={i} from={Math.max(0, Math.round(s.t * fps))}><Audio src={staticFile(`travel/${s.src}.wav`)} volume={s.vol ?? 0.5} /></Sequence>
      ))}
    </AbsoluteFill>
  );
};
