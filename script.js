// Você não precisa mexer aqui — edite o arquivo config.js
const $ = (id) => document.getElementById(id);
const C = CONFIG;

document.documentElement.style.setProperty("--cor", C.corPrincipal);

// Textos
$("texto-abertura").textContent = C.textoAbertura;
$("nomes").textContent = `${C.nome1} & ${C.nome2}`;
$("titulo").textContent = C.titulo;
$("subtitulo").textContent = C.subtitulo;
$("final").textContent = C.fraseFinal;
$("assinatura").textContent = C.assinatura;
C.carta.forEach((t) => { const p = document.createElement("p"); p.textContent = t; $("carta").appendChild(p); });

// Linha do tempo
C.momentos.forEach((m) => {
  const li = document.createElement("li");
  li.innerHTML = `<small></small><strong></strong><p></p>`;
  li.querySelector("small").textContent = m.data;
  li.querySelector("strong").textContent = " " + m.titulo;
  li.querySelector("p").textContent = m.texto;
  $("linha-tempo").appendChild(li);
});

// Carrossel de fotos
let atual = 0;
C.fotos.forEach((f, i) => {
  const fig = document.createElement("figure");
  fig.className = "slide";
  const img = document.createElement("img");
  img.src = f.arquivo; img.alt = f.legenda;
  img.onerror = () => { const d = document.createElement("div"); d.className = "falsa"; img.replaceWith(d); };
  const cap = document.createElement("figcaption"); cap.textContent = f.legenda;
  fig.append(img, cap);
  $("slides").appendChild(fig);
  const ponto = document.createElement("span");
  ponto.onclick = () => irPara(i);
  $("pontos").appendChild(ponto);
});
function irPara(i) {
  atual = (i + C.fotos.length) % C.fotos.length;
  $("slides").style.transform = `translateX(-${atual * 100}%)`;
  [...$("pontos").children].forEach((p, k) => p.classList.toggle("ativo", k === atual));
}
$("ant").onclick = () => irPara(atual - 1);
$("prox").onclick = () => irPara(atual + 1);
let toqueX = 0;
$("carrossel").addEventListener("touchstart", (e) => (toqueX = e.touches[0].clientX), { passive: true });
$("carrossel").addEventListener("touchend", (e) => {
  const dx = e.changedTouches[0].clientX - toqueX;
  if (Math.abs(dx) > 40) irPara(atual + (dx < 0 ? 1 : -1));
});
let auto = setInterval(() => irPara(atual + 1), 5000);
// quando alguém troca a foto na mão, reinicia a contagem da troca automática
function reiniciarAuto() { clearInterval(auto); auto = setInterval(() => irPara(atual + 1), 5000); }
$("carrossel").addEventListener("click", reiniciarAuto);
$("carrossel").addEventListener("touchend", reiniciarAuto);
irPara(0);

// Música
const audio = $("audio");
if (C.musica && C.musica.arquivo) {
  audio.src = C.musica.arquivo;
  $("musica-nome").textContent = C.musica.nome;
  $("musica-artista").textContent = C.musica.artista;
} else {
  $("player-box").remove();
}
function tocar() { audio.play().then(() => { $("play").textContent = "❚❚"; $("disco").classList.add("girando"); }).catch(() => {}); }
$("play").onclick = () => {
  if (audio.paused) tocar();
  else { audio.pause(); $("play").textContent = "▶"; $("disco").classList.remove("girando"); }
};
audio.ontimeupdate = () => { if (audio.duration) $("progresso").style.width = (audio.currentTime / audio.duration) * 100 + "%"; };

// Contador de tempo juntos
const inicio = new Date(C.dataInicio);
$("desde").textContent = "desde " + inicio.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
function atualizarContador() {
  const agora = new Date();
  let anos = agora.getFullYear() - inicio.getFullYear();
  let meses = agora.getMonth() - inicio.getMonth();
  let ref = new Date(inicio);
  ref.setFullYear(inicio.getFullYear() + anos, inicio.getMonth() + meses);
  if (ref > agora) { meses--; ref = new Date(inicio); ref.setFullYear(inicio.getFullYear() + anos, inicio.getMonth() + meses); }
  if (meses < 0) { anos--; meses += 12; }
  let resto = Math.max(0, Math.floor((agora - ref) / 1000));
  const dias = Math.floor(resto / 86400); resto %= 86400;
  const horas = Math.floor(resto / 3600); resto %= 3600;
  const min = Math.floor(resto / 60); const seg = resto % 60;
  const itens = [[anos, anos === 1 ? "ano" : "anos"], [meses, meses === 1 ? "mês" : "meses"], [dias, dias === 1 ? "dia" : "dias"],
    [horas, "horas"], [min, "minutos"], [seg, "segundos"]];
  const box = $("contador");
  if (!box.children.length) box.innerHTML = itens.map(() => "<div><b></b><small></small></div>").join("");
  itens.forEach(([v, r], i) => {
    const [b, s] = box.children[i].children;
    const txt = String(v).padStart(2, "0");
    if (b.textContent !== txt) b.textContent = txt;
    if (s.textContent !== r) s.textContent = r;
  });
}
atualizarContador();
setInterval(atualizarContador, 1000);

// Motivos
let iMotivo = 0;
$("motivo").textContent = C.motivos[0];
$("btn-motivo").onclick = () => {
  iMotivo = (iMotivo + 1) % C.motivos.length;
  const el = $("motivo");
  el.style.opacity = 0;
  setTimeout(() => { el.textContent = C.motivos[iMotivo]; el.style.opacity = 1; }, 300);
  for (let i = 0; i < 8; i++) setTimeout(criarCoracao, i * 80);
};

// Corações caindo
function criarCoracao() {
  const c = document.createElement("span");
  if (Math.random() < 0.6) c.className = "cai flor";
  else { c.className = "cai"; c.textContent = ["💙", "♥"][Math.floor(Math.random() * 2)]; }
  c.style.left = Math.random() * 100 + "vw";
  c.style.fontSize = 12 + Math.random() * 18 + "px";
  c.style.animationDuration = 5 + Math.random() * 5 + "s";
  $("coracoes").appendChild(c);
  setTimeout(() => c.remove(), 10000);
}

// Aparecer ao rolar
const obs = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && e.target.classList.add("visivel")), { threshold: 0.15 });

// Abertura
// o site já fica montado por trás da abertura
document.body.classList.add("fechado");
let aberto = false;

function revelarSite() {
  $("abertura").hidden = true;
  document.body.classList.remove("fechado");
  document.querySelectorAll(".cartao").forEach((el) => obs.observe(el));
}

$("btn-coracao").onclick = () => {
  if (aberto) return;
  aberto = true;
  if (C.musica && C.musica.arquivo) tocar();
  const btn = $("btn-coracao").getBoundingClientRect();
  $("abertura").classList.add("abrindo");
  const semMovimento = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (semMovimento) {
    revelarSite();
    return;
  }
  buqueDeMargaridas(btn, revelarSite, () => setInterval(criarCoracao, 600));
};

// ===== Animação: a margarida se abre num buquê que cobre a tela =====
// o "palco" da animação (duas telas de desenho) é criado antes do toque,
// para o toque não precisar alocar nada pesado
const DPR_BUQUE = Math.min(window.devicePixelRatio || 1, 1.5);
let palco = null;
function prepararPalco() {
  const W = innerWidth, H = innerHeight;
  if (palco && palco.W === W && palco.H === H) return palco;
  if (palco) palco.tela.remove();
  const tela = document.createElement("div");
  tela.id = "buque-abertura";
  // fixas[0] e fixas[1]: flores paradas (uma aparece enquanto a outra é montada); viva: flores em movimento
  const camadas = [0, 1, 2].map(() => {
    const c = document.createElement("canvas");
    c.width = Math.round(W * DPR_BUQUE); c.height = Math.round(H * DPR_BUQUE);
    tela.appendChild(c);
    const g = c.getContext("2d");
    g.scale(DPR_BUQUE, DPR_BUQUE);
    return { c, g };
  });
  camadas[1].c.style.visibility = "hidden";
  document.body.appendChild(tela);
  palco = { W, H, tela, fixas: [camadas[0], camadas[1]], fctx: camadas[0].g, ctx: camadas[2].g };
  return palco;
}
// desenha cada flor pronta uma vez, escondida, para o navegador já deixá-las na memória de vídeo
function aquecer(lista) {
  const { ctx, W, H } = prepararPalco();
  for (const s of lista) ctx.drawImage(s, 0, 0, 4, 4);
  ctx.clearRect(0, 0, W, H);
}

function buqueDeMargaridas(origem, aoCobrir, aoTerminar) {
  const { W, H, tela, fixas, fctx, ctx } = prepararPalco();
  tela.classList.add("ativo");

  if (!_sprites[0]) desenharVariacao(0);
  const prontas = VARIACOES.map((_, i) => i).filter((i) => _sprites[i]);
  const sprites = VARIACOES.map((_, i) => _sprites[i] || _sprites[prontas[i % prontas.length]]);
  const ESTAGIOS = sprites[0].length - 1;

  // posições: uma grade com variação que cobre a tela toda,
  // cada flor nasce mais tarde quanto mais longe do centro estiver
  const cx = origem.left + origem.width / 2, cy = origem.top + origem.height / 2;
  const passo = Math.max(70, Math.min(W, H) / 5.5);
  const distMax = Math.hypot(Math.max(cx, W - cx), Math.max(cy, H - cy)) + passo;
  const ESPALHAR = 1.7, ABRIR = 0.75;
  // a primeira já nasce aberta, no lugar exato da margarida do botão
  const m = getComputedStyle(document.querySelector("#btn-coracao .flor-grande")).transform;
  const giroBotao = m && m !== "none" ? Math.atan2(+m.split(",")[1], +m.split("(")[1].split(",")[0]) : 0;
  const flores = [{ x: cx, y: cy, d: origem.width * (0.94 / 0.92), nasce: -ABRIR, cor: 0, giro: giroBotao }];
  for (let y = -passo / 2; y < H + passo; y += passo * 0.78) {
    for (let x = -passo / 2; x < W + passo; x += passo * 0.78) {
      const fx = x + (Math.random() - 0.5) * passo * 0.7;
      const fy = y + (Math.random() - 0.5) * passo * 0.7;
      const dist = Math.hypot(fx - cx, fy - cy);
      flores.push({
        x: fx, y: fy,
        d: passo * (1.7 + Math.random() * 0.55),
        nasce: 0.15 + (dist / distMax) * ESPALHAR + Math.random() * 0.25,
        cor: sortearVariacao(),
        giro: Math.random() * Math.PI * 2,
      });
    }
  }
  flores.sort((a, b) => a.nasce - b.nasce);
  const fimAbrir = flores[flores.length - 1].nasce + ABRIR;

  const saiDeTras = (t) => 1 + 2.2 * Math.pow(t - 1, 3) + 1.2 * Math.pow(t - 1, 2); // easeOutBack
  function desenhar(g, f, a) {
    const est = Math.min(ESTAGIOS, Math.round(Math.min(1, a * 1.15) * ESTAGIOS));
    const tam = f.d * saiDeTras(a);
    g.save();
    g.globalAlpha = Math.min(1, a * 4);
    g.translate(f.x, f.y);
    g.rotate(f.giro + (1 - a) * -0.6);
    g.drawImage(sprites[f.cor][est], -tam / 2, -tam / 2, tam, tam);
    g.restore();
  }

  // ida: as flores nascem do centro para fora até cobrir a tela;
  // volta: elas se fecham na ordem inversa, de fora para dentro, e a do centro é a última
  const FECHAR = 0.5, PAUSA = 0.25, INTERVALO = 0.2;
  const n = flores.length;
  const ultimaNasce = flores[n - 1].nasce;
  const T0 = fimAbrir + PAUSA;
  for (let i = 1; i < n; i++) flores[i].fecha = T0 + (ultimaNasce - flores[i].nasce) * 0.85;
  flores[0].fecha = flores[1].fecha + 0.2; // a margarida que ela tocou fecha por último
  const fimFechar = flores[0].fecha + FECHAR;
  // como "fecha" diminui com o índice, as flores que ainda não começaram a fechar
  // num instante T são sempre as primeiras: [0, quantasAte(T))
  const quantasAte = (T) => { let p = 0; while (p < n && flores[p].fecha >= T) p++; return p; };

  // estado da volta: uma camada fixa aparece (com as flores paradas até o próximo marco)
  // enquanto a outra é montada aos poucos para o marco seguinte
  let mostra = 0, marco = -1, prefixoMostrado = n;
  let montando = null; // { alvo, feitas }
  function comecarMontagem(T) {
    const outra = fixas[1 - mostra];
    outra.g.clearRect(0, 0, W, H);
    montando = { alvo: quantasAte(T), feitas: 0 };
  }
  function montarUmPouco(pedaco) {
    if (!montando) return;
    const g = fixas[1 - mostra].g;
    const ate = Math.min(montando.alvo, montando.feitas + pedaco);
    for (let i = montando.feitas; i < ate; i++) desenhar(g, flores[i], 1);
    montando.feitas = ate;
  }
  function trocar() {
    montarUmPouco(Infinity); // termina o que faltar (normalmente já está pronto)
    fixas[1 - mostra].c.style.visibility = "visible";
    fixas[mostra].c.style.visibility = "hidden";
    mostra = 1 - mostra;
    prefixoMostrado = montando.alvo;
    montando = null;
  }

  let inicio = null;
  let abertas = 0, cobriu = false;
  function quadro(agora) {
    if (inicio === null) inicio = agora; // o relógio começa no primeiro quadro desenhado
    const t = (agora - inicio) / 1000;
    if (t < fimAbrir) {
      while (abertas < n && t >= flores[abertas].nasce + ABRIR) desenhar(fctx, flores[abertas++], 1);
      ctx.clearRect(0, 0, W, H);
      for (let i = abertas; i < n; i++) {
        const f = flores[i];
        const k = (t - f.nasce) / ABRIR;
        if (k <= 0) break;
        desenhar(ctx, f, Math.min(1, k));
      }
    } else {
      if (!cobriu) {
        // a tela está coberta: troca a abertura pelo site por trás das flores
        cobriu = true;
        while (abertas < n) desenhar(fctx, flores[abertas++], 1);
        ctx.clearRect(0, 0, W, H);
        aoCobrir();
        comecarMontagem(T0 + INTERVALO);
      }
      // a cada marco, passa a mostrar a camada montada e começa a próxima
      const m = t < T0 ? -1 : Math.floor((t - T0) / INTERVALO);
      while (marco < m) {
        marco++;
        trocar();
        comecarMontagem(T0 + (marco + 2) * INTERVALO);
      }
      const quadrosPorMarco = 12;
      if (montando) montarUmPouco(Math.ceil(montando.alvo / quadrosPorMarco));
      // por cima, só as flores que estão fechando agora (ou vão fechar antes do próximo marco)
      ctx.clearRect(0, 0, W, H);
      for (let i = prefixoMostrado; i < n; i++) {
        const f = flores[i];
        const k = (t - f.fecha) / FECHAR;
        if (k >= 1) continue;
        desenhar(ctx, f, k <= 0 ? 1 : 1 - k);
      }
      if (t >= fimFechar) {
        palco = null;
        tela.remove();
        aoTerminar();
        return;
      }
    }
    requestAnimationFrame(quadro);
  }
  requestAnimationFrame(quadro);
}

// variações do buquê: brancas, azul-gelo e azuis, algumas de lado
const VARIACOES = [
  { paleta: "branca", semente: 7, inclinacao: 1 },
  { paleta: "branca", semente: 21, inclinacao: 0.72 },
  { paleta: "branca", semente: 33, inclinacao: 0.88 },
  { paleta: "gelo", semente: 5, inclinacao: 0.95 },
  { paleta: "azul", semente: 11, inclinacao: 1 },
  { paleta: "azul", semente: 3, inclinacao: 0.7 },
];
const PESOS = [0.26, 0.17, 0.17, 0.14, 0.14, 0.12];
function sortearVariacao() {
  let r = Math.random();
  for (let i = 0; i < PESOS.length; i++) { if ((r -= PESOS[i]) < 0) return i; }
  return 0;
}

// cada variação é desenhada em vários estágios de abertura, uma por vez no tempo livre,
// antes do clique (se ela tocar antes de terminar, o resto é feito na hora)
const _sprites = [];
const ESTAGIOS_FLOR = 12, TAM_FLOR = 140;
function desenharEstagio(i, s) {
  const c = document.createElement("canvas");
  c.width = c.height = Math.round(TAM_FLOR * DPR_BUQUE);
  const g = c.getContext("2d");
  g.translate(c.width / 2, c.height / 2);
  g.scale((c.width / 100) * 0.92, (c.width / 100) * 0.92);
  desenharMargarida(g, { ...VARIACOES[i], p: s / ESTAGIOS_FLOR });
  g.getImageData(0, 0, 1, 1); // obriga o navegador a desenhar agora, e não na hora da animação
  return c;
}
// só usado se ela tocar antes da 1ª variação ficar pronta
function desenharVariacao(i) {
  const lista = [];
  for (let s = 0; s <= ESTAGIOS_FLOR; s++) lista.push(desenharEstagio(i, s));
  _sprites[i] = lista;
}
// prepara as flores em pedacinhos (uma etapa de abertura por vez) nos intervalos livres,
// e para assim que ela tocar, para não disputar com a animação
(function prepararAosPoucos() {
  let i = 0, s = 0, lista = [];
  const agendar = window.requestIdleCallback
    ? (f) => requestIdleCallback(f, { timeout: 500 })
    : (f) => setTimeout(() => f({ timeRemaining: () => 8 }), 30);
  function passo(prazo) {
    while (!aberto && i < VARIACOES.length && prazo.timeRemaining() > 4) {
      lista.push(desenharEstagio(i, s++));
      if (s > ESTAGIOS_FLOR) { _sprites[i] = lista; aquecer(lista); lista = []; s = 0; i++; }
    }
    if (!aberto && i < VARIACOES.length) agendar(passo);
  }
  agendar(passo);
})();
