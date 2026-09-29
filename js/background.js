// Page background below the hero: a vanilla port of backgroundlight.tsx / backgrounddark.tsx
// (the Originkit "Contour Embers"). Same shader, settings, timing and pointer rings, without
// React. The light preset is used normally and the dark one when <html> has dark-mode.
//
// It draws on one fixed, viewport-sized canvas (the TSX's box is the viewport here). The hero is
// opaque on top of it, so the canvas only renders while a section below the hero is on screen.
(function () {
  const canvas = document.querySelector(".contour-bg");
  if (!canvas) return;

  // backgroundlight.tsx preset / backgrounddark.tsx (the component defaults)
  const PRESETS = {
    light: { background: "#EBF9FC", baseColor: "#32A5DE", accentColor: "#002794" },
    dark: { background: "#140603", baseColor: "#CD5A21", accentColor: "#FFD86B" }
  };
  // The other props, at the component defaults (both files use them)
  const SETTINGS = { density: 30, scale: 3, warp: 45, angle: 35, lineWidth: 2, sparks: 100, speed: 100, rings: 6, reach: 15 };

  const MAX_DPR = 2;
  const HOVER_RATE = 6;
  const EMBER_RATE = 0.42;
  const DRIFT_RATE = 0.012;
  const MEAN_GRADIENT = 0.43;

  const clamp = (v, lo, hi) => (v < lo ? lo : v > hi ? hi : v);

  function parseColor(input, fallback) {
    if (!input) return fallback;
    const str = String(input).trim();

    if (str.charAt(0) === "#") {
      let hex = str.slice(1);
      if (hex.length === 3 || hex.length === 4) {
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
      }
      if (hex.length >= 6) {
        const r = parseInt(hex.slice(0, 2), 16);
        const g = parseInt(hex.slice(2, 4), 16);
        const b = parseInt(hex.slice(4, 6), 16);
        if (!isNaN(r) && !isNaN(g) && !isNaN(b)) return [r / 255, g / 255, b / 255];
      }
      return fallback;
    }

    const parts = str.match(/[\d.]+/g);
    if (parts && parts.length >= 3) {
      return [
        Math.min(255, parseFloat(parts[0])) / 255,
        Math.min(255, parseFloat(parts[1])) / 255,
        Math.min(255, parseFloat(parts[2])) / 255
      ];
    }
    return fallback;
  }

  const VERT_SRC = `
    attribute vec2 aPos;
    void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
  `;

  // Unchanged from the TSX
  const FRAG_SRC = `
    #ifdef GL_FRAGMENT_PRECISION_HIGH
    precision highp float;
    #else
    precision mediump float;
    #endif

    uniform vec2  uRes;
    uniform float uTime;
    uniform float uDpr;

    uniform vec3  uBg;
    uniform vec3  uBase;
    uniform vec3  uAccent;
    uniform vec2  uFocus;
    uniform float uLevels;
    uniform float uScale;
    uniform vec2  uDir;
    uniform float uWarpAmt;
    uniform float uHalfWidth;
    uniform float uSparkLevels;
    uniform float uPhase;
    uniform float uDrift;
    uniform float uAmp;
    uniform float uReach;
    uniform float uHover;

    const float GLOW = 0.25;

    float h21(vec2 p) {
        return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
    }

    vec3 vnoiseD(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        vec2 u = f * f * (3.0 - 2.0 * f);
        vec2 du = 6.0 * f * (1.0 - f);

        float a = h21(i);
        float b = h21(i + vec2(1.0, 0.0));
        float c = h21(i + vec2(0.0, 1.0));
        float d = h21(i + vec2(1.0, 1.0));

        float k1 = b - a;
        float k2 = c - a;
        float k3 = a - b - c + d;

        float v = a + k1 * u.x + k2 * u.y + k3 * u.x * u.y;
        vec2 g = vec2(k1 + k3 * u.y, k2 + k3 * u.x) * du;
        return vec3(v, g);
    }

    vec3 fbmD(vec2 p) {
        vec3 sum = vec3(0.0);
        float amp = 0.5;
        float freq = 1.0;
        for (int i = 0; i < 3; i++) {
            vec3 n = vnoiseD(p * freq + float(i) * 17.3);
            sum.x += amp * n.x;
            sum.yz += amp * freq * n.yz;
            freq *= 2.07;
            amp *= 0.5;
        }
        return sum;
    }

    void main() {
        vec2 uv = gl_FragCoord.xy / uRes;
        float aspect = uRes.x / uRes.y;

        vec2 p = vec2(uv.x * aspect, uv.y);
        float px = 1.0 / uRes.y;

        vec3 nf = fbmD(p * uScale + vec2(uDrift, uDrift * 0.6));
        float f = dot(p, uDir) + (nf.x - 0.5) * uWarpAmt;
        vec2 gradF = uDir + nf.yz * uScale * uWarpAmt;

        float R = max(uReach, 1e-4);
        vec2 rv = p - uFocus;
        float d = length(rv);
        vec2 u = d > 1e-6 ? rv / d : vec2(0.0);
        float x = d / R;

        float base = dot(uFocus, uDir);
        float dome = base + uAmp * max(0.0, 1.0 - x);
        float dDome = x < 1.0 ? -uAmp / R : 0.0;

        float st = clamp(x - 1.0, 0.0, 1.0);
        float k = (1.0 - st * st * (3.0 - 2.0 * st)) * uHover;
        float dK = (-(6.0 * st * (1.0 - st)) / R) * uHover;

        float terrain = f;
        f = terrain * (1.0 - k) + dome * k;
        gradF = gradF * (1.0 - k) + (dome - terrain) * dK * u + k * dDome * u;

        float gfLen = max(length(gradF), 1e-5);

        float ff = f * uLevels;

        float sf = (fract(ff) - 0.5) / (uLevels * gfLen);
        float df = abs(sf);

        float line = 1.0 - smoothstep(uHalfWidth - px * 0.7, uHalfWidth + px * 0.7, df);
        float bleed = exp(-df / max(uHalfWidth * 5.0, px));

        float spacing = 1.0 / (uLevels * gfLen);
        line *= smoothstep(0.9, 1.8, spacing / max(2.0 * uHalfWidth, px));

        float tone = clamp(f * 1.6 + 0.5, 0.0, 1.0);
        vec3 ink = mix(uBase, uAccent, tone);

        vec3 col = uBg;
        col += ink * bleed * GLOW;
        col = mix(col, ink, line);

        if (uSparkLevels > 0.0) {
            vec3 ng = fbmD(p * uScale * 0.71 + vec2(43.7, 11.9));
            vec2 gradG = ng.yz * uScale * 0.71;
            float ggLen = max(length(gradG), 1e-5);

            float gg = ng.x * uSparkLevels - uPhase;
            float sg = (fract(gg + 0.5) - 0.5) / (uSparkLevels * ggLen);

            vec2 nfDir = gradF / gfLen;
            vec2 ngDir = gradG / ggLen;
            vec2 off = sf * nfDir + sg * ngDir;

            vec2 id = vec2(floor(ff), floor(gg + 0.5));
            float r1 = h21(id);
            float r2 = h21(id + 7.31);
            float r3 = h21(id + 19.7);

            float cross = abs(nfDir.x * ngDir.y - nfDir.y * ngDir.x);
            float cond = smoothstep(0.26, 0.62, cross);

            float twinkle = 0.55 + 0.45 * sin(uTime * (1.7 + 2.6 * r2) + r3 * 6.283);

            float size = px * (0.75 + 2.2 * r1 * r1 * r1) * (0.7 + 0.6 * twinkle);

            float rr = dot(off, off) / max(size * size, 1e-12);
            float core = exp(-rr);

            float flare = exp(-abs(off.x) / (size * 7.0) - (off.y * off.y) / (size * size * 0.06))
                        + exp(-abs(off.y) / (size * 7.0) - (off.x * off.x) / (size * size * 0.06));

            vec3 emberCol = mix(uAccent, vec3(1.0), r2 * 0.85);
            float flareGate = smoothstep(0.72, 0.95, r1);
            col += emberCol * (core + flare * 0.45 * flareGate) * cond * (0.30 + 0.75 * twinkle);
        }

        col += (h21(gl_FragCoord.xy) - 0.5) * (1.5 / 255.0);

        gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
    }
  `;

  function compileShader(gl, type, src) {
    const shader = gl.createShader(type);
    if (!shader) return null;
    gl.shaderSource(shader, src);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  }

  const gl = canvas.getContext("webgl", { antialias: false, alpha: false, depth: false, preserveDrawingBuffer: false });
  if (!gl) return; // No WebGL: the canvas shows its plain --contour-bg colour

  const vs = compileShader(gl, gl.VERTEX_SHADER, VERT_SRC);
  const fs = compileShader(gl, gl.FRAGMENT_SHADER, FRAG_SRC);
  if (!vs || !fs) return;
  const program = gl.createProgram();
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
  gl.useProgram(program);

  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const posLoc = gl.getAttribLocation(program, "aPos");
  gl.enableVertexAttribArray(posLoc);
  gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

  const U = {};
  ["uRes", "uTime", "uDpr", "uBg", "uBase", "uAccent", "uFocus", "uLevels", "uScale", "uDir", "uWarpAmt", "uHalfWidth", "uSparkLevels", "uPhase", "uDrift", "uAmp", "uReach", "uHover"].forEach((n) => {
    U[n] = gl.getUniformLocation(program, n);
  });

  // Values the TSX derives from its props every frame; the props never change here
  const lines = Math.round(clamp(SETTINGS.density, 4, 60));
  const scale = clamp(SETTINGS.scale, 1, 20);
  const warpRatio = (clamp(SETTINGS.warp, 0, 100) / 100) * 1.5;
  const warpAmt = warpRatio / (MEAN_GRADIENT * scale);
  const levels = lines / Math.sqrt(1 + warpRatio * warpRatio);
  const angle = (clamp(SETTINGS.angle, 0, 360) * Math.PI) / 180;
  const rings = Math.round(clamp(SETTINGS.rings, 0, 12));
  const sparks = clamp(SETTINGS.sparks, 0, 100);
  const rate = clamp(SETTINGS.speed, 0, 100) / 50;

  const root = document.documentElement;
  const hero = document.querySelector(".hero");
  const heroFade = hero ? parseFloat(getComputedStyle(hero).getPropertyValue("--hero-fade")) || 0 : 0;
  const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

  let colors;
  function applyTheme() {
    const preset = root.classList.contains("dark-mode") ? PRESETS.dark : PRESETS.light;
    colors = {
      bg: parseColor(preset.background, [0.078, 0.024, 0.012]),
      base: parseColor(preset.baseColor, [0.804, 0.353, 0.129]),
      accent: parseColor(preset.accentColor, [1.0, 0.847, 0.42])
    };
  }

  let cssWidth = canvas.offsetWidth || 1;
  let cssHeight = canvas.offsetHeight || 1;

  // The TSX raises rings around the pointer while it is over its box. The canvas takes no
  // clicks here, so the pointer is read from the window and counts only below the hero.
  // Touch is ignored, as the TSX's touch-action: none would otherwise block scrolling.
  const pointer = { rawX: 0.5, rawY: 0.5, clientY: 0, inWindow: false, on: 0 };
  window.addEventListener("pointermove", (e) => {
    if (e.pointerType === "touch") return;
    pointer.rawX = clamp(e.clientX / cssWidth, 0, 1);
    pointer.rawY = clamp(e.clientY / cssHeight, 0, 1);
    pointer.clientY = e.clientY;
    pointer.inWindow = true;
  }, { passive: true });
  window.addEventListener("mouseout", (e) => {
    if (!e.relatedTarget) pointer.inWindow = false;
  });
  window.addEventListener("blur", () => {
    pointer.inWindow = false;
  });

  function pointerTarget() {
    if (!pointer.inWindow || motionQuery.matches) return 0;
    return !hero || pointer.clientY > hero.getBoundingClientRect().bottom ? 1 : 0;
  }

  let clock = 0;

  function draw(dt) {
    const still = motionQuery.matches;
    clock = (clock + dt * (still ? 0 : rate)) % 3600;
    pointer.on += (pointerTarget() - pointer.on) * (1 - Math.exp(-HOVER_RATE * dt));
    if (still) pointer.on = 0;

    const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
    const bufferWidth = Math.max(1, Math.round(cssWidth * dpr));
    const bufferHeight = Math.max(1, Math.round(cssHeight * dpr));
    if (canvas.width !== bufferWidth || canvas.height !== bufferHeight) {
      canvas.width = bufferWidth;
      canvas.height = bufferHeight;
      gl.viewport(0, 0, bufferWidth, bufferHeight);
    }
    const aspect = bufferWidth / bufferHeight;

    // Skip the rows the opaque part of the hero covers. The margin keeps a fast scroll from
    // uncovering rows before the next frame draws them.
    const covered = hero ? hero.getBoundingClientRect().bottom - heroFade - cssHeight * 0.25 : 0;
    const rows = Math.round((cssHeight - clamp(covered, 0, cssHeight)) * dpr);
    if (rows <= 0) return;
    gl.enable(gl.SCISSOR_TEST);
    gl.scissor(0, 0, bufferWidth, rows);

    gl.uniform2f(U.uRes, bufferWidth, bufferHeight);
    gl.uniform1f(U.uTime, clock);
    gl.uniform1f(U.uDpr, dpr);

    gl.uniform3f(U.uBg, colors.bg[0], colors.bg[1], colors.bg[2]);
    gl.uniform3f(U.uBase, colors.base[0], colors.base[1], colors.base[2]);
    gl.uniform3f(U.uAccent, colors.accent[0], colors.accent[1], colors.accent[2]);

    gl.uniform2f(U.uFocus, pointer.rawX * aspect, 1 - pointer.rawY);
    gl.uniform1f(U.uLevels, levels);
    gl.uniform1f(U.uScale, scale);
    gl.uniform2f(U.uDir, Math.cos(angle), Math.sin(angle));
    gl.uniform1f(U.uWarpAmt, warpAmt);
    gl.uniform1f(U.uHalfWidth, (clamp(SETTINGS.lineWidth, 1, 8) * 0.5 * dpr) / bufferHeight);

    gl.uniform1f(U.uSparkLevels, sparks === 0 ? 0 : 8 + (sparks / 100) * 52);
    gl.uniform1f(U.uPhase, clock * EMBER_RATE);
    gl.uniform1f(U.uDrift, clock * DRIFT_RATE);

    gl.uniform1f(U.uAmp, rings / levels);
    gl.uniform1f(U.uReach, clamp(SETTINGS.reach, 5, 100) / 100);
    gl.uniform1f(U.uHover, Math.min(1, Math.max(0, pointer.on)));

    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  // Animate only while something below the hero is on screen and the tab is visible.
  // With reduced motion the embers and rings stay still: one frame per resize or theme change.
  const visible = new Set();
  let raf = 0;
  let last = 0;

  function frame(now) {
    const dt = last ? Math.min(0.05, (now - last) / 1000) : 0;
    last = now;
    draw(dt);
    raf = requestAnimationFrame(frame);
  }

  function gate() {
    if (visible.size > 0 && !document.hidden && !motionQuery.matches) {
      if (!raf) {
        last = 0;
        raf = requestAnimationFrame(frame);
      }
    } else if (raf) {
      cancelAnimationFrame(raf);
      raf = 0;
    }
  }

  // One frame straight away, so the canvas never shows through blank
  let redrawQueued = false;
  function redraw() {
    if (raf || redrawQueued) return;
    redrawQueued = true;
    requestAnimationFrame(() => {
      redrawQueued = false;
      draw(0);
    });
  }

  new ResizeObserver(() => {
    cssWidth = canvas.offsetWidth || 1;
    cssHeight = canvas.offsetHeight || 1;
    redraw();
  }).observe(canvas);

  const below = document.querySelectorAll("main > section:not(.hero), footer");
  if ("IntersectionObserver" in window && below.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) visible.add(entry.target);
        else visible.delete(entry.target);
      });
      gate();
    });
    below.forEach((el) => io.observe(el));
  } else {
    visible.add(canvas);
  }

  document.addEventListener("visibilitychange", gate);
  document.addEventListener("themechange", () => {
    applyTheme();
    redraw();
  });
  motionQuery.addEventListener("change", () => {
    gate();
    redraw();
  });

  applyTheme();
  redraw();
  gate();
})();
