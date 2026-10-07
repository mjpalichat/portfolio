# Your website, in plain English

This is your guide to maintaining mattpalichat.com yourself — adding photos,
reordering galleries, swapping videos, all of it — without needing to be a
programmer. There are two ways to do everything in here:

1. **Ask an AI assistant to do it for you**, in plain English, right inside
   the editor. This is the easy way, and it's what this guide is built
   around.
2. **Follow the steps yourself**, if you'd rather understand exactly what's
   happening or the AI assistant gets something wrong.

Every section below gives you both.

---

## One-time setup

You only ever do this once.

### 1. Install VS Code

Not "Visual Studio" — that's a different, much heavier program. You want
**Visual Studio Code** (usually just called "VS Code"), a free, lightweight
editor: **[code.visualstudio.com](https://code.visualstudio.com)**. Download
it, install it like any other Mac app.

### 2. Install an AI assistant inside VS Code

Open VS Code, click the Extensions icon in the left sidebar (it looks like
four squares), and search for one of:

- **Claude Code** (what Ben's been using to build this with you)
- **GitHub Copilot**

Install it and sign in when prompted. Either one lets you type a request in
plain English and have it make the actual file changes for you.

### 3. Install Node.js

This is the program that actually builds your website from its source
files. Go to **[nodejs.org](https://nodejs.org)**, download the version
labeled **LTS**, and install it.

### 4. Get the website's code onto your computer

In VS Code, open the built-in terminal (**Terminal → New Terminal** in the
menu bar), and paste this in:

```
git clone https://github.com/mjpalichat/portfolio.git
cd portfolio
npm install
```

That downloads the whole project and installs everything it needs to run.
You only do this once — after today, you'll just reopen the `portfolio`
folder in VS Code (**File → Open Folder...**).

---

## The golden rule: previewing before publishing

Nothing you do goes live on the real website until you explicitly
**publish** it (the last step in every workflow below). Before that, you
can look at your changes privately on your own computer as many times as
you want. To start that private preview, run this once in the terminal and
leave it running in the background:

```
npx @11ty/eleventy --serve
```

It'll print a web address like `http://localhost:8080/` — open that in
Safari or Chrome. Every time you save a change, that page updates
automatically. Press `Control + C` in the terminal when you're done
previewing.

---

## Adding a new photo

**The easy way — ask your AI assistant:**

> I want to add a new photo to the Photography page. The image file is
> at [drag the photo file into the chat, or give its path]. Here's the
> description: [your description]. Add it to the end of the gallery.

It'll handle the rest — it already knows how this project is structured
(see `CLAUDE.md` in this folder if it ever needs reminding).

**What's actually happening, if you want to understand it or do it
yourself:**

Every photo on the site has two parts:

1. **The image file itself**, living in
   `src/content/photography/originals/` (or `design`, `mv`, `narrative` —
   whichever section it belongs to)
2. **A tiny text file describing it**, living in
   `src/content/photography/items/` — this is what controls where it shows
   up and in what order, *not* the filename

To add a photo by hand:

1. Drop the image file into the right `originals/` folder
2. Create a new text file in the matching `items/` folder (name it
   anything, e.g. `new-photo.md`), with this inside:

   ```
   ---
   permalink: false
   image: your-filename.webp
   order: 66
   alt: A real description of what's in this photo
   ---
   ```

   `order` controls position — give it a number higher than everything
   else to put it at the end, or slot it between two existing numbers to
   put it in the middle.

That's it. The site automatically turns that into a properly sized,
fast-loading image everywhere it's needed — you never resize anything
yourself.

**One difference for MV and Narrative:** video entries need a few extra
lines beyond `image`/`order`/`alt` — `title`, `credit`, and `youtube_id`
(just the ID from the end of a YouTube URL, not the whole link). Easiest to
copy an existing file in `src/content/mv/items/` as a starting point rather
than typing one from scratch — or just ask your AI assistant, which is
genuinely the better option for this one.

---

## Reordering photos

**The easy way:**

> Move [photo description] to be third in the Photography gallery.

**By hand:** open its text file in `src/content/photography/items/` and
change the `order:` number. Lower numbers come first.

---

## Removing a photo

**The easy way:**

> Remove [photo description] from the Design page.

**By hand:** delete its text file from the `items/` folder. (You can leave
the actual image file in `originals/` or delete that too — either is fine,
it just won't show up on the site without its text file.)

---

## Writing good alt text

"Alt text" is the one-sentence description attached to each photo — it's
what shows up in Google search results for your images, and what a screen
reader says aloud for a visually impaired visitor. Write what's actually in
the photo, plainly: "Portrait of a musician in blue stage lighting," not
"cool shot" or the filename.

---

## Publishing your changes

Once you're happy with how something looks in your private preview:

**The easy way:**

> Publish these changes to the live website.

**By hand**, in the terminal:

```
git add -A
git commit -m "describe what you changed, e.g. 'Add new concert photos'"
git push
```

That's genuinely it. The moment you run `git push`, the website rebuilds
itself and updates automatically — usually within a minute or two. You
don't need to do anything else; there's no separate "upload" step.

---

## Adding a whole new section (like Narrative)

This is a bigger change than adding one photo, so lean on your AI
assistant for this one:

> I want to add a new "Narrative" section the same way Photography,
> Design, and MV work. Here's my content: [list of videos/photos with
> descriptions]. Follow the pattern in CLAUDE.md under "Adding a new
> section."

---

## When something looks broken

- **A photo you just changed still looks like the old version?** Run
  `rm -rf _site` then `npx @11ty/eleventy --serve` again — this forces a
  completely fresh rebuild. (This project has a known quirk where the
  image system sometimes caches stale output; a full rebuild always fixes
  it.)
- **Not sure what went wrong at all?** Just describe what you see to your
  AI assistant and ask it to investigate — that's exactly what it's there
  for.
- **Genuinely stuck?** Reach out to Ben.

---

## Quick glossary

| Term | What it means |
|---|---|
| **Repo** | Short for "repository" — the whole project folder, tracked by Git |
| **Git** | The system that tracks every change ever made and lets you undo mistakes |
| **GitHub** | The website that hosts your repo online |
| **Commit** | A saved snapshot of your changes, with a short description |
| **Push** | Sending your commits up to GitHub — this is the "publish" step |
| **Build** | The process that turns your source files into the actual website files |
| **Terminal** | The text-command window inside VS Code |
