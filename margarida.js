// Desenho artístico da margarida (usado na animação e para gerar img/margarida.png)
// desenharMargarida(g, opcoes) desenha centrada em (0,0), num espaço de -50 a 50.
(function () {
  const PALETAS = {
    branca: { base: "#c9d6e8", meio: "#f4f7fc", ponta: "#ffffff", veio: "rgba(120,140,175,.28)", borda: "rgba(110,130,170,.35)", sombra: "rgba(10,25,60,.35)" },
    gelo: { base: "#a9bfe0", meio: "#e3edfb", ponta: "#f7faff", veio: "rgba(90,120,170,.3)", borda: "rgba(90,120,170,.4)", sombra: "rgba(10,25,60,.35)" },
    azul: { base: "#3f6fc4", meio: "#7fa8ec", ponta: "#b9d2fb", veio: "rgba(30,60,130,.35)", borda: "rgba(30,60,130,.45)", sombra: "rgba(5,15,45,.4)" },
  };

  // gerador pseudoaleatório com semente, para cada flor ter seu "jeito"
  function aleatorio(semente) {
    let s = semente >>> 0 || 1;
    return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
  }

  function petala(g, r0, L, w, b) {
    // pétala afinada na base, larga no meio, levemente curvada (b), com um recortezinho na ponta
    const tx = b * w;
    g.beginPath();
    g.moveTo(-w * 0.15, -r0);
    g.bezierCurveTo(-w * 0.85, -r0 - L * 0.25, -w * 0.8 + tx * 0.6, -r0 - L * 0.8, -w * 0.4 + tx, -r0 - L);
    g.quadraticCurveTo(-w * 0.18 + tx, -r0 - L * 1.03, tx, -r0 - L * 0.93);
    g.quadraticCurveTo(w * 0.18 + tx, -r0 - L * 1.03, w * 0.4 + tx, -r0 - L);
    g.bezierCurveTo(w * 0.8 + tx * 0.6, -r0 - L * 0.8, w * 0.85, -r0 - L * 0.25, w * 0.15, -r0);
    g.closePath();
  }

  function camada(g, rnd, pal, n, r0, L, w, p, desloc, escurecer) {
    const torcao = (1 - p) * 0.8;
    for (let k = 0; k < n; k++) {
      const ang = ((k + desloc) / n) * Math.PI * 2 + (rnd() - 0.5) * 0.12 + torcao;
      const l = L * (0.88 + rnd() * 0.22) * (0.3 + 0.7 * p);
      const ww = w * (0.85 + rnd() * 0.3) * (0.55 + 0.45 * p);
      const curva = (rnd() - 0.5) * 0.7;
      g.save();
      g.rotate(ang);
      const gr = g.createLinearGradient(0, -r0, 0, -r0 - l);
      gr.addColorStop(0, pal.base);
      gr.addColorStop(0.35, pal.meio);
      gr.addColorStop(1, pal.ponta);
      petala(g, r0, l, ww, curva);
      g.fillStyle = gr;
      g.fill();
      if (escurecer) { g.fillStyle = "rgba(20,40,90,.10)"; g.fill(); }
      g.strokeStyle = pal.borda; g.lineWidth = 0.6; g.stroke();
      // veios
      g.strokeStyle = pal.veio; g.lineWidth = 0.5;
      g.beginPath(); g.moveTo(0, -r0 - l * 0.08); g.lineTo(0, -r0 - l * 0.8); g.stroke();
      g.beginPath(); g.moveTo(-ww * 0.25, -r0 - l * 0.15); g.quadraticCurveTo(-ww * 0.35, -r0 - l * 0.5, -ww * 0.22, -r0 - l * 0.75); g.stroke();
      g.beginPath(); g.moveTo(ww * 0.25, -r0 - l * 0.15); g.quadraticCurveTo(ww * 0.35, -r0 - l * 0.5, ww * 0.22, -r0 - l * 0.75); g.stroke();
      g.restore();
    }
  }

  function miolo(g, rnd, R) {
    // sombra do miolo sobre as pétalas
    g.save();
    g.shadowColor = "rgba(60,40,0,.45)"; g.shadowBlur = R * 0.5; g.shadowOffsetY = R * 0.12;
    const gr = g.createRadialGradient(-R * 0.3, -R * 0.35, R * 0.1, 0, 0, R);
    gr.addColorStop(0, "#ffe98a");
    gr.addColorStop(0.5, "#f5bd2c");
    gr.addColorStop(0.85, "#d98d12");
    gr.addColorStop(1, "#a9650c");
    g.fillStyle = gr;
    g.beginPath(); g.arc(0, 0, R, 0, Math.PI * 2); g.fill();
    g.restore();
    // sementinhas em espiral (como nas margaridas de verdade)
    const N = Math.round(R * 7);
    const ouro = Math.PI * (3 - Math.sqrt(5));
    for (let i = 1; i < N; i++) {
      const rr = R * 0.92 * Math.sqrt(i / N);
      const a = i * ouro;
      const x = Math.cos(a) * rr, y = Math.sin(a) * rr;
      const t = rr / R;
      g.fillStyle = t > 0.6 ? "rgba(150,85,5,.55)" : "rgba(255,240,170,.55)";
      g.beginPath(); g.arc(x, y, R * 0.055 * (1.2 - t * 0.5), 0, Math.PI * 2); g.fill();
    }
    // brilho
    const br = g.createRadialGradient(-R * 0.35, -R * 0.4, 0, -R * 0.35, -R * 0.4, R * 0.6);
    br.addColorStop(0, "rgba(255,255,255,.55)"); br.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = br; g.beginPath(); g.arc(0, 0, R, 0, Math.PI * 2); g.fill();
  }

  // opcoes: { p: abertura 0..1, paleta: "branca"|"gelo"|"azul", semente, inclinacao: 0.6..1 }
  function desenharMargarida(g, o) {
    const p = o.p == null ? 1 : o.p;
    const pal = PALETAS[o.paleta || "branca"];
    const rnd = aleatorio(o.semente || 7);
    const inc = o.inclinacao || 1;
    g.save();
    g.rotate(rnd() * Math.PI * 2);
    g.scale(1, inc); // flor de lado, como se olhasse para outra direção
    const n = 14 + Math.floor(rnd() * 4);
    // sombra suave embaixo da flor toda
    g.save();
    g.shadowColor = pal.sombra; g.shadowBlur = 5; g.shadowOffsetY = 2;
    camada(g, rnd, pal, n, 6, 40, 9, p, 0.5, true); // camada de trás
    g.restore();
    camada(g, rnd, pal, n, 7, 37, 8.2, p, 0, false); // camada da frente
    miolo(g, rnd, 10 + 3 * p);
    g.restore();
  }

  window.desenharMargarida = desenharMargarida;
})();
