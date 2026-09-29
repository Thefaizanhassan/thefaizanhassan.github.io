// Courses in the Watch List. js/sections.js builds one flip card per entry, in this order, so adding
// a course only means adding an object here (see README.md).
//
//   title        Course name
//   url          Where to watch it. For a YouTube link the thumbnail is found automatically
//   thumbnail    Optional: an image URL or path, for a course that is not on YouTube
//   summary      A sentence or two for the front of the card
//   duration     e.g. "3 hr 10 min"
//   level        e.g. "Beginner"
//   topics       Topics covered, listed on the back of the card
//   description  A longer description, shown on the back under the topics
const watchlist = [
  {
    title: "Docker Tutorial for Beginners",
    url: "https://www.youtube.com/watch?v=pTFZFxd4hOI",
    summary: "This beginner-friendly tutorial covers the essentials for software and DevOps engineers.",
    duration: "1 hr",
    level: "Beginner",
    topics: [
      "Docker Essentials & Core Concepts",
      "Container Creation and Management",
      "Working with Docker Images",
      "Building and Using Dockerfiles",
      "Container Networking Basics",
      "Docker Compose Fundamentals"
    ],
    description: "Master Docker from scratch with this beginner-friendly tutorial. Learn all the essentials to effectively use containers, aimed at boosting the skills of aspiring and current software and DevOps engineers."
  },
  {
    title: "Computer Networking Full Course",
    url: "https://www.youtube.com/watch?v=IPvYjXCsTg8",
    summary: "A deep dive into the OSI model with real-life examples.",
    duration: "4 hr 6 min",
    level: "Beginner",
    topics: [
      "Client-Server Architecture",
      "Protocols",
      "How Data is Transferred? IP Address",
      "Port Numbers",
      "Submarine Cables Map (Optical Fibre Cables)",
      "LAN, MAN, WAN",
      "MODEM, ROUTER",
      "Topologies (BUS, RING, STAR, TREE, MESH)",
      "Structure of the Network",
      "OSI Model (7 Layers)",
      "TCP/IP Model (5 Layers)",
      "Peer to Peer Architecture",
      "Networking Devices (Download PDF)",
      "Sockets",
      "Ports",
      "HTTP",
      "HTTP(GET, POST, PUT, DELETE)",
      "Error/Status Codes",
      "Cookies",
      "How Email Works?",
      "DNS (Domain Name System)",
      "TCP/IP Model (Transport Layer)",
      "Checksum",
      "Timers",
      "UDP (User Datagram Protocol)",
      "TCP (Transmission Control Protocol)",
      "3-Way handshake",
      "TCP (Network Layer)",
      "Control Plane",
      "IP (Internet Protocol)",
      "Packets",
      "IPV4 vs IPV6",
      "Middle Boxes",
      "(NAT) Network Address Translation",
      "TCP (Data Link Layer)"
    ],
    description: "A comprehensive, beginner-friendly series designed to provide a deep dive into how the internet and data communication work. It is part of a larger DevOps Bootcamp but serves as a standalone resource for students and professionals."
  },
  {
    title: "SQL Course for Beginners",
    url: "https://www.youtube.com/watch?v=7S_tz1z_5bA",
    summary: "This beginner-friendly course teaches you SQL from scratch.",
    duration: "3 hr 10 min",
    level: "Beginner",
    topics: [
      "What is SQL?",
      "Installing MySQL",
      "The SELECT Statement",
      "The SELECT Clause",
      "The WHERE Clause",
      "The AND, OR, and NOT Operators",
      "The IN Operator",
      "The BETWEEN Operator",
      "The LIKE Operator",
      "The REGEXP Operator",
      "The IS NULL Operator",
      "The ORDER BY Operator",
      "The LIMIT Operator",
      "Inner Joins",
      "Joining Across Databases",
      "Self Joins",
      "Joining Multiple Tables",
      "Compound Join Conditions",
      "Implicit Join Syntax",
      "Outer Joins",
      "Outer Join Between Multiple Tables",
      "Self Outer Joins",
      "The USING Clause",
      "Natural Joins",
      "Cross Joins",
      "Unions",
      "Column Attributes",
      "Inserting a Single Row",
      "Inserting Multiple Rows",
      "Inserting Hierarchical Rows",
      "Creating a Copy of a Table",
      "Updating a Single Row",
      "Updating Multiple Rows",
      "Using Subqueries in Updates",
      "Deleting Rows",
      "Restoring Course Databases"
    ],
    description: "This tutorial is perfect for you if you're completely new to SQL, want a practical, hands-on approach or want to work with data."
  }
];
