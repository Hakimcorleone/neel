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
  var T = ms ? {
    selectCopy: "Pilih dan salin", selected: "Teks dipilih. Tekan Salin.", copied: "Disalin",
    name: "Nama", org: "Organisasi", email: "Emel", stage: "Perkara", tool: "Alat", decision: "Keputusan yang sedang kami hadapi:",
    subject: "Pertanyaan daripada ", site: "laman web"
  } : {
    selectCopy: "Select and copy", selected: "Text selected. Press Copy.", copied: "Copied",
    name: "Name", org: "Organisation", email: "Email", stage: "About", tool: "Tool", decision: "The decision in front of us:",
    subject: "Enquiry from ", site: "the website"
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

  // Enquiry form: preselect from ?stage= and ?tool=, compose the message, show it, offer copy and the mail app.
  var form = document.getElementById("enquiry");
  if (!form) return;
  var params = new URLSearchParams(window.location.search);
  ["stage", "tool"].forEach(function (k) {
    var v = params.get(k), sel = form.querySelector('[name="' + k + '"]');
    if (!v || !sel) return;
    Array.prototype.forEach.call(sel.options, function (o) { if (o.value === v || o.getAttribute("data-key") === v) sel.value = o.value; });
  });
  var out = document.getElementById("enquiry-out"), pre = document.getElementById("enquiry-text");
  var mail = document.getElementById("enquiry-mail"), status = document.getElementById("enquiry-status");
  var email = form.getAttribute("data-email");
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!form.checkValidity()) { form.reportValidity(); return; }
    var d = new FormData(form);
    var org = (d.get("organisation") || "").toString().trim(), name = (d.get("name") || "").toString().trim();
    var lines = [T.name + ": " + name, T.org + ": " + (org || "-"), T.email + ": " + (d.get("email") || "").toString().trim(),
                 T.stage + ": " + (d.get("stage") || "").toString()];
    if (d.get("tool")) lines.push(T.tool + ": " + d.get("tool"));
    lines.push("", T.decision, (d.get("message") || "").toString().trim());
    var text = lines.join("\n");
    var subject = T.subject + (org || name || T.site);
    pre.textContent = text;
    mail.href = "mailto:" + email + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(text);
    out.hidden = false;
    status.textContent = "";
    out.scrollIntoView({ behavior: motion ? "smooth" : "auto", block: "nearest" });
  });
})();
