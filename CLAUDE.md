# portfolio

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
- **Gotcha:** eleventy-img caches its generated image output internally, and
  that cache doesn't always notice when a source file's *content* changed
  while its *filename* stayed the same (e.g. replacing `originals/foo.webp`
  with a different image of the same name). If a swapped image still shows
  the old picture after a rebuild, run `rm -rf _site && npx @11ty/eleventy`
  (a full clean rebuild) rather than trusting the dev server's incremental
  reload — this actually happened once already (MV thumbnails)

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
- [x] Grid is now 3 columns (was 4), 2 at <=1100px, 1 at <=760px. The
      `sizes` default in `eleventy.config.js`'s `imageShortcode` is
      hand-matched to `.photo-grid`'s column-count breakpoints and was
      updated to match - if the grid layout changes again, this needs
      updating too or images will be served slightly larger than
      necessary (not broken, just not tight)
- [ ] Decide on a real home page (currently `/` redirects straight to
      `/photography/` since the live site doesn't really have a distinct
      homepage either — revisit once the other sections exist)
- [ ] Write a plain-language user guide for Matt: how to add a photo, how to
      reorder, how to write alt text — written so he can either follow it
      himself or hand it to an AI assistant (Claude/Gemini) to make the
      change for him. Should reference this CLAUDE.md's "adding a new
      section" pattern directly rather than duplicating it.
- [x] GitHub repo connected: https://github.com/mjpalichat/portfolio.git
      (`main` branch, Ben's account already has push access as a
      collaborator). `.git` history still carries old bloat from the
      early `.gitignore` bug (node_modules/_site got committed before it
      was fixed) - ~183MB of dead history. Cheap to clean up now (single
      collaborator, nobody else has cloned yet), gets more disruptive
      the longer it's left since fixing it means a force-push.
- [x] GitHub Actions set up (`.github/workflows/deploy.yml`): builds with
      Eleventy and deploys to GitHub Pages on every push to `main`. Matt (or
      Matt + AI) never needs Node/the terminal — just edit files via
      GitHub's web UI and push. Chose this over a CMS for the same reason
      as before — far less infrastructure than a CMS's OAuth backend for
      comparable benefit here. Live and verified working end-to-end at
      https://mjpalichat.github.io/portfolio/ (Pages source had to be
      switched from "Deploy from a branch" to "GitHub Actions" in repo
      Settings → Pages — a repo-admin-only change, done by Matt since
      Ben's collaborator access is push-only, not admin).
- [ ] **REMOVE ONCE THE CUSTOM DOMAIN IS LIVE:** the workflow sets
      `PATH_PREFIX: /portfolio/` when building, because without a custom
      domain GitHub Pages serves this project site at
      `mjpalichat.github.io/portfolio/`, not the root — and the site
      hardcodes root-absolute paths (`/assets/...`, `/photography/`, etc.)
      via Eleventy's `url` filter + `pathPrefix` config
      (`eleventy.config.js`), which only resolves correctly with that env
      var set. Once mattpalichat.com DNS points here, delete the `env:`
      block in `.github/workflows/deploy.yml` (`pathPrefix` then defaults
      to `/`, same as local dev already behaves) and re-run the workflow —
      no template changes needed, this was built to make that a one-line
      removal.
- [ ] Custom domain (mattpalichat.com) DNS → GitHub Pages, once ready to cut
      over from WordPress — see the PATH_PREFIX removal note directly above,
      it needs to happen at the same time as this
- [ ] Alt text pass: every photo currently has the same generic placeholder
      alt text — go through and write real per-photo descriptions (will come
      from Matt via the image metadata spreadsheet, see below)
- [x] **SUPERSEDED by 9/28 meeting with Matt** — there is no longer a
      separate About Me page. The homepage (`/`, currently a redirect to
      `/photography/`) becomes bio + a few photos of Matt + a contact form +
      quick links to the other sections. `about-me.njk` should be deleted
      and its nav link removed once this is built. Needs from Matt: bio
      text, photos of himself, and his preference on contact form fields —
      all tracked in the PDF sent to him (see below). Contact form still
      needs a static-friendly backend (Formspree/Basin) with basic spam
      protection (honeypot at minimum), since GitHub Pages has no server.
- [x] Narrative's content is now defined: documentaries / short films.
      Still an empty placeholder until Matt sends a list of links +
      thumbnails (same format as MV) — build identically to the MV page
      once that arrives.
- [ ] A PDF summarizing meeting notes + open questions was sent to Matt
      (`~/Downloads/Portfolio_Website_Notes_and_Answers.pdf`) covering:
      fonts (Google Fonts, pick 1-2 + weights), the homepage/About Me
      change above, Narrative's definition above, Kai Dickson thumbnail
      sizing reference (16:9, 2400px+ long edge) for his MV/Narrative
      exports, an image metadata spreadsheet template (filename / section /
      order / alt text / title+credit+link for MV+Narrative), confirmation
      images auto-resize (he should send full-resolution, not pre-shrunk),
      and VS Code (not Visual Studio) for his eventual handoff. Next
      meeting: Sunday October 4th, 6pm. Most remaining work is blocked on
      what Matt sends back from this.
- [x] Zoom + fullscreen toggle buttons added to the lightbox (Photography/
      Design).
