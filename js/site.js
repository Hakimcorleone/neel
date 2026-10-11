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

  // Copy buttons.
  function copyText(text, button, fallbackEl) {
    var original = button.dataset.label || (button.dataset.label = button.textContent);
    clearTimeout(button._t);
    function done(label) { button.textContent = label; button._t = setTimeout(function () { button.textContent = original; }, 1800); }
    function select() {
      if (!fallbackEl) { done("Select and copy"); return; }
      var range = document.createRange(); range.selectNodeContents(fallbackEl);
      var sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(range);
      done("Text selected. Press Copy.");
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { done("Copied"); }, select);
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
    var text = ["Name: " + name, "Organisation: " + (org || "-"), "Email: " + (d.get("email") || "").toString().trim(),
                "Stage: " + (d.get("stage") || "").toString(), "", "The decision in front of us:",
                (d.get("message") || "").toString().trim()].join("\n");
    var subject = "Enquiry from " + (org || name || "the website");
    pre.textContent = text;
    mail.href = "mailto:" + email + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(text);
    out.hidden = false;
    status.textContent = endpoint ? "Sending…" : "";
    out.scrollIntoView({ behavior: motion ? "smooth" : "auto", block: "nearest" });
    if (endpoint) {
      var payload = {}; d.forEach(function (v, k) { payload[k] = v; }); payload._subject = subject;
      fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json", "Accept": "application/json" }, body: JSON.stringify(payload) })
        .then(function (r) { status.textContent = r.ok ? "Sent. We will reply to " + payload.email + "." : "Could not send automatically. Use the copy or mail buttons below."; })
        .catch(function () { status.textContent = "Could not send automatically. Use the copy or mail buttons below."; });
    }
  });
})();
