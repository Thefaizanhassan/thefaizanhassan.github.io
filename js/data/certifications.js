// Certifications shown in the Certifications section. js/sections.js builds one card per entry,
// in this order, so adding a certificate only means adding an object here (see README.md).
//
//   title          Certificate name, as printed on it
//   issuer         Issuing organisation
//   credentialId   ID printed on the certificate. Leave it "" if there is none: the card shows N/A
//   credentialUrl  Where it can be verified. Opens in a new tab from the card's button
//   image          Picture of the certificate. The folder is assets/Certifications/ with a capital
//                  C, and GitHub Pages is case-sensitive, so copy the file name exactly
const certifications = [
  {
    title: "Google AI Fundamentals",
    issuer: "Coursera",
    credentialId: "WNTRQNUE75U0",
    credentialUrl: "https://coursera.org/verify/WNTRQNUE75U0",
    image: "assets/Certifications/AI_Fundamentals.jpeg"
  },
  {
    title: "Claude 101",
    issuer: "Anthropic",
    credentialId: "dz9gygzz4a3z",
    credentialUrl: "https://verify.skilljar.com/c/dz9gygzz4a3z",
    // The certificate itself; the course badge is assets/Certifications/Claude_101_bragde.png
    image: "assets/Certifications/Claude_101_certificate.jpg"
  },
  {
    title: "Introduction to Generative AI Studio",
    issuer: "Simplilearn",
    credentialId: "Dgk497nYr0b",
    credentialUrl: "https://simpli-web.app.link/e/Dgk497nYr0b",
    image: "assets/Certifications/Introduction_to_Generative_AI_Studio.png"
  },
  {
    title: "Introduction to Prompt Engineering with GitHub Copilot",
    issuer: "Simplilearn",
    credentialId: "3SO1LciYr0b",
    credentialUrl: "https://simpli-web.app.link/e/3SO1LciYr0b",
    image: "assets/Certifications/Introduction_to_Prompt_Engineering_with_GitHub_Copilot.png"
  },
  {
    title: "Java Foundations",
    issuer: "Oracle",
    credentialId: "", // No ID on this certificate
    credentialUrl: "https://drive.google.com/file/d/1_YmV6913PjuFQhu3gDqc3vsjPQjFze4l",
    image: "assets/Certifications/Java_Foundation.png"
  },
  {
    title: "SQL (Advanced)",
    issuer: "HackerRank",
    credentialId: "ecda27ca707e",
    credentialUrl: "https://www.hackerrank.com/certificates/ecda27ca707e",
    image: "assets/Certifications/SQL_Advanced.png"
  }
];
