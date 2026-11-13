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

updateScrolledState();
window.addEventListener("scroll", updateScrolledState, { passive: true });
