/* A DLTS spectrum computed from the Lang rate-window model. ~2 KB, no library.
   Degrades to a static first frame if anything here fails. */
(function () {
  var cv = document.getElementById("dltsCanvas");
  if (!cv || !cv.getContext) return;
  var ctx = cv.getContext("2d");
  var K = 8.617333e-5, GAMMA = 6.5e20, T_LO = 80, T_HI = 560;
  var t1 = 0.001, t2 = 0.010;
  var ew = Math.log(t2 / t1) / (t2 - t1);
  var REF = 0.697 * 1.12;
  var TRAPS = [
    { Ea: 0.18, sig: 2e-15, base: 1.00, rad: 0.05, v: "--sky-ink",   id: "E1" },
    { Ea: 0.42, sig: 5e-15, base: 0.55, rad: 0.45, v: "--violet",    id: "E2" },
    { Ea: 0.76, sig: 1e-14, base: 0.04, rad: 1.00, v: "--amber-ink", id: "E3" },
    { Ea: 1.05, sig: 3e-14, base: 0.00, rad: 0.80, v: "--red-ink",   id: "E4" }
  ];
  function en(tr, T) { return GAMMA * tr.sig * T * T * Math.exp(-tr.Ea / (K * T)); }
  function w(e) { return Math.exp(-e * t1) - Math.exp(-e * t2); }
  function tok(n) {
    return getComputedStyle(document.documentElement).getPropertyValue(n).trim() || "#888";
  }
  function draw(phi) {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var W = cv.clientWidth || 900, H = Math.round(W * 0.42);
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    cv.style.height = H + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    var L = 44, R = 12, TP = 14, B = 30, pw = W - L - R, ph = H - TP - B;
    var x = function (T) { return L + (T - T_LO) / (T_HI - T_LO) * pw; };
    var y = function (s) { return TP + ph - Math.max(0, Math.min(1, s)) * ph; };
    var ink3 = tok("--text3"), rule = tok("--border"), ink = tok("--text");
    ctx.font = '11px system-ui, sans-serif';
    ctx.strokeStyle = rule; ctx.lineWidth = 1; ctx.fillStyle = ink3;
    ctx.textAlign = "center"; ctx.textBaseline = "top";
    for (var T = 100; T <= 550; T += 100) {
      ctx.beginPath(); ctx.moveTo(Math.round(x(T)) + 0.5, TP);
      ctx.lineTo(Math.round(x(T)) + 0.5, TP + ph); ctx.stroke();
      ctx.fillText(T + " K", x(T), TP + ph + 7);
    }
    ctx.beginPath(); ctx.moveTo(L, TP + ph + 0.5); ctx.lineTo(L + pw, TP + ph + 0.5); ctx.stroke();
    ctx.save(); ctx.translate(12, TP + ph / 2); ctx.rotate(-Math.PI / 2);
    ctx.fillText("\u0394C  (arb.)", 0, 0); ctx.restore();
    var N = 300, sum = new Array(N), Tv = new Array(N), i, k;
    for (i = 0; i < N; i++) { Tv[i] = T_LO + (T_HI - T_LO) * i / (N - 1); sum[i] = 0; }
    for (k = 0; k < TRAPS.length; k++) {
      var tr = TRAPS[k], a = tr.base + tr.rad * phi;
      ctx.beginPath();
      for (i = 0; i < N; i++) {
        var v = a * w(en(tr, Tv[i])) / REF; sum[i] += v;
        if (i === 0) ctx.moveTo(x(Tv[i]), y(v)); else ctx.lineTo(x(Tv[i]), y(v));
      }
      ctx.strokeStyle = tok(tr.v); ctx.globalAlpha = 0.55; ctx.lineWidth = 1.3;
      ctx.stroke(); ctx.globalAlpha = 1;
    }
    ctx.beginPath();
    for (i = 0; i < N; i++) { if (i === 0) ctx.moveTo(x(Tv[i]), y(sum[i])); else ctx.lineTo(x(Tv[i]), y(sum[i])); }
    ctx.strokeStyle = ink; ctx.lineWidth = 2; ctx.lineJoin = "round"; ctx.stroke();
    for (k = 0; k < TRAPS.length; k++) {
      var t2r = TRAPS[k], aa = t2r.base + t2r.rad * phi;
      if (aa < 0.05) continue;
      var lo = 20, hi = 1200, mid;
      for (i = 0; i < 50; i++) { mid = (lo + hi) / 2; if (en(t2r, mid) < ew) lo = mid; else hi = mid; }
      var Tp = (lo + hi) / 2;
      if (Tp < T_LO || Tp > T_HI) continue;
      ctx.fillStyle = tok(t2r.v);
      ctx.beginPath(); ctx.arc(x(Tp), y(aa * 0.697 / REF), 3.2, 0, Math.PI * 2); ctx.fill();
      ctx.textBaseline = "bottom";
      ctx.fillText(t2r.id + "  " + t2r.Ea.toFixed(2) + " eV", x(Tp), y(aa * 0.697 / REF) - 6);
      ctx.textBaseline = "top";
    }
  }
  var sl = document.getElementById("dltsPhi"), out = document.getElementById("dltsOut");
  function run() {
    var phi = parseInt(sl.value, 10) / 100;
    out.textContent = phi === 0 ? "as-grown" :
      (phi).toFixed(2).replace(/0+$/, "").replace(/\.$/, "") + "\u00d710\u00b9\u00b3 ions\u00b7cm\u207b\u00b2";
    draw(phi);
  }
  sl.addEventListener("input", run);
  var rt; window.addEventListener("resize", function () { clearTimeout(rt); rt = setTimeout(run, 140); });
  if (window.matchMedia) {
    var mq = window.matchMedia("(prefers-color-scheme: dark)");
    if (mq.addEventListener) mq.addEventListener("change", run);
  }
  run();
})();
