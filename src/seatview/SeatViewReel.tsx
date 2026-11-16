// SeatView reel (1080x1920): presenter in front, the story's screen behind her. Hook full-screen,
// then a "boxes" seat map, Buildify's real UI (homepage screenshot), and a tour of the real
// SeatView app (screenshot). Captions word by word. Timeline: bfdemo/build_props.py.
import React from "react";
import { AbsoluteFill, Audio, Easing, Img, OffthreadVideo, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { INTER, MONTSERRAT, useFonts } from "../screendemo/fonts";

type Seg = { clip: string; from: number; to: number; at: number; scene: string };
type Word = { w: string; t: number; end: number };
export type SeatViewReelProps = { fps: number; segs: Seg[]; words: Word[]; scenes: Record<string, [number, number]>; duration: number; speechEnd: number };

const Y = "#FFD84D", BLUE = "#3B7EFF", INK = "#0B0B12";
const ease = Easing.bezier(0.45, 0, 0.2, 1);
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const BG_H = 1140; // background screen area height when the presenter is framed below

// show a crop [x, y, w] of a screenshot filling a W x H box (height follows aspect)
const Crop: React.FC<{ src: string; W: number; H: number; r: [number, number, number]; children?: React.ReactNode }> = ({ src, W, H, r, children }) => {
  const s = W / r[2];
  return (
    <div style={{ position: "absolute", inset: 0, width: W, height: H, overflow: "hidden" }}>
      <div style={{ position: "absolute", left: 0, top: 0, transformOrigin: "0 0", transform: `translate(${-r[0] * s}px, ${-r[1] * s}px) scale(${s})` }}>
        <Img src={staticFile(src)} style={{ display: "block" }} />
        {children}
      </div>
    </div>
  );
};
const lerpR = (a: [number, number, number], b: [number, number, number], k: number): [number, number, number] => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];

export const SeatViewReel: React.FC<SeatViewReelProps> = (p) => {
  useFonts();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const T = frame / fps;
  const pop = (t: number, cfg = { damping: 13, stiffness: 180 }) => spring({ fps, frame: frame - Math.round(t * fps), config: cfg, durationInFrames: 18 });
  const seg = [...p.segs].reverse().find((s) => T >= s.at) ?? p.segs[0];
  const last = p.segs[p.segs.length - 1];
  const inTail = T >= p.speechEnd;
  const sc = (n: string) => p.scenes[n];
  const inScene = (n: string) => T >= sc(n)[0] && T < sc(n)[1];
  const framed = !inScene("hook") && !inTail; // presenter in a frame below the screen
  const wt = (w: string, after = 0) => p.words.find((x) => x.w.startsWith(w) && x.t >= after)?.t ?? 0;

  // presenter video (jump-cut segments)
  const srcSec = inTail ? last.to - 0.04 : seg.from + (T - seg.at);
  const segStartF = Math.round(seg.at * fps);
  const presenter = (
    <Sequence key={`${seg.clip}-${seg.at}`} from={inTail ? Math.round(p.speechEnd * fps) - 1 : segStartF} layout="none">
      <OffthreadVideo src={staticFile(`seatview/${seg.clip}.mp4`)} trimBefore={Math.round((inTail ? last.to - 0.05 : seg.from) * fps)} muted style={{ width: 1080, height: 1920 }} />
    </Sequence>
  );
  void srcSec;

  // presenter frame geometry: full screen (hook) <-> card below the screen
  const fk = inScene("hook") ? 0 : ease(clamp01((T - sc("boxes")[0]) / 0.45));
  const box = { x: 40 * fk, y: (BG_H + 30) * fk, w: 1080 - 80 * fk, h: 1920 - (BG_H + 30 + 60) * fk, r: 44 * fk };
  // inside the frame: zoom toward her face (source ~600, 1150) so the card shows face and shoulders
  const vs = (box.w / 1080) * (1 + 0.2 * fk);
  const offX = -(600 * vs - box.w / 2) * fk, offY = -(1150 * vs - box.h / 2) * fk;

  // captions: chunks of up to 3 words
  const chunks: Word[][] = [];
  for (const w of p.words) {
    const cur = chunks[chunks.length - 1];
    if (!cur || cur.length >= 3 || w.w === "Thank" || /[.?!,]$/.test(cur[cur.length - 1].w) || w.t - cur[cur.length - 1].end > 0.35) chunks.push([w]); else cur.push(w);
  }
  const chunk = chunks.find((c, i) => T >= c[0].t - 0.05 && T < (chunks[i + 1]?.[0].t ?? c[c.length - 1].end + 0.4) - 0.05);
  const capTop = framed ? BG_H - 70 : 1240;

  return (
    <AbsoluteFill style={{ background: INK, fontFamily: MONTSERRAT, overflow: "hidden" }}>
      {/* ---------- background screen area ---------- */}
      {framed && (
        <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: BG_H, overflow: "hidden", background: "#0D0D16" }}>
          {inScene("boxes") && (() => {
            const t0 = sc("boxes")[0];
            return (
              <AbsoluteFill style={{ background: "#F3F4F7", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
                <div style={{ fontFamily: INTER, fontSize: 30, fontWeight: 700, color: "#9AA1B2", letterSpacing: 8, marginBottom: 26 }}>SCREEN THIS WAY</div>
                <div style={{ width: 780, height: 10, borderRadius: 6, background: "#C9CDD8", marginBottom: 46 }} />
                <div style={{ display: "grid", gridTemplateColumns: "repeat(12, 52px)", gap: 12 }}>
                  {Array.from({ length: 96 }, (_, i) => {
                    const sold = [3, 4, 9, 15, 16, 22, 27, 33, 40, 41, 47, 52, 58, 63, 70, 71, 77, 84, 89, 90].includes(i);
                    const k = pop(t0 + 0.1 + (i % 12) * 0.02 + Math.floor(i / 12) * 0.03);
                    return <div key={i} style={{ width: 52, height: 46, borderRadius: 8, background: sold ? "#D5D8E0" : "#fff", border: `2.5px solid ${sold ? "#D5D8E0" : "#9AA1B2"}`, transform: `scale(${k})` }} />;
                  })}
                </div>
                {T >= wt("real", t0) - 0.2 && (
                  <div style={{ position: "absolute", top: 380, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
                    <div style={{ background: "#fff", borderRadius: 30, padding: "22px 36px", boxShadow: "0 20px 60px rgba(0,0,0,0.25)", fontSize: 58, fontWeight: 900, color: INK, transform: `scale(${pop(wt("real", t0) - 0.2)}) rotate(-3deg)` }}>🤷 Real view?</div>
                  </div>
                )}
              </AbsoluteFill>
            );
          })()}

          {inScene("buildify") && (() => {
            const [a, b] = sc("buildify");
            const k = clamp01((T - a) / (b - a));
            const mins = Math.min(10, Math.floor(interpolate(T, [wt("idea", a), wt("minutes", a)], [0, 10], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })));
            // Buildify's real UI (sections of its homepage): hero -> "Plan with AI" chat -> Studio editor
            const stages: [string, number, number][] = [["seatview/bf-hero.png", 1920, 1080], ["seatview/bf-chat.png", 760, 560], ["seatview/bf-studio.png", 1220, 560]];
            const fit = (i: number) => {
              const [src, w, h] = stages[i];
              const st = i / 3, en = (i + 1) / 3;
              const o = clamp01((k - st) * 3 / 0.18 + 1) * (i === 2 ? 1 : clamp01((en - k) * 3 / 0.18));
              if (o <= 0) return null;
              const z = (i === 0 ? 1.55 : 1.32) * (1 + 0.08 * clamp01((k - st) * 3));
              const sc0 = Math.min(1080 / w, BG_H / h) * z;
              return <AbsoluteFill key={i} style={{ opacity: o, background: "#0D0C10", display: "flex", alignItems: "center", justifyContent: "center" }}><Img src={staticFile(src)} style={{ width: w * sc0, height: h * sc0, marginTop: 120 }} /></AbsoluteFill>;
            };
            return (
              <AbsoluteFill>
                {[0, 1, 2].map(fit)}
                <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(13,12,16,0.55) 0%, transparent 22%, transparent 70%, rgba(13,12,16,0.75) 100%)" }} />
                <div style={{ position: "absolute", top: 90, left: 0, right: 0, display: "flex", justifyContent: "center", transform: `scale(${pop(a + 0.15)})` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 18, background: "#121113", border: `2px solid ${BLUE}`, borderRadius: 60, padding: "16px 34px 16px 18px", boxShadow: `0 16px 50px ${BLUE}55` }}>
                    <div style={{ width: 70, height: 70, borderRadius: 18, background: "#0C0C0E", border: `1.5px solid ${BLUE}88`, display: "flex", alignItems: "center", justifyContent: "center" }}><Img src={staticFile("buildify/logo.svg")} style={{ width: 44 }} /></div>
                    <span style={{ fontSize: 46, fontWeight: 900, color: "#fff" }}>Built with Buildify</span>
                  </div>
                </div>
                {T >= wt("idea", a) - 0.1 && (
                  <div style={{ position: "absolute", top: 230, left: 0, right: 0, display: "flex", justifyContent: "center", transform: `scale(${pop(wt("idea", a) - 0.1)})` }}>
                    <div style={{ background: Y, color: INK, fontSize: 44, fontWeight: 900, padding: "12px 30px", borderRadius: 20, transform: "rotate(-2deg)" }}>⏱ Idea → prototype: {String(mins).padStart(2, "0")}:00 min</div>
                  </div>
                )}
              </AbsoluteFill>
            );
          })()}

          {inScene("seats") && (() => {
            const [a] = sc("seats");
            const tView = wt("that's", a), tBest = wt("Can't", a), tSend = wt("So", tBest);
            // SeatView desktop screenshot (1920 x 1080) regions
            const MAP: [number, number, number] = [1040, 150, 520], VIEW: [number, number, number] = [374, 170, 674], BEST: [number, number, number] = [1180, 160, 380], BOOK: [number, number, number] = [1050, 560, 500], STATS: [number, number, number] = [374, 380, 674];
            const steps: [number, [number, number, number]][] = [[a, MAP], [tView - 0.15, VIEW], [tBest - 0.1, BEST], [tBest + 1.0, MAP], [tSend, STATS], [tSend + 1.8, BOOK]];
            let r = steps[0][1];
            for (const [t, target] of steps) if (T >= t) r = lerpR(r, target, ease(clamp01((T - t) / 0.55)));
            const ring = (x: number, y: number, w: number, h: number, t: number, label: string) => T >= t && (
              <div style={{ position: "absolute", left: x, top: y, width: w, height: h, borderRadius: 10, border: `4px solid ${Y}`, boxShadow: `0 0 0 4000px rgba(0,0,0,${0.35 * clamp01((T - t) / 0.4)})`, opacity: pop(t) }}>
                <div style={{ position: "absolute", left: "50%", top: -40, transform: "translateX(-50%)", whiteSpace: "nowrap", background: Y, color: INK, fontFamily: INTER, fontWeight: 800, fontSize: 18, padding: "4px 12px", borderRadius: 8 }}>{label}</div>
              </div>
            );
            return (
              <Crop src="seatview/desktop.png" W={1080} H={BG_H} r={r}>
                {T < tView - 0.15 && ring(1312, 468, 26, 26, a + 0.5, "Your seat: H8")}
                {T >= tView - 0.15 && T < tBest - 0.1 && ring(396, 190, 284, 34, tView + 0.2, "Your real view · 100")}
                {T >= tBest - 0.1 && T < tBest + 1.0 && ring(1404, 196, 114, 34, tBest + 0.15, "Best available")}
                {T >= tSend + 1.8 && ring(1083, 816, 432, 46, tSend + 2.1, "Book")}
              </Crop>
            );
          })()}
        </div>
      )}

      {/* ---------- presenter ---------- */}
      {!inTail && (
        <div style={{ position: "absolute", left: box.x, top: box.y, width: box.w, height: box.h, borderRadius: box.r, overflow: "hidden", boxShadow: fk ? "0 24px 70px rgba(0,0,0,0.55)" : "none", border: fk ? `4px solid ${Y}` : "none" }}>
          <div style={{ position: "absolute", left: offX, top: offY, width: 1080, height: 1920, transformOrigin: "0 0", transform: `scale(${vs})` }}>{presenter}</div>
        </div>
      )}

      {/* hook stickers */}
      {inScene("hook") && (
        <>
          <div style={{ position: "absolute", top: 150, left: 0, right: 0, display: "flex", justifyContent: "center", transform: `scale(${pop(0.1)}) rotate(-3deg)` }}>
            <div style={{ background: "#E23636", color: "#fff", fontSize: 54, fontWeight: 900, padding: "14px 30px", borderRadius: 22, boxShadow: "0 14px 40px rgba(0,0,0,0.4)" }}>🎬 Front row, again?</div>
          </div>
          {T >= wt("neck") - 0.1 && (
            <div style={{ position: "absolute", top: 300, right: 60, transform: `scale(${pop(wt("neck") - 0.1)}) rotate(4deg)` }}>
              <div style={{ background: "#fff", color: INK, fontSize: 44, fontWeight: 900, padding: "12px 24px", borderRadius: 20, boxShadow: "0 14px 40px rgba(0,0,0,0.35)" }}>Head tilt: 38° 😵‍💫</div>
            </div>
          )}
        </>
      )}

      {/* captions */}
      {!inTail && chunk && (() => {
        const k = pop(chunk[0].t - 0.05, { damping: 14, stiffness: 260 });
        return (
          <div style={{ position: "absolute", top: capTop, left: 40, right: 40, display: "flex", justifyContent: "center", flexWrap: "wrap", gap: "0 26px", transform: `scale(${0.88 + 0.12 * k})` }}>
            {chunk.map((w, i) => {
              const on = T >= w.t - 0.03 && (i === chunk.length - 1 || T < chunk[i + 1].t - 0.03);
              return <span key={i} style={{ fontSize: 76, fontWeight: 900, textTransform: "uppercase", color: on ? Y : "#fff", WebkitTextStroke: "9px #000", paintOrder: "stroke", textShadow: "0 8px 22px rgba(0,0,0,0.5)", letterSpacing: -1 }}>{w.w}</span>;
            })}
          </div>
        );
      })()}

      {/* end card */}
      {T >= p.speechEnd - 0.65 && (() => {
        const t0 = p.speechEnd - 0.65;
        const o = clamp01((T - t0) / 0.35);
        return (
          <AbsoluteFill style={{ background: `rgba(11,11,18,${0.92 * o})`, alignItems: "center", justifyContent: "center", flexDirection: "column", opacity: o }}>
            <div style={{ fontSize: 120, fontWeight: 900, color: "#fff", letterSpacing: -3, transform: `scale(${pop(t0 + 0.1)})` }}>SeatView</div>
            <div style={{ fontFamily: INTER, fontSize: 40, color: "#C8CBD6", marginTop: 10, opacity: pop(t0 + 0.3) }}>See your real view before you book</div>
            <div style={{ marginTop: 60, display: "flex", alignItems: "center", gap: 20, background: "#121113", border: `2px solid ${BLUE}`, borderRadius: 60, padding: "18px 40px 18px 20px", boxShadow: `0 20px 60px ${BLUE}55`, transform: `scale(${pop(t0 + 0.5)})` }}>
              <div style={{ width: 80, height: 80, borderRadius: 20, background: "#0C0C0E", display: "flex", alignItems: "center", justifyContent: "center" }}><Img src={staticFile("buildify/logo.svg")} style={{ width: 50 }} /></div>
              <div><div style={{ fontSize: 46, fontWeight: 900, color: "#fff" }}>Built with Buildify</div><div style={{ fontFamily: INTER, fontSize: 30, color: "#8BB8FF", fontWeight: 700 }}>idea → prototype in 10 minutes</div></div>
            </div>
            <div style={{ marginTop: 34, fontFamily: INTER, fontSize: 36, fontWeight: 700, color: Y, opacity: pop(t0 + 0.8) }}>buildify.sh</div>
          </AbsoluteFill>
        );
      })()}

      {/* audio: her voice per segment, sfx on scene changes */}
      {p.segs.map((s, i) => (
        <Sequence key={i} from={Math.round(s.at * fps)} durationInFrames={Math.round((s.to - s.from) * fps)}>
          <Audio src={staticFile(`seatview/${s.clip}.mp4`)} trimBefore={Math.round(s.from * fps)} volume={(f) => Math.min(1, f / 2, (Math.round((s.to - s.from) * fps) - f) / 2)} />
        </Sequence>
      ))}
      {[["boxes", "whoosh"], ["buildify", "whoosh"], ["seats", "whoosh"]].map(([n, sfx]) => (
        <Sequence key={n} from={Math.max(0, Math.round((sc(n)[0] - 0.12) * fps))}><Audio src={staticFile(`reel/sfx/${sfx}.wav`)} volume={0.35} /></Sequence>
      ))}
      <Sequence from={Math.round(0.1 * fps)}><Audio src={staticFile("reel/sfx/pop.wav")} volume={0.4} /></Sequence>
      <Sequence from={Math.round((p.speechEnd - 0.5) * fps)}><Audio src={staticFile("reel/sfx/ding.wav")} volume={0.45} /></Sequence>
    </AbsoluteFill>
  );
};
