// Buildify mascot: a toy building block with rubber-hose arms and legs.
// mascot({ pose, face }) -> SVG string. viewBox 0 0 440 540, feet on y=520.
(function () {
  const O = "#121113", W = 7;
  const FRONT = "#3B7EFF", TOP = "#9CC2FF", SIDE = "#2457D6", SOLE = "#3B7EFF";

  const line = (d, w = 13) => `<path d="${d}" fill="none" stroke="${O}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
  const glove = (x, y, r = 24) =>
    `<circle cx="${x}" cy="${y}" r="${r}" fill="#fff" stroke="${O}" stroke-width="${W}"/>` +
    `<path d="M${x - r * .45} ${y - r * .15} q${r * .2} ${r * .35} ${r * .5} ${r * .3}" fill="none" stroke="${O}" stroke-width="4" stroke-linecap="round"/>`;
  const sneaker = (x, y, dir = 1) =>
    `<g transform="translate(${x} ${y}) scale(${dir} 1)"><path d="M-30 0 q-4 -30 22 -34 q20 -2 30 12 q22 6 26 22 z" fill="#fff" stroke="${O}" stroke-width="${W}" stroke-linejoin="round"/>` +
    `<rect x="-34" y="-4" width="86" height="12" rx="6" fill="${SOLE}" stroke="${O}" stroke-width="${W - 1}"/>` +
    `<path d="M2 -24 l8 8 M10 -28 l8 8" stroke="${O}" stroke-width="4" stroke-linecap="round"/></g>`;
  const palm = (x, y, rot = -8) => {
    const f = (fx, fy, h) => `<rect x="${fx - 10}" y="${fy - h}" width="20" height="${h + 16}" rx="10" fill="#fff" stroke="${O}" stroke-width="${W - 1}"/>`;
    return `<g transform="translate(${x} ${y}) rotate(${rot})">${f(-22, -22, 30)}${f(-7, -26, 38)}${f(8, -25, 36)}${f(23, -19, 28)}` +
      `<rect x="-34" y="-28" width="70" height="64" rx="28" fill="#fff" stroke="${O}" stroke-width="${W}"/>` +
      `<rect x="-52" y="-4" width="30" height="20" rx="10" transform="rotate(-30 -36 6)" fill="#fff" stroke="${O}" stroke-width="${W - 1}"/></g>`;
  };
  const pointer = (x, y, ang) => `<g transform="translate(${x} ${y}) rotate(${ang})"><rect x="8" y="-11" width="50" height="22" rx="11" fill="#fff" stroke="${O}" stroke-width="${W - 1}"/>${glove(0, 0, 25)}</g>`;

  // the block: front face + top + side, front corners rounded
  const block = (dx = 0, dy = 0) => {
    const x = 110 + dx, y = 200 + dy, s = 210, d = 42;
    return `<g>
      <path d="M${x + 20} ${y} L${x + d + 20} ${y - d} L${x + s + d} ${y - d} L${x + s} ${y} Z" fill="${TOP}" stroke="${O}" stroke-width="${W}" stroke-linejoin="round"/>
      <path d="M${x + s} ${y} L${x + s + d} ${y - d} L${x + s + d} ${y + s - d - 16} L${x + s} ${y + s - 4} Z" fill="${SIDE}" stroke="${O}" stroke-width="${W}" stroke-linejoin="round"/>
      <rect x="${x}" y="${y}" width="${s}" height="${s}" rx="34" fill="${FRONT}" stroke="${O}" stroke-width="${W}"/>
      <path d="M${x + 22} ${y + 34} q-4 36 0 70" stroke="rgba(255,255,255,.4)" stroke-width="10" fill="none" stroke-linecap="round"/>
    </g>`;
  };

  // faces are drawn relative to the block's front centre (cx, cy)
  const eyes = (cx, cy, h = 24, look = [0, 0]) =>
    [-36, 36].map((o) => `<ellipse cx="${cx + o}" cy="${cy}" rx="15" ry="${h}" fill="${O}"/><circle cx="${cx + o + 4 + look[0]}" cy="${cy - h * .4 + look[1]}" r="6" fill="#fff"/>`).join("");
  const blush = (cx, cy) => `<ellipse cx="${cx - 66}" cy="${cy + 30}" rx="17" ry="10" fill="#FF9DB5"/><ellipse cx="${cx + 66}" cy="${cy + 30}" rx="17" ry="10" fill="#FF9DB5"/>`;
  const faces = {
    stern: (cx, cy) => eyes(cx, cy, 20) + line(`M${cx - 60} ${cy - 40} l38 10 M${cx + 60} ${cy - 40} l-38 10`, 9) + line(`M${cx - 20} ${cy + 48} h40`, 8),
    plead: (cx, cy) => eyes(cx, cy, 27, [0, 2]) + `<circle cx="${cx - 40}" cy="${cy + 8}" r="4" fill="#fff"/><circle cx="${cx + 32}" cy="${cy + 8}" r="4" fill="#fff"/>` +
      line(`M${cx - 58} ${cy - 40} q16 -14 34 -4 M${cx + 58} ${cy - 40} q-16 -14 -34 -4`, 8) + line(`M${cx - 18} ${cy + 50} q9 -10 18 0 q9 10 18 0`, 7) + blush(cx, cy),
    wow: (cx, cy) => eyes(cx, cy, 25) + line(`M${cx - 58} ${cy - 46} q18 -14 36 -4 M${cx + 22} ${cy - 50} q18 -10 36 4`, 8) +
      `<ellipse cx="${cx}" cy="${cy + 52}" rx="15" ry="19" fill="${O}"/><ellipse cx="${cx}" cy="${cy + 58}" rx="8" ry="7" fill="#FF7A93"/>`,
    cheeky: (cx, cy) => `<ellipse cx="${cx - 36}" cy="${cy}" rx="15" ry="22" fill="${O}"/><circle cx="${cx - 31}" cy="${cy - 9}" r="6" fill="#fff"/>` +
      line(`M${cx + 20} ${cy + 2} q16 -14 32 0`, 8) + line(`M${cx - 30} ${cy + 40} q32 26 62 -6`, 8) + blush(cx, cy),
    happy: (cx, cy) => line(`M${cx - 52} ${cy + 4} q16 -22 32 0 M${cx + 20} ${cy + 4} q16 -22 32 0`, 8) +
      `<path d="M${cx - 32} ${cy + 30} q32 44 64 0 z" fill="${O}" stroke="${O}" stroke-width="6" stroke-linejoin="round"/><path d="M${cx - 14} ${cy + 46} q14 12 28 0" fill="#FF7A93"/>` + blush(cx, cy),
  };

  // block front centre at (215, 305) when undisplaced
  const poses = {
    stop: (f) => line("M175 410 L168 482") + line("M255 410 L262 482") + sneaker(160, 516, -1) + sneaker(270, 516) +
      line("M112 330 Q70 360 78 410") + glove(78, 414) + line("M352 290 Q400 260 396 200") + block() + palm(398, 182) + faces[f](215, 300),
    plead: (f) => line("M178 410 L172 482") + line("M252 410 L258 482") + sneaker(164, 516, -1) + sneaker(266, 516) +
      block() + faces[f](215, 290) + line("M112 340 Q140 392 192 392") + line("M330 340 Q296 392 244 392") + glove(198, 392, 24) + glove(236, 392, 24),
    sit: (f) => block(0, 70) + line("M170 482 Q140 500 104 504") + line("M262 482 Q296 500 330 504") + sneaker(90, 520, -1) + sneaker(346, 520) +
      line("M112 410 Q78 450 92 486") + glove(94, 490) + faces[f](215, 368) + line("M330 420 Q370 380 352 330") + glove(350, 326),
    walk: (f) => line("M180 410 Q160 450 128 480") + line("M252 410 Q270 452 296 486") + sneaker(124, 512, -1) + sneaker(300, 518) +
      line("M112 330 Q80 360 90 404") + glove(92, 410) + block() + faces[f](215, 300) + line("M352 320 Q404 360 394 420") + pointer(394, 432, 82),
    cheer: (f) => line("M175 410 L166 482") + line("M255 410 L264 482") + sneaker(158, 516, -1) + sneaker(272, 516) +
      line("M112 290 Q70 250 66 180") + glove(66, 172) + line("M352 270 Q398 220 392 160") + glove(392, 152) + block() + faces[f](215, 300),
  };

  window.mascot = ({ pose = "stop", face = "stern" } = {}) =>
    `<svg class="mascot" viewBox="0 0 440 540" xmlns="http://www.w3.org/2000/svg" stroke-linejoin="round">${poses[pose](face)}</svg>`;
})();
