const gallery = document.querySelector("[data-lightbox-gallery]");
if (gallery) {
  const triggers = Array.from(gallery.querySelectorAll(".lightbox-trigger"));
  const lightbox = document.getElementById("lightbox");
  const frame = document.getElementById("lightbox-frame");
  const closeBtn = document.getElementById("lightbox-close");
  const prevBtn = document.getElementById("lightbox-prev");
  const nextBtn = document.getElementById("lightbox-next");
  const zoomBtn = document.getElementById("lightbox-zoom");
  const fullscreenBtn = document.getElementById("lightbox-fullscreen");

  let currentIndex = 0;
  let lastTrigger = null;
  let isZoomed = false;

  const ZOOM_IN_ICON = `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
    <circle cx="10.5" cy="10.5" r="6.5"></circle>
    <line x1="15.5" y1="15.5" x2="21" y2="21"></line>
    <line x1="7.5" y1="10.5" x2="13.5" y2="10.5"></line>
    <line x1="10.5" y1="7.5" x2="10.5" y2="13.5"></line>
  </svg>`;
  const ZOOM_OUT_ICON = `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
    <circle cx="10.5" cy="10.5" r="6.5"></circle>
    <line x1="15.5" y1="15.5" x2="21" y2="21"></line>
    <line x1="7.5" y1="10.5" x2="13.5" y2="10.5"></line>
  </svg>`;
  const ENTER_FULLSCREEN_ICON = `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <polyline points="8 3 3 3 3 8"></polyline>
    <polyline points="16 3 21 3 21 8"></polyline>
    <polyline points="3 16 3 21 8 21"></polyline>
    <polyline points="21 16 21 21 16 21"></polyline>
  </svg>`;
  const EXIT_FULLSCREEN_ICON = `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <polyline points="3 8 8 8 8 3"></polyline>
    <polyline points="21 8 16 8 16 3"></polyline>
    <polyline points="8 21 8 16 3 16"></polyline>
    <polyline points="16 21 16 16 21 16"></polyline>
  </svg>`;

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

  function setZoomed(zoomed) {
    isZoomed = zoomed;
    frame.classList.toggle("is-zoomed", isZoomed);
    frame.scrollTop = 0;
    frame.scrollLeft = 0;
    zoomBtn.innerHTML = isZoomed ? ZOOM_OUT_ICON : ZOOM_IN_ICON;
    zoomBtn.setAttribute("aria-label", isZoomed ? "Zoom out" : "Zoom in");
    zoomBtn.setAttribute("aria-pressed", String(isZoomed));
  }

  function show(index) {
    currentIndex = (index + triggers.length) % triggers.length;
    const trigger = triggers[currentIndex];
    const img = trigger.querySelector("img");
    frame.innerHTML = "";
    const el = document.createElement("img");
    el.src = largestSrc(trigger);
    el.alt = img.alt;
    el.addEventListener("click", () => setZoomed(!isZoomed));
    frame.appendChild(el);
    setZoomed(false); // each photo starts fit-to-screen, not carrying over zoom
  }

  function open(index, trigger) {
    lastTrigger = trigger;
    show(index);
    lightbox.hidden = false;
    closeBtn.focus();
  }

  function close() {
    if (document.fullscreenElement) document.exitFullscreen();
    lightbox.hidden = true;
    frame.innerHTML = "";
    if (lastTrigger) lastTrigger.focus();
  }

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      lightbox.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.();
    }
  }

  // Keeps the icon in sync even if fullscreen is exited another way
  // (browser's own Escape handling, F11, etc.), not just our button.
  document.addEventListener("fullscreenchange", () => {
    const active = document.fullscreenElement === lightbox;
    fullscreenBtn.innerHTML = active ? EXIT_FULLSCREEN_ICON : ENTER_FULLSCREEN_ICON;
    fullscreenBtn.setAttribute("aria-label", active ? "Exit fullscreen" : "Enter fullscreen");
    fullscreenBtn.setAttribute("aria-pressed", String(active));
  });

  triggers.forEach((trigger, index) => {
    trigger.addEventListener("click", () => open(index, trigger));
  });

  closeBtn.addEventListener("click", close);
  prevBtn.addEventListener("click", () => show(currentIndex - 1));
  nextBtn.addEventListener("click", () => show(currentIndex + 1));
  zoomBtn.addEventListener("click", () => setZoomed(!isZoomed));
  fullscreenBtn.addEventListener("click", toggleFullscreen);

  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) close();
  });

  document.addEventListener("keydown", (event) => {
    if (lightbox.hidden) return;
    // If the browser is handling an Escape-exits-fullscreen itself, don't
    // also close the whole lightbox on the same keypress.
    if (event.key === "Escape" && document.fullscreenElement) return;
    if (event.key === "Escape") close();
    if (event.key === "ArrowLeft") show(currentIndex - 1);
    if (event.key === "ArrowRight") show(currentIndex + 1);
  });
}
