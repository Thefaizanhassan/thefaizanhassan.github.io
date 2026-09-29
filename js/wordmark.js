// The hero name: a vanilla port of codeLight.tsx / codeDark.tsx (the Originkit "Vector Wordmark").
// Same WebGL shader, text atlas, snapping handles, sweep, colours and timing, without React.
// The light or dark preset follows the dark-mode class on <html> and swaps on "themechange".
//
// The TSX centres the word in a 1200 x 800 box with 200px letters and gives the handles, pointer
// reach and dashes fixed pixel sizes for that. Here the word is a left-aligned (centred on phones)
// heading sized by CSS, so those sizes scale with the letters and keep the TSX's proportions.
(function () {
  const host = document.querySelector(".wordmark");
  const canvas = host && host.querySelector("canvas");
  if (!canvas) return;

  const WORDMARK = {
    text: "FAIZAN",
    font: { family: "Inter, system-ui, sans-serif", weight: "800", style: "normal", size: 200, letterSpacing: "-0.02em" },
    reach: 290,
    speed: 50,
    damping: 60,
    handles: { size: 109, spread: 27, labels: true },
    // Both presets also paint a background (#FFFFFF / #000000). That is already the page's
    // background in each theme, so the canvas stays transparent.
    light: { textColor: "#000000", shade: "#000000", accent: "#000000" }, // codeLight.tsx
    dark: { textColor: "#FFFFFF", shade: "#FFFFFF", accent: "#FFFFFF" } // codeDark.tsx
  };

  const MAX_DPR = 2;
  const MAX_TEX = 4096;
  const REF_HEIGHT = 800; // the TSX box height its pixel sizes were designed for
  const BOX_EM = 1.45; // the CSS box is this many letter-heights (--f) tall
  const PAD = 0.12; // atlas padding around the glyphs, in font sizes

  const HANDLES = 3;
  const CELL_ASPECT = 0.6;
  const DRIFT_X = 0.08;
  const DRIFT_Y = 0.04;
  const DRIFT_RATE = 1.3;
  const DRIFT_RATE_Y = 1.3 * 1.3;
  const SWEEP_RATE = 0.5;

  const SWEEP_BAND = 0.28;
  const RESNAP = 0.2;
  const DAMP_REF = 20;
  const SPEED_REF = 50;
  const DOT_DIAMETER = 4 / 440;
  const DOT_PITCH = 12 / 440;
  const STILL_X = 0.62; // where the sweep rests when reduced motion is on

  const clamp = (x, a, b) => (x < a ? a : x > b ? b : x);
  const fract = (x) => x - Math.floor(x);

  function parseColor(input, fallback) {
    if (!input) return fallback;
    let s = String(input).trim();
    if (s.slice(0, 4).toLowerCase() === "var(") {
      const comma = s.indexOf(",");
      const close = s.lastIndexOf(")");
      if (comma < 0 || close < comma) return fallback;
      s = s.slice(comma + 1, close).trim();
    }
    if (s[0] === "#") {
      let h = s.slice(1);
      if (h.length === 3 || h.length === 4) {
        let x = "";
        for (const c of h) x += c + c;
        h = x;
      }
      if (h.length === 6) h += "ff";
      if (h.length !== 8 || /[^0-9a-f]/i.test(h)) return fallback;
      return [
        parseInt(h.slice(0, 2), 16) / 255,
        parseInt(h.slice(2, 4), 16) / 255,
        parseInt(h.slice(4, 6), 16) / 255,
        parseInt(h.slice(6, 8), 16) / 255
      ];
    }
    const m = s.match(/^(rgba?|hsla?)\(([^)]*)\)$/i);
    if (!m) return fallback;
    const parts = m[2].split(/[\s,/]+/).filter((p) => p.length > 0);
    if (parts.length < 3) return fallback;
    const num = (t, scale) => {
      const v = parseFloat(t);
      if (!Number.isFinite(v)) return 0;
      return t.indexOf("%") >= 0 ? (v / 100) * scale : v;
    };
    const alpha = parts.length > 3 ? clamp(num(parts[3], 1), 0, 1) : 1;
    if (m[1].toLowerCase().slice(0, 3) === "rgb") {
      return [
        clamp(num(parts[0], 255) / 255, 0, 1),
        clamp(num(parts[1], 255) / 255, 0, 1),
        clamp(num(parts[2], 255) / 255, 0, 1),
        alpha
      ];
    }
    const hh = fract(parseFloat(parts[0]) / 360);
    const sat = clamp(num(parts[1], 1), 0, 1);
    const li = clamp(num(parts[2], 1), 0, 1);
    const q = li < 0.5 ? li * (1 + sat) : li + sat - li * sat;
    const p = 2 * li - q;
    const chan = (t) => {
      const u = fract(t);
      if (u < 1 / 6) return p + (q - p) * 6 * u;
      if (u < 1 / 2) return q;
      if (u < 2 / 3) return p + (q - p) * (2 / 3 - u) * 6;
      return p;
    };
    return [chan(hh + 1 / 3), chan(hh), chan(hh - 1 / 3), alpha];
  }

  const VERT = `
    attribute vec2 aPos;
    varying vec2 vUv;
    void main() {
        vUv = aPos * 0.5 + 0.5;
        gl_Position = vec4(aPos, 0.0, 1.0);
    }`;

  // The TSX shader with two uniforms added: uOrigin places the word (the TSX always centres it)
  // and uDash sets the dash count (the TSX's fixed 100). The blur taps are also skipped away from
  // the word, where the mask is zero anyway; the 4px margin keeps sampling exact at its edges.
  const FRAG = `
    precision highp float;

    uniform sampler2D uMap;
    uniform vec2 uRes;
    uniform vec2 uAtlas;
    uniform vec2 uOrigin;
    uniform vec2 uPtr;
    uniform float uReach;
    uniform vec3 uText;
    uniform vec3 uShade;
    uniform vec4 uAccent;
    uniform vec2 uV0;
    uniform vec2 uV1;
    uniform vec2 uV2;
    uniform float uHalf;
    uniform float uDash;

    varying vec2 vUv;

    float hash(vec2 p) {
        return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
    }

    vec2 blurRG(vec2 uv, float e) {
        vec4 sum = vec4(0.0);
        for (int i = 0; i < 6; i++) {
            float fi = float(i);
            float th = radians(fi / 6.0 * 360.0);
            vec2 dir = vec2(cos(th), sin(th));
            vec2 off = dir * (hash(vec2(fi, uv.x + uv.y)) + e);
            sum += texture2D(uMap, uv + off * e);
        }
        return (sum / 6.0).rg;
    }

    vec2 segment(vec2 p, vec2 a, vec2 b) {
        vec2 ab = b - a;
        vec2 ap = p - a;
        float t = clamp(dot(ap, ab) / max(dot(ab, ab), 1e-8), 0.0, 1.0);
        return vec2(length(ap - ab * t), t);
    }

    float stroke(float d, float lw, float px) {
        return 1.0 - smoothstep(lw, lw + px, d);
    }

    float dashedLine(vec2 p, vec2 a, vec2 b, float lw, float px) {
        vec2 s = segment(p, a, b);
        float dash = step(0.5, fract(s.y * length(b - a) * uDash));
        return stroke(s.x, lw, px) * dash;
    }

    float boxEdge(vec2 p, vec2 c, float h, float lw, float px) {
        vec2 q = abs(p - c) - vec2(h);
        float d = length(max(q, 0.0)) + min(max(q.x, q.y), 0.0);
        return stroke(abs(d), lw, px);
    }

    void main() {
        float aspect = uRes.x / uRes.y;

        vec2 E = (vUv * uRes - uOrigin) / uAtlas;
        float inside = step(0.0, E.x) * step(E.x, 1.0) * step(0.0, E.y) * step(E.y, 1.0);
        vec2 safeUv = clamp(E, 0.0, 1.0);

        float b = clamp(1.0 - E.y * 3.5, 0.0, 1.0) * 0.008;
        vec2 soft = vec2(0.0);
        vec2 sharp = vec2(0.0);
        vec2 margin = 4.0 / uAtlas;
        if (E.x > -margin.x && E.x < 1.0 + margin.x && E.y > -margin.y && E.y < 1.0 + margin.y) {
            soft = blurRG(safeUv, b);
            sharp = blurRG(safeUv, b * 0.1);
        }

        float d = length((vUv - uPtr) / vec2(1.0, aspect));
        float k = 1.0 - pow(smoothstep(0.0, max(uReach, 1e-4), d), 3.0);

        float mask = mix(soft.r, sharp.g, k) * inside;
        vec3 fill = mix(uShade, uText, smoothstep(0.0, 1.0, E.y));

        vec2 P = vec2(vUv.x * aspect, vUv.y);
        float px = 1.0 / uRes.y;
        float lw = px * 0.2;
        float lines = max(
            max(dashedLine(P, uV0, uV1, lw, px), dashedLine(P, uV1, uV2, lw, px)),
            dashedLine(P, uV2, uV0, lw, px)
        );
        float boxes = max(
            max(boxEdge(P, uV0, uHalf, lw, px), boxEdge(P, uV1, uHalf, lw, px)),
            boxEdge(P, uV2, uHalf, lw, px)
        );
        float A = max(lines, boxes) * uAccent.a * (1.0 - vUv.y);

        vec4 card = vec4(fill * mask, mask);
        vec4 comp = vec4(uAccent.rgb * A, A) + card * (1.0 - A);

        gl_FragColor = comp * pow(clamp(E.y, 0.0, 1.0), 0.7);
    }`;

  function compile(gl, vs, fs) {
    const make = (type, src) => {
      const sh = gl.createShader(type);
      gl.shaderSource(sh, src);
      gl.compileShader(sh);
      return sh;
    };
    const p = gl.createProgram();
    gl.attachShader(p, make(gl.VERTEX_SHADER, vs));
    gl.attachShader(p, make(gl.FRAGMENT_SHADER, fs));
    gl.bindAttribLocation(p, 0, "aPos");
    gl.linkProgram(p);
    return gl.getProgramParameter(p, gl.LINK_STATUS) ? p : null;
  }

  function fontString(f, px) {
    return `${f.style} ${f.weight} ${px}px ${f.family}`;
  }

  // Red channel: the filled word. Green channel: a dotted outline of it.
  function buildAtlas(text, f, drawFontPx, dpr) {
    const probe = document.createElement("canvas").getContext("2d");
    if (!probe) return null;

    const setFont = (ctx, px) => {
      ctx.font = fontString(f, px);
      try {
        if ("letterSpacing" in ctx) ctx.letterSpacing = f.letterSpacing;
      } catch (e) {}
    };

    const measure = (px) => {
      setFont(probe, px);
      const m = probe.measureText(text);
      const asc = m.actualBoundingBoxAscent || px * 0.8;
      const desc = m.actualBoundingBoxDescent || px * 0.22;
      return { w: Math.max(1, m.width), asc, desc };
    };

    let fpx = Math.max(8, drawFontPx * dpr);
    let m = measure(fpx);
    let pad = fpx * PAD;
    const over = Math.max((m.w + pad * 2) / MAX_TEX, (m.asc + m.desc + pad * 2) / MAX_TEX);
    if (over > 1) {
      fpx = Math.max(8, fpx / over);
      m = measure(fpx);
      pad = fpx * PAD;
    }

    const w = Math.max(1, Math.ceil(m.w + pad * 2));
    const h = Math.max(1, Math.ceil(m.asc + m.desc + pad * 2));
    const atlas = document.createElement("canvas");
    atlas.width = w;
    atlas.height = h;
    const ctx = atlas.getContext("2d");
    if (!ctx) return null;

    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, w, h);
    setFont(ctx, fpx);
    ctx.textBaseline = "alphabetic";
    ctx.textAlign = "left";
    ctx.globalCompositeOperation = "lighter";

    ctx.fillStyle = "#ff0000";
    ctx.fillText(text, pad, pad + m.asc);

    const block = m.asc + m.desc;
    ctx.strokeStyle = "#00ff00";
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = Math.max(1, block * DOT_DIAMETER);
    ctx.setLineDash([0, Math.max(2, block * DOT_PITCH)]);
    ctx.strokeText(text, pad, pad + m.asc);

    const cssPerPx = drawFontPx / fpx;
    return { canvas: atlas, cssW: w * cssPerPx, cssH: h * cssPerPx, textW: m.w / fpx };
  }

  const attrs = {
    alpha: true,
    antialias: false,
    depth: false,
    stencil: false,
    premultipliedAlpha: true,
    powerPreference: "high-performance"
  };
  const gl = canvas.getContext("webgl2", attrs) || canvas.getContext("webgl", attrs);
  if (!gl) return; // No WebGL: the plain FAIZAN fallback text stays
  const isGL2 = typeof WebGL2RenderingContext !== "undefined" && gl instanceof WebGL2RenderingContext;

  const prog = compile(gl, VERT, FRAG);
  if (!prog) return;
  const U = {};
  ["uMap", "uRes", "uAtlas", "uOrigin", "uPtr", "uReach", "uText", "uShade", "uAccent", "uV0", "uV1", "uV2", "uHalf", "uDash"].forEach((n) => {
    U[n] = gl.getUniformLocation(prog, n);
  });

  const quad = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, quad);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  gl.disable(gl.BLEND);

  const tex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 255]));
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  const root = document.documentElement;
  const cfg = WORDMARK;
  const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

  const labels = [];
  if (cfg.handles.labels) {
    for (let i = 0; i < HANDLES; i += 1) {
      const el = document.createElement("span");
      el.className = "wordmark-label";
      host.appendChild(el);
      labels.push(el);
    }
  }

  // codeDark in dark mode, codeLight otherwise
  let colors;
  function applyTheme() {
    const preset = root.classList.contains("dark-mode") ? cfg.dark : cfg.light;
    const accent = parseColor(preset.accent, [1, 1, 1, 0.4]);
    colors = {
      text: parseColor(preset.textColor, [0.859, 0.918, 0.992, 1]),
      shade: parseColor(preset.shade, [0.035, 0.063, 0.102, 1]),
      accent
    };
    const labelColor = `rgb(${Math.round(accent[0] * 255)}, ${Math.round(accent[1] * 255)}, ${Math.round(accent[2] * 255)})`;
    labels.forEach((el) => {
      el.style.color = labelColor;
    });
  }

  let boxW = 1;
  let boxH = 1;
  let boxDirty = true;
  let centred = false;
  let dpr = 1;
  let bufW = 0;
  let bufH = 0;

  let atlasRatioW = 1;
  let atlasRatioH = 1;
  let textRatioW = 3.7; // glyph run width in font sizes, measured on each atlas build
  let atlasKey = "";

  // Letter size: set by the CSS box height, and never wider than the box
  function drawFontPx() {
    return Math.max(8, Math.min(boxH / BOX_EM, (boxW * 0.98) / textRatioW));
  }

  // Sizes the TSX gives in pixels for its 200px letters, scaled to ours
  function scale() {
    return drawFontPx() / cfg.font.size;
  }

  // Bottom-left corner of the atlas (which includes PAD around the glyphs), in CSS px
  function origin() {
    const px = drawFontPx();
    const x = centred ? (boxW - atlasRatioW * px) / 2 : -PAD * px;
    return { x, y: 0 };
  }

  function resize() {
    boxW = Math.max(1, host.offsetWidth);
    boxH = Math.max(1, host.offsetHeight);
    centred = getComputedStyle(host).textAlign === "center";
    dpr = Math.min(MAX_DPR, window.devicePixelRatio || 1);
    const w = Math.max(1, Math.round(boxW * dpr));
    const h = Math.max(1, Math.round(boxH * dpr));
    if (w === bufW && h === bufH) return;
    bufW = w;
    bufH = h;
    canvas.width = w;
    canvas.height = h;
  }

  function rebuildAtlas() {
    const f = cfg.font;
    const px = drawFontPx();
    const atlas = buildAtlas(cfg.text || " ", f, px, dpr);
    if (!atlas) return;
    atlasRatioW = Math.max(1e-4, atlas.cssW / px);
    atlasRatioH = Math.max(1e-4, atlas.cssH / px);
    textRatioW = atlas.textW;

    // Rebuild once the web font arrives
    if (document.fonts) {
      try {
        const probe = fontString(f, 64);
        if (!document.fonts.check(probe)) {
          const again = () => {
            atlasKey = "";
            refreshStill();
          };
          document.fonts.load(probe, cfg.text).then(again, again);
        }
      } catch (e) {}
    }
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, atlas.canvas);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    const cw = atlas.canvas.width;
    const ch = atlas.canvas.height;
    const pot = (cw & (cw - 1)) === 0 && (ch & (ch - 1)) === 0;

    if (isGL2 || pot) {
      gl.generateMipmap(gl.TEXTURE_2D);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    } else {
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    }
  }

  const target = { x: -0.5, y: 0.5 };
  const eased = { x: -0.5, y: 0.5 };
  const cells = [];
  const verts = [];
  for (let i = 0; i < HANDLES; i += 1) {
    cells.push({ x: -0.5, y: 0.5 });
    verts.push({ x: -0.5, y: 0.5 });
  }
  let hasPointer = false;
  let sweepClock = 0;
  let driftT = 0;

  function snap(x, y, cw, ch) {
    const cx = Math.floor(x / cw);
    const cy = Math.floor(y / ch);
    const found = [];
    for (let i = -1; i <= 1; i += 1) {
      for (let j = -1; j <= 1; j += 1) {
        const px = (cx + i + 0.5) * cw;
        const py = (cy + j + 0.5) * ch;
        found.push({ x: px, y: py, d: Math.hypot(px - x, py - y) });
      }
    }
    found.sort((a, b) => a.d - b.d);
    for (let i = 0; i < HANDLES; i += 1) {
      cells[i].x = found[i + 1].x;
      cells[i].y = found[i + 1].y;
    }
  }

  // As in the TSX: once the pointer moves over the wordmark, the reveal follows it.
  // Touch is ignored so a swipe on a phone doesn't stop the sweep.
  host.addEventListener("pointermove", (e) => {
    if (e.pointerType === "touch" || motionQuery.matches) return;
    const r = host.getBoundingClientRect();
    if (r.width <= 0 || r.height <= 0) return;
    hasPointer = true;
    target.x = (e.clientX - r.left) / r.width;
    target.y = 1 - (e.clientY - r.top) / r.height;
  });

  function sync() {
    if (boxDirty) {
      boxDirty = false;
      resize();
    }
    const f = cfg.font;
    const key = [cfg.text, f.family, f.weight, f.style, f.letterSpacing, dpr, Math.ceil(drawFontPx() / 64)].join("|");
    if (key !== atlasKey) {
      atlasKey = key;
      rebuildAtlas();
    }
  }

  // Grid cells for the handles: the TSX's spread, in its 800px box, scaled to our letters
  function cellSize() {
    const cw = Math.max(0.01, ((cfg.handles.spread / 100) * REF_HEIGHT * scale()) / boxH);
    return { cw, ch: cw * CELL_ASPECT };
  }

  // Height of the sweep: SWEEP_BAND of the way up the word
  function sweepY() {
    return origin().y / boxH + SWEEP_BAND * ((atlasRatioH * drawFontPx()) / boxH);
  }

  function step(dt) {
    const rate = Math.max(0, cfg.speed) / SPEED_REF;
    const { cw, ch } = cellSize();
    const aspect = boxW / boxH;

    if (!hasPointer) {
      target.x += dt * SWEEP_RATE * rate;
      target.y = sweepY();
      if (target.x > 1.5) {
        target.x = -0.5;
        eased.x = -0.5;
      }
      sweepClock += dt;
      if (sweepClock >= RESNAP) {
        sweepClock = 0;
        snap(target.x * aspect, target.y, cw, ch);
      }
    } else {
      snap(target.x * aspect, target.y, cw, ch);
    }

    const damp = clamp((cfg.damping / 100) * DAMP_REF * dt, 0, 1);
    eased.x += (target.x - eased.x) * damp;
    eased.y += (target.y - eased.y) * damp;

    driftT += dt * rate;
    for (let i = 0; i < HANDLES; i += 1) {
      const c = cells[i];
      const sx = Math.round(c.x / cw - 0.5);
      const sy = Math.round(c.y / ch - 0.5);
      const h1 = fract(Math.sin(sx * 127.1 + sy * 311.7) * 43758.5453);
      const h2 = fract(Math.sin(sx * 269.5 + sy * 183.3) * 43758.5453);
      verts[i].x = c.x + DRIFT_X * cw * Math.sin(driftT * DRIFT_RATE + h1 * Math.PI * 2);
      verts[i].y = c.y + DRIFT_Y * ch * Math.sin(driftT * DRIFT_RATE_Y + h2 * Math.PI * 2);
    }
  }

  function writeLabels() {
    const aspect = boxW / boxH;
    const half = (cfg.handles.size * scale()) / 2;
    for (let i = 0; i < labels.length; i += 1) {
      const el = labels[i];
      const bx = verts[i].x / aspect;
      const by = verts[i].y;
      const gx = Math.round(clamp(bx * 100, 0, 100));
      const gy = Math.round(clamp(by * 100, 0, 100));
      el.style.transform = `translate(${bx * boxW - half}px, ${(1 - by) * boxH - half}px)`;
      const text = `${gx}, ${gy}`;
      if (el.textContent !== text) el.textContent = text;
    }
  }

  function draw() {
    const tc = colors.text;
    const sc = colors.shade;
    const ac = colors.accent;
    const px = drawFontPx();
    const s = scale();
    const o = origin();

    gl.viewport(0, 0, bufW, bufH);
    gl.useProgram(prog);
    gl.uniform1i(U.uMap, 0);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.uniform2f(U.uRes, boxW, boxH);
    gl.uniform2f(U.uAtlas, atlasRatioW * px, atlasRatioH * px);
    gl.uniform2f(U.uOrigin, o.x, o.y);
    gl.uniform2f(U.uPtr, eased.x, eased.y);
    gl.uniform1f(U.uReach, Math.max(1, cfg.reach * s) / boxW);
    gl.uniform3f(U.uText, tc[0], tc[1], tc[2]);
    gl.uniform3f(U.uShade, sc[0], sc[1], sc[2]);
    gl.uniform4f(U.uAccent, ac[0], ac[1], ac[2], ac[3]);
    gl.uniform2f(U.uV0, verts[0].x, verts[0].y);
    gl.uniform2f(U.uV1, verts[1].x, verts[1].y);
    gl.uniform2f(U.uV2, verts[2].x, verts[2].y);
    gl.uniform1f(U.uHalf, (cfg.handles.size * s) / 2 / boxH);
    gl.uniform1f(U.uDash, (100 * boxH) / (REF_HEIGHT * s));
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    host.classList.add("is-live");
  }

  let raf = 0;
  let last = 0;
  let onScreen = true;

  const frame = (now) => {
    const dt = last ? Math.min(0.1, (now - last) / 1000) : 0;
    last = now;
    sync();
    step(dt);
    writeLabels();
    draw();
    raf = requestAnimationFrame(frame);
  };

  // Reduced motion: one still frame, with the sweep parked part-way along the word
  let stillQueued = false;
  function drawStill() {
    stillQueued = false;
    hasPointer = false;
    sync();
    const { cw, ch } = cellSize();
    target.x = eased.x = STILL_X;
    target.y = eased.y = sweepY();
    snap(target.x * (boxW / boxH), target.y, cw, ch);
    step(0);
    writeLabels();
    draw();
  }

  function refreshStill() {
    if (!motionQuery.matches || stillQueued) return;
    stillQueued = true;
    requestAnimationFrame(drawStill);
  }

  // Animate only while the hero is on screen, the tab is visible and motion is allowed
  const gate = () => {
    if (onScreen && !document.hidden && !motionQuery.matches) {
      if (!raf) {
        last = 0;
        raf = requestAnimationFrame(frame);
      }
    } else if (raf) {
      cancelAnimationFrame(raf);
      raf = 0;
    }
  };

  new ResizeObserver(() => {
    boxDirty = true;
    refreshStill();
  }).observe(host);

  if ("IntersectionObserver" in window) {
    new IntersectionObserver((entries) => {
      onScreen = entries[entries.length - 1].isIntersecting;
      gate();
    }).observe(host);
  }

  document.addEventListener("visibilitychange", gate);
  document.addEventListener("themechange", () => {
    applyTheme();
    refreshStill();
  });
  motionQuery.addEventListener("change", () => {
    gate();
    refreshStill();
  });

  if (document.fonts) {
    document.fonts.ready.then(() => {
      atlasKey = "";
      refreshStill();
    }, () => {});
  }

  applyTheme();
  gate();
  refreshStill();
})();
