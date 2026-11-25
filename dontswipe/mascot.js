// "Blocky", a Buildify mascot built from the logo's three stacked blocks.
// mascot({ pose, face }) -> SVG string. viewBox 0 0 420 520, feet on y=500.
(function () {
  const O = "#121113", W = 7;
  const B1 = "#3B7EFF", B2 = "#5B9AFF", B3 = "#8BB8FF", NAVY = "#1E2A4A";
  const limb = (d) => `<path d="${d}" fill="none" stroke="${O}" stroke-width="30" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="${B1}" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"/>`;
  const leg = (d) => `<path d="${d}" fill="none" stroke="${O}" stroke-width="32" stroke-linecap="round"/><path d="${d}" fill="none" stroke="${NAVY}" stroke-width="18" stroke-linecap="round"/>`;
  const hand = (x, y, r = 20) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#fff" stroke="${O}" stroke-width="${W}"/>`;
  const shoe = (x, y, flip = 1) => `<path d="M${x - 26 * flip} ${y} q0 -24 ${30 * flip} -24 q${24 * flip} 0 ${30 * flip} 24 z" fill="#fff" stroke="${O}" stroke-width="${W}" stroke-linejoin="round"/>`;
  const finger = (x, y, h) => `<rect x="${x - 9}" y="${y - h}" width="18" height="${h + 14}" rx="9" fill="#fff" stroke="${O}" stroke-width="${W - 1}"/>`;
  const palm = (x, y) => `<g transform="translate(${x} ${y}) rotate(-6)">${finger(-21, -26, 34)}${finger(-6, -30, 42)}${finger(9, -28, 40)}${finger(24, -22, 32)}<rect x="-34" y="-30" width="70" height="66" rx="26" fill="#fff" stroke="${O}" stroke-width="${W}"/><rect x="-46" y="-6" width="26" height="16" rx="8" transform="rotate(-35 -34 2)" fill="#fff" stroke="${O}" stroke-width="${W - 1}"/></g>`;
  const point = (x, y, ang) => `<g transform="translate(${x} ${y}) rotate(${ang})"><rect x="6" y="-8" width="52" height="20" rx="10" fill="#fff" stroke="${O}" stroke-width="${W - 1}"/>${hand(0, 0, 24)}</g>`;

  // head stack (logo blocks), body block
  const body = (dy = 0) => `
    <rect x="236" y="${54 + dy}" width="96" height="72" rx="20" fill="${B3}" stroke="${O}" stroke-width="${W}"/>
    <rect x="168" y="${102 + dy}" width="150" height="84" rx="24" fill="${B2}" stroke="${O}" stroke-width="${W}"/>
    <rect x="80" y="${164 + dy}" width="260" height="236" rx="46" fill="${B1}" stroke="${O}" stroke-width="${W}"/>
    <path d="M104 ${190 + dy} q-6 40 -2 80" stroke="rgba(255,255,255,.35)" stroke-width="10" fill="none" stroke-linecap="round"/>`;

  const eye = (cx, cy, px, py, lid = 0) =>
    `<ellipse cx="${cx}" cy="${cy}" rx="27" ry="31" fill="#fff" stroke="${O}" stroke-width="${W - 1}"/>` +
    `<circle cx="${cx + px}" cy="${cy + py}" r="13" fill="${O}"/><circle cx="${cx + px + 5}" cy="${cy + py - 5}" r="4.5" fill="#fff"/>` +
    (lid ? `<path d="M${cx - 29} ${cy - 4} q29 ${-lid} 58 0 v-30 h-58 z" fill="${B1}" stroke="${O}" stroke-width="${W - 1}" stroke-linejoin="round"/>` : "");
  const faces = {
    stern: (dy) => eye(165, 262 + dy, 0, 3) + eye(255, 262 + dy, 0, 3) +
      `<path d="M136 ${222 + dy} l52 12 M284 ${222 + dy} l-52 12" stroke="${O}" stroke-width="9" stroke-linecap="round"/>` +
      `<path d="M182 ${336 + dy} h56" stroke="${O}" stroke-width="8" stroke-linecap="round"/>`,
    plead: (dy) => eye(165, 262 + dy, 3, -7) + eye(255, 262 + dy, -3, -7) +
      `<circle cx="158" cy="${256 + dy}" r="6" fill="#fff"/><circle cx="248" cy="${256 + dy}" r="6" fill="#fff"/>` +
      `<path d="M140 ${224 + dy} q22 -16 46 -2 M280 ${224 + dy} q-22 -16 -46 -2" stroke="${O}" stroke-width="8" fill="none" stroke-linecap="round"/>` +
      `<path d="M188 ${340 + dy} q11 -12 22 0 q11 12 22 0" stroke="${O}" stroke-width="7" fill="none" stroke-linecap="round"/>` +
      `<ellipse cx="128" cy="${310 + dy}" rx="16" ry="9" fill="#FFB3C6"/><ellipse cx="292" cy="${310 + dy}" rx="16" ry="9" fill="#FFB3C6"/>`,
    wow: (dy) => eye(165, 258 + dy, -4, 0) + eye(255, 258 + dy, -4, 0) +
      `<path d="M140 ${212 + dy} q24 -18 48 -4 M232 ${208 + dy} q24 -14 48 4" stroke="${O}" stroke-width="8" fill="none" stroke-linecap="round"/>` +
      `<ellipse cx="210" cy="${336 + dy}" rx="17" ry="21" fill="${O}"/><ellipse cx="210" cy="${343 + dy}" rx="9" ry="8" fill="#FF7A93"/>`,
    cheeky: (dy) => eye(165, 262 + dy, 9, 2, 14) +
      `<path d="M228 ${262 + dy} q27 -18 54 0" stroke="${O}" stroke-width="8" fill="none" stroke-linecap="round"/>` +
      `<path d="M140 ${222 + dy} q24 -8 48 4 M232 ${226 + dy} q24 -16 48 -6" stroke="${O}" stroke-width="8" fill="none" stroke-linecap="round"/>` +
      `<path d="M178 ${330 + dy} q36 26 66 -8" stroke="${O}" stroke-width="8" fill="none" stroke-linecap="round"/>` +
      `<ellipse cx="292" cy="${308 + dy}" rx="16" ry="9" fill="#FFB3C6"/>`,
  };

  const poses = {
    // right hand up in a "stop" palm, left arm relaxed
    stop: (f) => leg("M170 400 L162 474") + leg("M250 400 L258 474") + shoe(158, 500) + shoe(262, 500) +
      limb("M86 290 Q50 330 58 380") + hand(58, 386) +
      body() + limb("M334 280 Q380 250 378 180") + palm(378, 168) + faces[f](0),
    // hands clasped under the face, pleading
    plead: (f) => leg("M170 400 L166 474") + leg("M250 400 L254 474") + shoe(162, 500) + shoe(258, 500) +
      body() + faces[f](0) + limb("M88 300 Q120 372 192 376") + limb("M332 300 Q300 372 228 376") + hand(196, 378, 22) + hand(226, 378, 22),
    // sitting on the ground, legs out front, one hand on cheek
    sit: (f) => leg("M150 452 Q120 486 80 488") + leg("M268 452 Q300 486 340 488") + shoe(72, 500, -1) + shoe(348, 500) +
      body(60) + limb("M86 360 Q50 410 74 452") + hand(76, 456) + faces[f](60) + limb("M334 360 Q366 420 300 400") + hand(292, 398),
    // walking off to the right, glancing back, pointing down (at the caption)
    walk: (f) => leg("M175 400 Q150 440 120 470") + leg("M250 400 Q268 444 290 480") + shoe(118, 494, -1) + shoe(296, 500) +
      limb("M86 290 Q56 320 66 362") + hand(68, 368) + body() + faces[f](0) + limb("M334 300 Q378 340 372 402") + point(372, 410, 80),
  };

  window.mascot = ({ pose = "stop", face = "stern" } = {}) =>
    `<svg class="mascot" viewBox="0 0 420 520" xmlns="http://www.w3.org/2000/svg" stroke-linejoin="round">${poses[pose](face)}</svg>`;
})();
