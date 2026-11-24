const video = document.getElementById("home-video");
const reelBtn = document.getElementById("home-reel-btn");

// Best-effort: try to start with sound immediately, no click needed, for
// visitors whose browser already trusts this site enough to allow it (e.g.
// returning visitors with a high "media engagement" score). Most first-time
// visitors' browsers will still block unmuted autoplay outright per their
// own policy - that's a platform restriction, not something fixable from
// here - and this silently falls back to the normal muted loop when
// blocked. "View Reel" stays the one guaranteed way to get sound, since an
// actual click always satisfies autoplay-with-sound restrictions.
video.muted = false;
video.play().catch(() => {
  video.muted = true;
});

function backToBackgroundLoop() {
  video.muted = true;
  video.controls = false;
}

// "View Reel" unmutes the same looping background video and sends it
// fullscreen with sound, instead of opening a separate modal/player -
// keeps the homepage to the one video element the reference asked for.
// iOS Safari before 16.4 has no standard requestFullscreen() for arbitrary
// elements, only the video-specific webkitEnterFullscreen() - fall back to
// that instead of silently leaving the video unmuted with no way back.
reelBtn.addEventListener("click", () => {
  if (video.requestFullscreen) {
    video.muted = false;
    video.controls = true;
    video.requestFullscreen().catch(backToBackgroundLoop);
  } else if (video.webkitEnterFullscreen) {
    video.muted = false;
    video.webkitEnterFullscreen();
  }
});

// Back to a silent background loop once fullscreen ends, however that
// happens (Escape, the browser's own fullscreen UI, etc) - standard API
// and iOS's own webkit events, covering whichever path was taken above.
document.addEventListener("fullscreenchange", () => {
  if (document.fullscreenElement !== video) backToBackgroundLoop();
});
video.addEventListener("webkitendfullscreen", backToBackgroundLoop);
