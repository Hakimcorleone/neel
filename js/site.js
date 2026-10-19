/* neeladvisory.my v4. Progressive enhancement only: every page reads fully without this file. */
(function () {
  "use strict";
  var motion = window.matchMedia("(prefers-reduced-motion: no-preference)").matches;

  // Close the phone menu after an in-page link.
  Array.prototype.forEach.call(document.querySelectorAll(".menu__nav a"), function (a) {
    a.addEventListener("click", function () { var d = a.closest("details"); if (d) d.removeAttribute("open"); });
  });

  // Interface text in the page's language (Bahasa Malaysia pages set lang="ms-MY").
  var ms = /^ms/i.test(document.documentElement.lang);
  var T = ms ? { selectCopy: "Pilih dan salin", selected: "Teks dipilih. Tekan Salin.", copied: "Disalin" }
             : { selectCopy: "Select and copy", selected: "Text selected. Press Copy.", copied: "Copied" };

  // Copy buttons.
  function copyText(text, button, fallbackEl) {
    var original = button.dataset.label || (button.dataset.label = button.textContent);
    clearTimeout(button._t);
    function done(label) { button.textContent = label; button._t = setTimeout(function () { button.textContent = original; }, 1800); }
    function select() {
      if (!fallbackEl) { done(T.selectCopy); return; }
      var range = document.createRange(); range.selectNodeContents(fallbackEl);
      var sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(range);
      done(T.selected);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { done(T.copied); }, select);
    } else { select(); }
  }
  Array.prototype.forEach.call(document.querySelectorAll("[data-copy], [data-copy-from]"), function (btn) {
    btn.addEventListener("click", function () {
      var from = btn.getAttribute("data-copy-from");
      var el = from ? document.querySelector(from) : null;
      copyText(el ? el.textContent : btn.getAttribute("data-copy"), btn, el);
    });
  });

  // How we work: the pinned stage shows the beat whose copy sits in the middle of the screen; the pointer tilts it.
  var scene = document.querySelector(".scene");
  if (scene) {
    var story = scene.closest(".story2") || scene.parentNode;
    var beats = Array.prototype.slice.call(document.querySelectorAll(".beat[data-beat]"));
    var steps = Array.prototype.slice.call(scene.querySelectorAll(".scene__step"));
    var mast = document.querySelector(".masthead");
    var current = -1;
    function setMast() { if (mast && story.style) story.style.setProperty("--mast", mast.offsetHeight + "px"); }
    function pick(instant) {
      var vh = window.innerHeight, sr = scene.getBoundingClientRect();
      var stacked = sr.bottom < vh * 0.7;                       // phones: the stage sits above the copy
      var line = stacked ? sr.bottom + (vh - sr.bottom) * 0.5 : vh * 0.5;
      var n = 0;
      for (var i = 0; i < beats.length; i++) {
        if (beats[i].getBoundingClientRect().top <= line) n = parseInt(beats[i].getAttribute("data-beat"), 10);
      }
      if (n === current) return;
      current = n;
      if (instant) scene.classList.add("no-tr");
      scene.setAttribute("data-beat", String(n));
      steps.forEach(function (s) {
        var k = parseInt(s.getAttribute("data-step"), 10), a = s.querySelector("a");
        s.classList.toggle("is-active", k === n); s.classList.toggle("is-done", k < n);
        if (a) { if (k === n) a.setAttribute("aria-current", "step"); else a.removeAttribute("aria-current"); }
      });
      if (instant) requestAnimationFrame(function () { requestAnimationFrame(function () { scene.classList.remove("no-tr"); }); });
    }
    var ticking = false, settled = false;
    function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(function () { ticking = false; pick(!settled); }); } }
    setMast(); pick(true);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", function () { setMast(); pick(false); });
    window.addEventListener("load", function () { setTimeout(function () { settled = true; }, 400); });
    if (document.fonts && document.fonts.ready) { document.fonts.ready.then(function () { setMast(); pick(!settled); }); }
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) { scene.classList.toggle("is-off", !entries[0].isIntersecting); }, { threshold: 0 }).observe(scene);
    }
    if (motion && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
      scene.addEventListener("pointermove", function (e) {
        var r = scene.getBoundingClientRect();
        scene.style.setProperty("--mx", ((e.clientX - r.left) / r.width * 2 - 1).toFixed(3));
        scene.style.setProperty("--my", ((e.clientY - r.top) / r.height * 2 - 1).toFixed(3));
      });
      scene.addEventListener("pointerleave", function () { scene.style.setProperty("--mx", "0"); scene.style.setProperty("--my", "0"); });
    }
  }
})();
