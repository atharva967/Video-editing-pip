// "Client Said What?!" talking-head reel (1080x1920). Jump-cut segments of the raw clips with
// punch-in zooms, word-by-word captions, pop-up text, a chat-bubble hook, a mock bot B-roll,
// a title slam and an end card. All times in props are OUTPUT seconds (reel/build_props.py
// maps them from the source clips).
import React from "react";
import { AbsoluteFill, Audio, Easing, Freeze, OffthreadVideo, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { INTER, MONTSERRAT, useFonts } from "../screendemo/fonts";

type Seg = { clip: string; from: number; to: number; zoom: number; punch?: [number, number][]; at: number };
type Word = { w: string; t: number; end: number };
type Chip = { t: number; text: string };
export type ReelProps = {
  fps: number;
  segs: Seg[]; // `at` = output start second, punch = [[output second, zoom]]
  words: Word[];
  hideCaptions: [number, number][];
  chat: { t: number; until: number; name: string; text: string };
  sticker: { t: number; until: number; text: string };
  chips: { t: number; until: number; items: Chip[] };
  bot: { t: number; until: number; question: string; answer: string; footer: string[] };
  slam: { t: number; until: number; text: string };
  cta: { t: number; until: number; text: string; brand: string };
  end: { sec: number; title: string; ep: string; line: string; brand: string };
  badge: string;
  sfx: { t: number; src: string; vol?: number }[];
  musicSrc: string | null;
  musicVolume: number;
};

const Y = "#FFD60A";
const ease = Easing.bezier(0.33, 0, 0.2, 1);
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
export const reelFrames = (p: ReelProps) => {
  const last = p.segs[p.segs.length - 1];
  return Math.round((last.at + (last.to - last.from) + p.end.sec) * p.fps);
};

const Card: React.FC<{ style?: React.CSSProperties; children: React.ReactNode }> = ({ style, children }) => (
  <div style={{ background: "#fff", borderRadius: 38, boxShadow: "0 30px 80px rgba(0,0,0,0.35)", padding: 34, fontFamily: INTER, ...style }}>{children}</div>
);

const Dots: React.FC<{ sec: number }> = ({ sec }) => (
  <div style={{ display: "flex", gap: 10, padding: "22px 28px", background: "#E9E9EB", borderRadius: 30, width: "fit-content" }}>
    {[0, 1, 2].map((i) => <div key={i} style={{ width: 16, height: 16, borderRadius: 8, background: "#8E8E93", opacity: 0.4 + 0.6 * Math.max(0, Math.sin(sec * 9 - i * 0.9)) }} />)}
  </div>
);

export const ClientSaidWhat: React.FC<ReelProps> = (p) => {
  useFonts();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const T = frame / fps;
  const last = p.segs[p.segs.length - 1];
  const endAt = last.at + (last.to - last.from);
  const total = endAt + p.end.sec;
  const seg = [...p.segs].reverse().find((s) => T >= s.at) ?? p.segs[0];
  const inEnd = T >= endAt;
  const pop = (t: number, cfg = { damping: 12, stiffness: 170 }) => spring({ fps, frame: frame - Math.round(t * fps), config: cfg, durationInFrames: 18 });
  const vis = (a: number, b: number) => T >= a && T < b;
  const fadeOut = (b: number, d = 0.15) => clamp01((b - T) / d);

  // zoom: segment base, eased punch-ins, small drift so it never feels static
  let z = seg.zoom;
  for (const [at, k] of seg.punch ?? []) if (T >= at) z = z + (k - z) * ease(clamp01((T - at) / 0.18));
  z *= 1 + 0.012 * Math.sin(T * 0.9);
  // slam shake
  const shakeK = vis(p.slam.t, p.slam.t + 0.35) ? (1 - (T - p.slam.t) / 0.35) : 0;
  const shake = shakeK * 14 * Math.sin(T * 90);

  const srcSec = inEnd ? last.to - 0.04 : seg.from + (T - seg.at);
  const video = (
    <AbsoluteFill style={{ transform: `translate(${shake}px, ${shake * 0.6}px) scale(${z})`, transformOrigin: "540px 760px" }}>
      <Freeze frame={Math.round(srcSec * fps)}>
        <OffthreadVideo src={staticFile(`reel/${inEnd ? last.clip : seg.clip}.mp4`)} muted style={{ width: 1080, height: 1920 }} />
      </Freeze>
    </AbsoluteFill>
  );

  // captions: chunks of up to 3 words, chunk breaks at sentence ends; active word in yellow
  const chunks: Word[][] = [];
  for (const w of p.words) {
    const cur = chunks[chunks.length - 1];
    if (!cur || cur.length >= 3 || /[.?!,]$/.test(cur[cur.length - 1].w) || w.t - cur[cur.length - 1].end > 0.4) chunks.push([w]);
    else cur.push(w);
  }
  const chunk = chunks.find((c) => T >= c[0].t - 0.05 && T < (chunks[chunks.indexOf(c) + 1]?.[0].t ?? c[c.length - 1].end + 0.4) - 0.05);
  const capHidden = inEnd || p.hideCaptions.some(([a, b]) => vis(a, b));

  return (
    <AbsoluteFill style={{ background: "#000", fontFamily: MONTSERRAT }}>
      {video}
      {/* bottom gradient for caption legibility */}
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.18) 0%, transparent 18%, transparent 55%, rgba(0,0,0,0.35) 100%)" }} />

      {/* series badge */}
      {!inEnd && (
        <div style={{ position: "absolute", top: 70, left: 0, right: 0, display: "flex", justifyContent: "center", opacity: clamp01(T / 0.4) }}>
          <div style={{ background: Y, color: "#111", fontWeight: 900, fontSize: 30, padding: "10px 22px", borderRadius: 12, letterSpacing: 0.5, transform: "rotate(-2deg)", boxShadow: "0 8px 24px rgba(0,0,0,0.25)" }}>{p.badge}</div>
        </div>
      )}

      {/* hook: chat bubble */}
      {vis(p.chat.t, p.chat.until) && (() => {
        const k = pop(p.chat.t, { damping: 14, stiffness: 140 });
        const typed = T >= p.chat.t + 0.55;
        const kb = pop(p.chat.t + 0.55);
        return (
          <div style={{ position: "absolute", top: 170, left: 60, right: 60, opacity: Math.min(k, fadeOut(p.chat.until)), transform: `translateY(${(1 - k) * -80}px) scale(${0.9 + 0.1 * k})` }}>
            <Card>
              <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 22 }}>
                <div style={{ width: 64, height: 64, borderRadius: 32, background: "linear-gradient(135deg,#A1A1AA,#52525B)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, fontWeight: 700 }}>C</div>
                <div><div style={{ fontSize: 30, fontWeight: 700, color: "#111" }}>{p.chat.name}</div><div style={{ fontSize: 22, color: "#8E8E93" }}>now</div></div>
              </div>
              {!typed ? <Dots sec={T} /> : (
                <div style={{ background: "#E9E9EB", color: "#111", fontSize: 40, lineHeight: 1.28, fontWeight: 500, padding: "24px 30px", borderRadius: 30, borderBottomLeftRadius: 8, transform: `scale(${0.85 + 0.15 * kb})`, transformOrigin: "0 100%" }}>{p.chat.text}</div>
              )}
            </Card>
          </div>
        );
      })()}

      {/* reaction sticker */}
      {vis(p.sticker.t, p.sticker.until) && (() => {
        const k = pop(p.sticker.t);
        return (
          <div style={{ position: "absolute", top: 260, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
            <div style={{ fontSize: 120, fontWeight: 900, color: "#fff", WebkitTextStroke: "6px #111", paintOrder: "stroke", textShadow: "0 10px 30px rgba(0,0,0,0.4)", transform: `rotate(-5deg) scale(${k})`, opacity: fadeOut(p.sticker.until) }}>{p.sticker.text}</div>
          </div>
        );
      })()}

      {/* stat chips */}
      {vis(p.chips.t, p.chips.until) && (
        <div style={{ position: "absolute", top: 190, left: 0, right: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 18, opacity: fadeOut(p.chips.until) }}>
          {p.chips.items.filter((c) => T >= c.t).map((c, i) => {
            const k = pop(c.t);
            return <div key={c.text} style={{ background: i === 2 ? Y : "#fff", color: "#111", fontWeight: 900, fontSize: 54, padding: "14px 30px", borderRadius: 16, transform: `rotate(${i % 2 ? 2 : -2}deg) scale(${k})`, boxShadow: "0 12px 30px rgba(0,0,0,0.3)" }}>{c.text}</div>;
          })}
        </div>
      )}

      {/* bot B-roll (mock chat, not a real recording) */}
      {vis(p.bot.t, p.bot.until) && (() => {
        const k = pop(p.bot.t, { damping: 15, stiffness: 140 });
        const tA = p.bot.t + 0.75;
        const answered = T >= tA;
        const chars = Math.floor(clamp01((T - tA) / 0.9) * p.bot.answer.length);
        return (
          <div style={{ position: "absolute", top: 160, left: 50, right: 50, opacity: Math.min(k, fadeOut(p.bot.until)), transform: `translateY(${(1 - k) * 120}px)` }}>
            <Card style={{ padding: 30 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24 }}>
                <div style={{ width: 56, height: 56, borderRadius: 16, background: "linear-gradient(135deg,#6366F1,#22D3EE)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, fontWeight: 800 }}>AI</div>
                <div style={{ fontSize: 28, fontWeight: 700, color: "#111" }}>Support assistant</div>
                <div style={{ marginLeft: "auto", fontSize: 20, fontWeight: 700, color: "#16A34A", background: "#DCFCE7", padding: "6px 14px", borderRadius: 20 }}>● 24/7</div>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 18 }}>
                <div style={{ background: "#2563EB", color: "#fff", fontSize: 34, fontWeight: 500, padding: "18px 26px", borderRadius: 26, borderBottomRightRadius: 8, maxWidth: "80%", transform: `scale(${pop(p.bot.t + 0.15)})`, transformOrigin: "100% 100%" }}>{p.bot.question}</div>
              </div>
              {!answered ? <Dots sec={T} /> : (
                <div style={{ background: "#F1F5F9", color: "#111", fontSize: 34, lineHeight: 1.3, fontWeight: 500, padding: "18px 26px", borderRadius: 26, borderBottomLeftRadius: 8, maxWidth: "88%" }}>{p.bot.answer.slice(0, chars)}</div>
              )}
              <div style={{ display: "flex", gap: 12, marginTop: 24, flexWrap: "wrap" }}>
                {p.bot.footer.map((f, i) => {
                  const kf = pop(tA + 0.5 + i * 0.35);
                  return T >= tA + 0.5 + i * 0.35 && <div key={f} style={{ fontFamily: MONTSERRAT, fontWeight: 900, fontSize: 30, background: i ? Y : "#111", color: i ? "#111" : "#fff", padding: "10px 18px", borderRadius: 12, transform: `scale(${kf})` }}>{f}</div>;
                })}
              </div>
            </Card>
          </div>
        );
      })()}

      {/* title slam */}
      {vis(p.slam.t, p.slam.until) && (() => {
        const k = spring({ fps, frame: frame - Math.round(p.slam.t * fps), config: { damping: 9, stiffness: 220 }, durationInFrames: 16 });
        return (
          <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", background: `rgba(0,0,0,${0.35 * fadeOut(p.slam.until)})` }}>
            <div style={{ textAlign: "center", fontSize: 150, lineHeight: 0.95, fontWeight: 900, color: Y, WebkitTextStroke: "8px #111", paintOrder: "stroke", transform: `rotate(-4deg) scale(${2.2 - 1.2 * k})`, opacity: Math.min(clamp01(k * 2), fadeOut(p.slam.until)), textShadow: "0 16px 40px rgba(0,0,0,0.5)" }}>
              {p.slam.text.split(" ").map((w, i) => <div key={i}>{w}</div>)}
            </div>
          </AbsoluteFill>
        );
      })()}

      {/* CTA card */}
      {vis(p.cta.t, p.cta.until) && (() => {
        const k = pop(p.cta.t, { damping: 14, stiffness: 140 });
        return (
          <div style={{ position: "absolute", top: 180, left: 0, right: 0, display: "flex", justifyContent: "center", opacity: k, transform: `translateY(${(1 - k) * -60}px)` }}>
            <div style={{ background: "#fff", borderRadius: 28, padding: "22px 34px", display: "flex", alignItems: "center", gap: 20, boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
              <div style={{ fontSize: 70 }}>📩</div>
              <div><div style={{ fontSize: 46, fontWeight: 900, color: "#111" }}>{p.cta.text}</div><div style={{ fontFamily: INTER, fontSize: 30, fontWeight: 600, color: "#555", marginTop: 4 }}>{p.cta.brand}</div></div>
            </div>
          </div>
        );
      })()}

      {/* captions */}
      {!capHidden && chunk && (() => {
        const k = pop(chunk[0].t - 0.05, { damping: 14, stiffness: 260 });
        return (
          <div style={{ position: "absolute", top: 1290, left: 50, right: 50, display: "flex", justifyContent: "center", flexWrap: "wrap", gap: "0 36px", transform: `scale(${0.85 + 0.15 * k})` }}>
            {chunk.map((w, i) => {
              const on = T >= w.t - 0.03 && (i === chunk.length - 1 || T < chunk[i + 1].t - 0.03);
              return <span key={i} style={{ fontSize: 92, fontWeight: 900, textTransform: "uppercase", color: on ? Y : "#fff", WebkitTextStroke: "10px #000", paintOrder: "stroke", textShadow: "0 8px 22px rgba(0,0,0,0.45)", letterSpacing: -1, transform: on ? "scale(1.04)" : undefined, display: "inline-block" }}>{w.w}</span>;
            })}
          </div>
        );
      })()}

      {/* end card over the blurred last frame */}
      {inEnd && (() => {
        const t0 = endAt;
        const kb = clamp01((T - t0) / 0.3);
        return (
          <AbsoluteFill style={{ backdropFilter: `blur(${kb * 22}px)`, background: `rgba(10,10,12,${0.55 * kb})`, alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
            <div style={{ fontSize: 40, fontWeight: 800, color: "#fff", opacity: pop(t0 + 0.05), letterSpacing: 6 }}>{p.end.ep}</div>
            <div style={{ marginTop: 16, textAlign: "center", fontSize: 140, lineHeight: 0.95, fontWeight: 900, color: Y, WebkitTextStroke: "8px #111", paintOrder: "stroke", transform: `rotate(-4deg) scale(${pop(t0 + 0.1)})` }}>{p.end.title.split(" ").map((w, i) => <div key={i}>{w}</div>)}</div>
            <div style={{ marginTop: 50, fontSize: 50, lineHeight: 1.25, fontWeight: 800, color: "#fff", textAlign: "center", opacity: pop(t0 + 0.35) }}>{p.end.line.split(" | ").map((l, i) => <div key={i}>{l}</div>)}</div>
            <div style={{ marginTop: 26, fontFamily: INTER, fontSize: 38, fontWeight: 700, color: "#111", background: "#fff", padding: "12px 30px", borderRadius: 40, opacity: pop(t0 + 0.5) }}>{p.end.brand}</div>
          </AbsoluteFill>
        );
      })()}

      {/* audio: speech per segment, sfx, music */}
      {p.segs.map((s, i) => (
        <Sequence key={i} from={Math.round(s.at * fps)} durationInFrames={Math.round((s.to - s.from) * fps)}>
          <Audio src={staticFile(`reel/${s.clip}.mp4`)} startFrom={Math.round(s.from * fps)} volume={(f) => Math.min(1, f / 2, (Math.round((s.to - s.from) * fps) - f) / 2)} />
        </Sequence>
      ))}
      {p.sfx.map((s, i) => (
        <Sequence key={`sfx${i}`} from={Math.max(0, Math.round(s.t * fps))}>
          <Audio src={staticFile(`reel/sfx/${s.src}.wav`)} volume={s.vol ?? 1} />
        </Sequence>
      ))}
      {p.musicSrc && <Audio src={staticFile(p.musicSrc)} volume={(f) => p.musicVolume * Math.min(1, f / 15) * clamp01((total * fps - f) / 30) * (f / fps > endAt ? 2.2 : 1)} />}
    </AbsoluteFill>
  );
};
