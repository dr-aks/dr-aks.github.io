/* News: search, year and kind filters, and a lightbox for the gallery.
   Every item is in the HTML already, so the page reads fine without this. */
(function () {
  "use strict";

  var items = [].slice.call(document.querySelectorAll(".nitem"));
  var q = document.getElementById("n-q");
  var year = document.getElementById("n-year");
  var cat = document.getElementById("n-cat");
  var count = document.getElementById("n-count");
  var none = document.getElementById("n-none");

  if (items.length && q && year && cat) {
    var years = {}, cats = {};
    items.forEach(function (el) {
      var y = el.getAttribute("data-year"), c = el.getAttribute("data-cat");
      if (y) years[y] = (years[y] || 0) + 1;
      if (c) cats[c] = (cats[c] || 0) + 1;
    });
    Object.keys(years).sort(function (a, b) { return b - a; }).forEach(function (y) {
      var o = document.createElement("option");
      o.value = y; o.textContent = y + "  (" + years[y] + ")";
      year.appendChild(o);
    });
    Object.keys(cats).sort().forEach(function (c) {
      var o = document.createElement("option");
      o.value = c; o.textContent = c + "  (" + cats[c] + ")";
      cat.appendChild(o);
    });

    function apply() {
      var term = (q.value || "").trim().toLowerCase();
      var y = year.value, c = cat.value, shown = 0;
      items.forEach(function (el) {
        var ok = true;
        if (y && el.getAttribute("data-year") !== y) ok = false;
        if (ok && c && el.getAttribute("data-cat") !== c) ok = false;
        if (ok && term && (el.getAttribute("data-text") || "").indexOf(term) < 0) ok = false;
        el.hidden = !ok;
        if (ok) shown++;
      });
      count.innerHTML = shown === items.length
        ? "Showing all <strong>" + items.length + "</strong> entries"
        : "Showing <strong>" + shown + "</strong> of " + items.length + " entries";
      if (none) none.hidden = shown !== 0;
    }

    var t;
    q.addEventListener("input", function () { clearTimeout(t); t = setTimeout(apply, 90); });
    year.addEventListener("change", apply);
    cat.addEventListener("change", apply);
    apply();
  }

  /* ---- lightbox ------------------------------------------------------ */
  var lbx = document.getElementById("lbx");
  var lim = document.getElementById("lbx-img");
  var lcap = document.getElementById("lbx-cap");
  var lx = document.getElementById("lbx-x");
  if (!lbx || !lim) return;

  var lastFocus = null;
  function open(src, cap) {
    lastFocus = document.activeElement;
    lim.src = src; lim.alt = cap || "";
    lcap.textContent = cap || "";
    lbx.classList.add("on");
    document.body.style.overflow = "hidden";
    if (lx) lx.focus();
  }
  function close() {
    lbx.classList.remove("on");
    lim.src = "";
    document.body.style.overflow = "";
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  document.addEventListener("click", function (e) {
    var fig = e.target.closest ? e.target.closest(".gal, .n-pics figure") : null;
    if (fig) {
      var img = fig.querySelector("img");
      if (!img) return;
      var cap = fig.getAttribute("data-cap");
      if (!cap) {
        var fc = fig.querySelector("figcaption");
        cap = fc ? fc.textContent.replace(/\s+/g, " ").trim() : img.alt;
      }
      open(fig.getAttribute("data-full") || img.currentSrc || img.src, cap);
    }
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && lbx.classList.contains("on")) close();
    if ((e.key === "Enter" || e.key === " ") && e.target.classList &&
        e.target.classList.contains("gal")) {
      e.preventDefault();
      var img = e.target.querySelector("img");
      if (img) open(e.target.getAttribute("data-full") || img.src,
                    e.target.getAttribute("data-cap") || img.alt);
    }
  });
  if (lx) lx.addEventListener("click", close);
  lbx.addEventListener("click", function (e) { if (e.target === lbx) close(); });

  /* figures inside news entries are zoomable too */
  [].forEach.call(document.querySelectorAll(".n-pics figure"), function (f) {
    f.style.cursor = "zoom-in";
  });
})();
