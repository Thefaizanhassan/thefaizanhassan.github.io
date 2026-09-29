// Projects in the Projects carousel. js/sections.js builds one card per entry, in this order (numbered
// 01, 02, ...), so adding a project only means adding an object here (see README.md).
//
//   title   Project name
//   image   Screenshot or thumbnail (square works best), e.g. "assets/Projects/my-project.png"
//   alt     Short description of the image, for screen readers
//   links   Buttons under the card, left to right: { label, url }. The last one is the main,
//           solid button; any before it are outlined. Links open in a new tab.
const projects = [
  {
    title: "Lumina",
    image: "assets/Projects/Lumina.png",
    alt: "Lumina - Universal Wisdom guide",
    links: [
      { label: "GitHub", url: "https://github.com/Thefaizanhassan/Lumina" }
    ]
  },
  {
    title: "My Mcp Server",
    image: "assets/Projects/myMCPProject.png",
    alt: "MCP Server project",
    links: [
      { label: "GitHub", url: "https://github.com/Thefaizanhassan/myMcpServer" }
    ]
  },
  {
    title: "Resume Category Classifier",
    image: "assets/Projects/resumeClassifierProject.png",
    alt: "Resume Category Classifier",
    links: [
      { label: "GitHub", url: "https://github.com/Thefaizanhassan/ResumeCategoryClassifier" }
    ]
  },
  {
    title: "Calculator",
    image: "assets/Projects/calculator.png",
    alt: "Calculator project",
    links: [
      { label: "GitHub", url: "https://github.com/Thefaizanhassan" },
      { label: "Live Demo", url: "./projects/calculator/index.html" }
    ]
  },
  {
    title: "Pocket Full of Flowers",
    image: "assets/Projects/project-5.png",
    alt: "Pocket Full of Flowers project",
    links: [
      { label: "GitHub", url: "https://github.com/Thefaizanhassan/pocketfulflower" },
      { label: "Live Demo", url: "https://pocketfullofflowers.vercel.app/" }
    ]
  },
  {
    title: "Python Password Generator",
    image: "assets/Projects/project-4.png",
    alt: "Python Password Generator project",
    links: [
      { label: "GitHub", url: "https://github.com/Thefaizanhassan/PythonPasswordGenerator" },
      { label: "View Code", url: "./projects/pythonPasswordGenerator/index.html" }
    ]
  },
  {
    title: "Automated Email",
    image: "assets/Projects/project-1.png",
    alt: "Automated Email project",
    links: [
      { label: "GitHub", url: "https://github.com/Thefaizanhassan/Automated-Email-Trigger-App" }
    ]
  },
  {
    title: "Tic Tac Toe",
    image: "assets/Projects/project-2.png",
    alt: "Tic Tac Toe project",
    links: [
      { label: "GitHub", url: "https://github.com/Thefaizanhassan/TicTacToe" }
    ]
  },
  {
    title: "Generate Shark Image",
    image: "assets/Projects/project-3.png",
    alt: "Generate Shark Image project",
    links: [
      { label: "Google Drive", url: "https://drive.google.com/file/d/17A6caimnUNpC94hL9rWfe5YRFMzUyGSH/view?usp=sharing" }
    ]
  }
];
