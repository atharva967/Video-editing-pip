// Pardhan Holidayz, Char Dham by helicopter: full redesign. Nothing from the client's own
// graphics is used. From his finished reel we keep only his voice and the shots of him talking:
// full-screen where the source frame is clean, and as a lip-synced face circle (cropped above his
// baked captions) elsewhere. Every other visual is drawn here as vector illustration.
// Times are seconds on the source timeline (no cuts, his voice runs continuously).
import React from "react";
import { AbsoluteFill, Audio, Easing, OffthreadVideo, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { INTER, MONTSERRAT, useFonts } from "../screendemo/fonts";

type Span = [number, number];
export type CharDhamProps = {
  duration: number;
  handle: string;
  talk: Span[]; // clean talking-head ranges: shown full screen
  pip: Span[]; // ranges where his face shows in a circle over our graphics
  captions: { t: number; until: number; text: string }[];
  scenes: {
    hook: Span; map: Span; heli: Span; incl: Span; dates: Span; price: Span; ticket: Span; all: Span; cta: Span;
  };
  mapStops: { name: string; at: number; x: number; y: number }[];
  inclusions: { at: number; icon: string; title: string; sub: string }[];
  priceAt: number;
  amount: string;
  allItems: { at: number; text: string }[];
  numbers: string[];
  sfx: { t: number; src: string; vol?: number }[];
};

const C = { night: "#0B1033", dusk: "#3A1C5C", saff: "#FF8A3D", gold: "#F5C542", snow: "#F4F7FF", maroon: "#6E1423", ink: "#140A1F", cream: "#FFF6E5" };
const ease = Easing.bezier(0.33, 0, 0.2, 1);
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const within = (t: number, [a, b]: Span) => t >= a && t < b;

/* ---------------- illustration pieces ---------------- */
const Sky: React.FC<{ dawn: number; sec: number }> = ({ dawn, sec }) => (
  <AbsoluteFill>
    <AbsoluteFill style={{ background: `linear-gradient(180deg, ${C.night} 0%, ${C.dusk} ${45 - dawn * 15}%, ${C.saff} ${100 - dawn * 25}%)` }} />
    <div style={{ position: "absolute", left: 540 - 420, top: 1050 - dawn * 260, width: 840, height: 840, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,214,140,0.95) 0%, rgba(255,160,80,0.45) 30%, transparent 65%)" }} />
    {Array.from({ length: 40 }, (_, i) => {
      const x = (i * 263) % 1080, y = (i * 137) % 900;
      return <div key={i} style={{ position: "absolute", left: x, top: y, width: 3, height: 3, borderRadius: 2, background: "#fff", opacity: (0.25 + 0.5 * Math.abs(Math.sin(sec * 1.5 + i))) * (1 - dawn) }} />;
    })}
  </AbsoluteFill>
);

// three ridges with snow caps; `shift` gives parallax
const Mountains: React.FC<{ shift: number; y?: number }> = ({ shift, y = 0 }) => (
  <svg viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
    <g transform={`translate(${-shift * 0.3} ${y})`}>
      <path d="M-200 1250 L80 900 L230 1020 L420 760 L600 980 L760 820 L980 1040 L1280 880 L1700 1000 L2200 900 L2200 1920 L-200 1920Z" fill="#5B4A8B" opacity="0.85" />
      <path d="M420 760 L470 820 L440 830 L400 800 L380 812Z M760 820 L800 870 L770 868 L745 850Z" fill={C.snow} opacity="0.9" />
    </g>
    <g transform={`translate(${-shift * 0.6} ${y * 1.2})`}>
      <path d="M-200 1400 L140 1040 L300 1180 L520 930 L700 1150 L900 1000 L1300 1300 L1650 1080 L2200 1250 L2200 1920 L-200 1920Z" fill="#3B2F66" />
      <path d="M520 930 L585 1010 L560 1005 L540 990 L505 1012 L480 975Z M140 1040 L190 1095 L160 1090 L120 1065Z M900 1000 L960 1050 L925 1046 L890 1030Z" fill={C.snow} />
    </g>
    <g transform={`translate(${-shift} ${y * 1.5})`}>
      <path d="M-200 1600 L160 1330 L380 1470 L620 1280 L860 1450 L1300 1250 L1700 1420 L2200 1300 L2200 1920 L-200 1920Z" fill="#221A45" />
      <path d="M620 1280 L690 1345 L655 1342 L630 1330 L600 1350 L580 1318Z" fill={C.snow} opacity="0.95" />
    </g>
    <path d="M0 1700 Q270 1640 540 1700 T1080 1690 L1080 1920 L0 1920Z" fill="#150F2E" />
  </svg>
);

const Helicopter: React.FC<{ size: number; sec: number; tilt?: number; color?: string }> = ({ size, sec, tilt = -6, color = C.saff }) => (
  <svg viewBox="0 0 220 120" style={{ width: size, height: size * 120 / 220, transform: `rotate(${tilt}deg)`, overflow: "visible", filter: "drop-shadow(0 10px 18px rgba(0,0,0,0.35))" }}>
    <g>
      <rect x="18" y="18" width={184 * (0.55 + 0.45 * Math.abs(Math.sin(sec * 40)))} height="5" rx="2.5" fill="#2A2A35" transform={`translate(${92 * (0.45 - 0.45 * Math.abs(Math.sin(sec * 40)))} 0)`} />
      <rect x="106" y="20" width="8" height="18" rx="3" fill="#2A2A35" />
      <path d="M60 40 Q60 30 80 30 L140 30 Q178 32 182 62 Q184 84 150 86 L84 86 Q58 86 58 62Z" fill={color} />
      <path d="M140 36 Q170 40 174 62 L140 62Z" fill="#9FD3FF" stroke="#1E2A44" strokeWidth="2" />
      <rect x="86" y="44" width="18" height="16" rx="4" fill="#9FD3FF" />
      <rect x="110" y="44" width="18" height="16" rx="4" fill="#9FD3FF" />
      <path d="M60 52 L8 46 L8 56 L60 66Z" fill={color} />
      <rect x="2" y="34" width="6" height="28" rx="3" fill="#2A2A35" />
      <circle cx="5" cy="48" r={10 * (0.6 + 0.4 * Math.abs(Math.cos(sec * 35)))} fill="rgba(42,42,53,0.35)" />
      <path d="M80 86 L74 102 M150 86 L156 102" stroke="#2A2A35" strokeWidth="5" strokeLinecap="round" />
      <path d="M58 104 L176 104" stroke="#2A2A35" strokeWidth="6" strokeLinecap="round" />
      <path d="M70 70 L170 70" stroke="#fff" strokeWidth="3" opacity="0.6" />
    </g>
  </svg>
);

// generic North-Indian shikhara temple with a saffron flag
const Temple: React.FC<{ size: number; glow?: number }> = ({ size, glow = 0 }) => (
  <svg viewBox="0 0 100 120" style={{ width: size, height: size * 1.2, overflow: "visible", filter: glow ? `drop-shadow(0 0 ${14 * glow}px rgba(255,200,90,${0.9 * glow}))` : undefined }}>
    <path d="M50 4 L50 -12" stroke="#5a3a1a" strokeWidth="2" />
    <path d="M50 -12 L68 -6 L50 0Z" fill={C.saff} />
    <path d="M50 6 Q30 40 26 78 L74 78 Q70 40 50 6Z" fill="#F2E3C6" stroke="#7a5230" strokeWidth="2" />
    <path d="M50 14 Q38 42 36 74 M50 14 Q62 42 64 74" stroke="#C9A877" strokeWidth="2" fill="none" />
    <circle cx="50" cy="8" r="5" fill={C.gold} />
    <rect x="14" y="76" width="72" height="28" rx="3" fill="#E9D5AE" stroke="#7a5230" strokeWidth="2" />
    <path d="M40 104 L40 88 Q50 78 60 88 L60 104Z" fill="#7a3b1e" />
    <rect x="8" y="104" width="84" height="8" rx="2" fill="#C9A877" />
  </svg>
);

/* ---------------- shared UI ---------------- */
const Caption: React.FC<{ text: string; k: number; o: number; bottom?: number }> = ({ text, k, o, bottom = 330 }) => (
  <div style={{ position: "absolute", left: 60, right: 60, bottom, textAlign: "center", opacity: o, transform: `scale(${0.85 + 0.15 * k})` }}>
    <span style={{ fontFamily: MONTSERRAT, fontWeight: 900, fontSize: 74, lineHeight: 1.12, color: "#fff", WebkitTextStroke: "10px #000", paintOrder: "stroke", textShadow: "0 8px 24px rgba(0,0,0,0.5)" }}>{text}</span>
  </div>
);

const Title: React.FC<{ kicker?: string; title: string; k: number; color?: string; top?: number }> = ({ kicker, title, k, color = "#fff", top = 230 }) => (
  <div style={{ position: "absolute", top, left: 60, right: 60, textAlign: "center", opacity: k, transform: `translateY(${(1 - k) * 40}px)` }}>
    {kicker && <div style={{ display: "inline-block", background: C.gold, color: C.ink, fontFamily: MONTSERRAT, fontWeight: 900, fontSize: 30, letterSpacing: 3, padding: "8px 20px", borderRadius: 10, transform: "rotate(-2deg)" }}>{kicker}</div>}
    <div style={{ fontFamily: MONTSERRAT, fontWeight: 900, fontSize: 84, lineHeight: 1.0, color, marginTop: 18, letterSpacing: -1, textShadow: "0 8px 30px rgba(0,0,0,0.4)" }}>{title}</div>
  </div>
);

export const CharDhamV2: React.FC<CharDhamProps> = (p) => {
  useFonts();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const T = frame / fps;
  const s = p.scenes;
  const pop = (t: number, cfg = { damping: 13, stiffness: 170 }) => spring({ fps, frame: frame - Math.round(t * fps), config: cfg, durationInFrames: 18 });
  const k01 = (a: number, d: number) => ease(clamp01((T - a) / d));

  const talking = p.talk.some((r) => within(T, r));
  const pipOn = p.pip.find((r) => within(T, r));
  const cap = p.captions.find((c) => T >= c.t && T < c.until);

  // which illustrated scene is active (talking shots sit on top of everything)
  const scene = (Object.keys(s) as (keyof typeof s)[]).find((k) => within(T, s[k] as Span));

  const video = (style: React.CSSProperties) => <OffthreadVideo src={staticFile("travel/ref.mp4")} muted style={{ width: 1080, height: 1920, ...style }} />;

  return (
    <AbsoluteFill style={{ background: C.night, fontFamily: INTER, overflow: "hidden" }}>
      {/* ===== illustrated scenes ===== */}
      {scene === "hook" && (() => {
        const t = T - s.hook[0];
        const hx = interpolate(t, [0, 1.6], [-420, 420], { extrapolateRight: "clamp", easing: ease });
        const kt = pop(s.hook[0] + 0.45, { damping: 11, stiffness: 140 });
        return (
          <AbsoluteFill>
            <Sky dawn={clamp01(t / 2)} sec={T} />
            <Mountains shift={t * 60} y={(1 - k01(s.hook[0], 1.2)) * 120} />
            {[[120, 380, 0.9], [700, 300, 1.2], [380, 470, 0.7]].map(([x, y, sc], i) => <div key={i} style={{ position: "absolute", left: x + Math.sin(T * 0.6 + i) * 30 - t * 20 * (i + 1), top: y, width: 300 * sc, height: 90 * sc, borderRadius: 60, background: "rgba(255,255,255,0.14)", filter: "blur(6px)" }} />)}
            {[[150, 1500], [420, 1440], [690, 1475], [930, 1430]].map(([x, y], i) => <div key={i} style={{ position: "absolute", left: x - 30, top: y - 72 + (1 - k01(s.hook[0] + 0.3 + i * 0.1, 0.5)) * 60, opacity: 0.95 }}><Temple size={60} glow={0.6} /></div>)}
            <div style={{ position: "absolute", left: 540 - 180 + hx * 0.25, top: 560 + Math.sin(T * 3) * 8 }}><Helicopter size={360} sec={T} /></div>
            <div style={{ position: "absolute", left: 40, right: 40, top: 900, height: 480, borderRadius: "50%", background: "radial-gradient(closest-side, rgba(11,16,51,0.75), transparent)" }} />
            <div style={{ position: "absolute", top: 940, left: 40, right: 40, textAlign: "center" }}>
              <div style={{ display: "inline-block", background: C.gold, color: C.ink, fontFamily: MONTSERRAT, fontWeight: 900, fontSize: 32, letterSpacing: 3, padding: "8px 22px", borderRadius: 10, transform: `scale(${pop(s.hook[0] + 0.2)}) rotate(-2deg)` }}>YATRA SEASON IS HERE</div>
              <div style={{ fontFamily: MONTSERRAT, fontWeight: 900, fontSize: 118, lineHeight: 0.95, color: "#fff", marginTop: 22, transform: `scale(${0.6 + 0.4 * kt})`, opacity: kt, letterSpacing: -2, textShadow: "0 10px 40px rgba(0,0,0,0.5)", WebkitTextStroke: "8px #140A1F", paintOrder: "stroke" }}>CHAR DHAM<br />YATRA</div>
              <div style={{ fontFamily: MONTSERRAT, fontWeight: 900, fontSize: 70, color: C.gold, marginTop: 10, opacity: pop(s.hook[0] + 0.8), WebkitTextStroke: "8px #140A1F", paintOrder: "stroke" }}>by Helicopter</div>
            </div>
          </AbsoluteFill>
        );
      })()}

      {scene === "map" && (() => {
        const t0 = s.map[0];
        const pts = p.mapStops;
        // route progress follows the stop times
        const seg = pts.findIndex((q, i) => i === pts.length - 1 || T < pts[i + 1].at);
        let hx = pts[0].x, hy = pts[0].y;
        if (T >= pts[0].at) {
          const a = pts[seg], b = pts[Math.min(seg + 1, pts.length - 1)];
          const u = b === a ? 1 : ease(clamp01((T - a.at) / Math.max(0.3, b.at - a.at)));
          hx = a.x + (b.x - a.x) * u; hy = a.y + (b.y - a.y) * u;
        }
        const routeD = pts.map((q, i) => `${i ? "L" : "M"}${q.x} ${q.y}`).join(" ");
        const kt = pop(t0 + 0.1);
        return (
          <AbsoluteFill>
            <Sky dawn={1} sec={T} />
            <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(11,16,51,0.15), rgba(11,16,51,0.65))" }} />
            <Title kicker="4 DHAM · 1 PACKAGE" title="Char Dham Darshan" k={kt} />
            {/* terrain card */}
            <div style={{ position: "absolute", left: 50, right: 50, top: 560, height: 900, borderRadius: 50, overflow: "hidden", background: "linear-gradient(160deg,#2C7A5B,#1D4E5F 55%,#2B2F6A)", boxShadow: "0 40px 100px rgba(0,0,0,0.5)", border: "3px solid rgba(255,255,255,0.25)", transform: `scale(${0.92 + 0.08 * pop(t0 + 0.2)})` }}>
              <svg viewBox="0 0 980 900" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
                {/* contour rings */}
                {[0, 1, 2, 3, 4].map((i) => <ellipse key={i} cx={560 + i * 10} cy={360 - i * 6} rx={420 - i * 70} ry={260 - i * 42} fill="none" stroke="rgba(255,255,255,0.10)" strokeWidth="3" />)}
                {/* snowy peaks */}
                {[[250, 240], [430, 170], [640, 200], [800, 280]].map(([x, y], i) => <path key={i} d={`M${x - 70} ${y + 70} L${x} ${y - 40} L${x + 70} ${y + 70}Z`} fill="rgba(255,255,255,0.18)" />)}
                {/* river */}
                <path d="M60 860 C 220 700, 300 760, 380 600 S 560 520, 620 420" stroke="#7FD3FF" strokeWidth="10" fill="none" opacity="0.55" strokeLinecap="round" />
                {/* route */}
                <path d={routeD} stroke="rgba(255,255,255,0.35)" strokeWidth="8" fill="none" strokeDasharray="4 22" strokeLinecap="round" />
                <path d={routeD} stroke={C.gold} strokeWidth="9" fill="none" strokeLinecap="round" strokeDasharray="2400" strokeDashoffset={2400 * (1 - clamp01((T - pts[0].at) / (pts[pts.length - 1].at - pts[0].at + 0.4)))} />
              </svg>
              {pts.map((q, i) => {
                const k = pop(q.at - 0.2);
                const on = T >= q.at - 0.2;
                return on && (
                  <div key={q.name} style={{ position: "absolute", left: q.x - 80, top: q.y - 190, width: 160, textAlign: "center", transform: `scale(${k})`, transformOrigin: "50% 100%" }}>
                    <Temple size={96} glow={T >= q.at && T < q.at + 0.8 ? 1 : 0.3} />
                    <div style={{ marginTop: 4, display: "inline-block", whiteSpace: "nowrap", background: "#fff", color: C.ink, fontWeight: 800, fontSize: 34, padding: "8px 16px", borderRadius: 14, boxShadow: "0 6px 16px rgba(0,0,0,0.3)" }}>{i + 1}. {q.name}</div>
                  </div>
                );
              })}
              <div style={{ position: "absolute", left: hx - 85, top: hy - 120 + Math.sin(T * 4) * 6, opacity: T >= pts[0].at - 0.4 ? 1 : 0 }}><Helicopter size={170} sec={T} tilt={-4} /></div>
            </div>
          </AbsoluteFill>
        );
      })()}

      {scene === "heli" && (() => {
        const t = T - s.heli[0];
        return (
          <AbsoluteFill>
            <Sky dawn={1} sec={T} />
            <Mountains shift={t * 70} y={-120} />
            {/* trek path far below */}
            <svg viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0 }}><path d="M-20 1820 C 200 1700, 300 1780, 480 1640 S 760 1600, 1100 1480" stroke="#E9D5AE" strokeWidth="7" strokeDasharray="14 14" fill="none" opacity="0.7" /></svg>
            <div style={{ position: "absolute", left: interpolate(t, [0, 3.6], [-500, 1100]), top: 720 + Math.sin(T * 3) * 12 }}><Helicopter size={480} sec={T} tilt={-8} /></div>
            <Title kicker="FLY BETWEEN THE DHAMS" title="Skip the long trek" k={pop(s.heli[0] + 0.15)} top={250} />
            <div style={{ position: "absolute", top: 1240, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 20 }}>
              {["🚁 Helicopter to every Dham", "⏱️ Save days"].map((x, i) => { const k = pop(s.heli[0] + 0.7 + i * 0.3); return <div key={x} style={{ background: "rgba(255,255,255,0.95)", color: C.ink, fontWeight: 800, fontSize: 34, padding: "14px 26px", borderRadius: 40, transform: `scale(${k})`, boxShadow: "0 10px 30px rgba(0,0,0,0.3)" }}>{x}</div>; })}
            </div>
          </AbsoluteFill>
        );
      })()}

      {scene === "incl" && (() => {
        const cur = [...p.inclusions].reverse().find((x) => T >= x.at) ?? p.inclusions[0];
        const idx = p.inclusions.indexOf(cur);
        const k = pop(cur.at, { damping: 12, stiffness: 160 });
        return (
          <AbsoluteFill style={{ background: `radial-gradient(120% 80% at 50% 30%, #2B2F6A, ${C.night})` }}>
            <Title kicker="INCLUDED IN YOUR PACKAGE" title="We take care of it" k={pop(s.incl[0] + 0.1)} top={200} />
            <div style={{ position: "absolute", top: 600, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
              <div style={{ width: 760, height: 620, borderRadius: 60, background: `linear-gradient(160deg, ${C.cream}, #FFE1BD)`, boxShadow: "0 40px 100px rgba(0,0,0,0.55)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", transform: `scale(${0.85 + 0.15 * k}) rotate(${(1 - k) * -6}deg)` }}>
                <div style={{ fontSize: 230, lineHeight: 1 }}>{cur.icon}</div>
                <div style={{ fontFamily: MONTSERRAT, fontWeight: 900, fontSize: 76, color: C.maroon, marginTop: 20 }}>{cur.title}</div>
                <div style={{ fontSize: 34, fontWeight: 600, color: "#6B4A3A", marginTop: 6 }}>{cur.sub}</div>
              </div>
            </div>
            <div style={{ position: "absolute", top: 1290, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 16 }}>
              {p.inclusions.map((x, i) => <div key={x.title} style={{ width: 120, height: 120, borderRadius: 30, background: i <= idx ? C.gold : "rgba(255,255,255,0.12)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 62, transform: `scale(${i === idx ? 1.12 : 1})`, boxShadow: i <= idx ? "0 10px 26px rgba(245,197,66,0.4)" : "none" }}>{x.icon}</div>)}
            </div>
          </AbsoluteFill>
        );
      })()}

      {(scene === "price" || scene === "all" || scene === "ticket" || scene === "cta" || scene === "dates") && (
        <AbsoluteFill style={{ background: `radial-gradient(120% 80% at 50% 20%, ${C.maroon}, #1A0710)` }}>
          <svg viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0, opacity: 0.12 }}>
            {Array.from({ length: 14 }, (_, i) => <circle key={i} cx={540} cy={420} r={120 + i * 110} fill="none" stroke={C.gold} strokeWidth="2" />)}
          </svg>
          <div style={{ position: "absolute", left: 0, right: 0, bottom: -40, opacity: 0.35 }}><Mountains shift={0} y={240} /></div>
        </AbsoluteFill>
      )}

      {scene === "dates" && !talking && <Title kicker="YATRA SEASON" title="When to go" k={pop(s.dates[0] + 0.05)} top={600} />}

      {scene === "price" && (() => {
        const kp = spring({ fps, frame: frame - Math.round(p.priceAt * fps), config: { damping: 9, stiffness: 200 }, durationInFrames: 16 });
        return (
          <AbsoluteFill>
            <Title kicker="BOOK YOUR SEAT" title="Char Dham by Helicopter" k={pop(s.price[0] + 0.1)} top={560} color="#fff" />
            {T >= p.priceAt && (
              <div style={{ position: "absolute", top: 900, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
                <div style={{ width: 860, borderRadius: 50, background: C.cream, padding: "44px 30px", textAlign: "center", boxShadow: "0 40px 100px rgba(0,0,0,0.6)", transform: `scale(${kp})`, border: `4px solid ${C.gold}` }}>
                  <div style={{ fontSize: 32, fontWeight: 800, letterSpacing: 4, color: C.maroon }}>PACKAGE COST</div>
                  <div style={{ fontFamily: MONTSERRAT, fontWeight: 900, fontSize: 168, color: C.ink, lineHeight: 1.05, letterSpacing: -4 }}>{p.amount}</div>
                  <div style={{ fontSize: 42, fontWeight: 700, color: "#6B4A3A" }}>per person</div>
                  <div style={{ display: "inline-block", marginTop: 22, background: C.maroon, color: "#fff", fontWeight: 800, fontSize: 34, padding: "12px 30px", borderRadius: 40 }}>All inclusive ✅</div>
                </div>
              </div>
            )}
          </AbsoluteFill>
        );
      })()}

      {scene === "ticket" && (() => {
        const k = pop(s.ticket[0] + 0.05, { damping: 14, stiffness: 140 });
        const stamp = spring({ fps, frame: frame - Math.round((s.ticket[0] + 1.4) * fps), config: { damping: 8, stiffness: 220 }, durationInFrames: 14 });
        return (
          <AbsoluteFill>
            <Title kicker="SORTED FOR YOU" title="Tickets, hotel, transfers" k={pop(s.ticket[0])} top={300} />
            <div style={{ position: "absolute", top: 720, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
              <div style={{ position: "relative", width: 900, height: 470, borderRadius: 36, background: "#fff", boxShadow: "0 40px 100px rgba(0,0,0,0.55)", transform: `translateX(${(1 - k) * 900}px) rotate(${(1 - k) * 8 - 2}deg)`, display: "flex", overflow: "hidden" }}>
                <div style={{ width: 230, background: `linear-gradient(180deg, ${C.saff}, ${C.maroon})`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14 }}><Helicopter size={170} sec={T} color="#fff" tilt={0} /><div style={{ color: "#fff", fontWeight: 900, fontSize: 30, letterSpacing: 3 }}>BOARDING</div></div>
                <div style={{ flex: 1, padding: "36px 40px", borderLeft: "4px dashed #E5D5C0" }}>
                  <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: 3, color: "#9A7B66" }}>HELICOPTER TICKET</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 18, marginTop: 14, fontFamily: MONTSERRAT, fontWeight: 900, fontSize: 54, color: C.ink, whiteSpace: "nowrap" }}>4 DHAM <span style={{ color: C.saff }}>✈</span> BY HELI</div>
                  <div style={{ display: "flex", gap: 40, marginTop: 30 }}>
                    {[["HOTEL", "Included"], ["TRANSFER", "Pick & drop"], ["MEALS", "All 3"]].map(([a, b]) => <div key={a}><div style={{ fontSize: 22, fontWeight: 800, letterSpacing: 2, color: "#9A7B66" }}>{a}</div><div style={{ fontSize: 34, fontWeight: 800, color: C.ink, marginTop: 4 }}>{b}</div></div>)}
                  </div>
                  <div style={{ position: "absolute", right: 46, bottom: 34, transform: `rotate(-14deg) scale(${2 - stamp})`, opacity: stamp, border: "6px solid #16A34A", color: "#16A34A", fontFamily: MONTSERRAT, fontWeight: 900, fontSize: 46, padding: "6px 20px", borderRadius: 14 }}>CONFIRMED</div>
                </div>
              </div>
            </div>
          </AbsoluteFill>
        );
      })()}

      {scene === "all" && (
        <AbsoluteFill>
          <Title kicker="NO HIDDEN COSTS" title="All services included" k={pop(s.all[0] + 0.05)} top={560} />
          <div style={{ position: "absolute", top: 860, left: 120, right: 120, display: "flex", flexDirection: "column", gap: 22 }}>
            {p.allItems.map((it, i) => {
              const k = pop(it.at);
              return T >= it.at - 0.05 && (
                <div key={it.text} style={{ display: "flex", alignItems: "center", gap: 24, background: C.cream, borderRadius: 30, padding: "22px 30px", boxShadow: "0 14px 36px rgba(0,0,0,0.4)", transform: `translateX(${(1 - k) * (i % 2 ? 300 : -300)}px)`, opacity: k }}>
                  <div style={{ width: 66, height: 66, borderRadius: 33, background: "#16A34A", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 42, fontWeight: 900, transform: `scale(${pop(it.at + 0.12)})` }}>✓</div>
                  <div style={{ fontFamily: MONTSERRAT, fontWeight: 900, fontSize: 56, color: C.ink }}>{it.text}</div>
                </div>
              );
            })}
          </div>
        </AbsoluteFill>
      )}

      {scene === "cta" && (() => {
        const t0 = s.cta[0];
        return (
          <AbsoluteFill>
            <div style={{ position: "absolute", top: 560, left: 60, right: 60, textAlign: "center" }}>
              <div style={{ fontFamily: MONTSERRAT, fontWeight: 900, fontSize: 92, color: "#fff", lineHeight: 1, opacity: pop(t0 + 0.05), letterSpacing: -1 }}>Book your Yatra</div>
              <div style={{ fontSize: 40, fontWeight: 700, color: "#FFD9B0", marginTop: 14, opacity: pop(t0 + 0.2) }}>Message us for all the details</div>
            </div>
            <div style={{ position: "absolute", top: 820, left: 0, right: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 22 }}>
              {p.numbers.map((n, i) => {
                const k = pop(t0 + 0.35 + i * 0.25);
                return (
                  <div key={n} style={{ display: "flex", alignItems: "center", gap: 24, background: C.cream, borderRadius: 34, padding: "20px 40px 20px 22px", boxShadow: "0 20px 50px rgba(0,0,0,0.45)", transform: `scale(${k})` }}>
                    <div style={{ width: 92, height: 92, borderRadius: 26, background: i ? "#25D366" : C.saff, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 52 }}>{i ? "💬" : "📞"}</div>
                    <div style={{ fontFamily: MONTSERRAT, fontWeight: 900, fontSize: 84, color: C.maroon, letterSpacing: 1 }}>{n}</div>
                  </div>
                );
              })}
              <div style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 14, background: `linear-gradient(135deg, ${C.saff}, ${C.gold})`, color: C.ink, fontWeight: 900, fontSize: 44, padding: "16px 36px", borderRadius: 50, transform: `scale(${pop(t0 + 0.9)})` }}>🛕 {p.handle}</div>
              <div style={{ marginTop: 6, fontSize: 32, fontWeight: 700, color: "#fff", opacity: pop(t0 + 1.1) }}>Call or WhatsApp · Seats for May & June</div>
            </div>
          </AbsoluteFill>
        );
      })()}

      {/* ===== his clean talking shots, full screen ===== */}
      {talking && (() => {
        const r = p.talk.find((x) => within(T, x))!;
        const k = k01(r[0], 0.25);
        return (
          <AbsoluteFill style={{ opacity: clamp01((T - r[0]) / 0.12) * clamp01((r[1] - T) / 0.12) }}>
            <AbsoluteFill style={{ transform: `scale(${1.04 + 0.04 * k + 0.02 * ((T - r[0]) / (r[1] - r[0]))})`, transformOrigin: "540px 700px" }}>{video({})}</AbsoluteFill>
            <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(11,16,51,0.35) 0%, transparent 18%, transparent 60%, rgba(11,16,51,0.55) 100%)" }} />
          </AbsoluteFill>
        );
      })()}

      {/* ===== his face in a circle over our graphics ===== */}
      {pipOn && !talking && (() => {
        const k = pop(pipOn[0], { damping: 14, stiffness: 180 });
        const out = clamp01((pipOn[1] - T) / 0.15);
        const D = 330;
        // source face centre in 1080x1920 space and zoom inside the circle
        const fx = 560, fy = 470, z = 1.0;
        return (
          <div style={{ position: "absolute", left: 540 - D / 2, top: 190, width: D, height: D, borderRadius: "50%", overflow: "hidden", border: `8px solid ${C.gold}`, boxShadow: "0 20px 50px rgba(0,0,0,0.5)", transform: `scale(${k * out})` }}>
            <div style={{ position: "absolute", left: D / 2 - fx * z, top: D / 2 - fy * z, width: 1080, height: 1920, transform: `scale(${z})`, transformOrigin: "0 0" }}>{video({})}</div>
          </div>
        );
      })()}

      {/* handle badge (not on hook or end card) */}
      {scene !== "hook" && scene !== "cta" && !(pipOn && !talking) && (
        <div style={{ position: "absolute", top: 70, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, background: "rgba(11,16,51,0.6)", border: "1.5px solid rgba(255,255,255,0.25)", padding: "10px 24px 10px 12px", borderRadius: 40, color: "#fff", fontWeight: 700, fontSize: 30 }}>
            <div style={{ width: 44, height: 44, borderRadius: 22, background: `linear-gradient(135deg, ${C.saff}, ${C.maroon})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>🛕</div>{p.handle}
          </div>
        </div>
      )}

      {/* dates card rides over the talking shot */}
      {within(T, s.dates) && (() => {
        const k = pop(s.dates[0]);
        const o = clamp01((s.dates[1] - T) / 0.2);
        return (
          <div style={{ position: "absolute", left: 50, right: 50, bottom: 360, opacity: o, transform: `translateY(${(1 - k) * 80}px)` }}>
            <div style={{ background: C.cream, borderRadius: 40, padding: "40px 34px", boxShadow: "0 24px 60px rgba(0,0,0,0.5)" }}>
              <div style={{ fontFamily: MONTSERRAT, fontWeight: 900, fontSize: 42, color: C.maroon }}>🗓️ Yatra dates</div>
              <div style={{ display: "flex", gap: 18, marginTop: 18 }}>
                {["MAY", "JUNE"].map((m, i) => { const km = pop(s.dates[0] + 0.25 + i * 0.25); return <div key={m} style={{ flex: 1, textAlign: "center", fontFamily: MONTSERRAT, fontWeight: 900, fontSize: 84, padding: "26px 0", borderRadius: 26, background: i ? C.saff : C.maroon, color: i ? C.ink : "#fff", transform: `scale(${km})` }}>{m}</div>; })}
              </div>
            </div>
          </div>
        );
      })()}

      {cap && !within(T, s.dates) && <Caption text={cap.text} k={pop(cap.t, { damping: 14, stiffness: 240 })} o={clamp01((T - cap.t) / 0.12) * clamp01((cap.until - T) / 0.12)} />}

      {/* audio */}
      <Audio src={staticFile("travel/audio.m4a")} />
      {p.sfx.map((x, i) => <Sequence key={i} from={Math.max(0, Math.round(x.t * fps))}><Audio src={staticFile(`travel/${x.src}.wav`)} volume={x.vol ?? 0.5} /></Sequence>)}
    </AbsoluteFill>
  );
};
