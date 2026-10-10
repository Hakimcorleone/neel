/* neeladvisory.my - progressive enhancement only. Every page reads fully without this file. */
(function () {
  "use strict";

  function copyText(text, button, fallbackEl) {
    var original = button.textContent;
    function done(label) {
      button.textContent = label;
      setTimeout(function () { button.textContent = original; }, 1800);
    }
    function select() {
      if (!fallbackEl) { done("Select and copy"); return; }
      var range = document.createRange();
      range.selectNodeContents(fallbackEl);
      var sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
      done("Selected, press copy");
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { done("Copied"); }, select);
    } else {
      select();
    }
  }

  // Copy buttons: <button data-copy="text" data-copy-from="#id">
  Array.prototype.forEach.call(document.querySelectorAll("[data-copy], [data-copy-from]"), function (btn) {
    btn.addEventListener("click", function () {
      var from = btn.getAttribute("data-copy-from");
      var el = from ? document.querySelector(from) : null;
      var text = el ? el.textContent : btn.getAttribute("data-copy");
      copyText(text, btn, el);
    });
  });

  // Enquiry form: compose the brief, show it, offer copy + mail app, post to an endpoint if one is set.
  var form = document.getElementById("brief");
  if (!form) { return; }
  var out = document.getElementById("brief-out");
  var pre = document.getElementById("brief-text");
  var mail = document.getElementById("brief-mail");
  var status = document.getElementById("brief-status");
  var email = form.getAttribute("data-email");
  var endpoint = form.getAttribute("data-endpoint") || "";

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var d = new FormData(form);
    var company = (d.get("company") || "").toString().trim();
    var name = (d.get("name") || "").toString().trim();
    var lines = [
      "Name: " + name,
      "Company: " + (company || "-"),
      "Email: " + (d.get("email") || "").toString().trim(),
      "Need: " + (d.get("need") || "").toString(),
      "",
      "Brief:",
      (d.get("message") || "").toString().trim()
    ];
    var text = lines.join("\n");
    var subject = "Brief from " + (company || name || "the website");
    pre.textContent = text;
    mail.href = "mailto:" + email + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(text);
    out.hidden = false;
    status.textContent = endpoint ? "Sending…" : "";
    out.scrollIntoView({ behavior: "smooth", block: "nearest" });

    if (endpoint) {
      var payload = {};
      d.forEach(function (v, k) { payload[k] = v; });
      payload._subject = subject;
      fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify(payload)
      }).then(function (r) {
        status.textContent = r.ok
          ? "Sent. We will reply to " + payload.email + "."
          : "Could not send automatically. Use the copy or mail buttons below.";
      }).catch(function () {
        status.textContent = "Could not send automatically. Use the copy or mail buttons below.";
      });
    }
  });
})();
