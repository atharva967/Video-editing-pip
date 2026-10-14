// Native replica of the Rekroots employer flow (landing -> dashboard -> new posting ->
// form -> publish -> postings -> applicant pipeline), drawn as real DOM so it stays sharp
// at any zoom and every word is data: company, role, description, requirements, skills.
// Geometry was measured off the product recording (same 1260x684 coordinate space the
// ScreenDemo camera uses; the left sidebar is not drawn, the camera never shows x < 180).
// `t` = seconds into the demo; TL holds the beat times the props JSON keys off.
import React from "react";
import { Easing, interpolate } from "remotion";
import { GROTESK, MONO } from "./fonts";

const SERIF = '"Times New Roman", Times, serif';

export type Job = { title: string; type: string; mode: string; location?: string; description: string; requirements: string[]; skills: string[]; date: string };
export type RekrootsData = {
  company: string;
  greeting?: string;
  stats?: [string, string, string][]; // label, value, sub
  recent?: [string, string][]; // title, meta
  others?: [string, string, string, number][]; // title, line1, published date, applicants
  job?: Job; // single role
  jobs?: Job[]; // several roles posted one after another in the same video (first in full, the rest faster)
  fit?: number; // target length in seconds for the product part; every beat is scaled to match
};
export const jobsOf = (d: RekrootsData): Job[] => (d.jobs?.length ? d.jobs : d.job ? [d.job] : []);

// ---- beat sheet, generated from the number of roles ----
// m scales every beat (1 = full pace). `fit` picks m so the product part lasts that long.
type Span = [number, number];
type FormBeats = { title: Span; loc: Span; scrollA: Span; desc: Span; scrollB: Span; req: Span; skills: Span; publish: number; end: number; fast: boolean };
type Page = { kind: "land" | "dash" | "choose" | "form" | "posts" | "appl"; start: number; end: number; job: number; fb?: FormBeats; final?: boolean };
const formBeats = (s: number, fast: boolean, m: number): FormBeats => {
  const o = (x: number) => s + x * m, sp = (x: number, y: number): Span => [o(x), o(y)];
  return fast
    ? { fast, title: sp(0.4, 1.2), loc: sp(1.25, 1.6), scrollA: sp(1.7, 2.3), desc: sp(2.5, 3.7), scrollB: sp(4.1, 4.7), req: sp(4.9, 5.9), skills: sp(6.1, 7.1), publish: o(8.0), end: o(8.5) }
    : { fast, title: sp(0.7, 2.3), loc: sp(2.4, 3.0), scrollA: sp(3.5, 4.4), desc: sp(4.9, 7.1), scrollB: sp(7.9, 8.7), req: sp(9.1, 11.1), skills: sp(11.9, 13.9), publish: o(16.4), end: o(16.9) };
};
const buildPages = (d: RekrootsData, m: number): Page[] => {
  const jobs = jobsOf(d);
  const pages: Page[] = [{ kind: "land", start: 0, end: 2.2 * m, job: 0 }, { kind: "dash", start: 2.2 * m, end: 5.0 * m, job: 0 }];
  let t = 5.0 * m;
  jobs.forEach((_, i) => {
    const last = i === jobs.length - 1;
    const ch = Math.max(0.9, (i ? 1.1 : 1.6) * m); // room for the pointer to reach the card
    pages.push({ kind: "choose", start: t, end: t + ch, job: i }); t += ch;
    const fb = formBeats(t, i > 0, m);
    pages.push({ kind: "form", start: t, end: fb.end, job: i, fb }); t = fb.end;
    const po = Math.max(1.5, (last ? 3.4 : 2.7) * m);
    pages.push({ kind: "posts", start: t, end: t + po, job: i, final: last }); t += po;
  });
  pages.push({ kind: "appl", start: t, end: t + Math.max(2.4, 4.4 * m), job: jobs.length - 1 });
  return pages;
};
export const paceOf = (d: RekrootsData): number => {
  if (!d.fit) return 1;
  let m = 1;
  for (let k = 0; k < 8; k++) { const p = buildPages(d, m); m *= d.fit / p[p.length - 1].end; }
  return m;
};
export const rekrootsPages = (d: RekrootsData): Page[] => buildPages(d, paceOf(d));

// Everything the ScreenDemo shell needs (camera, clicks, spotlights, captions, pointer
// path), derived from the pages so adding a role never needs hand-timing.
const BASE: [number, number, number] = [182, 42, 1075];
export const rekrootsScript = (d: RekrootsData) => {
  const jobs = jobsOf(d), m = paceOf(d), pages = buildPages(d, m), n = jobs.length;
  const dm = (x: number) => Math.max(0.35, x * m); // camera moves never get snappier than this
  const land = pages[0], dash = pages[1];
  const camera: { o: number; rect: [number, number, number]; dur: number }[] = [{ o: 0, rect: [16, 42, 1075], dur: 0.01 }, { o: 0.3 * m, rect: [130, 171, 860], dur: dm(1.0) }, { o: dash.start, rect: BASE, dur: dm(0.6) }, { o: dash.start + 1.4 * m, rect: [640, 55, 620], dur: dm(0.8) }];
  const clicks: { o: number; x: number; y: number }[] = [{ o: land.end - 0.5, x: 498, y: 612 }, { o: dash.end - 0.5, x: 1172, y: 222 }];
  const spots: { o: number; len: number; box: [number, number, number, number]; label?: string }[] = [{ o: dash.start + 0.5 * m, len: Math.max(0.7, 1.0 * m), box: [221, 292, 1004, 132] }];
  const caps: { o: number; len: number; text: string }[] = [{ o: 0, len: land.end, text: "Start at rekroots.com" }, { o: dash.start, len: dash.end - dash.start, text: `${d.company}'s hiring dashboard at a glance` }];
  const path: [number, number, number][] = [[0, 700, 520], [Math.max(0.3, land.end - 0.75), 498, 612], [land.end, 498, 612], [dash.start + 0.9 * m, 900, 380], [dash.end - 0.7, 1172, 222], [dash.end, 1172, 222]];
  const cap = (o: number, until: number, text: string) => caps.push({ o, len: until - o, text });
  for (const pg of pages) {
    const { start: s, end: e, job: i } = pg, j = jobs[i];
    if (pg.kind === "choose") {
      camera.push({ o: s, rect: [190, 42, 1050], dur: dm(0.6) });
      if (i === 0 && m > 0.8) camera.push({ o: s + 0.6 * m, rect: [640, 170, 600], dur: dm(0.6) });
      clicks.push({ o: e - 0.45, x: 958, y: 362 });
      path.push([e - 0.6, 958, 362], [e, 958, 362]);
      if (i === 0) cap(s, e, m > 0.8 ? "Write the posting yourself, or let AI draft it" : "Create a new posting");
    } else if (pg.kind === "form" && pg.fb) {
      const f = pg.fb;
      if (f.fast) camera.push({ o: s, rect: [200, 86, 1000], dur: dm(0.5) }, { o: f.scrollA[0], rect: [400, 200, 810], dur: dm(0.6) }, { o: f.publish - 0.7 * m, rect: [700, 350, 560], dur: dm(0.5) });
      else camera.push({ o: s, rect: [200, 86, 1000], dur: dm(0.7) }, { o: s + 0.5 * m, rect: [460, 180, 720], dur: dm(0.7) }, { o: f.scrollA[0] - 0.3 * m, rect: BASE, dur: dm(0.6) }, { o: f.scrollA[1] + 0.1 * m, rect: [440, 230, 760], dur: dm(0.7) }, { o: f.publish - 1.1 * m, rect: [700, 350, 560], dur: dm(0.6) });
      clicks.push({ o: f.publish - 0.05, x: 1118, y: 656 });
      if (!f.fast) spots.push({ o: f.skills[1] + 0.1 * m, len: Math.max(0.8, 1.2 * m), box: [538, 576, 372, 30], label: "AI first-round interviews" });
      path.push([f.title[0] - 0.1 * m, 700, 368], [f.title[1] + 0.5 * m, 700, 420], [f.scrollA[1], 760, 470], [f.desc[0] - 0.1 * m, 700, 400], [f.desc[1] + 0.3 * m, 900, 470], [f.req[0] - 0.1 * m, 700, 420], [f.req[1] + 0.1 * m, 760, 520], [f.skills[0] + 0.1 * m, 700, 536], [f.publish - 0.9 * m, 900, 560], [f.publish - 0.3 * m, 1118, 656], [e, 1118, 656]);
      if (f.fast) cap(pages[pages.indexOf(pg) - 1].start, e, `Role ${i + 1}: ${j.title}, posted the same way`);
      else {
        cap(s, f.scrollA[0], n > 1 ? `Role 1: ${j.title}` : "Add the role basics");
        cap(f.scrollA[0], f.skills[0], "Describe the role and what you need");
        cap(f.skills[0], f.publish - 1.1 * m, "Add skills. AI interviews are one checkbox away");
        cap(f.publish - 1.1 * m, e, "Publish in one click");
      }
    } else if (pg.kind === "posts") {
      camera.push({ o: s, rect: BASE, dur: dm(0.6) });
      const rows = pg.final ? n : 1;
      spots.push({ o: s + 0.5 * m, len: Math.max(0.8, e - s - 0.5 * m - 0.6), box: [205, 292, 1021, 90 * rows], label: rows > 1 ? (rows === 2 ? "Both roles live" : `${rows} roles live`) : "Live now" });
      if (pg.final) { clicks.push({ o: e - 0.45, x: 560, y: 336 }); path.push([s + 0.8 * m, 1000, 520], [e - 0.6, 560, 336], [e, 560, 336]); cap(s, e, n > 1 ? "Both roles are live on your postings board" : `${j.title} is live instantly`); }
      else { clicks.push({ o: e - 0.45, x: 1172, y: 222 }); path.push([e - 0.6, 1172, 222], [e, 1172, 222]); cap(s, e, `${j.title} is live instantly`); }
    } else if (pg.kind === "appl") {
      camera.push({ o: s, rect: BASE, dur: dm(0.5) }, { o: s + 1.4 * m, rect: [196, 60, 1044], dur: dm(0.9) });
      spots.push({ o: s + 1.2 * m, len: e - s - 1.2 * m - 0.2, box: [213, 342, 1014, 90], label: "Your hiring pipeline" });
      path.push([s + 1.6 * m, 760, 470], [e, 800, 500]);
      cap(s, e, "Track every applicant through your pipeline");
    }
  }
  const dur = pages[pages.length - 1].end;
  return { dur, camera, clicks, spots, captions: caps.map((c, k) => ({ ...c, n: k + 1 })), path };
};

const C = { bg: "#F3F1EF", card: "#F7F5F3", line: "#E3DFDA", ink: "#0C0C0C", sub: "#6F6A65", mono: "#7B756F", red: "#DC2626", field: "#EFECE9", focus: "#F7E8E6", focusLine: "#E0736C", green: "#1F9D55", greenBg: "#E3F3E8" };
const ease = Easing.bezier(0.45, 0, 0.15, 1);
const cl = (x: number, a: number, b: number) => interpolate(x, [a, b], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
const typed = (s: string, t: number, [a, b]: readonly [number, number]) => s.slice(0, Math.round(s.length * cl(t, a, b)));

const Label: React.FC<{ x: number; y: number; children: React.ReactNode; color?: string }> = ({ x, y, children, color }) => (
  <div style={{ position: "absolute", left: x, top: y, fontFamily: MONO, fontWeight: 500, fontSize: 10.3, letterSpacing: 2.6, color: color ?? C.mono, whiteSpace: "nowrap", textTransform: "uppercase" }}>{children}</div>
);
const H1: React.FC<{ x: number; y: number; children: React.ReactNode }> = ({ x, y, children }) => (
  <div style={{ position: "absolute", left: x, top: y, fontFamily: GROTESK, fontWeight: 700, fontSize: 29.6, lineHeight: 1, color: C.ink, whiteSpace: "nowrap", letterSpacing: -0.3 }}>{children}</div>
);
const Sub: React.FC<{ x: number; y: number; children: React.ReactNode; size?: number }> = ({ x, y, children, size = 14.5 }) => (
  <div style={{ position: "absolute", left: x, top: y, fontFamily: SERIF, fontSize: size, color: C.sub, whiteSpace: "nowrap" }}>{children}</div>
);
const Btn: React.FC<{ x: number; y: number; w: number; h?: number; red?: boolean; children: React.ReactNode; dim?: boolean }> = ({ x, y, w, h = 30, red, children, dim }) => (
  <div style={{ position: "absolute", left: x, top: y, width: w, height: h, borderRadius: 6, background: red ? C.red : C.card, border: red ? "none" : `1px solid ${C.line}`, color: red ? "#fff" : C.sub, fontFamily: SERIF, fontSize: 13.5, fontWeight: red ? 700 : 400, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, opacity: dim ? 0.55 : 1, boxShadow: red ? "0 4px 12px rgba(220,38,38,0.28)" : "none" }}>{children}</div>
);
const Badge: React.FC = () => (
  <span style={{ fontFamily: MONO, fontWeight: 700, fontSize: 8.4, letterSpacing: 1.2, color: C.green, background: C.greenBg, border: "1px solid #BFE3CB", borderRadius: 4, padding: "4px 8px" }}>PUBLISHED</span>
);

const TopBar: React.FC = () => (
  <>
    <div style={{ position: "absolute", left: 178, top: 42, right: 0, height: 56, borderBottom: `1px solid ${C.line}`, background: C.bg }} />
    <div style={{ position: "absolute", left: 205, top: 68, fontFamily: SERIF, fontSize: 13, color: C.ink }}><span style={{ color: C.mono, marginRight: 10 }}>/</span>Overview</div>
    <div style={{ position: "absolute", left: 462, top: 60, width: 450, height: 30, borderRadius: 6, background: C.field, border: `1px solid ${C.line}`, display: "flex", alignItems: "center", padding: "0 12px", gap: 9, fontFamily: SERIF, fontSize: 12.5, color: "#9A948E" }}>
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9A948E" strokeWidth="2.4"><circle cx="11" cy="11" r="7" /><path d="M20 20l-4-4" /></svg>
      Search jobs, companies, people...
      <span style={{ marginLeft: "auto", fontFamily: MONO, fontSize: 9.5 }}>⌘K</span>
    </div>
    <div style={{ position: "absolute", left: 1146, top: 70, fontFamily: MONO, fontWeight: 500, fontSize: 9.2, letterSpacing: 2.2, color: C.mono, display: "flex", alignItems: "center", gap: 9 }}>PRIVATE BETA<span style={{ width: 8, height: 8, borderRadius: 4, background: "#22C55E" }} /></div>
  </>
);

const Landing: React.FC = () => (
  <div style={{ position: "absolute", inset: 0, background: "#FBF7F6", overflow: "hidden" }}>
    <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(220,38,38,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(220,38,38,0.045) 1px, transparent 1px)", backgroundSize: "44px 44px" }} />
    <div style={{ position: "absolute", left: 150, top: 80, width: 960, height: 620, borderRadius: "50%", background: "radial-gradient(circle, rgba(220,38,38,0.16) 0%, rgba(220,38,38,0) 62%)" }} />
    <div style={{ position: "absolute", left: 20, top: 74, display: "flex", alignItems: "center", gap: 9, fontFamily: MONO, fontWeight: 700, fontSize: 11.5, letterSpacing: 3, color: C.ink }}>
      <span style={{ width: 20, height: 20, borderRadius: 4, background: C.ink, color: "#fff", fontFamily: "Georgia, serif", fontSize: 13, letterSpacing: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>R</span>REKROOTS
    </div>
    <div style={{ position: "absolute", left: 364, top: 77, display: "flex", gap: 34, fontFamily: SERIF, fontSize: 12.5, color: C.sub }}><span>Browse jobs</span><span>For recruiters</span><span>Pricing</span></div>
    <div style={{ position: "absolute", left: 1036, top: 70, border: `1px solid ${C.red}`, color: C.red, background: "rgba(220,38,38,0.07)", borderRadius: 20, padding: "6px 16px", fontFamily: MONO, fontWeight: 700, fontSize: 9.5, letterSpacing: 2 }}>DASHBOARD →</div>
    <div style={{ position: "absolute", left: 0, right: 0, top: 158, display: "flex", justifyContent: "center" }}>
      <span style={{ border: "1px solid rgba(220,38,38,0.45)", color: C.red, background: "rgba(220,38,38,0.06)", borderRadius: 20, padding: "6px 16px", fontFamily: MONO, fontWeight: 500, fontSize: 9, letterSpacing: 2 }}>⚡ NOW WITH AI-POWERED INTERVIEWS →</span>
    </div>
    <div style={{ position: "absolute", left: 0, right: 0, top: 206, textAlign: "center", fontFamily: GROTESK, fontWeight: 700, fontSize: 96, lineHeight: 1.16, letterSpacing: -3, color: C.ink }}>
      Find work.<br />Hire <span style={{ color: "#E5484D" }}>designers.</span>
    </div>
    <div style={{ position: "absolute", left: 340, width: 520, top: 470, textAlign: "center", fontFamily: SERIF, fontSize: 15.5, lineHeight: 1.55, color: C.sub }}>
      The modern job board for the people who ship. Browse roles, build a public profile, apply with one resume - or post openings and hire faster with AI interviews.
    </div>
    <div style={{ position: "absolute", left: 406, top: 590, width: 184, height: 42, borderRadius: 24, background: C.red, color: "#fff", fontFamily: MONO, fontWeight: 700, fontSize: 10.5, letterSpacing: 2.4, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 22px rgba(220,38,38,0.35)" }}>GET STARTED →</div>
    <div style={{ position: "absolute", left: 614, top: 590, width: 164, height: 42, borderRadius: 24, border: `1px solid #C9C3BD`, color: C.ink, fontFamily: MONO, fontWeight: 700, fontSize: 10.5, letterSpacing: 2.4, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,255,255,0.6)" }}>BROWSE JOBS</div>
  </div>
);

const Dashboard: React.FC<{ d: RekrootsData }> = ({ d }) => {
  const stats = d.stats ?? [["Active postings", "21", "· 6 in draft"], ["Total applicants", "64", ""], ["Upcoming interviews", "0", ""], ["Drafts", "6", ""], ["Verified", "No", ""]];
  const recent = d.recent ?? [["Senior AI Engineer", "2 applicants · 7/22/2026"], ["Data Scientist", "1 applicant · 6/11/2026"]];
  const xs = [225, 425, 627, 831, 1036];
  return (
    <>
      <Label x={219} y={151}>{d.greeting ?? "Welcome back"}</Label>
      <H1 x={218} y={174}>{d.company}</H1>
      <Sub x={219} y={216}>Active postings, new applicants, and what's in your pipeline.</Sub>
      <Btn x={1010} y={206} w={96}>Edit company</Btn>
      <Btn x={1116} y={206} w={110} red>+ New posting</Btn>
      {stats.map(([k, v, s], i) => (
        <div key={i} style={{ position: "absolute", left: xs[i], top: 296, width: 186, height: 124, borderRadius: 8, background: "#FCFBFA", border: `1px solid ${C.line}`, padding: "20px 20px" }}>
          <div style={{ fontFamily: MONO, fontWeight: 500, fontSize: 9.4, letterSpacing: 2.2, color: C.mono, textTransform: "uppercase", lineHeight: 1.5, height: 30 }}>{k}</div>
          <div style={{ fontFamily: GROTESK, fontWeight: 700, fontSize: 29, color: C.ink, marginTop: 6 }}>{v}</div>
          {s && <div style={{ fontFamily: MONO, fontSize: 9, color: C.mono, marginTop: 2 }}>{s}</div>}
        </div>
      ))}
      <div style={{ position: "absolute", left: 225, top: 452, width: 997, height: 260, borderRadius: 8, background: C.card, border: `1px solid ${C.line}` }}>
        <div style={{ padding: "20px 24px 14px", display: "flex", justifyContent: "space-between" }}>
          <div><div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 14.5, color: C.ink }}>Recent postings</div><div style={{ fontFamily: SERIF, fontSize: 11.5, color: C.sub, marginTop: 3 }}>Your five most recent jobs.</div></div>
          <div style={{ fontFamily: SERIF, fontSize: 11.5, color: C.sub }}>View all ↗</div>
        </div>
        {recent.map(([title, meta], i) => (
          <div key={i} style={{ borderTop: `1px solid ${C.line}`, padding: "15px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div><div style={{ fontFamily: SERIF, fontSize: 13.5, color: C.ink }}>{title}</div><div style={{ fontFamily: MONO, fontSize: 8.6, letterSpacing: 1.6, color: C.mono, marginTop: 5, textTransform: "uppercase" }}>{meta}</div></div>
            <Badge />
          </div>
        ))}
      </div>
    </>
  );
};

const PostHeader: React.FC = () => (
  <>
    <Label x={219} y={151}>New posting</Label>
    <H1 x={218} y={174}>Post a role</H1>
    <Sub x={219} y={216}>Answer a few questions to auto-generate your JD, or write it yourself.</Sub>
    <Btn x={1168} y={206} w={58}>Cancel</Btn>
  </>
);

const Chooser: React.FC = () => (
  <>
    <PostHeader />
    {[[275, "Generate with AI", "Answer a few quick questions and we'll draft the full JD for you.", true], [737, "Write it yourself", "Fill in the form directly with your own job description.", false]].map(([x, t, s, ai]) => (
      <div key={t as string} style={{ position: "absolute", left: x as number, top: 292, width: 440, height: 138, borderRadius: 8, background: C.card, border: `1px solid ${C.line}`, padding: "24px 26px" }}>
        <div style={{ width: 30, height: 30, borderRadius: 7, background: ai ? "#FBD9D7" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", color: ai ? C.red : C.sub, fontSize: 17 }}>{ai ? "✦" : "✎"}</div>
        <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 14.5, color: C.ink, marginTop: 14 }}>{t}</div>
        <div style={{ fontFamily: SERIF, fontSize: 11.5, color: C.sub, marginTop: 6 }}>{s}</div>
      </div>
    ))}
  </>
);

const Field: React.FC<{ x: number; y: number; w: number; h?: number; label: string; hint?: string; focus?: boolean; mono?: boolean; children?: React.ReactNode; placeholder?: string; select?: boolean }> = ({ x, y, w, h = 30, label, hint, focus, mono, children, placeholder, select }) => (
  <>
    <div style={{ position: "absolute", left: x, top: y - 19, fontFamily: SERIF, fontSize: 11, color: C.sub }}>{label}</div>
    {hint && <div style={{ position: "absolute", left: x, width: w, top: y - 19, textAlign: "right", fontFamily: SERIF, fontSize: 10, color: "#9A948E" }}>{hint}</div>}
    <div style={{ position: "absolute", left: x, top: y, width: w, height: h, borderRadius: 6, background: focus ? C.focus : C.field, border: `1px solid ${focus ? C.focusLine : C.line}`, boxShadow: focus ? "0 0 0 3px rgba(220,38,38,0.08)" : "none", padding: h > 40 ? "11px 13px" : "0 13px", display: "flex", alignItems: h > 40 ? "flex-start" : "center", fontFamily: mono ? MONO : SERIF, fontSize: mono ? 11.2 : 13.5, lineHeight: mono ? 1.62 : 1.2, color: C.ink, whiteSpace: "pre-wrap", overflow: "hidden" }}>
      {children || <span style={{ color: "#A39D97" }}>{placeholder}</span>}
      {select && <span style={{ marginLeft: "auto", color: C.sub, fontSize: 11 }}>⌄</span>}
    </div>
  </>
);
const Caret: React.FC<{ t: number }> = ({ t }) => <span style={{ display: "inline-block", width: 1.4, height: "1.05em", background: C.ink, marginLeft: 1, verticalAlign: "text-bottom", opacity: Math.floor(t * 2.5) % 2 ? 0.15 : 1 }} />;

const Form: React.FC<{ j: Job; TL: FormBeats; t: number }> = ({ j, TL, t }) => {
  const scroll = 420 * ease(cl(t, TL.scrollA[0], TL.scrollA[1])) + 168 * ease(cl(t, TL.scrollB[0], TL.scrollB[1]));
  const title = typed(j.title, t, TL.title);
  const loc = typed(j.location ?? "", t, TL.loc);
  const desc = typed(j.description, t, TL.desc);
  const reqAll = j.requirements.join("\n");
  const req = typed(reqAll, t, TL.req);
  const nChips = Math.floor(cl(t, TL.skills[0], TL.skills[1]) * j.skills.length + 0.001);
  const focus = t < TL.title[0] - 0.3 ? "" : t < TL.title[1] + 0.05 ? "title" : j.location && t < TL.loc[1] + 0.2 ? "loc" : t < TL.scrollA[0] ? "" : t < TL.desc[0] - 0.3 ? "" : t < TL.scrollB[0] ? "desc" : t < TL.req[0] - 0.3 ? "" : t < TL.skills[0] - 0.3 ? "req" : t < TL.publish - (TL.fast ? 0.8 : 1.6) ? "skills" : "";
  const publishing = t >= TL.publish;
  const Y = (docY: number) => docY - scroll; // document y -> screen y
  const card = (y: number, h: number) => <div style={{ position: "absolute", left: 262, top: Y(y), width: 913, height: h, borderRadius: 8, background: C.card, border: `1px solid ${C.line}` }} />;
  const section = (y: number, t1: string, t2: string) => (
    <>
      <div style={{ position: "absolute", left: 290, top: Y(y), fontFamily: SERIF, fontWeight: 700, fontSize: 13.5, color: C.ink }}>{t1}</div>
      <div style={{ position: "absolute", left: 290, top: Y(y + 22), width: 210, fontFamily: SERIF, fontSize: 10.5, color: C.sub }}>{t2}</div>
    </>
  );
  return (
    <div style={{ position: "absolute", left: 0, top: 99, width: 1260, height: 585, overflow: "hidden" }}>
      <div style={{ position: "absolute", left: 0, top: -99, width: 1260, height: 684 }}>
        <div style={{ position: "absolute", left: 0, top: -scroll, width: 1260, height: 684 }}><PostHeader /></div>
        {card(295, 282)}
        {section(325, "Basics", "The headline info candidates see first.")}
        <Field x={545} y={Y(352)} w={597} label="Job title" focus={focus === "title"} placeholder="Senior Frontend Engineer">{title && <span>{title}{focus === "title" && <Caret t={t} />}</span>}</Field>
        <Field x={545} y={Y(432)} w={290} label="Employment type" select>{j.type}</Field>
        <Field x={852} y={Y(432)} w={290} label="Work mode" select>{j.mode}</Field>
        <Field x={545} y={Y(512)} w={597} label="Location" hint="Optional" placeholder="Remote · Worldwide" focus={focus === "loc"}>{loc && <span>{loc}{focus === "loc" && <Caret t={t} />}</span>}</Field>
        {card(597, 112)}
        {section(627, "Compensation", "Leave blank if you prefer not to disclose.")}
        <Field x={545} y={Y(650)} w={185} label="Currency">USD</Field>
        <Field x={750} y={Y(650)} w={185} label="Salary min (annual)" placeholder="120000" />
        <Field x={955} y={Y(650)} w={187} label="Salary max (annual)" placeholder="180000" />
        {card(729, 468)}
        {section(759, "Role detail", "What's the role and who's a fit?")}
        <Field x={545} y={Y(782)} w={597} h={128} mono label="Description" hint="Markdown supported" focus={focus === "desc"} placeholder={"## About the role\n\nWhat the role involves, the team, what you'll ship."}>{desc && <span>{desc}{focus === "desc" && <Caret t={t} />}</span>}</Field>
        <Field x={545} y={Y(946)} w={597} h={98} mono label="Requirements" hint="Optional · Markdown supported" focus={focus === "req"} placeholder={"- 5+ years with React\n- Strong TypeScript\n- US timezone"}>{req && <span>{req}{focus === "req" && <Caret t={t} />}</span>}</Field>
        <Field x={545} y={Y(1080)} w={597} h={62} label="Skills" hint="Type and press Enter to add" focus={focus === "skills"} placeholder="react, typescript, postgres...">
          {nChips > 0 && (
            <span style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {j.skills.slice(0, nChips).map((s) => <span key={s} style={{ fontFamily: MONO, fontWeight: 500, fontSize: 8.4, letterSpacing: 1.3, textTransform: "uppercase", color: C.ink, background: "#E6E1DC", border: `1px solid ${C.line}`, borderRadius: 4, padding: "4px 7px", whiteSpace: "nowrap" }}>{s} ×</span>)}
            </span>
          )}
        </Field>
        <div style={{ position: "absolute", left: 545, top: Y(1154), fontFamily: SERIF, fontSize: 11, color: C.sub }}>AI Interview</div>
        <div style={{ position: "absolute", left: 545, top: Y(1172), display: "flex", alignItems: "center", gap: 9, fontFamily: SERIF, fontSize: 12.5, color: C.sub }}>
          <span style={{ width: 14, height: 14, borderRadius: 3, border: `1.5px solid #A39D97`, background: "#fff" }} />Enable AI-powered first-round interview for this job
        </div>
        {card(1215, 56)}
        <div style={{ position: "absolute", left: 290, top: Y(1236), fontFamily: SERIF, fontSize: 11, color: C.sub }}>Drafts stay private. Published postings appear on /jobs immediately.</div>
        <Btn x={978} y={Y(1228)} w={82}>Save draft</Btn>
        <Btn x={1070} y={Y(1228)} w={94} red dim={publishing}>{publishing ? "Publishing…" : "➤ Publish now"}</Btn>
      </div>
    </div>
  );
};

const Postings: React.FC<{ d: RekrootsData; t: number; pg: Page }> = ({ d, t, pg }) => {
  const line = (j: Job) => `${j.location ? j.location.split(",")[0] + " · " : ""}${j.location ? j.type.toLowerCase() : j.type} · ${j.mode.toLowerCase()}`;
  const mine: [string, string, string, number][] = jobsOf(d).slice(0, pg.job + 1).reverse().map((j) => [j.title, line(j), j.date, 0]);
  const rows: [string, string, string, number][] = [...mine, ...(d.others ?? [["Senior AI Engineer", "Full-time · remote", "7/22/2026", 2], ["Data Scientist", "Delhi · full-time · onsite", "6/11/2026", 1], ["Business Development Manager / Sr. Manager / Associate Director", "Pune · full-time · onsite", "5/22/2026", 0]] as [string, string, string, number][])];
  const toast = cl(t, pg.start + 0.15, pg.start + 0.4) * (1 - cl(t, pg.end - 0.3, pg.end - 0.05));
  const hover = !!pg.final && t > pg.end - 0.9;
  const shown = rows.slice(0, 4);
  return (
    <>
      <Label x={205} y={151}>Employer</Label>
      <H1 x={204} y={174}>Postings</H1>
      <Sub x={205} y={216}>Every role you've posted, across all statuses.</Sub>
      <Btn x={1116} y={206} w={110} red>+ New posting</Btn>
      <div style={{ position: "absolute", left: 205, top: 292, width: 1021, borderRadius: 8, background: C.card, border: `1px solid ${C.line}`, overflow: "hidden" }}>
        {shown.map(([title, l1, date, n], i) => (
          <div key={i} style={{ height: 90, borderTop: i ? `1px solid ${C.line}` : "none", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", background: i === 0 && hover ? "#FAF1EF" : "transparent" }}>
            <div>
              <div style={{ fontFamily: SERIF, fontSize: 13.5, color: i === 0 && hover ? C.red : C.ink }}>{title}</div>
              <div style={{ fontFamily: SERIF, fontSize: 11, color: C.sub, marginTop: 5 }}>{l1}</div>
              <div style={{ fontFamily: MONO, fontSize: 8.6, letterSpacing: 1.6, color: C.mono, marginTop: 6 }}>PUBLISHED {date}</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <span style={{ fontFamily: MONO, fontSize: 10, color: C.mono }}>⚇ {n}</span><Badge />
              <span style={{ fontFamily: SERIF, fontSize: 11.5, color: C.sub, border: `1px solid ${C.line}`, borderRadius: 5, padding: "5px 10px" }}>Edit</span>
            </div>
          </div>
        ))}
      </div>
      <div style={{ position: "absolute", left: 877, top: 600 + (1 - toast) * 16, width: 350, height: 44, borderRadius: 8, background: "#E9F6EE", border: "1px solid #BFE3CB", boxShadow: "0 10px 26px rgba(0,0,0,0.10)", display: "flex", alignItems: "center", gap: 12, padding: "0 16px", fontFamily: SERIF, fontSize: 13, color: "#17663A", opacity: toast }}>
        <span style={{ width: 16, height: 16, borderRadius: 8, border: "1.5px solid #1F9D55", color: "#1F9D55", fontSize: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>✓</span>Posting published.
      </div>
    </>
  );
};

const Applicants: React.FC<{ d: RekrootsData; j: Job }> = ({ d, j }) => {
  const stages = ["Sourced", "Submitted", "Screening", "Interview", "Offer", "Rejected", "Withdrawn"];
  return (
    <>
      <Label x={219} y={151}>← All postings</Label>
      <Label x={219} y={192}>{d.company}</Label>
      <H1 x={218} y={214}>{j.title}</H1>
      <Sub x={219} y={256}>Applicants, grouped by pipeline stage.</Sub>
      <div style={{ position: "absolute", left: 219, top: 296, fontFamily: SERIF, fontSize: 11.5, color: C.sub, border: `1px solid ${C.line}`, borderRadius: 5, padding: "6px 12px", background: C.card }}>Pipeline view →</div>
      {stages.map((s, i) => (
        <div key={s} style={{ position: "absolute", left: 219 + i * 144.6, top: 348, width: 134, height: 78, borderRadius: 8, background: "#FCFBFA", border: `1px solid ${C.line}`, padding: "16px 16px" }}>
          <div style={{ fontFamily: MONO, fontWeight: 500, fontSize: 8.4, letterSpacing: 1.8, color: C.mono, textTransform: "uppercase" }}>{s}</div>
          <div style={{ fontFamily: GROTESK, fontWeight: 700, fontSize: 24, color: C.ink, marginTop: 8 }}>0</div>
        </div>
      ))}
      <div style={{ position: "absolute", left: 219, top: 452, width: 1003, height: 200, borderRadius: 8, background: C.card, border: `1px solid ${C.line}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontFamily: GROTESK, fontWeight: 700, fontSize: 17, color: C.ink }}>No applicants yet</div>
        <div style={{ fontFamily: SERIF, fontSize: 12, color: C.sub, marginTop: 10, textAlign: "center", lineHeight: 1.5 }}>Once the posting is published on /jobs, applicants will show up here in<br />the submitted stage.</div>
      </div>
    </>
  );
};

// smooth pointer between waypoints: [time, x, y] (generated by rekrootsScript)
const Pointer: React.FC<{ t: number; PATH: [number, number, number][] }> = ({ t, PATH }) => {
  let i = 0;
  while (i < PATH.length - 2 && t > PATH[i + 1][0]) i++;
  const [t0, x0, y0] = PATH[i], [t1, x1, y1] = PATH[i + 1];
  const k = ease(cl(t, t0, t1));
  return (
    <svg width="26" height="30" viewBox="0 0 26 30" style={{ position: "absolute", left: x0 + (x1 - x0) * k - 3, top: y0 + (y1 - y0) * k - 2, filter: "drop-shadow(0 2px 3px rgba(0,0,0,0.35))" }}>
      <path d="M3 2 L3 23 L8.6 18 L12.4 27 L16 25.4 L12.3 16.6 L20 16.4 Z" fill="#111" stroke="#fff" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
};

export const RekrootsApp: React.FC<{ t: number; data: RekrootsData; w: number; h: number }> = ({ t, data, w, h }) => {
  const pages = rekrootsPages(data), jobs = jobsOf(data);
  const pg = pages.find((x) => t >= x.start && t < x.end) ?? pages[pages.length - 1];
  const fade = cl(t, pg.start, pg.start + 0.22); // each page eases in like a fast route change
  const path = React.useMemo(() => rekrootsScript(data).path, [data]);
  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: w, height: h, background: C.bg, overflow: "hidden" }}>
      {pg.kind === "land" ? <Landing /> : (
        <>
          <div style={{ position: "absolute", inset: 0, opacity: 0.35 + 0.65 * fade, transform: `translateY(${(1 - fade) * 6}px)` }}>
            {pg.kind === "dash" && <Dashboard d={data} />}
            {pg.kind === "choose" && <Chooser />}
            {pg.kind === "form" && pg.fb && <Form j={jobs[pg.job]} TL={pg.fb} t={t} />}
            {pg.kind === "posts" && <Postings d={data} t={t} pg={pg} />}
            {pg.kind === "appl" && <Applicants d={data} j={jobs[pg.job]} />}
          </div>
          <TopBar />
        </>
      )}
      <Pointer t={t} PATH={path} />
    </div>
  );
};
