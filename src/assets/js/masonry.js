// True masonry for .photo-grid: CSS multi-column (the pre-JS/no-JS
// fallback in style.css) can't give both "no gaps" and correct
// left-to-right reading order at once, since it always fills one column
// completely before starting the next. This instead places each figure,
// in its original reading order, into whichever column currently has the
// least content height - gapless, and reads left-to-right across roughly
// even rows for similarly-sized photos.
function setupMasonry(grid) {
  const figures = Array.from(grid.children);

  function layout() {
    const columnCount =
      parseInt(getComputedStyle(grid).getPropertyValue("--grid-columns"), 10) ||
      1;

    grid.classList.add("is-masonry");
    grid.innerHTML = "";
    const columns = [];
    const heights = new Array(columnCount).fill(0);
    for (let i = 0; i < columnCount; i++) {
      const col = document.createElement("div");
      col.className = "photo-grid-col";
      grid.appendChild(col);
      columns.push(col);
    }

    figures.forEach((figure) => {
      let shortest = 0;
      for (let i = 1; i < columnCount; i++) {
        if (heights[i] < heights[shortest]) shortest = i;
      }
      columns[shortest].appendChild(figure);
      heights[shortest] += figure.getBoundingClientRect().height;
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
