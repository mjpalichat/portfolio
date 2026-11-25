const video = document.getElementById("home-video");
const reelBtn = document.getElementById("home-reel-btn");

// One-time intro: a first-time visitor sees just the video alone for 1s,
// then the header/logo/nav/Contact and the "View Reel" button fade in
// together over 1.5s. A returning visitor (localStorage already set) gets
// none of this - the inline script at the top of base.njk already added
// chrome-visible before the header even rendered, so this block is a
// no-op for them (the class is already there, nothing left to delay).
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
  // Rejected (the common case - most first-time visitors' browsers block
  // this outright): re-mute and explicitly resume playback. Without this
  // second play() call the video was being left paused/frozen on its
  // current frame instead of looping, since a rejected play() call can
  // stop the video's own `autoplay` attribute from continuing to drive it.
  video.muted = true;
  video.play();
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
