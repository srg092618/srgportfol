/* srgportfol.io page behavior: contact links, the hero forecast fan, the model lab tabs. */

/* ---------- Contact: fill these in; empty values keep the button hidden ---------- */
const CONTACT = {
  email: "",      // e.g. "stevenricardogoncalves@gmail.com"
  linkedin: ""    // e.g. "https://www.linkedin.com/in/steven-ricardo-gon%C3%A7alves-31048ba5/"
};
(function () {
  const e = document.getElementById("c-email"), l = document.getElementById("c-li");
  if (CONTACT.email) { e.href = "mailto:" + CONTACT.email; e.hidden = false; }
  if (CONTACT.linkedin) { l.href = CONTACT.linkedin; l.hidden = false; }
})();

/* ---------- Hero: history plus forecast fan, drawn on canvas ---------- */
(function () {
  const DATA = window.HERO_DATA, cv = document.getElementById("fan"), ctx = cv.getContext("2d");
  if (!DATA || !cv) return;
  const order = ["ZAF", "MOZ", "NGA", "UGA", "KEN"];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const css = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
  const fmt = v => v >= 1e6 ? (v / 1e6).toFixed(2) + "M" : v >= 1e4 ? Math.round(v / 1e3) + "k" : v >= 1e3 ? (v / 1e3).toFixed(1) + "k" : String(Math.round(v));
  const full = v => Math.round(v).toLocaleString("en-US");
  let loc = "ZAF", reveal = 1, raf = 0, hover = null, W = 0, H = 0, dp = 1;

  const seg = document.getElementById("fan-seg");
  seg.innerHTML = order.map(k => `<button type="button" data-k="${k}" aria-pressed="${k === loc}">${DATA[k].name}</button>`).join("");
  seg.addEventListener("click", e => {
    const b = e.target.closest("button"); if (!b) return;
    loc = b.dataset.k; seg.querySelectorAll("button").forEach(x => x.setAttribute("aria-pressed", x === b));
    hover = null; animate(); setReadout();
  });

  function resize() {
    dp = Math.min(2, devicePixelRatio || 1); const r = cv.getBoundingClientRect();
    W = Math.max(1, Math.round(r.width * dp)); H = Math.max(1, Math.round(r.height * dp)); cv.width = W; cv.height = H;
  }
  function scales() {
    const d = DATA[loc], years0 = d.hist[0][0], years1 = d.fc[d.fc.length - 1][0];
    let ymax = 0; d.hist.forEach(p => ymax = Math.max(ymax, p[1])); d.fc.forEach(r => ymax = Math.max(ymax, r[7]));
    const step = niceStep(ymax / 4); ymax = Math.ceil(ymax / step) * step;
    const L = 52 * dp, R = 14 * dp, T = 16 * dp, B = 28 * dp;
    return { d, years0, years1, ymax, step, L, R, T, B,
      X: y => L + (y - years0) / (years1 - years0) * (W - L - R),
      Y: v => H - B - v / ymax * (H - T - B) };
  }
  function niceStep(x) { const p = Math.pow(10, Math.floor(Math.log10(x))), m = x / p; return (m < 1.5 ? 1 : m < 3 ? 2 : m < 7 ? 5 : 10) * p; }

  function draw() {
    const s = scales(), d = s.d, ink = css("--hist"), band = css("--band"), line = css("--line"), muted = css("--muted");
    ctx.clearRect(0, 0, W, H);
    ctx.font = `${11 * dp}px ${css("--mono")}`; ctx.lineWidth = 1 * dp;
    for (let v = 0; v <= s.ymax + 1; v += s.step) {
      const y = s.Y(v); ctx.strokeStyle = line; ctx.beginPath(); ctx.moveTo(s.L, y); ctx.lineTo(W - s.R, y); ctx.stroke();
      ctx.fillStyle = muted; ctx.textAlign = "right"; ctx.fillText(fmt(v), s.L - 8 * dp, y + 4 * dp);
    }
    ctx.textAlign = "center";
    for (let y = 2006; y <= s.years1; y += 4) ctx.fillText(y, s.X(y), H - 9 * dp);
    const origin = d.hist[d.hist.length - 1][0], xo = s.X(origin);
    ctx.save(); ctx.beginPath(); ctx.rect(0, 0, s.L + (W - s.L) * reveal, H); ctx.clip();
    /* forecast-origin marker */
    ctx.setLineDash([3 * dp, 4 * dp]); ctx.strokeStyle = muted; ctx.beginPath(); ctx.moveTo(xo, s.T); ctx.lineTo(xo, H - s.B); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = muted; ctx.textAlign = "left"; ctx.fillText("forecast", xo + 6 * dp, s.T + 10 * dp);
    /* bands: 95, 80, 50 (columns 1/7, 2/6, 3/5), anchored at the last observed value */
    const last = d.hist[d.hist.length - 1];
    [[1, 7, .14], [2, 6, .2], [3, 5, .3]].forEach(([lo, hi, a]) => {
      ctx.globalAlpha = a; ctx.fillStyle = band; ctx.beginPath(); ctx.moveTo(s.X(last[0]), s.Y(last[1]));
      d.fc.forEach(r => ctx.lineTo(s.X(r[0]), s.Y(r[hi])));
      for (let i = d.fc.length - 1; i >= 0; i--) ctx.lineTo(s.X(d.fc[i][0]), s.Y(d.fc[i][lo]));
      ctx.closePath(); ctx.fill();
    });
    ctx.globalAlpha = 1;
    ctx.strokeStyle = band; ctx.lineWidth = 2.2 * dp; ctx.setLineDash([5 * dp, 4 * dp]); ctx.beginPath(); ctx.moveTo(s.X(last[0]), s.Y(last[1]));
    d.fc.forEach(r => ctx.lineTo(s.X(r[0]), s.Y(r[4]))); ctx.stroke(); ctx.setLineDash([]);
    ctx.strokeStyle = ink; ctx.lineWidth = 2.4 * dp; ctx.lineJoin = "round"; ctx.beginPath();
    d.hist.forEach((p, i) => i ? ctx.lineTo(s.X(p[0]), s.Y(p[1])) : ctx.moveTo(s.X(p[0]), s.Y(p[1]))); ctx.stroke();
    ctx.restore();
    if (hover != null) {
      const x = s.X(hover); ctx.strokeStyle = ink; ctx.globalAlpha = .35; ctx.lineWidth = 1 * dp;
      ctx.beginPath(); ctx.moveTo(x, s.T); ctx.lineTo(x, H - s.B); ctx.stroke(); ctx.globalAlpha = 1;
      const h = d.hist.find(p => p[0] === hover), f = d.fc.find(r => r[0] === hover), v = h ? h[1] : f[4];
      ctx.beginPath(); ctx.arc(x, s.Y(v), 4.5 * dp, 0, 7); ctx.fillStyle = h ? ink : band; ctx.fill();
      ctx.lineWidth = 2 * dp; ctx.strokeStyle = css("--surface"); ctx.stroke();
    }
  }
  function setReadout() {
    const d = DATA[loc], last = d.hist[d.hist.length - 1], end = d.fc[d.fc.length - 1];
    const set = (i, k, v) => { document.getElementById("ro-k" + i).textContent = k; document.getElementById("ro-v" + i).textContent = v; };
    if (hover == null) {
      set(1, last[0] + " estimate", full(last[1])); set(2, end[0] + " median", full(end[4])); set(3, "95% interval", fmt(end[1]) + " to " + fmt(end[7]));
    } else {
      const h = d.hist.find(p => p[0] === hover), f = d.fc.find(r => r[0] === hover);
      if (h) { set(1, hover + " estimate", full(h[1])); set(2, "Source", "UNAIDS"); set(3, "Type", "Observed"); }
      else { set(1, hover + " median", full(f[4])); set(2, "80% interval", fmt(f[2]) + " to " + fmt(f[6])); set(3, "95% interval", fmt(f[1]) + " to " + fmt(f[7])); }
    }
  }
  function animate() {
    cancelAnimationFrame(raf);
    if (reduce) { reveal = 1; draw(); return; }
    const t0 = performance.now();
    const step = t => { reveal = Math.min(1, (t - t0) / 1100); reveal = 1 - Math.pow(1 - reveal, 3); draw(); if (reveal < 1) raf = requestAnimationFrame(step); };
    raf = requestAnimationFrame(step);
  }
  function pick(e) {
    const r = cv.getBoundingClientRect(), s = scales(), x = (e.clientX - r.left) * dp;
    const yr = Math.round(s.years0 + (x - s.L) / (W - s.L - s.R) * (s.years1 - s.years0));
    hover = Math.max(s.years0, Math.min(s.years1, yr)); draw(); setReadout();
  }
  cv.addEventListener("pointermove", pick);
  cv.addEventListener("pointerdown", pick);
  cv.addEventListener("pointerleave", () => { hover = null; draw(); setReadout(); });
  new ResizeObserver(() => { resize(); draw(); }).observe(cv);
  matchMedia("(prefers-color-scheme: dark)").addEventListener("change", draw);
  document.fonts && document.fonts.ready.then(draw);
  resize(); setReadout(); animate();
})();

/* ---------- Model lab: one embedded page, six instruments ---------- */
(function () {
  const LAB = [
    ["optimization", "Gradient descent", "θ ← θ − η∇L(θ)", "SGD, momentum and Adam race across three loss surfaces. Raise the learning rate to watch SGD diverge."],
    ["regression", "Linear regression", "ŷ = w·x + b", "Gradient descent converges on the exact least-squares line. Click the plot to add points."],
    ["complexity", "Model selection", "error = bias² + variance + σ²", "Raise the polynomial degree to see a model underfit, then overfit, against held-out error."],
    ["sampling", "Sampling and inference", "SE = σ / √n", "The central limit theorem: means of skewed samples settle onto a normal curve."],
    ["clustering", "Clustering", "J = Σ ‖xᵢ − μ_c(i)‖²", "k-means finds customer segments in six dimensions, shown through a 3-component PCA projection."],
    ["forecasting", "Time-series forecasting", "ŷₜ₊ₕ = ℓₜ + h·bₜ + sₜ₊ₕ₋ₘ", "Holt-Winters smoothing forecasts seasonal sales, scored against 12 hidden months."]
  ];
  const seg = document.getElementById("lab-seg"), frame = document.getElementById("if-lab"), desc = document.getElementById("lab-desc");
  if (!seg || !frame) return;
  let cur = "optimization", ro = null, loaded = false;
  seg.innerHTML = LAB.map(m => `<button type="button" data-k="${m[0]}" aria-pressed="${m[0] === cur}">${m[1]}</button>`).join("");
  function show(k, nav) {
    cur = k; const m = LAB.find(x => x[0] === k);
    seg.querySelectorAll("button").forEach(b => b.setAttribute("aria-pressed", b.dataset.k === k));
    desc.innerHTML = `<b>${m[2]}</b>${m[3]}`;
    if (!nav) return;
    if (!loaded) { frame.src = "demos/model-lab/index.html#lab-" + k; loaded = true; }
    else { try { frame.contentWindow.location.hash = "lab-" + k; } catch (_) { frame.src = "demos/model-lab/index.html#lab-" + k; } }
  }
  seg.addEventListener("click", e => { const b = e.target.closest("button"); if (b) show(b.dataset.k, true); });
  /* load the lab only when it is about to scroll into view */
  new IntersectionObserver((es, o) => { if (es[0].isIntersecting) { show(cur, true); o.disconnect(); } }, { rootMargin: "400px" }).observe(frame);
  show(cur, false);
  /* size the frame to its content, since both pages share an origin */
  frame.addEventListener("load", () => {
    try {
      const doc = frame.contentDocument, fit = () => { frame.style.height = Math.max(600, Math.ceil(doc.body.offsetHeight) + 24) + "px"; };
      if (ro) ro.disconnect(); ro = new ResizeObserver(fit); ro.observe(doc.body); fit();
      frame.contentWindow.addEventListener("hashchange", () => setTimeout(fit, 120));
    } catch (_) { /* different origin: keep the fixed height from the stylesheet */ }
  });
})();

/* ---------- Header: mark the section in view ---------- */
(function () {
  const links = [...document.querySelectorAll("nav.main a")], map = new Map(links.map(a => [a.getAttribute("href").slice(1), a]));
  const io = new IntersectionObserver(es => es.forEach(e => { const a = map.get(e.target.id); if (a && e.isIntersecting) { links.forEach(x => x.classList.remove("on")); a.classList.add("on"); } }),
    { rootMargin: "-45% 0px -50% 0px" });
  ["forecasting", "visualizations", "lab", "about", "contact"].forEach(id => { const el = document.getElementById(id); if (el) io.observe(el); });
})();
