// Data-driven sections: builds the Projects coverflow cards, the Certifications cards, the Watch List
// flip cards and the Core Subjects marquee from the lists in js/data/, and runs the arrow buttons of
// the sideways-scrolling rows. It loads (deferred) just before main.js, so everything it creates gets
// main.js's coverflow, scroll reveal, tilt and card flipping like the rest of the page.
(function () {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  // Icons in the same style as the rest of the site's icons
  const ICONS = {
    expand: '<path d="M15 3h6v6"/><path d="M9 21H3v-6"/><path d="m21 3-7 7"/><path d="m3 21 7-7"/>',
    external: '<path d="M7 17 17 7"/><path d="M8 7h9v9"/>',
    book: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z"/>',
    play: '<path d="M8 5v14l11-7z"/>'
  };
  const FILLED = { play: true };

  function icon(name) {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    if (FILLED[name]) {
      svg.setAttribute("fill", "currentColor");
    } else {
      svg.setAttribute("fill", "none");
      svg.setAttribute("stroke", "currentColor");
      svg.setAttribute("stroke-width", "2");
      svg.setAttribute("stroke-linecap", "round");
      svg.setAttribute("stroke-linejoin", "round");
    }
    svg.setAttribute("aria-hidden", "true");
    svg.innerHTML = ICONS[name];
    return svg;
  }

  // el("a", { class: "btn", href: "#" }, child, "text", ...). Text is added as text, never as HTML.
  function el(tag, attrs, ...children) {
    const node = document.createElement(tag);
    Object.entries(attrs || {}).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== false) node.setAttribute(key, value);
    });
    children.forEach((child) => {
      if (child !== undefined && child !== null) node.append(child);
    });
    return node;
  }

  // <span class="chip"><strong>Label:</strong> value</span>, or nothing when there is no value
  function chip(label, value) {
    return value ? el("span", { class: "chip" }, el("strong", null, label), " " + value) : null;
  }

  const NEW_TAB = " (opens in a new tab)";

  // ---------- Projects: one coverflow card per entry in js/data/projects.js ----------
  // main.js then gives the row its 3D coverflow look, dots, counter and arrow buttons.
  function projectCard(project, index) {
    const links = Array.isArray(project.links) ? project.links.filter((link) => link && link.label && link.url) : [];
    return el("li", { class: "p-card" },
      el("div", { class: "p-card-3d" },
        el("article", { class: "glass p-card-inner", "data-tilt": "10" },
          el("div", { class: "p-thumb" },
            project.image ? el("img", { src: project.image, alt: project.alt || project.title + " project", loading: "lazy" }) : null,
            el("span", { class: "p-num", "aria-hidden": "true" }, String(index + 1).padStart(2, "0"))
          ),
          el("h3", null, project.title),
          // The last button is the main, solid one; any before it are outlined
          el("div", { class: "p-actions" },
            ...links.map((link, i) => el("a", {
              class: "btn btn-sm " + (i === links.length - 1 ? "btn-solid" : "btn-ghost"),
              href: link.url,
              target: "_blank",
              rel: "noopener"
            }, link.label, el("span", { class: "sr-only" }, " for " + project.title + NEW_TAB)))
          )
        )
      )
    );
  }

  const projectTrack = document.querySelector("[data-projects]");
  if (projectTrack && typeof projects !== "undefined" && Array.isArray(projects)) {
    projects
      .filter((project) => project && project.title)
      .forEach((project, index) => projectTrack.append(projectCard(project, index)));
  }

  // ---------- Certifications: one card per entry in js/data/certifications.js ----------
  function certCard(cert) {
    const card = el("article", { class: "glass cert-card", "data-tilt": "8" });

    // The picture opens full size; the button below opens the verification page
    if (cert.image) {
      card.append(
        el("a", {
          class: "thumb-link cert-thumb",
          href: cert.image,
          target: "_blank",
          rel: "noopener",
          "aria-label": "View the " + cert.title + " certificate" + NEW_TAB
        },
          el("img", { src: cert.image, alt: "", loading: "lazy", decoding: "async" }),
          el("span", { class: "play", "aria-hidden": "true" }, el("span", null, icon("expand")))
        )
      );
    }

    const credentialId = String(cert.credentialId || "").trim();
    const body = el("div", { class: "cert-body pop-sm" },
      cert.issuer ? el("p", { class: "count" }, cert.issuer) : null,
      el("h3", null, cert.title),
      el("div", { class: "chips" },
        el("span", { class: "chip" },
          el("strong", null, "Credential ID:"), " ",
          el("span", { class: "cert-id" }, credentialId || "N/A")
        )
      )
    );

    if (cert.credentialUrl) {
      body.append(
        el("div", { class: "cert-actions" },
          el("a", { class: "btn btn-sm btn-solid", href: cert.credentialUrl, target: "_blank", rel: "noopener" },
            "Show Credential",
            icon("external"),
            el("span", { class: "sr-only" }, " for " + cert.title + NEW_TAB)
          )
        )
      );
    }

    card.append(body);
    return el("li", null, card);
  }

  const certTrack = document.querySelector("[data-certifications]");
  if (certTrack && typeof certifications !== "undefined" && Array.isArray(certifications)) {
    certifications.forEach((cert) => {
      if (cert && cert.title) certTrack.append(certCard(cert));
    });
  }

  // ---------- Watch List: one flip card per entry in js/data/watchlist.js ----------
  function youtubeId(url) {
    try {
      const u = new URL(url, location.href);
      if (/(^|\.)youtu\.be$/.test(u.hostname)) return u.pathname.slice(1) || null;
      if (/(^|\.)youtube\.com$/.test(u.hostname)) return u.searchParams.get("v");
    } catch (e) {}
    return null;
  }

  function watchCard(course) {
    const videoId = youtubeId(course.url);
    const thumbnail = course.thumbnail || (videoId ? "https://img.youtube.com/vi/" + videoId + "/maxresdefault.jpg" : "");
    const watchLabel = videoId ? "Watch " + course.title + " on YouTube" : "Open " + course.title;
    const topics = Array.isArray(course.topics) ? course.topics : [];

    const front = el("article", { class: "flip-face flip-front" },
      el("a", { class: "thumb-link", href: course.url, target: "_blank", rel: "noopener", "aria-label": watchLabel },
        thumbnail ? el("img", { src: thumbnail, alt: course.title + " thumbnail", loading: "lazy" }) : null,
        el("span", { class: "play", "aria-hidden": "true" }, el("span", null, icon("play")))
      ),
      el("div", { class: "body" },
        el("h3", null, course.title),
        course.summary ? el("p", null, course.summary) : null,
        el("div", { class: "chips" }, chip("Duration:", course.duration), chip("Level:", course.level)),
        el("button", { type: "button", class: "btn btn-sm btn-ghost", "data-flip": "", style: "margin-top: 1.2rem" }, "Course Details ↻")
      )
    );

    const back = el("article", { class: "flip-face flip-back" },
      el("div", { class: "back-head" },
        el("h3", null, "Course Details"),
        el("button", { type: "button", class: "btn btn-sm btn-ghost", "data-flip": "" }, "← Back")
      ),
      el("div", { class: "back-meta" }, chip("Duration:", course.duration), chip("Level:", course.level)),
      topics.length ? el("p", { class: "topics-label" }, "Topics Covered") : null,
      topics.length ? el("ul", { class: "topics" }, ...topics.map((topic) => el("li", null, topic))) : null,
      course.description ? el("p", { class: "course-desc" }, course.description) : null,
      el("div", { class: "back-actions" },
        el("a", { class: "btn btn-sm btn-solid", href: course.url, target: "_blank", rel: "noopener" },
          videoId ? "▶ Watch on YouTube" : "▶ Open Course"
        )
      )
    );

    return el("li", { class: "flip" }, el("div", { class: "flip-inner" }, front, back));
  }

  const watchTrack = document.querySelector("[data-watchlist]");
  if (watchTrack && typeof watchlist !== "undefined" && Array.isArray(watchlist)) {
    watchlist.forEach((course) => {
      if (course && course.title && course.url) watchTrack.append(watchCard(course));
    });
  }

  // ---------- Sideways-scrolling rows: arrow buttons ----------
  // Each row can also be scrolled with a trackpad, touch, its scrollbar, or the arrow keys once
  // focused. The buttons step one card at a time, dim at either end, and hide when all cards fit.
  document.querySelectorAll("[data-h-scroll]").forEach((scroller) => {
    const ui = scroller.nextElementSibling;
    if (!ui || !ui.classList.contains("scroll-ui")) return;
    const prev = ui.querySelector('[data-scroll-dir="-1"]');
    const next = ui.querySelector('[data-scroll-dir="1"]');
    const track = scroller.querySelector(".h-track");

    // One card plus the gap. Layout width, so the row's scroll-in transform can't skew it.
    const step = () => {
      const item = track && track.firstElementChild;
      if (!item) return scroller.clientWidth * 0.8;
      return item.offsetWidth + (parseFloat(getComputedStyle(track).columnGap) || 0);
    };

    const update = () => {
      const max = scroller.scrollWidth - scroller.clientWidth;
      ui.hidden = max <= 2;
      prev.setAttribute("aria-disabled", String(scroller.scrollLeft <= 2));
      next.setAttribute("aria-disabled", String(scroller.scrollLeft >= max - 2));
    };

    [prev, next].forEach((button) => {
      button.addEventListener("click", () => {
        if (button.getAttribute("aria-disabled") === "true") return;
        const dir = Number(button.dataset.scrollDir);
        scroller.scrollBy({ left: dir * step(), behavior: reduceMotion.matches ? "auto" : "smooth" });
      });
    });

    let frame = 0;
    scroller.addEventListener("scroll", () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    }, { passive: true });
    new ResizeObserver(update).observe(scroller);
    update();
  });

  // ---------- Core Subjects marquee: one link per entry in js/data/subjects.js ----------
  const marquee = document.querySelector("[data-subjects]");
  const items = typeof subjects !== "undefined" && Array.isArray(subjects)
    ? subjects.filter((subject) => subject && subject.name && subject.href)
    : [];

  if (marquee && items.length) {
    const group = el("ul", { class: "marquee-group", "aria-label": "Core subjects" });
    items.forEach((subject) => {
      group.append(el("li", null, el("a", { class: "btn btn-ghost subject-pill", href: subject.href }, icon("book"), subject.name)));
    });

    // An identical copy trails the list so the loop never shows a gap. Screen readers and the Tab
    // key only see the first copy.
    const copy = group.cloneNode(true);
    copy.removeAttribute("aria-label");
    copy.setAttribute("aria-hidden", "true");
    copy.inert = true;
    copy.querySelectorAll("a").forEach((a) => { a.tabIndex = -1; });
    marquee.append(group, copy);

    // Each subject gets the same share of the loop, so the speed holds as subjects come and go
    marquee.style.setProperty("--marquee-duration", Math.max(20, items.length * 5) + "s");

    // Pause / play button. Hovering or focusing the list pauses it too (in the CSS).
    const toggle = document.querySelector(".marquee-toggle");
    if (toggle) {
      toggle.addEventListener("click", () => {
        const paused = marquee.classList.toggle("is-paused");
        toggle.setAttribute("aria-pressed", String(paused));
      });
    }

    // Tabbing into the list pauses it and brings the focused subject to the middle, so it is
    // never hidden past an edge. Mouse clicks are left alone, so a link never moves under the pointer.
    marquee.addEventListener("focusin", (e) => {
      const link = e.target.closest("a");
      if (!link) return;
      try {
        if (!link.matches(":focus-visible")) return;
      } catch (err) {} // Older browsers without :focus-visible: treat it as keyboard focus
      marquee.classList.add("is-focused");

      const box = marquee.getBoundingClientRect();
      const r = link.getBoundingClientRect();
      if (r.left >= box.left + box.width * 0.1 && r.right <= box.right - box.width * 0.1) return;
      if (!marquee.getAnimations) return;
      const loops = marquee.getAnimations({ subtree: true }).filter((a) => a.animationName === "marquee");
      if (!loops.length) return; // Reduced motion: nothing moves

      const timing = loops[0].effect.getComputedTiming();
      const travel = group.getBoundingClientRect().width + (parseFloat(getComputedStyle(marquee).columnGap) || 0);
      const restingX = r.left - box.left + (timing.progress || 0) * travel; // where it sits unshifted
      const progress = Math.min(Math.max((restingX + r.width / 2 - box.width / 2) / travel, 0), 0.999);
      loops.forEach((a) => { a.currentTime = progress * timing.duration; });
    });

    marquee.addEventListener("focusout", (e) => {
      if (!marquee.contains(e.relatedTarget)) marquee.classList.remove("is-focused");
    });
  }
})();
