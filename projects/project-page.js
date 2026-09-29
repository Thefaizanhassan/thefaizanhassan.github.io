// PROJECT DEMO PAGES: shared by every page in /projects. Load it in <head> (not deferred) so the
// saved theme applies before the first paint. It uses the portfolio's "theme" localStorage key, so a
// visitor's light or dark choice follows them onto the demos. It also runs the page's theme button
// (#theme-toggle), fires "themechange" (../../js/background.js redraws on it) and sets the footer year.
(function () {
  const root = document.documentElement;
  try {
    if (localStorage.getItem("theme") === "dark") root.classList.add("dark-mode");
  } catch (e) {}

  document.addEventListener("DOMContentLoaded", () => {
    const year = document.getElementById("year");
    if (year) year.textContent = new Date().getFullYear();

    const toggle = document.getElementById("theme-toggle");
    if (!toggle) return;
    const icon = toggle.querySelector(".theme-icon") || toggle;
    const setIcon = () => { icon.textContent = root.classList.contains("dark-mode") ? "☀️" : "🌙"; };
    setIcon();
    toggle.addEventListener("click", () => {
      root.classList.toggle("dark-mode");
      setIcon();
      try { localStorage.setItem("theme", root.classList.contains("dark-mode") ? "dark" : "light"); } catch (e) {}
      document.dispatchEvent(new CustomEvent("themechange"));
    });
  });
})();
