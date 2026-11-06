/* Naisho: carousel dots/arrows + optional beta-update email signup (Kit form 10118748, double opt-in). No trackers, no cookies. */
(function () {
  "use strict";
  var track = document.getElementById("track");
  if (track) {
    var slides = [].slice.call(track.querySelectorAll(".slide"));
    var dots = [].slice.call(document.querySelectorAll(".dot"));
    var current = function () {
      var c = track.scrollLeft + track.clientWidth / 2, best = 0, bd = 1e9;
      slides.forEach(function (s, i) { var m = s.offsetLeft + s.offsetWidth / 2, dd = Math.abs(m - c); if (dd < bd) { bd = dd; best = i; } });
      return best;
    };
    var go = function (i) {
      i = Math.max(0, Math.min(slides.length - 1, i));
      var s = slides[i];
      track.scrollTo({ left: s.offsetLeft - (track.clientWidth - s.offsetWidth) / 2, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
    };
    var mark = function () { var k = current(); dots.forEach(function (d, i) { d.setAttribute("aria-current", i === k ? "true" : "false"); }); };
    var t; track.addEventListener("scroll", function () { clearTimeout(t); t = setTimeout(mark, 60); }, { passive: true });
    dots.forEach(function (d, i) { d.addEventListener("click", function (e) { e.preventDefault(); go(i); }); });
    document.getElementById("prev").addEventListener("click", function () { go(current() - 1); });
    document.getElementById("next").addEventListener("click", function () { go(current() + 1); });
    track.addEventListener("keydown", function (e) { if (e.key === "ArrowRight") { e.preventDefault(); go(current() + 1); } if (e.key === "ArrowLeft") { e.preventDefault(); go(current() - 1); } });
    var fit = function () { var nav = document.querySelector(".car-nav"); if (nav) nav.hidden = track.scrollWidth <= track.clientWidth + 2; mark(); };
    addEventListener("resize", fit); addEventListener("load", fit); fit();
  }

  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  var jf = document.getElementById("join-form");
  if (jf) {
    var email = document.getElementById("j-email");
    var st = jf.querySelector(".status"), btn = jf.querySelector("button[type=submit]");
    var say = function (txt, bad) { st.textContent = txt; st.classList.toggle("err", !!bad); };
    jf.addEventListener("submit", function (e) {
      e.preventDefault();
      var em = email.value.trim(), ok = EMAIL_RE.test(em);
      if (ok) email.removeAttribute("aria-invalid"); else email.setAttribute("aria-invalid", "true");
      if (!ok) { say(em ? "Please check your email address." : "Add your email to get Naisho updates.", true); email.focus(); return; }
      btn.disabled = true; say("Signing you up…");
      fetch(jf.action, { method: "POST", body: new FormData(jf), headers: { Accept: "application/json" } })
        .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { return { ok: r.ok, j: j }; }); })
        .then(function (x) {
          if (x.j && x.j.status === "quarantined" && x.j.url) { say("One quick check to confirm you're human…"); location.href = x.j.url; return; }
          if (x.ok && (!x.j.status || x.j.status === "success")) { say("Almost done: check your inbox and tap the confirm link."); jf.reset(); }
          else { say((x.j && x.j.errors && x.j.errors.messages && x.j.errors.messages.join(" ")) || "That didn't go through. Please try again.", true); }
        })
        .catch(function () { jf.submit(); })
        .then(function () { btn.disabled = false; });
    });
  }
})();
