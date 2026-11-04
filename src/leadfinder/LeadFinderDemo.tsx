// Lead Finder client demo (~6 min). Narrated walkthrough built from a 720p screen recording
// (browser bar cropped) and sharper screenshots: eased camera per shot, highlight boxes, crossfades,
// chapter swipes, subtitles, and graphic cards for the intro and outro. Timeline: leadfinder/build.py.
import React from "react";
import { AbsoluteFill, Audio, Easing, Freeze, Img, OffthreadVideo, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { INTER, useFonts } from "../screendemo/fonts";

type Rect = [number, number, number];
type Spot = [number, number, number, number, string, number];
type Shot = { t: number; dur: number; kind: "video" | "image" | "card"; a?: number; b?: number; rate?: number; src?: string; size?: [number, number]; card?: string; cam: [Rect, Rect] | null; spots: Spot[] };
export type LeadFinderProps = {
  src: string; duration: number;
  lines: { key: string; t: number }[];
  shots: Shot[];
  chapters: { id: string; title: string; t: number; n: number }[];
  subs: { t: number; until: number; text: string }[];
};

const C = { indigo: "#4F46E5", indigo2: "#6366F1", ink: "#0F1222", sub: "#5B6275", red: "#E5484D", orange: "#F5A524", blue: "#3B82F6", green: "#22C55E" };
const VW = 1680, VH = 852, BAR = 32, TOP = 26, LEFT = 120;
const CROP_Y = 73; // browser bar height in the 720p recording
const ease = Easing.bezier(0.45, 0, 0.2, 1);
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const XF = 0.4; // crossfade seconds

const Wallpaper: React.FC<{ sec: number }> = ({ sec }) => {
  const d = (k: number, a: number) => Math.sin(sec * 0.18 + k) * a;
  return (
    <AbsoluteFill style={{ background: "#0E0B2A", overflow: "hidden" }}>
      <div style={{ position: "absolute", left: -360 + d(0, 60), top: -520 + d(1, 40), width: 1400, height: 1200, borderRadius: "50%", background: "radial-gradient(circle, #4F46E5AA 0%, #4F46E500 62%)" }} />
      <div style={{ position: "absolute", right: -420 + d(2, 70), bottom: -620 + d(3, 50), width: 1500, height: 1300, borderRadius: "50%", background: "radial-gradient(circle, #A855F777 0%, #A855F700 60%)" }} />
      <AbsoluteFill style={{ backgroundImage: "radial-gradient(rgba(255,255,255,0.06) 1.2px, transparent 1.2px)", backgroundSize: "30px 30px" }} />
    </AbsoluteFill>
  );
};

const Logo: React.FC<{ size: number }> = ({ size }) => (
  <div style={{ width: size, height: size, borderRadius: size / 2, background: C.indigo, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: size * 0.44, boxShadow: `0 ${size * 0.15}px ${size * 0.4}px ${C.indigo}66` }}>T</div>
);

// ---------- graphic cards (drawn in the 1680x852 viewport) ----------
const Card: React.FC<{ name: string; lt: number; dur: number; pop: (t: number) => number }> = ({ name, lt, dur, pop }) => {
  const at = (f: number) => pop(f * dur);
  const bg: React.CSSProperties = { position: "absolute", inset: 0, background: "linear-gradient(160deg,#FFFFFF,#F1F0FF)", fontFamily: INTER, color: C.ink };
  if (name === "types") {
    const items = [["No website", "No site at all, or only a free page on Square, Wix or a booking app.", C.red, "🌐"], ["Bad website", "Slow, broken, not mobile friendly, or no way to get in touch.", C.orange, "🛠️"], ["Low reach", "A decent site, but hardly any reviews and no social media.", C.blue, "📣"]] as const;
    return (
      <div style={bg}>
        <div style={{ position: "absolute", top: 110, left: 0, right: 0, textAlign: "center", opacity: at(0.02) }}>
          <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: 5, color: C.indigo }}>THE OPPORTUNITY</div>
          <div style={{ fontSize: 66, fontWeight: 800, letterSpacing: -2, marginTop: 10 }}>Local businesses that need you</div>
        </div>
        <div style={{ position: "absolute", top: 330, left: 110, right: 110, display: "flex", gap: 40 }}>
          {items.map(([t, d, col, ic], i) => {
            const k = at(0.12 + i * 0.22);
            return (
              <div key={t} style={{ flex: 1, background: "#fff", borderRadius: 28, padding: "36px 34px", boxShadow: "0 20px 50px rgba(30,20,90,0.12)", borderTop: `6px solid ${col}`, transform: `translateY(${(1 - k) * 60}px)`, opacity: k }}>
                <div style={{ fontSize: 54 }}>{ic}</div>
                <div style={{ display: "inline-block", marginTop: 16, fontSize: 24, fontWeight: 700, color: col, background: `${col}18`, padding: "6px 16px", borderRadius: 20 }}>● {t}</div>
                <div style={{ fontSize: 28, lineHeight: 1.4, color: C.sub, marginTop: 18 }}>{d}</div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
  if (name === "title" || name === "outro") {
    const outro = name === "outro";
    return (
      <div style={{ ...bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <div style={{ transform: `scale(${at(0.02)})` }}><Logo size={130} /></div>
        <div style={{ fontSize: 112, fontWeight: 800, letterSpacing: -4, marginTop: 28, opacity: at(0.08), transform: `translateY(${(1 - at(0.08)) * 30}px)` }}>{outro ? "Want a lead engine like this?" : "Lead Finder"}</div>
        <div style={{ fontSize: 40, color: C.sub, marginTop: 10, opacity: at(0.2) }}>{outro ? "We build AI-powered tools that grow your business." : "by TechnoTribes"}</div>
        <div style={{ marginTop: 44, fontSize: 36, fontWeight: 700, color: "#fff", background: C.indigo, padding: "18px 40px", borderRadius: 50, boxShadow: `0 20px 50px ${C.indigo}55`, transform: `scale(${at(0.35)})` }}>{outro ? "Talk to TechnoTribes · technotribes.ai" : "Find local businesses that need a website. Automatically."}</div>
      </div>
    );
  }
  // chapters
  const ch = ["The Overview", "The leads list", "Inside a lead", "Running searches", "Team access"];
  return (
    <div style={bg}>
      <div style={{ position: "absolute", top: 120, left: 0, right: 0, textAlign: "center", opacity: at(0.02) }}>
        <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: 5, color: C.indigo }}>IN THIS DEMO</div>
        <div style={{ fontSize: 66, fontWeight: 800, letterSpacing: -2, marginTop: 10 }}>A tour of Lead Finder</div>
      </div>
      <div style={{ position: "absolute", top: 330, left: 260, right: 260, display: "grid", gridTemplateColumns: "1fr 1fr", gap: "22px 40px" }}>
        {ch.map((c, i) => {
          const k = at(0.1 + i * 0.12);
          return <div key={c} style={{ display: "flex", alignItems: "center", gap: 20, background: "#fff", borderRadius: 22, padding: "22px 26px", boxShadow: "0 12px 30px rgba(30,20,90,0.1)", opacity: k, transform: `translateX(${(1 - k) * -40}px)` }}><span style={{ width: 52, height: 52, borderRadius: 14, background: C.indigo, color: "#fff", fontWeight: 800, fontSize: 26, display: "flex", alignItems: "center", justifyContent: "center" }}>{i + 1}</span><span style={{ fontSize: 34, fontWeight: 700 }}>{c}</span></div>;
        })}
      </div>
    </div>
  );
};

// ---------- one shot in the viewport ----------
const ShotView: React.FC<{ s: Shot; lt: number; srcVideo: string; pop: (t: number) => number }> = ({ s, lt, srcVideo, pop }) => {
  const { fps } = useVideoConfig();
  if (s.kind === "card") return <Card name={s.card!} lt={lt} dur={s.dur} pop={(t) => pop(s.t + t)} />;
  const [r0, r1] = s.cam ?? [[0, 0, s.kind === "video" ? 1280 : s.size![0]], [0, 0, s.kind === "video" ? 1280 : s.size![0]]];
  const k = ease(clamp01(lt / s.dur));
  const r: Rect = [r0[0] + (r1[0] - r0[0]) * k, r0[1] + (r1[1] - r0[1]) * k, r0[2] + (r1[2] - r0[2]) * k];
  const sc = VW / r[2];
  const W = s.kind === "video" ? 1280 : s.size![0], H = s.kind === "video" ? 720 - CROP_Y : s.size![1];
  const last = [...s.spots].filter((sp) => lt >= sp[5] * s.dur).pop();
  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: W, height: H, transformOrigin: "0 0", transform: `translate(${-r[0] * sc}px, ${-r[1] * sc}px) scale(${sc})`, overflow: "hidden", background: "#F6F7FB" }}>
      {s.kind === "video" ? (
        <div style={{ position: "absolute", left: 0, top: -CROP_Y, width: 1280, height: 720 }}>
          <Freeze frame={Math.round((s.a! + Math.min(lt * s.rate!, s.b! - s.a!)) * fps)}>
            <OffthreadVideo src={staticFile(srcVideo)} muted style={{ width: 1280, height: 720 }} />
          </Freeze>
        </div>
      ) : (
        <Img src={staticFile(s.src!)} style={{ width: W, height: H, display: "block" }} />
      )}
      {s.spots.map((sp, i) => {
        const st = sp[5] * s.dur;
        if (lt < st) return null;
        const kk = pop(s.t + st);
        const dim = sp === last ? clamp01((lt - st) / 0.5) * clamp01((s.dur - lt) / 0.4) : 0;
        return (
          <div key={i} style={{ position: "absolute", left: sp[0], top: sp[1], width: sp[2], height: sp[3], borderRadius: 14, boxShadow: `0 0 0 ${3 / sc}px ${C.indigo}, 0 0 0 4000px rgba(14,11,42,${0.38 * dim})`, opacity: kk, transform: `scale(${1.04 - 0.04 * kk})` }}>
            <div style={{ position: "absolute", left: 0, top: -44 / sc, transformOrigin: "0 100%", transform: `scale(${1 / sc})`, background: C.indigo, color: "#fff", fontWeight: 700, fontSize: 26, padding: "6px 16px", borderRadius: 10, whiteSpace: "nowrap", fontFamily: INTER }}>{sp[4]}</div>
          </div>
        );
      })}
    </div>
  );
};

export const LeadFinderDemo: React.FC<LeadFinderProps> = (p) => {
  useFonts();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const T = frame / fps;
  const pop = (t: number) => spring({ fps, frame: frame - Math.round(t * fps), config: { damping: 14, stiffness: 150 }, durationInFrames: 22 });

  const si = Math.max(0, p.shots.filter((s) => T >= s.t).length - 1);
  const shot = p.shots[si], prev = si > 0 ? p.shots[si - 1] : null;
  const lt = T - shot.t;
  const xf = prev ? clamp01(lt / XF) : 1;
  const chap = [...p.chapters].reverse().find((c) => T >= c.t);
  const swipe = p.chapters.find((c) => T >= c.t - 0.1 && T < c.t + 1.3);
  const sub = p.subs.find((s) => T >= s.t && T < s.until);
  const winIn = pop(0);
  const end = clamp01((p.duration - T) / 0.8);

  return (
    <AbsoluteFill style={{ fontFamily: INTER }}>
      <Wallpaper sec={T} />

      <div style={{ position: "absolute", left: LEFT, top: TOP, width: VW, height: VH + BAR, borderRadius: 18, overflow: "hidden", background: "#fff", boxShadow: "0 40px 100px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.15)", transform: `scale(${0.94 + 0.06 * winIn})`, opacity: Math.min(winIn, end) }}>
        <div style={{ height: BAR, background: "#EEF0F6", display: "flex", alignItems: "center", padding: "0 16px", gap: 8, borderBottom: "1px solid #E1E4EE" }}>
          {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => <div key={c} style={{ width: 12, height: 12, borderRadius: 6, background: c }} />)}
          <div style={{ margin: "0 auto", transform: "translateX(-30px)", background: "#fff", color: C.sub, fontSize: 15, padding: "4px 110px", borderRadius: 8, border: "1px solid #E1E4EE" }}>🔒 Lead Finder · TechnoTribes</div>
        </div>
        <div style={{ position: "relative", width: VW, height: VH, overflow: "hidden", background: "#F6F7FB" }}>
          {prev && xf < 1 && <AbsoluteFill><ShotView s={prev} lt={prev.dur} srcVideo={p.src} pop={pop} /></AbsoluteFill>}
          <AbsoluteFill style={{ opacity: xf }}><ShotView s={shot} lt={lt} srcVideo={p.src} pop={pop} /></AbsoluteFill>

          {/* chapter chip */}
          {chap && !swipe && shot.kind !== "card" && (
            <div style={{ position: "absolute", left: 22, bottom: 22, display: "flex", alignItems: "center", gap: 12, background: "rgba(14,11,42,0.88)", borderRadius: 14, padding: "9px 18px 9px 9px", boxShadow: "0 10px 30px rgba(0,0,0,0.3)", opacity: pop(chap.t + 1.2) }}>
              <span style={{ minWidth: 38, height: 38, borderRadius: 10, background: C.indigo, color: "#fff", fontWeight: 800, fontSize: 19, display: "flex", alignItems: "center", justifyContent: "center" }}>{chap.n}</span>
              <span style={{ fontWeight: 700, fontSize: 23, color: "#fff" }}>{chap.title}</span>
            </div>
          )}

          {/* chapter swipe */}
          {swipe && (() => {
            const k = clamp01((T - (swipe.t - 0.1)) / 1.4);
            const x = (ease(k) * 2.7 - 1.35) * VW;
            return (
              <div style={{ position: "absolute", top: -80, bottom: -80, left: x - 220, width: VW + 440, transform: "skewX(-14deg)", background: `linear-gradient(90deg, ${C.indigo}00, ${C.indigo} 14%, #3730A3 50%, ${C.indigo} 86%, ${C.indigo}00)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ transform: "skewX(14deg)", textAlign: "center", color: "#fff" }}>
                  <div style={{ fontSize: 30, fontWeight: 700, letterSpacing: 6, opacity: 0.85 }}>CHAPTER {swipe.n}</div>
                  <div style={{ fontSize: 92, fontWeight: 800, letterSpacing: -2 }}>{swipe.title}</div>
                </div>
              </div>
            );
          })()}
        </div>
      </div>

      {/* chapter progress */}
      <div style={{ position: "absolute", left: LEFT, width: VW, top: TOP + VH + BAR + 12, display: "flex", gap: 6, opacity: winIn * end }}>
        {p.chapters.map((c, i) => {
          const until = p.chapters[i + 1]?.t ?? p.duration;
          return <div key={c.id} style={{ flex: until - c.t, height: 5, borderRadius: 3, background: "rgba(255,255,255,0.14)", overflow: "hidden" }}><div style={{ width: `${clamp01((T - c.t) / (until - c.t)) * 100}%`, height: "100%", background: "#A5B4FC" }} /></div>;
        })}
      </div>

      {/* subtitles */}
      {sub && (
        <div style={{ position: "absolute", left: 80, right: 80, top: TOP + VH + BAR + 32, textAlign: "center", opacity: clamp01((T - sub.t) / 0.15) * clamp01((sub.until - T) / 0.15) * end }}>
          <span style={{ fontSize: 34, fontWeight: 600, lineHeight: 1.3, color: "#fff", textShadow: "0 2px 12px rgba(0,0,0,0.6)" }}>{sub.text}</span>
        </div>
      )}

      {p.lines.map((l) => <Sequence key={l.key} from={Math.round(l.t * fps)}><Audio src={staticFile(`leadfinder/vo/${l.key}.wav`)} /></Sequence>)}
      {p.chapters.map((c) => <Sequence key={`w${c.id}`} from={Math.max(0, Math.round((c.t - 0.1) * fps))}><Audio src={staticFile("travel/whoosh.wav")} volume={0.25} /></Sequence>)}
    </AbsoluteFill>
  );
};
