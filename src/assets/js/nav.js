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

// Touch swipe page-nav was removed on purpose - on a long portrait page
// (e.g. Photography) a viewer scrolling through work could accidentally
// trigger it and get bounced to the next section, which risked deterring
// them from seeing the rest. Desktop trackpad swipe and arrow keys below
// are unaffected; the 3s press-and-hold gesture further down is a
// different, deliberate gesture, not an accidental one, so it stays.

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

// Press and hold anywhere (3s) also opens the nav overlay - a fallback way
// to find it besides the small toggle icon. Cancelled by any real finger
// movement (so it doesn't fire while scrolling) or by releasing early.
const HOLD_DURATION = 3000;
const HOLD_MOVE_THRESHOLD = 10;
let holdTimer = null;
let holdStartX = 0;
let holdStartY = 0;

function cancelHold() {
  if (holdTimer) {
    clearTimeout(holdTimer);
    holdTimer = null;
  }
}

document.addEventListener(
  "touchstart",
  (e) => {
    if (isOverlayOpen() || nav.classList.contains("is-open")) return;
    holdStartX = e.touches[0].clientX;
    holdStartY = e.touches[0].clientY;
    holdTimer = setTimeout(() => {
      nav.classList.add("is-open");
      toggle.classList.add("is-open");
      toggle.setAttribute("aria-expanded", "true");
      document.body.classList.add("nav-open");
      holdTimer = null;
    }, HOLD_DURATION);
  },
  { passive: true }
);

document.addEventListener(
  "touchmove",
  (e) => {
    if (!holdTimer) return;
    const dx = e.touches[0].clientX - holdStartX;
    const dy = e.touches[0].clientY - holdStartY;
    if (Math.hypot(dx, dy) > HOLD_MOVE_THRESHOLD) cancelHold();
  },
  { passive: true }
);

document.addEventListener("touchend", cancelHold, { passive: true });

// Arrow keys - skipped while typing in a form field (e.g. the contact
// form's own inputs/textarea use arrow keys for text editing, not paging).
document.addEventListener("keydown", (e) => {
  if (isOverlayOpen()) return;
  const tag = document.activeElement && document.activeElement.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA") return;
  if (e.key === "ArrowLeft") goToAdjacentPage(-1);
  if (e.key === "ArrowRight") goToAdjacentPage(1);
});
