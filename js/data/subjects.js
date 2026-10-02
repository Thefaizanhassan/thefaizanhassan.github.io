// Subjects in the Core Subjects marquee. js/sections.js turns each entry into a link and sets the
// marquee's pace from how many there are, so adding a subject only means adding an object here.
//
//   name   Subject name, as shown on the link
//   href   Its notes page, relative to index.html. Create the page by copying
//          notes/_template.html to notes/<subject-name>.html (lowercase, words joined by "-")
const subjects = [
  { name: "Operating Systems", href: "notes/operating-systems.html" },
  { name: "Computer Networks", href: "notes/computer-networks.html" },
  { name: "Machine Learning", href: "notes/machine-learning.html" },
  { name: "Compiler Design", href: "notes/compiler-design.html" },
  { name: "Database Management Systems", href: "notes/database-management-systems.html" },
  { name: "Theory of Computation", href: "notes/theory-of-computation.html" },
  { name: "Linear Algebra", href: "notes/linear-algebra.html" },
  { name: "Discrete Structures", href: "notes/discrete-structures.html" },
  { name: "Design & Analysis of Algorithms", href: "notes/design-and-analysis-of-algorithms.html" }
];
