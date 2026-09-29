// Page interactions: theme toggle, nav, scroll reveal, tilt cards, project coverflow, flip cards.
// The hero wordmark and the About portrait live in wordmark.js and portrait.js.
(function () {
  const root = document.documentElement;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  // ---------- Theme (shared "theme" key) ----------
  const toggle = document.getElementById("theme-toggle");
  const themeIcon = toggle.querySelector(".theme-icon");
  const setIcon = () => { themeIcon.textContent = root.classList.contains("dark-mode") ? "☀️" : "🌙"; };
  setIcon();
  toggle.addEventListener("click", () => {
    root.classList.toggle("dark-mode");
    setIcon();
    try { localStorage.setItem("theme", root.classList.contains("dark-mode") ? "dark" : "light"); } catch (e) {}
    document.dispatchEvent(new CustomEvent("themechange"));
  });

  document.getElementById("year").textContent = new Date().getFullYear();

  // ---------- Nav: mobile menu, shrink on scroll, progress, active link ----------
  const nav = document.querySelector(".nav");
  const menuBtn = nav.querySelector(".menu-btn");
  const closeMenu = () => { nav.classList.remove("open"); menuBtn.setAttribute("aria-expanded", "false"); };
  menuBtn.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    menuBtn.setAttribute("aria-expanded", String(open));
  });
  nav.querySelectorAll(".nav-links a").forEach((a) => a.addEventListener("click", closeMenu));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeMenu(); });

  const bar = document.querySelector(".progress");
  const onScroll = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.transform = "scaleX(" + (max > 0 ? window.scrollY / max : 0) + ")";
    nav.classList.toggle("scrolled", window.scrollY > 24);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  const navLinks = document.querySelectorAll(".nav > .nav-links a");
  const spy = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      navLinks.forEach((a) => a.classList.toggle("active", a.getAttribute("href") === "#" + entry.target.id));
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  document.querySelectorAll("main section[id]").forEach((s) => spy.observe(s));

  // ---------- Scroll reveal ----------
  const reveals = document.querySelectorAll(".reveal");
  if (reduceMotion || !("IntersectionObserver" in window)) {
    reveals.forEach((el) => el.classList.add("in"));
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) { entry.target.classList.add("in"); io.unobserve(entry.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    reveals.forEach((el) => io.observe(el));
  }

  // ---------- 3D tilt with glare ----------
  if (finePointer && !reduceMotion) {
    document.querySelectorAll("[data-tilt]").forEach((el) => {
      const max = parseFloat(el.dataset.tilt) || 8;
      let frame = 0;
      el.addEventListener("pointermove", (e) => {
        if (el.closest(".p-card:not(.is-active)")) return;
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(() => {
          const r = el.getBoundingClientRect();
          const x = (e.clientX - r.left) / r.width - 0.5;
          const y = (e.clientY - r.top) / r.height - 0.5;
          el.style.setProperty("--rx", (-y * max).toFixed(2) + "deg");
          el.style.setProperty("--ry", (x * max).toFixed(2) + "deg");
          el.style.setProperty("--gx", ((x + 0.5) * 100).toFixed(1) + "%");
          el.style.setProperty("--gy", ((y + 0.5) * 100).toFixed(1) + "%");
          el.classList.add("tilting");
        });
      });
      el.addEventListener("pointerleave", () => {
        cancelAnimationFrame(frame);
        el.style.setProperty("--rx", "0deg");
        el.style.setProperty("--ry", "0deg");
        el.classList.remove("tilting");
      });
    });
  }

  // ---------- Projects: 3D coverflow ----------
  const stage = document.querySelector(".carousel-stage");
  const carousel = document.querySelector(".carousel");
  const cards = Array.from(stage.querySelectorAll(".p-card"));
  const dotsWrap = document.querySelector(".dots");
  const counter = document.querySelector(".counter");
  const n = cards.length;
  let active = 0;
  let prevOffsets = cards.map(() => 0);

  cards.forEach((card, i) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.setAttribute("aria-label", "Show project " + (i + 1));
    dot.addEventListener("click", () => go(i));
    dotsWrap.appendChild(dot);
  });
  const dots = Array.from(dotsWrap.children);

  function offsetOf(i) {
    let o = i - active;
    if (o > n / 2) o -= n;
    if (o < -n / 2) o += n;
    return o;
  }

  function layout() {
    const w = cards[0].offsetWidth;
    const narrow = window.innerWidth < 700;
    const gap = w * (narrow ? 0.6 : 0.8);
    cards.forEach((card, i) => {
      const o = offsetOf(i);
      const a = Math.abs(o);
      // Cards that wrap around the ring jump instead of flying across the stage
      card.style.transition = Math.abs(o - prevOffsets[i]) > 1.5 ? "none" : "";
      const ry = o === 0 ? 0 : -Math.sign(o) * Math.min(42, 24 + a * 8);
      card.style.transform =
        "translate(-50%, -50%) translate3d(" + (o * gap).toFixed(1) + "px, 0, " + (-a * (narrow ? 150 : 230)) + "px) rotateY(" + ry + "deg)";
      card.style.opacity = a >= 3 ? "0" : a === 2 ? "0.5" : "1";
      card.style.zIndex = String(10 - a);
      card.style.pointerEvents = a >= 3 ? "none" : "";
      card.classList.toggle("is-active", o === 0);
      card.querySelectorAll("a, button").forEach((el) => { el.tabIndex = o === 0 ? 0 : -1; });
      card.setAttribute("aria-hidden", String(o !== 0));
      prevOffsets[i] = o;
    });
    dots.forEach((d, i) => d.setAttribute("aria-current", String(i === active)));
    counter.textContent = String(active + 1).padStart(2, "0") + " / " + String(n).padStart(2, "0");
  }

  function go(i) {
    active = (i + n) % n;
    layout();
  }

  document.querySelectorAll(".arrow-btn").forEach((b) => b.addEventListener("click", () => go(active + Number(b.dataset.dir))));
  carousel.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") { e.preventDefault(); go(active + 1); }
    if (e.key === "ArrowLeft") { e.preventDefault(); go(active - 1); }
  });

  // Click a side card to bring it forward
  cards.forEach((card, i) => card.addEventListener("click", (e) => {
    if (i !== active) { e.preventDefault(); go(i); }
  }));

  // Drag / swipe
  let startX = null, dragged = false;
  stage.addEventListener("pointerdown", (e) => { startX = e.clientX; dragged = false; });
  stage.addEventListener("pointermove", (e) => {
    if (startX === null) return;
    if (Math.abs(e.clientX - startX) > 8) { dragged = true; stage.classList.add("dragging"); }
  });
  const endDrag = (e) => {
    if (startX === null) return;
    const dx = e.clientX - startX;
    if (Math.abs(dx) > 50) go(active + (dx < 0 ? 1 : -1));
    startX = null;
    stage.classList.remove("dragging");
  };
  stage.addEventListener("pointerup", endDrag);
  stage.addEventListener("pointercancel", () => { startX = null; stage.classList.remove("dragging"); });
  stage.addEventListener("click", (e) => { if (dragged) { e.preventDefault(); e.stopPropagation(); dragged = false; } }, true);
  stage.addEventListener("dragstart", (e) => e.preventDefault());

  window.addEventListener("resize", layout);
  layout();

  // ---------- Watch list flip cards ----------
  document.querySelectorAll(".flip").forEach((flip) => {
    const front = flip.querySelector(".flip-front");
    const back = flip.querySelector(".flip-back");
    back.inert = true;
    flip.querySelectorAll("[data-flip]").forEach((btn) => btn.addEventListener("click", () => {
      const flipped = flip.classList.toggle("is-flipped");
      front.inert = flipped;
      back.inert = !flipped;
      (flipped ? back : front).querySelector("[data-flip]").focus({ preventScroll: true });
    }));
  });
})();
