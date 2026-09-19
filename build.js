// Builds the static site from data.js + template.html.
// No dependencies and no client-side JS: the output is plain HTML.
//
//   npm run build        (or: node build.js)
//
// Writes index.html, sitemap.xml and robots.txt next to this file.

import { readFileSync, writeFileSync } from "node:fs";
import data from "./data.js";

const { updated, cities, programs = {}, email, goatcounter } = data;
const url = data.url.replace(/\/+$/, "");

const read = (file) => readFileSync(new URL(file, import.meta.url), "utf8");
const write = (file, text) =>
  writeFileSync(new URL(file, import.meta.url), text);

const esc = (s) =>
  String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
const indent = (s, n) => s.replace(/^(?=.)/gm, " ".repeat(n));
const phoneDigits = (s) => s.replace(/[^\d+]/g, ""); // "22 123-45-67" -> "221234567", for tel: links
const formatDate = (iso) =>
  new Date(iso).toLocaleDateString("pl-PL", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
// "Nowy Sącz" -> "nowy-sacz" (ł has no decomposition, so it is handled separately)
const slug = (s) =>
  s
    .toLowerCase()
    .replace(/ł/g, "l")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

// With GoatCounter on, links get a data-goatcounter-click attribute so their clicks are counted
const track = (name, title) =>
  goatcounter
    ? ` data-goatcounter-click="${name}" data-goatcounter-title="${esc(title)}"`
    : "";

// Replaces {{name}} in the template. Multi-line values are re-indented to the placeholder's column,
// and an empty value removes the whole line.
const fill = (template, vars) =>
  template.replace(/([ \t]*)\{\{(\w+)\}\}(\n?)/g, (_, ws, key, nl) => {
    if (!(key in vars))
      throw new Error(`template.html: unknown placeholder {{${key}}}`);
    if (vars[key] === "") return "";
    return ws + vars[key].replace(/\n(?=[^\n])/g, "\n" + ws) + nl;
  });

// Fail loudly on bad data instead of publishing "undefined"
if (!/^\d{4}-\d{2}-\d{2}$/.test(updated))
  throw new Error(
    `data.js: "updated" must look like 2026-09-19, got "${updated}"`,
  );
if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email))
  throw new Error(
    `data.js: "email" doesn't look like an e-mail address: "${email}"`,
  );
if (goatcounter && !/^[a-z0-9][a-z0-9-]*$/.test(goatcounter))
  throw new Error(
    `data.js: "goatcounter" must be just your site code, like "mysite" from mysite.goatcounter.com, got "${goatcounter}"`,
  );
const checkVisible = (obj, where) => {
  if ("isVisible" in obj && typeof obj.isVisible !== "boolean")
    throw new Error(`data.js: ${where}: isVisible must be true or false`);
};
for (const [id, pr] of Object.entries(programs)) {
  for (const key of ["label", "url"]) {
    if (!pr[key])
      throw new Error(`data.js: program "${id}" is missing "${key}"`);
  }
  checkVisible(pr, `program "${id}"`);
}
for (const [city, places] of Object.entries(cities)) {
  places.forEach((p, i) => {
    for (const key of ["name", "promo", "street"]) {
      if (!p[key])
        throw new Error(
          `data.js: ${city}, place #${i + 1} is missing "${key}"`,
        );
    }
    if (p.program && !programs[p.program])
      throw new Error(
        `data.js: ${city}, place #${i + 1} uses unknown program "${p.program}"`,
      );
    if (p.phone && !/^\+?\d{9,15}$/.test(phoneDigits(p.phone)))
      throw new Error(
        `data.js: ${city}, place #${i + 1}: "phone" doesn't look like a phone number: "${p.phone}"`,
      );
    checkVisible(p, `${city}, place #${i + 1}`);
  });
}

// A place is hidden when it, or the program it belongs to, has isVisible: false.
// Hidden places are still validated above, and cities left with no visible places are dropped.
const isVisible = (p) =>
  p.isVisible !== false && programs[p.program]?.isVisible !== false;
const visible = Object.fromEntries(
  Object.entries(cities)
    .map(([city, places]) => [city, places.filter(isVisible)])
    .filter(([, places]) => places.length > 0),
);

// Order matters: name, address (links to the map), promo, who it is for, then the small print
const renderPlace = (city, p) => {
  const address = `${p.street}, ${city}`;
  const map = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
  const details = [p.when, p.how].filter(Boolean);
  const program = programs[p.program];
  return [
    '<li class="place" itemscope itemtype="https://schema.org/CafeOrCoffeeShop">',
    `  <h3 itemprop="name">${esc(p.name)}</h3>`,
    '  <p class="address" itemprop="address" itemscope itemtype="https://schema.org/PostalAddress">',
    `    <a href="${esc(map)}" target="_blank" rel="noopener"${track(`map-${slug(city)}-${slug(p.name)}`, `Mapa: ${p.name} (${city})`)} aria-label="${esc(address)} – pokaż na mapie (otwiera się w nowej karcie)"><span itemprop="streetAddress">${esc(p.street)}</span>, <span itemprop="addressLocality">${esc(city)}</span></a>`,
    '    <meta itemprop="addressCountry" content="PL">',
    "  </p>",
    ...(p.phone
      ? [
          `  <p class="phone">tel.: <a href="tel:${esc(phoneDigits(p.phone))}"${track(`tel-${slug(city)}-${slug(p.name)}`, `Telefon: ${p.name} (${city})`)}><span itemprop="telephone">${esc(p.phone)}</span></a></p>`,
        ]
      : []),
    '  <p class="promo" itemprop="makesOffer" itemscope itemtype="https://schema.org/Offer">',
    `    <span itemprop="description">${esc(p.promo)}</span>`,
    "  </p>",
    ...(program
      ? [
          `  <p class="local"><strong>${esc(program.label)}</strong> – <a href="${esc(program.url)}" target="_blank" rel="noopener"${track(`info-${p.program}`, `Więcej informacji: ${program.label}`)} aria-label="więcej informacji – ${esc(program.label)} (otwiera się w nowej karcie)">więcej informacji</a></p>`,
        ]
      : []),
    ...(details.length
      ? [
          '  <p class="details">',
          ...details.map((d) => `    <span>${esc(d)}</span>`),
          "  </p>",
        ]
      : []),
    "</li>",
  ].join("\n");
};

const renderCity = (city) => {
  const id = slug(city);
  return [
    `<section id="${id}" aria-labelledby="${id}-h">`,
    '  <div class="city-head">',
    `    <h2 id="${id}-h">${esc(city)}</h2>`,
    ...(several
      ? ['    <a class="change" href="#miasta">Zmień miasto</a>']
      : []),
    "  </div>",
    '  <ul class="places">',
    visible[city].map((p) => indent(renderPlace(city, p), 4)).join("\n\n"),
    "  </ul>",
    "</section>",
  ].join("\n");
};

const names = Object.keys(visible).sort((a, b) => a.localeCompare(b, "pl"));
if (names.length === 0)
  throw new Error(
    "data.js: every place is hidden, so there is nothing to publish",
  );

// The city list (and everything that points at it) only makes sense with more than one city
const several = names.length > 1;
const cityNav = several
  ? [
      '<nav aria-labelledby="miasta">',
      '  <h2 id="miasta">Wybierz miasto</h2>',
      '  <ul class="cities">',
      ...names.map((c) => `    <li><a href="#${slug(c)}">${esc(c)}</a></li>`),
      "  </ul>",
      "</nav>",
    ].join("\n")
  : "";
const updatedText = formatDate(updated);
const contact = email
  ? `<p class="contact"><span>Znasz kawiarnię ze zniżką dla seniorów albo widzisz nieaktualną informację?</span> <span>Napisz do nas: <a href="mailto:${esc(email)}"${track("email", "Kontakt e-mail")}>${esc(email)}</a></span></p>`
  : "";
const analytics = goatcounter
  ? `<script data-goatcounter="https://${goatcounter}.goatcounter.com/count" async src="https://gc.zgo.at/count.js"></script>`
  : "";

// The description names the cities that are actually on the page, so it never
// promises more than the page delivers. Set `title` or `description` in data.js
// to override either one.
const siteName = "Kawa dla seniora";
const joinNames = (list) =>
  list.length > 1
    ? `${list.slice(0, -1).join(", ")} i ${list.at(-1)}`
    : list[0];
const makeDescription = (where) =>
  `Zniżki dla seniorów w kawiarniach – ${where}. Adresy, promocje i telefony w jednym miejscu.`;
// Name as many cities as fit in the ~160 characters that search results show
const wheres = [
  joinNames(names),
  `${names.slice(0, 3).join(", ")} i inne miasta`,
  `${names.slice(0, 2).join(", ")} i inne miasta`,
  `${names[0]} i inne miasta`,
  "wiele miast",
];
const where =
  wheres.find((w) => makeDescription(w).length <= 160) ?? wheres.at(-1);
const title = data.title ?? `${siteName} – zniżki w kawiarniach`;
const description = data.description ?? makeDescription(where);

// One JSON-LD block for the whole page (the places carry their own microdata)
const pageUrl = `${url}/`;
const jsonld = JSON.stringify(
  {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${pageUrl}#website`,
        url: pageUrl,
        name: siteName,
        alternateName: new URL(url).host,
        description,
        inLanguage: "pl-PL",
      },
      {
        "@type": "WebPage",
        "@id": `${pageUrl}#webpage`,
        url: pageUrl,
        name: title,
        description,
        inLanguage: "pl-PL",
        isPartOf: { "@id": `${pageUrl}#website` },
        dateModified: updated,
      },
    ],
  },
  null,
  2,
).replace(/</g, "\\u003c");

const page = fill(read("template.html"), {
  url,
  updated,
  updatedText,
  title: esc(title),
  description: esc(description),
  jsonld,
  contact,
  analytics,
  layout: several ? "columns" : "single",
  cityNav,
  sections: names.map(renderCity).join("\n\n"),
});

write("index.html", page);

write(
  "sitemap.xml",
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${url}/</loc>
    <lastmod>${updated}</lastmod>
  </url>
</urlset>
`,
);

write(
  "robots.txt",
  `User-agent: *
Allow: /

Sitemap: ${url}/sitemap.xml
`,
);

const count = names.reduce((n, c) => n + visible[c].length, 0);
const total = Object.values(cities).reduce((n, places) => n + places.length, 0);
const hidden = total > count ? ` (${total - count} hidden)` : "";
console.log(
  `Built ${count} places in ${names.length} cities${hidden} -> index.html, sitemap.xml, robots.txt`,
);

// The footer tells people to call the café, so every visible place should have a number
const noPhone = names.flatMap((c) =>
  visible[c].filter((p) => !p.phone).map((p) => `${p.name} (${c})`),
);
if (noPhone.length)
  console.warn(
    `Warning: ${noPhone.length} visible place(s) without a phone number: ${noPhone.join(", ")}`,
  );

// Search results cut long titles and descriptions off
if (title.length > 60)
  console.warn(
    `Warning: title is ${title.length} characters, search results show about 60`,
  );
if (description.length < 70 || description.length > 160)
  console.warn(
    `Warning: description is ${description.length} characters, aim for 70-160`,
  );
