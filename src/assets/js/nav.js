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

// Move to the previous/next page in the nav order, iPhone-style - body
// carries the prev/next URLs for the current page's position (set in
// base.njk; empty string at either end of the sequence, so there's simply
// nowhere to go there). Shared by touch swipe, trackpad swipe, and the
// arrow keys below. Skipped while a lightbox/video overlay is open so
// browsing a gallery doesn't accidentally navigate away.
function isOverlayOpen() {
  const lightbox = document.querySelector(".lightbox");
  const modal = document.querySelector(".video-modal");
  return (lightbox && !lightbox.hidden) || (modal && !modal.hidden);
}

function goToAdjacentPage(direction) {
  const { prevUrl, nextUrl } = document.body.dataset;
  if (direction < 0 && prevUrl) {
    location.href = prevUrl;
  } else if (direction > 0 && nextUrl) {
    location.href = nextUrl;
  }
}

// Touch swipe (phones/tablets)
let touchStartX = 0;
let touchStartY = 0;

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
    goToAdjacentPage(dx < 0 ? 1 : -1);
  },
  { passive: true }
);

// Trackpad swipe (two-finger horizontal gesture fires `wheel` events with
// deltaX, not touch events). `overscroll-behavior-x` in style.css is what
// actually stops the browser's own swipe-to-go-back/forward from firing
// alongside this; preventDefault here is belt-and-suspenders for browsers
// that still try. Accumulates deltaX across one gesture (a single swipe
// fires many small wheel events) rather than reacting to the first one,
// and ignores mostly-vertical wheel/scroll motion.
let wheelAccumX = 0;
let wheelCooldown = false;
let wheelResetTimer = null;
const WHEEL_THRESHOLD = 80;

document.addEventListener(
  "wheel",
  (e) => {
    if (isOverlayOpen() || wheelCooldown) return;
    if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) {
      wheelAccumX = 0;
      return;
    }
    e.preventDefault();
    wheelAccumX += e.deltaX;

    clearTimeout(wheelResetTimer);
    wheelResetTimer = setTimeout(() => {
      wheelAccumX = 0;
    }, 150);

    if (Math.abs(wheelAccumX) > WHEEL_THRESHOLD) {
      goToAdjacentPage(wheelAccumX < 0 ? 1 : -1);
      wheelAccumX = 0;
      wheelCooldown = true;
      setTimeout(() => {
        wheelCooldown = false;
      }, 800);
    }
  },
  { passive: false }
);

// Arrow keys - skipped while typing in a form field (e.g. the contact
// form's own inputs/textarea use arrow keys for text editing, not paging).
document.addEventListener("keydown", (e) => {
  if (isOverlayOpen()) return;
  const tag = document.activeElement && document.activeElement.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA") return;
  if (e.key === "ArrowLeft") goToAdjacentPage(-1);
  if (e.key === "ArrowRight") goToAdjacentPage(1);
});
