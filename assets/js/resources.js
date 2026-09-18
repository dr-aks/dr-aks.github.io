/* Filter the curated resource list in place.
   Sixty-odd cards is past the point where scanning beats searching. */
(function () {
  var q = document.getElementById("rf-q");
  var count = document.getElementById("rf-count");
  var chips = document.querySelectorAll("[data-rf-tag]");
  if (!q) return;

  var cards = [].slice.call(document.querySelectorAll(".link-card"));
  var sections = [].slice.call(document.querySelectorAll(".link-section"));
  var TOTAL = cards.length;
  var tag = "";

  cards.forEach(function (c) {
    c._hay = (c.textContent || "").toLowerCase().replace(/\s+/g, " ");
  });

  function paint() {
    var term = (q.value || "").trim().toLowerCase();
    var shown = 0;
    cards.forEach(function (c) {
      var ok = (!term || c._hay.indexOf(term) > -1) &&
               (!tag || c._hay.indexOf(tag.toLowerCase()) > -1);
      c.hidden = !ok;
      if (ok) shown++;
    });
    // a section with nothing left in it says so rather than sitting empty
    sections.forEach(function (s) {
      var any = s.querySelector(".link-card:not([hidden])");
      s.hidden = !any;
    });
    if (count) {
      count.textContent = (!term && !tag)
        ? "Showing all " + TOTAL + " resources"
        : "Showing " + shown + " of " + TOTAL + " resources";
    }
  }

  var timer;
  q.addEventListener("input", function () {
    clearTimeout(timer);
    timer = setTimeout(paint, 90);
  });

  chips.forEach(function (b) {
    b.addEventListener("click", function () {
      var v = b.getAttribute("data-rf-tag");
      tag = (tag === v) ? "" : v;
      chips.forEach(function (o) {
        o.setAttribute("aria-pressed", o.getAttribute("data-rf-tag") === tag ? "true" : "false");
      });
      paint();
    });
  });

  var clear = document.getElementById("rf-clear");
  if (clear) clear.addEventListener("click", function () {
    q.value = ""; tag = "";
    chips.forEach(function (o) { o.setAttribute("aria-pressed", "false"); });
    paint();
    q.focus();
  });

  paint();
})();
