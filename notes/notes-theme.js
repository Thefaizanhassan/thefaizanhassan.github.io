/* NOTES THEME — load in <head> (not deferred) so the saved theme applies before first paint.
   Shares the "theme" localStorage key with the portfolio, so a visitor's choice follows them
   between the portfolio and every note. Sets the portfolio's `dark-mode` class (read by
   ../css/style.css and ../js/background.js) and `data-theme` (read by the --nt-* tokens in
   notes-theme.css), adds the floating Home and theme buttons, and fires a "themechange" event. */
(function () {
  var KEY = "theme";
  var root = document.documentElement;

  function read() {
    try { return localStorage.getItem(KEY); } catch (e) { return null; }
  }

  function write(value) {
    try { localStorage.setItem(KEY, value); } catch (e) { /* storage blocked: theme still switches */ }
  }

  function current() {
    return root.classList.contains("dark-mode") ? "dark" : "light";
  }

  function apply(theme) {
    root.classList.toggle("dark-mode", theme === "dark");
    root.setAttribute("data-theme", theme);
  }

  apply(read() === "dark" ? "dark" : "light");

  window.notesTheme = { current: current };

  document.addEventListener("DOMContentLoaded", function () {
    var home = document.createElement("a");
    home.className = "nt-fab nt-home";
    home.href = "../index.html";
    home.title = "Back to portfolio";
    home.setAttribute("aria-label", "Back to portfolio");
    home.innerHTML =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
      'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/><path d="M10 21v-6h4v6"/></svg>';

    var toggle = document.createElement("button");
    toggle.type = "button";
    toggle.className = "nt-fab nt-theme";
    toggle.setAttribute("aria-label", "Toggle dark mode");

    function label() {
      toggle.textContent = current() === "dark" ? "☀️" : "🌙";
    }

    toggle.addEventListener("click", function () {
      var next = current() === "dark" ? "light" : "dark";
      apply(next);
      write(next);
      label();
      document.dispatchEvent(new CustomEvent("themechange", { detail: { theme: next } }));
    });

    label();
    document.body.appendChild(home);
    document.body.appendChild(toggle);

    // Keep the footer year current, as on the portfolio
    var year = document.getElementById("year");
    if (year) year.textContent = new Date().getFullYear();
  });
})();
