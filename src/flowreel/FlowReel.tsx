import React from "react";
import {
  AbsoluteFill,
  Audio,
  OffthreadVideo,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

// One vertical reel built from Google Flow B-roll clips with Hinglish captions.
// No talking head yet: captions carry the script. All times are in seconds.

export type Scene = {
  src: string; // path under public/
  sec: number; // how long the scene plays
  from?: number; // trim start inside the clip
  zoom?: number; // extra scale to hide black bars
  origin?: string; // transform origin for that zoom
  volume?: number; // clip's own ambient audio (0 = muted)
  blur?: { x: number; y: number; w: number; h: number }; // soften a stray on-screen label
};

export type Caption = {
  t: number;
  end: number;
  text: string;
  hl?: string[]; // words drawn in the accent colour
  kind?: "hook" | "cap" | "q";
};

export type FlowReelProps = {
  id: string;
  fps: number;
  scenes: Scene[];
  captions: Caption[];
  end: { sec: number; keyword: string; line: string; tag: string };
  musicSrc: string | null;
  musicStart: number;
  musicVolume: number;
  sfxSrc: string | null;
};

const ACCENT = "#FFD21F";
const FONT = "Inter, 'Inter Display', sans-serif";

export const totalFrames = (p: FlowReelProps) =>
  Math.round((p.scenes.reduce((a, s) => a + s.sec, 0) + p.end.sec) * p.fps);

const SceneClip: React.FC<{ s: Scene; frames: number }> = ({ s, frames }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  // Punch in on the cut, then a slow push.
  const punch = interpolate(f, [0, 7], [1.1, 1], { extrapolateRight: "clamp" });
  const push = interpolate(f, [0, frames], [1, 1.06]);
  const scale = (s.zoom ?? 1) * punch * push;
  return (
    <AbsoluteFill style={{ backgroundColor: "#000", overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `scale(${scale})`, transformOrigin: s.origin ?? "50% 50%" }}>
        <OffthreadVideo
          src={staticFile(s.src)}
          startFrom={Math.round((s.from ?? 0) * fps)}
          volume={s.volume ?? 0}
          muted={!s.volume}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
        {s.blur ? (
          <div
            style={{
              position: "absolute",
              left: s.blur.x,
              top: s.blur.y,
              width: s.blur.w,
              height: s.blur.h,
              backdropFilter: "blur(22px)",
              WebkitBackdropFilter: "blur(22px)",
              maskImage: "radial-gradient(closest-side, #000 60%, transparent)",
              WebkitMaskImage: "radial-gradient(closest-side, #000 60%, transparent)",
            }}
          />
        ) : null}
      </AbsoluteFill>
      {/* Soft gradient so captions read on bright footage. */}
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0) 28%, rgba(0,0,0,0) 45%, rgba(0,0,0,0.45) 75%, rgba(0,0,0,0.2) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};

const clean = (w: string) => w.replace(/[^\p{L}\p{N}%]/gu, "").toLowerCase();

const Words: React.FC<{ c: Caption; color: string; hlColor: string }> = ({ c, color, hlColor }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const hl = new Set((c.hl ?? []).flatMap((h) => h.split(" ")).map(clean));
  const words = c.text.split(" ");
  const step = Math.max(2, Math.min(5, Math.floor(((c.end - c.t) * fps * 0.45) / words.length)));
  return (
    <>
      {words.map((w, i) => {
        const p = spring({ frame: f - i * step, fps, config: { damping: 14, stiffness: 220, mass: 0.6 } });
        const on = hl.has(clean(w));
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              marginRight: "0.26em",
              opacity: interpolate(p, [0, 0.3], [0, 1], { extrapolateRight: "clamp" }),
              transform: `translateY(${(1 - p) * 26}px) scale(${0.8 + 0.2 * p})`,
              color: on ? hlColor : color,
            }}
          >
            {w}
          </span>
        );
      })}
    </>
  );
};

const CaptionView: React.FC<{ c: Caption }> = ({ c }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const dur = (c.end - c.t) * fps;
  const out = interpolate(f, [dur - 5, dur], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const kind = c.kind ?? "cap";

  if (kind === "q") {
    const pop = spring({ frame: f, fps, config: { damping: 12, stiffness: 180 } });
    return (
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", opacity: out }}>
        <div
          style={{
            marginTop: 220,
            width: 900,
            padding: "44px 52px",
            borderRadius: 36,
            background: "rgba(255,255,255,0.96)",
            boxShadow: "0 24px 80px rgba(0,0,0,0.45)",
            transform: `scale(${0.85 + 0.15 * pop}) rotate(${(1 - pop) * -3}deg)`,
            fontFamily: FONT,
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 34, fontWeight: 800, letterSpacing: 2, color: "#7A6A00", marginBottom: 16 }}>
            AAPKA JAWAB?
          </div>
          <div style={{ fontSize: 64, fontWeight: 900, lineHeight: 1.12, color: "#111" }}>
            <Words c={c} color="#111" hlColor="#C99700" />
          </div>
        </div>
      </AbsoluteFill>
    );
  }

  const hook = kind === "hook";
  return (
    <AbsoluteFill
      style={{
        alignItems: "center",
        justifyContent: hook ? "flex-start" : "flex-end",
        paddingTop: hook ? 300 : 0,
        paddingBottom: hook ? 0 : 560,
        opacity: out,
      }}
    >
      <div
        style={{
          width: 940,
          textAlign: "center",
          fontFamily: FONT,
          fontWeight: 900,
          fontSize: hook ? 92 : 80,
          lineHeight: 1.1,
          letterSpacing: -1,
          color: "#fff",
          textShadow: "0 4px 0 rgba(0,0,0,0.55), 0 0 28px rgba(0,0,0,0.6)",
          WebkitTextStroke: "2px rgba(0,0,0,0.35)",
        }}
      >
        <Words c={c} color="#fff" hlColor={ACCENT} />
      </div>
    </AbsoluteFill>
  );
};

const EndCard: React.FC<{ end: FlowReelProps["end"] }> = ({ end }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const a = spring({ frame: f, fps, config: { damping: 13 } });
  const b = spring({ frame: f - 8, fps, config: { damping: 11, stiffness: 200 } });
  const c = spring({ frame: f - 18, fps, config: { damping: 14 } });
  const pulse = 1 + 0.03 * Math.sin((f / fps) * Math.PI * 2.2);
  return (
    <AbsoluteFill
      style={{
        background: "radial-gradient(circle at 50% 40%, #23201A 0%, #0B0B0C 70%)",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: FONT,
        color: "#fff",
        textAlign: "center",
      }}
    >
      <div style={{ fontSize: 64, fontWeight: 800, opacity: a, transform: `translateY(${(1 - a) * 30}px)` }}>
        Comment
      </div>
      <div
        style={{
          marginTop: 24,
          padding: "18px 56px",
          borderRadius: 28,
          background: ACCENT,
          color: "#111",
          fontSize: 150,
          fontWeight: 900,
          letterSpacing: 2,
          transform: `scale(${(0.6 + 0.4 * b) * pulse})`,
          opacity: Math.min(1, b * 2),
        }}
      >
        {end.keyword}
      </div>
      <div
        style={{
          marginTop: 44,
          width: 860,
          fontSize: 50,
          fontWeight: 700,
          lineHeight: 1.25,
          opacity: c,
          transform: `translateY(${(1 - c) * 30}px)`,
        }}
      >
        {end.line}
      </div>
      <div style={{ marginTop: 90, fontSize: 46, fontWeight: 800, color: ACCENT, opacity: c }}>{end.tag}</div>
    </AbsoluteFill>
  );
};

export const FlowReel: React.FC<FlowReelProps> = (p) => {
  const { fps } = useVideoConfig();
  const total = totalFrames(p);
  let at = 0;
  const seqs = p.scenes.map((s, i) => {
    const from = Math.round(at * fps);
    const dur = Math.round(s.sec * fps);
    at += s.sec;
    return (
      <Sequence key={i} from={from} durationInFrames={dur}>
        <SceneClip s={s} frames={dur} />
      </Sequence>
    );
  });
  const endFrom = Math.round(at * fps);
  const musicVol = (f: number) =>
    interpolate(f, [0, 12, total - 30, total], [0, p.musicVolume, p.musicVolume, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });

  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {seqs}
      {p.captions.map((c, i) => (
        <Sequence key={`c${i}`} from={Math.round(c.t * fps)} durationInFrames={Math.round((c.end - c.t) * fps)}>
          <CaptionView c={c} />
          {p.sfxSrc ? <Audio src={staticFile(p.sfxSrc)} volume={0.35} /> : null}
        </Sequence>
      ))}
      <Sequence from={endFrom}>
        <EndCard end={p.end} />
        {p.sfxSrc ? <Audio src={staticFile(p.sfxSrc)} volume={0.5} /> : null}
      </Sequence>
      {p.musicSrc ? (
        <Audio src={staticFile(p.musicSrc)} startFrom={Math.round(p.musicStart * fps)} volume={musicVol} />
      ) : null}
    </AbsoluteFill>
  );
};
