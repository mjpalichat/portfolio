const reelBtn = document.getElementById("home-reel-btn");
const modal = document.getElementById("video-modal");
const frame = document.getElementById("video-modal-frame");
const closeBtn = document.getElementById("video-modal-close");

// The background video is just a short decorative loop, always muted -
// "View Reel" has nothing to do with it. The actual reel lives on Vimeo,
// at full quality, and opens in the same kind of modal mv.js already uses
// for YouTube elsewhere on the site.
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
