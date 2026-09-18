/* Shell behaviour: menu, announcement, on-this-page scrollspy, counter.
   Everything degrades to a working page if this file never loads. */
(function () {
  "use strict";

  /* ---- main menu ---------------------------------------------------- */
  var burger = document.querySelector(".nav-burger");
  var menu = document.getElementById("mainmenu");
  if (burger && menu) {
    burger.addEventListener("click", function () {
      var open = menu.classList.toggle("open");
      burger.setAttribute("aria-expanded", String(open));
    });
    menu.addEventListener("click", function (e) {
      if (e.target.tagName === "A") {
        menu.classList.remove("open");
        burger.setAttribute("aria-expanded", "false");
      }
    });
  }

  var head = document.getElementById("siteHead");

  /* ---- announcement: dismissible, remembered per visitor ------------- */
  var ann = document.querySelector(".announce");
  if (ann) {
    var KEY = "ann-dismissed";
    var txt = (ann.textContent || "").replace(/\s+/g, " ").trim().slice(0, 80);
    try {
      if (localStorage.getItem(KEY) === txt) ann.hidden = true;
    } catch (e) { /* private window, blocked storage — just show it */ }
    var x = ann.querySelector(".ann-x");
    if (x) x.addEventListener("click", function () {
      ann.hidden = true;
      try { localStorage.setItem(KEY, txt); } catch (e) {}
    });
  }

  /* ---- on this page: toggle + scrollspy ------------------------------ */
  var otp = document.getElementById("onthispage");
  if (otp) {
    var list = otp.querySelector("ul");
    var toggle = otp.querySelector(".otp-toggle");
    if (toggle && list) {
      toggle.addEventListener("click", function () {
        var open = list.classList.toggle("open");
        toggle.setAttribute("aria-expanded", String(open));
      });
      list.addEventListener("click", function (e) {
        if (e.target.tagName === "A" && window.innerWidth <= 1450) {
          list.classList.remove("open");
          toggle.setAttribute("aria-expanded", "false");
        }
      });
    }
    var links = [].slice.call(otp.querySelectorAll("a[href^='#']"));
    var targets = links.map(function (a) {
      return document.getElementById(a.getAttribute("href").slice(1));
    });
    if (window.IntersectionObserver && targets.filter(Boolean).length) {
      var seen = {};
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) { seen[en.target.id] = en.isIntersecting; });
        var activeId = null;
        for (var i = 0; i < targets.length; i++) {
          if (targets[i] && seen[targets[i].id]) { activeId = targets[i].id; break; }
        }
        links.forEach(function (a) {
          a.classList.toggle("active", a.getAttribute("href") === "#" + activeId);
        });
      }, { rootMargin: "-25% 0px -60% 0px", threshold: 0 });
      targets.forEach(function (t) { if (t) io.observe(t); });
    }
  }

    /* ---- the menu closes on a link, a click outside, or Escape ---------- */
  /* Leaving the panel open over the page you had just asked for meant tapping
     the burger a second time to read anything. */
  var menu = document.getElementById("mainmenu");
  var burger = document.querySelector(".nav-burger");

  function closeMenu() {
    if (!menu || !menu.classList.contains("open")) return;
    menu.classList.remove("open");
    if (burger) burger.setAttribute("aria-expanded", "false");
  }

  if (menu) {
    menu.addEventListener("click", function (e) {
      if (e.target.closest("a")) closeMenu();
    });
    // anywhere else on the page, including the header around the burger
    document.addEventListener("click", function (e) {
      if (e.target.closest("#mainmenu") || e.target.closest(".nav-burger")) return;
      closeMenu();
    });
    // and the keyboard route out
    document.addEventListener("keydown", function (e) {
      if (e.key !== "Escape") return;
      var wasOpen = menu.classList.contains("open");
      closeMenu();
      if (wasOpen && burger) burger.focus();
    });
    // a swipe or a jump to an anchor also means you are done with the menu
    window.addEventListener("hashchange", closeMenu);
  }

  /* ---- one scroll handler: shrink the header, step the rest aside ----- */
  /* The old shrink handler declared its own `ticking` in this same function
     scope; two handlers sharing one flag meant whichever fired first made the
     other return early, and the collapse never ran. One handler, one flag. */
  var lastY = window.pageYOffset || 0;
  var scrollPending = false;

  function onScroll() {
    var y = window.pageYOffset || 0;
    if (head) head.classList.toggle("shrunk", y > 120);

    var floor = (head ? head.offsetHeight : 64) + 40;
    if (y < floor) document.body.classList.remove("chrome-away");
    else if (y > lastY + 6) document.body.classList.add("chrome-away");
    else if (y < lastY - 6) document.body.classList.remove("chrome-away");

    lastY = y;
    scrollPending = false;
  }

  window.addEventListener("scroll", function () {
    if (scrollPending) return;
    scrollPending = true;
    window.requestAnimationFrame(onScroll);
  }, { passive: true });

  /* jumping to a section must not leave the strip hidden over the heading */
  window.addEventListener("hashchange", function () {
    document.body.classList.remove("chrome-away");
    lastY = window.pageYOffset || 0;
  });

  var otp = document.getElementById("otp-list");
  if (otp) {
    otp.addEventListener("click", function (e) {
      var a = e.target.closest("a");
      if (!a) return;
      otp.classList.remove("open");
      var tgl = document.querySelector(".otp-toggle");
      if (tgl) tgl.setAttribute("aria-expanded", "false");
      // keep the chosen topic in view in the scrolling strip
      try { a.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" }); }
      catch (err) { /* older browsers: the jump still works */ }
    });
  }

/* ---- visitor counter ----------------------------------------------- */
  /* Put your GoatCounter code between the quotes and the footer figure
     appears. Empty means no counter and no network request at all. */
  var GOATCOUNTER_CODE = "";
  var COUNTER_SINCE = "September 2026";
  if (GOATCOUNTER_CODE) {
    var origin = "https://" + GOATCOUNTER_CODE + ".goatcounter.com";
    var t = document.createElement("script");
    t.async = true; t.src = "//gc.zgo.at/count.js";
    t.setAttribute("data-goatcounter", origin + "/count");
    document.body.appendChild(t);
    var slot = document.getElementById("visits");
    if (slot) {
      fetch(origin + "/counter/TOTAL.json")
        .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
        .then(function (d) {
          if (!d || !d.count) return;
          slot.textContent = String(d.count).replace(/[<>&]/g, "") + " visits" +
                             (COUNTER_SINCE ? " since " + COUNTER_SINCE : "");
          slot.hidden = false;
        })
        .catch(function () { /* down, blocked, or setting off: show nothing */ });
    }
  }
})();
