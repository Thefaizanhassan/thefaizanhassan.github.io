# 🚀 Faizan Hassan's Portfolio

My personal portfolio: a static website (HTML, CSS and plain JavaScript) published with GitHub Pages at
**https://thefaizanhassan.github.io/**.

It introduces me as a software developer and aspiring data scientist, and collects my internship,
skills, projects, certifications, study notes and the courses I'm learning from.

---

## 📋 Contents

- [Overview](#-overview)
- [Project structure](#-project-structure)
- [Running locally and deploying](#%EF%B8%8F-running-locally-and-deploying)
- [Adding a project](#-adding-a-project)
- [Adding a certification](#-adding-a-certification)
- [Adding a Watch List course](#-adding-a-watch-list-course)
- [Adding a subject and its notes page](#-adding-a-subject-and-its-notes-page)
- [Adding a project report or document](#-adding-a-project-report-or-document)
- [Theme and design rule](#-theme-and-design-rule)
- [Asset notes](#%EF%B8%8F-asset-notes)

---

## 🌟 Overview

The page is one long scroll. In order:

1. **Hero**: "Hello, I'm", the animated FAIZAN wordmark, my roles, and the CV and contact buttons
2. **About**: a particle portrait (three.js), experience and education cards, and a short bio
3. **Experience**: my internship at Konkuwan Herbs, with the GitHub repository and the project report
4. **Skills**
5. **Projects**: a 3D coverflow of my projects that scrolls sideways round in a circle, built from a
   data file
6. **Certifications**: a sideways-scrolling row with one card per certificate, built from a data file
7. **Watch List**: a sideways-scrolling row of flip cards for courses I'm learning from, built from a
   data file
8. **Core Subjects**: a moving row of links to my study notes, built from a data file
9. **Contact**

Light and dark themes are remembered in `localStorage` under the key `theme`, and the notes pages and
project demo pages share that setting. Motion respects the visitor's *reduce motion* setting, and the Core Subjects row has a
pause button.

---

## 📁 Project structure

```text
.
├── index.html                    # The portfolio page
├── css/
│   └── style.css                 # The design system: colour tokens, glass cards, buttons,
│                                 #   every section's styles and the responsive rules
├── js/
│   ├── data/
│   │   ├── projects.js           # ✏️ Projects in the carousel (edit to add one)
│   │   ├── certifications.js     # ✏️ Certifications shown on the page (edit to add one)
│   │   ├── watchlist.js          # ✏️ Watch List courses (edit to add one)
│   │   └── subjects.js           # ✏️ Core Subjects in the moving row (edit to add one)
│   ├── sections.js               # Builds the Projects, Certifications, Watch List and Core Subjects
│   │                             #   from js/data/, and runs the sideways rows' arrow buttons
│   ├── main.js                   # Theme toggle, navigation, scroll reveal, card tilt, projects, flip cards
│   ├── wordmark.js               # The animated FAIZAN wordmark in the hero
│   ├── background.js             # The animated contour background below the hero
│   └── portrait.js               # The particle portrait in About (loads three.js from a CDN)
├── assets/
│   ├── Faizan Hassan CV.pdf
│   ├── Konkuwan_Herbs_Internship_Report.pdf
│   ├── Certifications/           # Certificate images (capital C, see Asset notes)
│   ├── Projects/                 # Project thumbnails
│   ├── profile-pic.png
│   └── profile-pic.ico           # Favicon
├── notes/
│   ├── notes-theme.css           # Notes reading styles, floating buttons and --nt-* colour tokens
│   ├── notes-theme.js            # Applies the shared theme; adds the Home and theme buttons
│   ├── _template.html            # Starting point for a new notes page (not published)
│   └── <subject>.html            # One page per Core Subject, e.g. operating-systems.html
└── projects/                     # Demo pages linked from the Projects section
    ├── project-page.css          # Shared frame of every demo page: top bar, heading, "built with" chips
    ├── project-page.js           # Applies the shared theme and runs the theme button
    ├── calculator/               # index.html, style.css, script.js
    └── pythonPasswordGenerator/  # index.html, style.css
```

`js/sections.js` loads just before `js/main.js`, so the cards it builds get the same carousel, scroll
reveal, tilt and card flipping as the rest of the page. Keep that order in `index.html`.

The Projects coverflow and the Certifications and Watch List rows all scroll sideways with a trackpad,
touch, or the arrow keys once focused; the two rows also have a scrollbar.

- **Projects** goes round in a circle: after the last project comes the first again, in both
  directions. `js/sections.js` puts copies of the cards either side of the real ones (hidden from
  screen readers and the Tab key), and `js/main.js` hops back to the real cards whenever a scroll comes
  to rest. It also has arrow buttons, dots (hidden on phones) and a counter.
- **Certifications and Watch List** have a start and an end. Their arrow buttons appear by themselves
  whenever the cards don't all fit on screen.

---

## 🖥️ Running locally and deploying

There is **no `package.json`, build step, linter or test suite**. The site is plain HTML, CSS and
JavaScript, and the files in this repository are exactly what gets served. Nothing needs installing.

- **Quick look:** open `index.html` in a browser.
- **Closest to the live site:** serve the folder with any static server, for example Python's (it
  ships with macOS and most Linux systems):

  ```bash
  python3 -m http.server 8000
  ```

  Then open <http://localhost:8000>.

If an edit doesn't show up, hard-reload the page (<kbd>Cmd</kbd>+<kbd>Shift</kbd>+<kbd>R</kbd> on a Mac,
<kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>R</kbd> elsewhere): browsers can keep an older copy of a CSS or JS file.

**Deploying:** GitHub Pages publishes this repository. Push to `main`, and
https://thefaizanhassan.github.io/ updates within a minute or two.

---

## 🚀 Adding a project

Only the data file changes. The carousel numbers the cards, and builds its dots, counter and loop, by
itself.

1. Put a screenshot in `assets/Projects/`. Square images fit the card best.
2. Add an object to the `projects` list in `js/data/projects.js`:

```js
{
  title: "Weather Dashboard",
  image: "assets/Projects/weather-dashboard.png",
  alt: "Weather Dashboard showing a five-day forecast",
  links: [
    { label: "GitHub", url: "https://github.com/Thefaizanhassan/weather-dashboard" },
    { label: "Live Demo", url: "https://weather-dashboard.vercel.app/" }
  ]
}
```

- **Buttons:** `links` are the buttons under the card, left to right. The last one is the main, solid
  button and any before it are outlined, so a project with only a GitHub link gets one solid button.
  Every link opens in a new tab.
- **Local demos:** a demo kept in this repository is linked by its path, e.g.
  `"./projects/calculator/index.html"`. See [Adding a demo page](#adding-a-demo-page) below.
- **Order:** the cards appear in the order of the list. The first one starts in front.

### Adding a demo page

A demo that runs on this site gets its own folder, e.g. `projects/weather-dashboard/`, and looks like
the portfolio: the same colours in both themes, the contour background, the glass top bar and the
theme button.

1. Copy `projects/calculator/index.html` into the new folder. Keep its `<head>` (the favicon,
   `../project-page.js`, the fonts, `../../css/style.css`, `../project-page.css` and
   `../../js/background.js`), the top bar, the heading, the footer and the theme button. Change the
   title, the description, the GitHub link and the "Built with" chips.
2. Replace the calculator with the demo, and put its styles in the folder's own `style.css`. Use the
   portfolio's colour tokens (`var(--ink)`, `var(--text)`, `var(--glass-hi)`, `var(--accent)`, …) so it
   works in light and dark mode.
3. Keep the demo's scripts to its own elements, e.g. `document.querySelectorAll(".calculator button")`
   rather than every `button`, because the page also has the theme button.
4. Link it from the project's entry in `js/data/projects.js`, e.g.
   `{ label: "Live Demo", url: "./projects/weather-dashboard/index.html" }`.

---

## 🏅 Adding a certification

Only the data file changes. The card markup is built for you.

1. Put the certificate image in `assets/Certifications/`.
2. Add an object to the `certifications` list in `js/data/certifications.js`:

```js
{
  title: "Machine Learning Specialization",       // Certificate name
  issuer: "Coursera",                              // Issuing organisation
  credentialId: "ABC123XYZ",                       // "" if there is no ID: the card shows N/A
  credentialUrl: "https://coursera.org/verify/ABC123XYZ",
  image: "assets/Certifications/Machine_Learning.png"
}
```

The cards appear in the order of the list. Each shows the image (click it to open full size), the
issuer, the title, the credential ID and a **Show Credential** button that opens `credentialUrl` in a
new tab.

---

## 🎬 Adding a Watch List course

Only the data file changes. Each course becomes a flip card: the front shows the thumbnail, title,
summary, duration and level, and **Course Details** flips it to show the topics and description.

Add an object to the `watchlist` list in `js/data/watchlist.js`:

```js
{
  title: "Git and GitHub for Beginners",
  url: "https://www.youtube.com/watch?v=VIDEO_ID",  // YouTube: the thumbnail is found automatically
  summary: "A crash course in version control with Git and GitHub.",
  duration: "1 hr 8 min",
  level: "Beginner",
  topics: [
    "What Git is and why it matters",
    "Commits, branches and merging",
    "Pushing to GitHub and opening pull requests"
  ],
  description: "A hands-on introduction to Git and GitHub, from the first commit to collaborating on a project."
}
```

- For a course that isn't on YouTube, add `thumbnail: "https://…/image.jpg"` (or a path in `assets/`).
  Its button then reads **Open Course** instead of **Watch on YouTube**.
- Any field except `title` and `url` can be left out; the card simply skips it.
- Cards appear in the order of the list. Once they no longer fit on screen, the row scrolls sideways and
  its arrow buttons appear.

---

## 📚 Adding a subject and its notes page

1. **Add the subject** to the `subjects` list in `js/data/subjects.js`:

   ```js
   {
     name: "New Subject",
     href: "notes/new-subject.html"
   }
   ```

   The moving row picks it up automatically and keeps the same speed however many subjects there are.

2. **Create its notes page** at the `href` you used:
   - Copy `notes/_template.html` to `notes/new-subject.html`.
   - Replace `Subject Name` in the `<title>`, the description and the `<h1>`.
   - Write the notes between the `NOTES START` and `NOTES END` comments. The template shows the
     supported pieces: topic sections with `<h2>`, lists, code blocks, tables and callouts.

**File names:** lowercase, with words joined by hyphens and `&` written as `and`, for example
`design-and-analysis-of-algorithms.html`. The `href` is relative to `index.html`, so it always starts
with `notes/`.

A notes page links `../css/style.css` (the portfolio's design system) and then
`notes/notes-theme.css`, so it matches the portfolio in both themes. `notes/notes-theme.js` loads in the
`<head>`: it applies the saved theme before the page appears and adds the floating Home and theme
buttons. Subjects without notes yet show a "Notes on the way" card. Replace that card when the notes
are written.

---

## 📄 Adding a project report or document

1. Put the file in `assets/`, e.g. `assets/My_Project_Report.pdf`. Prefer names without spaces; the
   existing `Faizan Hassan CV.pdf` keeps its name.
2. Link it the same way as the CV and internship-report buttons: it opens in a new tab.

```html
<a class="btn btn-solid" href="./assets/My_Project_Report.pdf" target="_blank" rel="noopener" type="application/pdf">
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/></svg>
  Project Report<span class="sr-only"> (PDF, opens in a new tab)</span>
</a>
```

- `btn-solid` is the main action and `btn-ghost` the secondary one. Add `btn-sm` inside cards.
- Keep the `sr-only` text, so screen readers announce that it is a PDF opening in a new tab.
- Group several buttons in `<div class="btn-row">`, like the Experience section does.

---

## 🎨 Theme and design rule

> **New content and sections must reuse the existing design system and must not introduce a new
> visual theme.**

In practice:

- **Colours** come only from the tokens at the top of `css/style.css` (`--ink`, `--text`, `--muted`,
  `--line`, `--glass`, `--accent`, …). Dark mode is the `.dark-mode` block beneath them. Don't add new
  colours.
- **Build with the existing pieces:**
  - a `section.block` with a `.sec-head` (`.eyebrow` and `.sec-title`)
  - `.glass` cards, with `data-tilt` for the 3D tilt
  - `.btn` with `.btn-solid`, `.btn-ghost` and `.btn-sm`
  - `.chips` and `.chip`, `.count`, `.topics-label` and `.stat-icon`
- **Motion:** wrap blocks in `.reveal` to scroll them in, and stagger them with `style="--d: 0.08s"`.
- **Spacing:** sections get their spacing from `section.block` and headings from `.sec-head`. The
  page is deliberately compact, so don't add extra margins between sections.
- **Responsiveness:** add rules to the existing breakpoints (1000px, 860px, 640px, 420px) and to the
  `prefers-reduced-motion` block, rather than making new ones.
- **New sections** get a link in both the top navigation and the footer.
- **Notes pages** follow the same rule, through `../css/style.css` and `notes/notes-theme.css`.
- **Project demo pages** follow it too, through `../../css/style.css` and `projects/project-page.css`.

---

## 🗂️ Asset notes

- The certificate folder is **`assets/Certifications/`**, with a capital C. GitHub Pages is
  case-sensitive, so a path written as `assets/certifications/` works on a Mac but breaks on the live
  site.
- Which image each certificate uses:

  | Certification | Image in `assets/Certifications/` |
  | --- | --- |
  | Google AI Fundamentals (Coursera) | `AI_Fundamentals.jpeg` |
  | Claude 101 (Anthropic) | `Claude_101_certificate.jpg` |
  | Introduction to Generative AI Studio (Simplilearn) | `Introduction_to_Generative_AI_Studio.png` |
  | Introduction to Prompt Engineering with GitHub Copilot (Simplilearn) | `Introduction_to_Prompt_Engineering_with_GitHub_Copilot.png` |
  | Java Foundations (Oracle) | `Java_Foundation.png` |
  | SQL (Advanced) (HackerRank) | `SQL_Advanced.png` |

- `Claude_101_bragde.png` is the Claude 101 course badge. It isn't used; to show it instead of the
  certificate, change that entry's `image`.
- The two Simplilearn images are JPEG files with `.png` names. Browsers display them correctly, so
  they keep their names.

---

## 📞 Contact

- **Email:** [thefaizanhassan@gmail.com](mailto:thefaizanhassan@gmail.com)
- **LinkedIn:** [thefaizanhassan](https://www.linkedin.com/in/thefaizanhassan/)
- **GitHub:** [Thefaizanhassan](https://github.com/Thefaizanhassan)
