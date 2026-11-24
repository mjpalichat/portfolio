const video = document.getElementById("home-video");
const reelBtn = document.getElementById("home-reel-btn");

// "View Reel" unmutes the same looping background video and sends it
// fullscreen with sound, instead of opening a separate modal/player -
// keeps the homepage to the one video element the reference asked for.
reelBtn.addEventListener("click", () => {
  video.muted = false;
  video.controls = true;
  video.requestFullscreen?.().catch(() => {
    video.muted = true;
    video.controls = false;
  });
});

// Back to a silent background loop once fullscreen ends, however that
// happens (Escape, the browser's own fullscreen UI, etc).
document.addEventListener("fullscreenchange", () => {
  if (document.fullscreenElement !== video) {
    video.muted = true;
    video.controls = false;
  }
});
