// Page interactions: theme toggle, nav, scroll reveal, tilt cards, the Projects coverflow, flip cards.
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

  // ---------- Projects: 3D coverflow that scrolls sideways ----------
  // The stage is a real sideways scroller that snaps a card to the middle, so a trackpad, touch,
  // the scrollbar and Home / End move it as well as the arrows, keys, dots and a mouse drag. On every
  // scroll frame each card turns and sinks back by how far it is from the middle.
  const carousel = document.querySelector(".carousel");
  const stage = carousel.querySelector(".carousel-stage");
  const cards = Array.from(stage.querySelectorAll(".p-card"));
  const turners = cards.map((card) => card.querySelector(".p-card-3d")); // the 3D goes on these
  const dotsWrap = carousel.querySelector(".dots");
  const counter = carousel.querySelector(".counter");
  const arrows = Array.from(carousel.querySelectorAll(".arrow-btn[data-dir]"));
  const n = cards.length;
  const pad = (v) => String(v).padStart(2, "0");
  let active = -1;  // the card in the middle
  let target = 0;   // the card the last arrow, key or dot asked for
  let lastGo = 0;

  carousel.querySelector(".carousel-ui").hidden = !n; // No projects in js/data/projects.js

  cards.forEach((card, i) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.setAttribute("aria-label", "Show project " + (i + 1));
    dot.addEventListener("click", () => go(i));
    dotsWrap.appendChild(dot);
  });
  const dots = Array.from(dotsWrap.children);

  // A card's centre in the stage's scroll coordinates (layout, so the 3D transforms don't count)
  const centreOf = (card) => card.offsetLeft + card.offsetWidth / 2;

  function go(i) {
    if (!n || !Number.isFinite(i)) return;
    target = Math.max(0, Math.min(n - 1, i));
    lastGo = performance.now();
    stage.scrollTo({ left: centreOf(cards[target]) - stage.clientWidth / 2, behavior: reduceMotion ? "auto" : "smooth" });
  }

  // Steps count on from where the last press was heading, so quick presses add up
  const step = (dir) => go((performance.now() - lastGo < 700 ? target : active) + dir);

  let frame = 0;
  function render() {
    frame = 0;
    if (!n) return;
    const spacing = n > 1 ? cards[1].offsetLeft - cards[0].offsetLeft : cards[0].offsetWidth;
    const depth = spacing * 0.87; // 230px on desktop, 150px on phones, as the old coverflow
    const middle = stage.scrollLeft + stage.clientWidth / 2;
    cards.forEach((card, i) => {
      const x = centreOf(card) - middle;
      const a = Math.abs(x) / spacing; // cards away from the middle
      const turn = a <= 1 ? a * 32 : Math.min(42, 24 + a * 8);
      // The perspective() between the two translates puts the vanishing point in the middle of the stage
      turners[i].style.transform = "translateX(" + (-x).toFixed(1) + "px) perspective(1800px) translateX(" + x.toFixed(1) +
        "px) translateZ(" + (-a * depth).toFixed(1) + "px) rotateY(" + (-Math.sign(x) * turn).toFixed(2) + "deg)";
      turners[i].style.pointerEvents = a > 2.5 ? "none" : "";
      card.style.opacity = String(a <= 1 ? 1 : Math.max(0, 1.5 - a * 0.5));
      card.style.zIndex = String(100 - Math.round(a * 10));
    });

    const now = Math.max(0, Math.min(n - 1, Math.round((middle - centreOf(cards[0])) / spacing)));
    if (now !== active) {
      active = now;
      cards.forEach((card, i) => card.classList.toggle("is-active", i === active));
      dots.forEach((d, i) => d.setAttribute("aria-current", String(i === active)));
      counter.textContent = pad(active + 1) + " / " + pad(n);
    }
    const max = stage.scrollWidth - stage.clientWidth;
    arrows.forEach((b) => b.setAttribute("aria-disabled", String(Number(b.dataset.dir) < 0 ? stage.scrollLeft <= 2 : stage.scrollLeft >= max - 2)));
  }

  const schedule = () => { if (!frame) frame = requestAnimationFrame(render); };
  stage.addEventListener("scroll", schedule, { passive: true });
  new ResizeObserver(schedule).observe(stage);

  // Only the carousel's own arrows: other round buttons on the page share the .arrow-btn style
  arrows.forEach((b) => b.addEventListener("click", () => {
    if (b.getAttribute("aria-disabled") !== "true") step(Number(b.dataset.dir));
  }));
  carousel.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") { e.preventDefault(); step(1); }
    if (e.key === "ArrowLeft") { e.preventDefault(); step(-1); }
  });

  // Click a side card, or tab to one of its links, to bring it to the middle
  cards.forEach((card, i) => card.addEventListener("click", (e) => {
    if (i !== active) { e.preventDefault(); go(i); }
  }));
  stage.addEventListener("focusin", (e) => {
    const i = cards.indexOf(e.target.closest(".p-card"));
    if (i >= 0 && i !== active) go(i);
  });

  // Mouse drag: a flick of more than 50px moves one card (touch and trackpads scroll natively)
  let startX = null, dragged = false;
  stage.addEventListener("pointerdown", (e) => {
    if (e.pointerType !== "mouse" || e.button !== 0) return;
    startX = e.clientX;
    dragged = false;
  });
  window.addEventListener("pointermove", (e) => {
    if (startX === null || dragged || Math.abs(e.clientX - startX) <= 8) return;
    dragged = true;
    stage.classList.add("dragging");
  });
  window.addEventListener("pointerup", (e) => {
    if (startX === null) return;
    const dx = e.clientX - startX;
    startX = null;
    stage.classList.remove("dragging");
    if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1);
  });
  stage.addEventListener("click", (e) => { if (dragged) { e.preventDefault(); e.stopPropagation(); dragged = false; } }, true);
  stage.addEventListener("dragstart", (e) => e.preventDefault());

  render();

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
