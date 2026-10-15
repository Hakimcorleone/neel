/* neeladvisory.my v2. Progressive enhancement only: every page reads fully without this file. */
(function () {
  "use strict";
  var fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var motion = window.matchMedia("(prefers-reduced-motion: no-preference)").matches;

  // Cube tilt follows the pointer over the hero; on Android it follows device tilt.
  var tilt = document.getElementById("tilt");
  var hero = document.querySelector(".hero");
  if (tilt && hero && motion) {
    if (fine) {
      hero.addEventListener("mousemove", function (e) {
        var r = hero.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5;
        var y = (e.clientY - r.top) / r.height - 0.5;
        tilt.style.setProperty("--tx", (-y * 16).toFixed(2) + "deg");
        tilt.style.setProperty("--ty", (x * 22).toFixed(2) + "deg");
      });
      hero.addEventListener("mouseleave", function () {
        tilt.style.setProperty("--tx", "0deg"); tilt.style.setProperty("--ty", "0deg");
      });
    } else if ("DeviceOrientationEvent" in window && typeof DeviceOrientationEvent.requestPermission !== "function") {
      window.addEventListener("deviceorientation", function (e) {
        if (e.beta == null || e.gamma == null) return;
        tilt.style.setProperty("--tx", Math.max(-14, Math.min(14, (e.beta - 45) / 3)).toFixed(2) + "deg");
        tilt.style.setProperty("--ty", Math.max(-18, Math.min(18, e.gamma / 2.5)).toFixed(2) + "deg");
      });
    }
  }

  // Close the phone menu after an in-page link.
  Array.prototype.forEach.call(document.querySelectorAll(".menu__nav a"), function (a) {
    a.addEventListener("click", function () { var d = a.closest("details"); if (d) d.removeAttribute("open"); });
  });

  // Cursor glow on dark sections and magnetic buttons (desktop only).
  if (fine && motion) {
    Array.prototype.forEach.call(document.querySelectorAll(".dark"), function (sec) {
      var spot = sec.querySelector(".spot");
      if (!spot) return;
      sec.addEventListener("mousemove", function (e) {
        var r = sec.getBoundingClientRect();
        spot.style.setProperty("--mx", (e.clientX - r.left) + "px");
        spot.style.setProperty("--my", (e.clientY - r.top) + "px");
        spot.style.opacity = "1";
      });
      sec.addEventListener("mouseleave", function () { spot.style.opacity = "0"; });
    });
    Array.prototype.forEach.call(document.querySelectorAll(".magnetic"), function (btn) {
      btn.addEventListener("mousemove", function (e) {
        var r = btn.getBoundingClientRect();
        var dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
        btn.style.transform = "translate(" + (dx * 0.18).toFixed(1) + "px," + (dy * 0.22).toFixed(1) + "px)";
      });
      btn.addEventListener("mouseleave", function () { btn.style.transform = ""; });
    });
  }

  // Scroll story (home): the sticky cube turns one side per stage as the stage panels pass the middle
  // of the screen, held 24deg off square so the next side shows. With reduced motion it snaps to the active side instead of turning continuously.
  var story = document.querySelector(".story");
  if (story) {
    var panels = story.querySelectorAll(".story__panels .tile");
    var cube = story.querySelector(".story__cube");
    var ticks = story.querySelectorAll(".story__rail li");
    var wide = window.matchMedia("(min-width: 960px)");
    var queued = false, last = -1;
    var paint = function () {
      queued = false;
      if (!wide.matches) return;
      var mid = window.innerHeight / 2, c = [];
      for (var i = 0; i < panels.length; i++) { var r = panels[i].getBoundingClientRect(); c.push(r.top + r.height / 2); }
      var n = c.length - 1, pos = 0;
      if (mid >= c[n]) pos = n;
      else for (var k = 0; k < n; k++) if (mid >= c[k] && mid < c[k + 1]) { pos = k + (mid - c[k]) / (c[k + 1] - c[k]); break; }
      var active = Math.round(pos);
      cube.style.transform = "rotateX(-16deg) rotateY(" + (-24 - 90 * (motion ? pos : active)).toFixed(2) + "deg)";
      if (active !== last) {
        last = active;
        for (var j = 0; j < panels.length; j++) {
          panels[j].classList.toggle("is-active", j === active);
          if (ticks[j]) ticks[j].classList.toggle("is-active", j === active);
        }
      }
    };
    var queue = function () { if (!queued) { queued = true; window.requestAnimationFrame(paint); } };
    if (panels.length && cube) {
      story.classList.add("is-live");
      window.addEventListener("scroll", queue, { passive: true });
      window.addEventListener("resize", queue);
      paint();
    }
  }

  // Interface text in the page's language (Bahasa Melayu pages set lang="ms-MY").
  var ms = /^ms/i.test(document.documentElement.lang);
  var T = ms ? {
    selectCopy: "Pilih dan salin", selected: "Teks dipilih. Tekan Salin.", copied: "Disalin",
    name: "Nama", org: "Organisasi", email: "Emel", stage: "Peringkat", decision: "Keputusan yang sedang kami hadapi:",
    subject: "Pertanyaan daripada ", site: "laman web", sending: "Menghantar…",
    sent: function (e) { return "Dihantar. Kami akan membalas ke " + e + "."; },
    failed: "Tidak dapat dihantar secara automatik. Guna butang salin atau emel di bawah."
  } : {
    selectCopy: "Select and copy", selected: "Text selected. Press Copy.", copied: "Copied",
    name: "Name", org: "Organisation", email: "Email", stage: "Stage", decision: "The decision in front of us:",
    subject: "Enquiry from ", site: "the website", sending: "Sending…",
    sent: function (e) { return "Sent. We will reply to " + e + "."; },
    failed: "Could not send automatically. Use the copy or mail buttons below."
  };

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

  // Enquiry form: compose the message, show it, offer copy + mail app, post to an endpoint if one is set.
  var form = document.getElementById("enquiry");
  if (!form) return;
  var out = document.getElementById("enquiry-out"), pre = document.getElementById("enquiry-text");
  var mail = document.getElementById("enquiry-mail"), status = document.getElementById("enquiry-status");
  var email = form.getAttribute("data-email"), endpoint = form.getAttribute("data-endpoint") || "";
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!form.checkValidity()) { form.reportValidity(); return; }
    var d = new FormData(form);
    var org = (d.get("organisation") || "").toString().trim(), name = (d.get("name") || "").toString().trim();
    var text = [T.name + ": " + name, T.org + ": " + (org || "-"), T.email + ": " + (d.get("email") || "").toString().trim(),
                T.stage + ": " + (d.get("stage") || "").toString(), "", T.decision,
                (d.get("message") || "").toString().trim()].join("\n");
    var subject = T.subject + (org || name || T.site);
    pre.textContent = text;
    mail.href = "mailto:" + email + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(text);
    out.hidden = false;
    status.textContent = endpoint ? T.sending : "";
    out.scrollIntoView({ behavior: motion ? "smooth" : "auto", block: "nearest" });
    if (endpoint) {
      var payload = {}; d.forEach(function (v, k) { payload[k] = v; }); payload._subject = subject;
      fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json", "Accept": "application/json" }, body: JSON.stringify(payload) })
        .then(function (r) { status.textContent = r.ok ? T.sent(payload.email) : T.failed; })
        .catch(function () { status.textContent = T.failed; });
    }
  });
})();
