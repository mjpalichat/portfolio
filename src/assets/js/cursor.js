// Replaces the system arrow with a circle on desktop (anything with a real
// mouse and hover support) that fills white over anything clickable - stays
// the system arrow everywhere else (touch devices never match this media
// query, so the rest of this file never runs for them).
if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
  const cursor = document.getElementById("custom-cursor");
  const HOVER_SELECTOR =
    "a, button, input, textarea, select, [role='button'], .lightbox-trigger, .mv-play";

  document.documentElement.classList.add("has-custom-cursor");

  document.addEventListener(
    "mousemove",
    (e) => {
      cursor.classList.add("is-active");
      cursor.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0) translate(-50%, -50%)`;
      cursor.classList.toggle("is-hover", !!e.target.closest(HOVER_SELECTOR));
    },
    { passive: true }
  );

  document.addEventListener("mouseleave", () => {
    cursor.classList.remove("is-active");
  });
}
