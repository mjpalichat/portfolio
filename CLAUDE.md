# mattpalichat-rebuild

A static rebuild of Matt Palichat's photography/videography portfolio
(currently WordPress + Elementor at mattpalichat.com), built to fix a
~16MB-per-page-load image problem and to be genuinely maintainable by a
non-developer. Static HTML/CSS/JS output, built with Eleventy, deployed
(eventually) to GitHub Pages.

## Stack

- **Eleventy (11ty)** — static site generator. Reads `src/`, writes `_site/`.
- **eleventy-img** — generates responsive WebP/JPEG variants + `srcset` +
  `loading="lazy"` markup for every photo at build time. This is the actual
  fix for the original site's load-time problem — see `eleventy.config.js`.
- No client-side framework. `assets/js/nav.js` is the only JS shipped to
  visitors, and it's a ~15-line mobile-nav toggle, nothing else.

## Commands

- `npx @11ty/eleventy` — build once, output to `_site/`
- `npx @11ty/eleventy --serve --port=8080` — local dev server with live reload
- `_site/` and `node_modules/` are gitignored — both are fully regenerable,
  never hand-edit anything in `_site/`

## Folder structure and why

```
src/
├── pages/              One file per URL-producing page (index, photography,
│                        and future: narrative, mv, design, about-me). Each
│                        sets an explicit `permalink:` in its front matter,
│                        so file location never determines the output URL —
│                        safe to reorganize without breaking links.
├── _includes/
│   ├── layouts/         Full-page wrappers. base.njk holds the shared
│   │                    header/nav/footer every page gets wrapped in.
│   └── partials/        Reusable fragments included into a page or layout
│                        (empty for now — add here first if something
│                        starts getting copy-pasted across pages).
├── content/
│   └── <section>/       One folder per content section. Each currently has:
│       ├── items/        one front-matter file per content item (image
│       │                filename, order, alt text) — this is what
│       │                eleventy.config.js turns into an Eleventy
│       │                collection, sorted by `order`.
│       └── originals/    the actual source media files, full resolution.
│                        Never referenced directly by a page template —
│                        only through an `items/*.md` file that points at
│                        one by filename.
├── assets/              Sitewide static files (CSS, JS, fonts) — copied
│                        to _site/ untouched, not processed.
└── _data/                Global data available to every template
                          automatically, by filename (e.g. year.js → `year`).
```

**Adding a new section (e.g. Narrative) follows the same pattern as
photography, exactly:**
1. `src/content/narrative/originals/` — drop the source files in
2. `src/content/narrative/items/*.md` — one file per item:
   ```
   ---
   permalink: false
   image: filename.webp
   order: 1
   alt: A real description of this specific photo
   ---
   ```
3. `eleventy.config.js` — add an `eleventyConfig.addCollection("narrative", ...)`
   block, copy-pasted from the `photography` one, section name swapped
4. `src/pages/narrative.njk` — copy `photography.njk`, swap `collections.photography`
   → `collections.narrative` and the originals path

## Naming conventions

- Folders and filenames: kebab-case (`about-me.njk`, `photo-order.txt`-style
  naming), no spaces, no camelCase in file/folder names
- Front-matter keys across all content items: always `image`, `order`, `alt`
  — keep these identical across every section so the pattern stays
  copy-pasteable. A section can add its own extra fields on top when its
  content genuinely needs them (e.g. `mv` items also carry `title`,
  `credit`, `youtube_id` since a video card needs more than an image) —
  just don't rename or drop the shared three
- `permalink: false` on every `content/*/items/*.md` file — these are data,
  not pages; this line is what stops Eleventy from generating a stray output
  page for each one

## Before writing code

- Check: does this duplicate a value that's used in only one place? If so,
  don't extract it into a variable just for the sake of it — that's
  indirection without removing duplication
- Check: does this hardcode something (a section name, a folder path) that
  the next section/page will need to be different? If yes, parameterize it
  now rather than duplicating the whole function/block later
- Prefer the existing pattern (see "adding a new section" above) over
  inventing a new one, unless there's a concrete reason this case is
  different

## Before committing

- Rebuild from a clean `_site/` and re-check the actual page in a browser —
  don't assume a change worked
- Confirm naming/structure matches the conventions above
- No secrets, API keys, or credentials in anything committed — this repo is
  public once pushed to GitHub (GitHub Pages on a free plan requires it)
- For a meaningful change (not a one-line tweak), consider an actual
  `/code-review` or `/simplify` pass before committing, not just a self-read

## Roadmap / not done yet

- [x] All 5 pages built: Photography, Design, MV, ~~Narrative~~ and
      ~~About Me~~ both empty-state placeholders — confirmed by checking the
      live site, not assumed (About Me's form/bio never actually existed;
      an earlier grep "finding" of form fields was a false match against
      generic theme CSS selectors, not real content)
- [x] MV plays video in an on-page modal (YouTube's privacy-enhanced
      `youtube-nocookie.com` embed, only created on click) rather than
      linking out to youtube.com or embedding iframes eagerly on load.
      Decided this way because an embedded YouTube player always shows a
      small YouTube logo in its controls — no way around that short of
      self-hosting actual video files, which was judged out of scope for
      this project. Each card still has a real `href` to the YouTube watch
      page as a no-JS fallback (`src/assets/js/mv.js` intercepts the click
      and opens the modal instead when JS is available).
- [ ] The `sizes` default in `eleventy.config.js`'s `imageShortcode` is
      hand-matched to `.photo-grid`'s current column-count breakpoints
      (1/2/3/4 cols at 480/760/1100px). If the grid layout changes, this
      needs updating to match or images will be served slightly larger
      than necessary again (not broken, just not tight)
- [ ] Decide on a real home page (currently `/` redirects straight to
      `/photography/` since the live site doesn't really have a distinct
      homepage either — revisit once the other sections exist)
- [ ] Write a plain-language user guide for Matt: how to add a photo, how to
      reorder, how to write alt text — written so he can either follow it
      himself or hand it to an AI assistant (Claude/Gemini) to make the
      change for him. Should reference this CLAUDE.md's "adding a new
      section" pattern directly rather than duplicating it.
- [ ] Set up GitHub repo + GitHub Actions to build and deploy on every push,
      so Matt (or Matt + AI) never needs Node/the terminal installed — just
      edit files via GitHub's web UI and push. This is the actual "keep it
      simple for him" step; skip a CMS, this achieves the same goal with far
      less infrastructure (see earlier discussion — a CMS would need its own
      OAuth backend and accounts for comparatively little benefit here)
- [ ] Custom domain (mattpalichat.com) DNS → GitHub Pages, once ready to cut
      over from WordPress
- [ ] Alt text pass: every photo currently has the same generic placeholder
      alt text — go through and write real per-photo descriptions
- [ ] About Me and Narrative are both empty-state placeholders since the
      live site never actually had real content on either (confirmed, not
      assumed — see above). Needs real content from Matt: a bio/photo for
      About Me, actual work for Narrative, and — since there was never a
      real contact form to begin with — a decision on whether he even wants
      one. If yes, it'd need a static-friendly form backend (Formspree/Basin)
      with basic spam protection (honeypot field at minimum), since GitHub
      Pages has no server to handle a form submission itself
