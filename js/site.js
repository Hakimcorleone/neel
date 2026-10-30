/* neeladvisory.my: reveal-on-scroll, scroll progress and the mobile menu. Content reads fully without it. */
(function () {
  "use strict";
  var root = document.querySelector("[data-croot]");
  if (!root) return;
  root.classList.add("booted");
  var ticking = false;
  function clamp(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
  function update() {
    ticking = false;
    var h = window.innerHeight;
    var items = root.querySelectorAll("[data-in]:not(.in)");
    for (var k = 0; k < items.length; k++) {
      var r = items[k].getBoundingClientRect();
      if (r.top < h * 0.92 && r.bottom > 0) items[k].classList.add("in");
    }
    root.style.setProperty("--sy", String(Math.min(window.scrollY || 0, 900)));
    var ps = root.querySelectorAll("[data-prog]");
    for (var i = 0; i < ps.length; i++) {
      var el = ps[i], b = el.getBoundingClientRect();
      var p = clamp((h * 0.8 - b.top) / (b.height * 0.85));
      el.style.setProperty("--p", p.toFixed(4));
      var ats = el.querySelectorAll("[data-at-v]");
      for (var j = 0; j < ats.length; j++) {
        ats[j].classList.toggle("in", p >= parseFloat(ats[j].getAttribute("data-at-v")));
      }
    }
  }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  update();
  setTimeout(update, 500);

  var menu = document.getElementById("menu");
  var toggles = document.querySelectorAll("[data-menu-toggle]");
  function setMenu(open) {
    if (!menu) return;
    menu.hidden = !open;
    document.documentElement.style.overflow = open ? "hidden" : "";
    for (var t = 0; t < toggles.length; t++) toggles[t].setAttribute("aria-expanded", open ? "true" : "false");
  }
  for (var t = 0; t < toggles.length; t++) {
    toggles[t].addEventListener("click", function () { setMenu(menu && menu.hidden); });
  }
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && menu && !menu.hidden) setMenu(false); });
  if (menu) {
    menu.addEventListener("click", function (e) { if (e.target.closest && e.target.closest("a")) setMenu(false); });
  }
})();
