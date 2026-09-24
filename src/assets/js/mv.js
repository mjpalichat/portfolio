const modal = document.getElementById("video-modal");
const frame = document.getElementById("video-modal-frame");
const closeBtn = document.getElementById("video-modal-close");

let lastTrigger = null;

function openVideo(youtubeId, trigger) {
  lastTrigger = trigger;
  frame.innerHTML = `<iframe
    src="https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&rel=0"
    title="Video player"
    allow="autoplay; encrypted-media; picture-in-picture"
    allowfullscreen
  ></iframe>`;
  modal.hidden = false;
  closeBtn.focus();
}

function closeVideo() {
  modal.hidden = true;
  frame.innerHTML = ""; // removes the iframe so playback actually stops
  if (lastTrigger) lastTrigger.focus();
}

document.querySelectorAll(".mv-play").forEach((trigger) => {
  trigger.addEventListener("click", (event) => {
    event.preventDefault();
    openVideo(trigger.dataset.youtubeId, trigger);
  });
});

closeBtn.addEventListener("click", closeVideo);

modal.addEventListener("click", (event) => {
  if (event.target === modal) closeVideo();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !modal.hidden) closeVideo();
});
