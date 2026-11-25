// True masonry for .photo-grid: CSS multi-column (the pre-JS/no-JS
// fallback in style.css) can't give both "no gaps" and correct
// left-to-right reading order at once, since it always fills one column
// completely before starting the next. This instead reparents each figure
// into one of several flex columns that each stack tightly (no shared row
// height, so no gaps) - straight round-robin by position (item N goes to
// column N % columnCount), not by measuring which column is currently
// shortest. An earlier version picked the shortest column by actual
// rendered height, which seemed more "balanced" but meant a caption
// wrapping to an extra line, or two photos differing by a few px of real
// aspect ratio, could nudge an item into a different column than its
// `order` implied - so "item 2 is in the center column" stopped being
// reliably true. Round-robin makes position a direct, guaranteed function
// of `order`, at the cost of sometimes-uneven column heights.
function setupMasonry(grid) {
  const figures = Array.from(grid.children);

  function layout() {
    const columnCount =
      parseInt(getComputedStyle(grid).getPropertyValue("--grid-columns"), 10) ||
      1;

    grid.classList.add("is-masonry");
    grid.innerHTML = "";
    const columns = [];
    for (let i = 0; i < columnCount; i++) {
      const col = document.createElement("div");
      col.className = "photo-grid-col";
      grid.appendChild(col);
      columns.push(col);
    }

    figures.forEach((figure, index) => {
      columns[index % columnCount].appendChild(figure);
    });
  }

  layout();

  let resizeTimer;
  window.addEventListener(
    "resize",
    () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(layout, 200);
    },
    { passive: true }
  );
}

document.querySelectorAll(".photo-grid").forEach(setupMasonry);
