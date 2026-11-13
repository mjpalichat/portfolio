const toggle = document.getElementById("nav-toggle");
const nav = document.getElementById("site-nav");
const header = document.getElementById("site-header");

toggle.addEventListener("click", () => {
  const isOpen = nav.classList.toggle("is-open");
  toggle.classList.toggle("is-open", isOpen);
  toggle.setAttribute("aria-expanded", String(isOpen));
  document.body.classList.toggle("nav-open", isOpen);
});

nav.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    nav.classList.remove("is-open");
    toggle.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
    document.body.classList.remove("nav-open");
  });
});

function updateScrolledState() {
  header.classList.toggle("is-scrolled", window.scrollY > 40);
}

// main's padding-top has to reserve exactly as much space as the header
// takes up at its tallest (expanded) - only measured while expanded,
// since that's the only state that matters for this.
function syncHeaderHeight() {
  if (!header.classList.contains("is-scrolled")) {
    document.documentElement.style.setProperty(
      "--header-height",
      `${header.offsetHeight}px`
    );
  }
}

updateScrolledState();
syncHeaderHeight();
window.addEventListener("scroll", updateScrolledState, { passive: true });
window.addEventListener("resize", syncHeaderHeight, { passive: true });

// Swipe left/right to move between pages, iPhone-style - body carries the
// prev/next URLs for the current page's position in the nav order (set in
// base.njk; empty string at either end of the sequence, so there's simply
// nowhere to swipe to there). Skipped while a lightbox/video overlay is
// open so browsing a gallery doesn't accidentally navigate away.
let touchStartX = 0;
let touchStartY = 0;

function isOverlayOpen() {
  const lightbox = document.querySelector(".lightbox");
  const modal = document.querySelector(".video-modal");
  return (lightbox && !lightbox.hidden) || (modal && !modal.hidden);
}

document.addEventListener(
  "touchstart",
  (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  },
  { passive: true }
);

document.addEventListener(
  "touchend",
  (e) => {
    if (isOverlayOpen()) return;
    const dx = e.changedTouches[0].clientX - touchStartX;
    const dy = e.changedTouches[0].clientY - touchStartY;
    const SWIPE_THRESHOLD = 60;
    if (Math.abs(dx) < SWIPE_THRESHOLD || Math.abs(dx) < Math.abs(dy) * 1.5) return;

    const { prevUrl, nextUrl } = document.body.dataset;
    if (dx < 0 && nextUrl) {
      location.href = nextUrl;
    } else if (dx > 0 && prevUrl) {
      location.href = prevUrl;
    }
  },
  { passive: true }
);
