const gallery = document.querySelector("[data-lightbox-gallery]");
if (gallery) {
  const triggers = Array.from(gallery.querySelectorAll(".lightbox-trigger"));
  const lightbox = document.getElementById("lightbox");
  const frame = document.getElementById("lightbox-frame");
  const closeBtn = document.getElementById("lightbox-close");
  const prevBtn = document.getElementById("lightbox-prev");
  const nextBtn = document.getElementById("lightbox-next");

  let currentIndex = 0;
  let lastTrigger = null;

  function largestSrc(trigger) {
    const source = trigger.querySelector("source");
    const img = trigger.querySelector("img");
    const srcset = (source && source.getAttribute("srcset")) || img.getAttribute("srcset");
    if (!srcset) return img.src;

    const candidates = srcset.split(",").map((entry) => {
      const [url, width] = entry.trim().split(/\s+/);
      return { url, width: parseInt(width, 10) || 0 };
    });
    candidates.sort((a, b) => b.width - a.width);
    return candidates[0].url;
  }

  function show(index) {
    currentIndex = (index + triggers.length) % triggers.length;
    const trigger = triggers[currentIndex];
    const img = trigger.querySelector("img");
    frame.innerHTML = "";
    const el = document.createElement("img");
    el.src = largestSrc(trigger);
    el.alt = img.alt;
    frame.appendChild(el);
  }

  function open(index, trigger) {
    lastTrigger = trigger;
    show(index);
    lightbox.hidden = false;
    closeBtn.focus();
  }

  function close() {
    lightbox.hidden = true;
    frame.innerHTML = "";
    if (lastTrigger) lastTrigger.focus();
  }

  triggers.forEach((trigger, index) => {
    trigger.addEventListener("click", () => open(index, trigger));
  });

  closeBtn.addEventListener("click", close);
  prevBtn.addEventListener("click", () => show(currentIndex - 1));
  nextBtn.addEventListener("click", () => show(currentIndex + 1));

  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) close();
  });

  document.addEventListener("keydown", (event) => {
    if (lightbox.hidden) return;
    if (event.key === "Escape") close();
    if (event.key === "ArrowLeft") show(currentIndex - 1);
    if (event.key === "ArrowRight") show(currentIndex + 1);
  });
}
