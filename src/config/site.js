/**
 * Site identity — single source of truth.
 *
 * Why this file exists
 * ────────────────────
 * The public contact address and social links were previously hardcoded in
 * Contact.jsx, ContactPage.jsx, and Footer.jsx. Those copies drifted: two of
 * them listed different email addresses. That is the normal fate of any value
 * duplicated across files.
 *
 * Rebranding is now a one-line diff here rather than a search-and-replace
 * across files you have forgotten exist.
 *
 * See docs/decisions/0002-email-identity-separation.md
 *
 * What belongs here: values that are DISPLAYED and that you expect to change.
 * What does not: secrets (.env), and anything that varies between local and
 * production deploys (.env). This file is committed and public.
 */

export const site = {
  name: "Awodi Ochiponu",
  handle: "CosmiCodeArcher",
  role: "Software Engineer",
  tagline: "Building experiences that blend creativity with functionality",
  url: "https://cc-archer.netlify.app",
};

/**
 * PUBLIC contact address — identity #4 in ADR 0002.
 *
 * Currently an interim Gmail. The plan is to move this to a name-based domain
 * address (e.g. hello@awodi.dev) forwarded free via Cloudflare Email Routing.
 * When that happens, change this one line. Nothing else needs to move.
 *
 * Deliberately NOT read from an env var: it is display content, not
 * configuration. It does not differ between local and production, and putting
 * it in .env would mean a missing variable silently renders an empty mailto
 * link in production.
 */
export const contactEmail = "gackmar@gmail.com";

/**
 * Bot-resistant rendering of the address.
 *
 * Scrapers harvest `mailto:` hrefs from public pages. This is a speed bump,
 * not a wall — a headless browser reading rendered DOM defeats it trivially.
 * It filters the low-effort majority, which is most of the volume.
 *
 * The honest tradeoff: obfuscation that breaks the link for keyboard and
 * screen-reader users is a bad trade. This keeps a real anchor element with a
 * real href, so assistive tech behaves normally.
 */
export const contactEmailParts = {
  user: contactEmail.split("@")[0],
  domain: contactEmail.split("@")[1],
};

export const socials = [
  {
    name: "GitHub",
    handle: "CosmiCodeArcher",
    url: "https://github.com/CosmiCodeArcher",
    description: "Check out my code",
    // Tailwind gradient classes must appear as complete literal strings
    // somewhere in the source, or the JIT compiler will not generate them.
    // Building them dynamically (`from-${color}-400`) produces classes that
    // exist in the DOM but not in the stylesheet. A common and confusing bug.
    gradient: "from-gray-600 to-gray-800",
  },
  {
    name: "LinkedIn",
    handle: "awodi-ochiponu",
    url: "https://www.linkedin.com/in/awodi-ochiponu-b10126204",
    description: "Let's connect professionally",
    gradient: "from-blue-400 to-cyan-400",
  },
  {
    name: "Email",
    handle: contactEmail,
    url: `mailto:${contactEmail}`,
    description: "Drop me an email",
    gradient: "from-red-400 to-pink-400",
  },
];

/**
 * Navigation. Sections render within the single-page shell; routes are
 * separate pages. Keeping them in one list makes it obvious which is which
 * when you add a new wing (writing, vault, games).
 */
export const navSections = [
  { id: "portfolio", label: "Portfolio", preview: "See my projects" },
  { id: "about", label: "About", preview: "Learn about me" },
  { id: "contact", label: "Contact", preview: "Get in touch" },
];

export default site;
