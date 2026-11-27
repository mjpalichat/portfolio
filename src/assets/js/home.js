const reelBtn = document.getElementById("home-reel-btn");
const modal = document.getElementById("video-modal");
const frame = document.getElementById("video-modal-frame");
const closeBtn = document.getElementById("video-modal-close");

// One-time intro: a first-time visitor sees just the background video
// alone for 1s, then the header/logo/nav/Contact and the "View Reel"
// button fade in together over 1.5s. A returning visitor (localStorage
// already set) gets none of this - the inline script at the top of
// base.njk already added chrome-visible before the header even rendered,
// so this block is a no-op for them (the class is already there, nothing
// left to delay).
try {
  if (!localStorage.getItem("introSeen")) {
    setTimeout(() => {
      document.body.classList.add("chrome-visible");
      try {
        localStorage.setItem("introSeen", "true");
      } catch (e) {}
    }, 1000);
  }
} catch (e) {
  // Storage blocked (private browsing, etc) - fail open rather than
  // leaving the header/button invisible forever.
  document.body.classList.add("chrome-visible");
}

// The background video and the hover preview are both just short,
// self-hosted decorative loops, always muted - plain HTML/CSS handles
// showing/hiding the preview (see style.css), nothing for JS to do there.
// "View Reel" is the only thing that reaches out to Vimeo, for the actual
// full-quality reel, opening it in the same kind of modal mv.js already
// uses for YouTube elsewhere on the site.
const VIMEO_ID = "1250115406";

function openReel() {
  frame.innerHTML = `<iframe
    src="https://player.vimeo.com/video/${VIMEO_ID}?autoplay=1&title=0&byline=0&portrait=0"
    title="Reel"
    allow="autoplay; fullscreen; picture-in-picture"
    allowfullscreen
  ></iframe>`;
  modal.hidden = false;
  closeBtn.focus();
}

function closeReel() {
  modal.hidden = true;
  frame.innerHTML = ""; // removes the iframe so playback actually stops
  reelBtn.focus();
}

reelBtn.addEventListener("click", openReel);
closeBtn.addEventListener("click", closeReel);

modal.addEventListener("click", (event) => {
  if (event.target === modal) closeReel();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !modal.hidden) closeReel();
});
