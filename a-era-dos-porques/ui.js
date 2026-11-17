(() => {
  const $ = (id) => document.getElementById(id);
  let jogo;
  let resultado = null;

  function renderPlacar() {
    const s = jogo.estado();
    $("pontos").textContent = s.pontos;
    $("consciencia-valor").textContent = s.consciencia;
    $("medidor-barra").style.width = (s.consciencia / s.consciencia_max) * 100 + "%";
    $("progresso").textContent = `PERGUNTA ${s.numero}/${s.total}`;
  }

  function bloquear(sim) {
    document.querySelectorAll("#opcoes button").forEach((b) => (b.disabled = sim));
    $("texto-livre").disabled = sim;
    $("btn-enviar").disabled = sim;
  }

  function renderPergunta() {
    const p = jogo.perguntaAtual();
    resultado = null;

    $("imagem").textContent = `[ IMAGEM: ${p.imagem} ]`;
    $("pergunta").textContent = p.texto;

    const box = $("opcoes");
    box.innerHTML = "";
    jogo.opcoes().forEach((op) => {
      const b = document.createElement("button");
      b.type = "button";
      b.textContent = "> " + op.texto;
      b.addEventListener("click", () => mostrarResultado(jogo.responderOpcao(op.tipo)));
      box.appendChild(b);
    });

    $("texto-livre").value = "";
    $("feedback").hidden = true;
    $("btn-proxima").hidden = true;
    bloquear(false);
    renderPlacar();
  }

  function mostrarResultado(res) {
    if (!res) return;
    resultado = res;
    bloquear(true);

    const sinal = (n) => (n > 0 ? "+" + n : String(n));
    const fb = $("feedback");
    fb.innerHTML = "";

    const tag = document.createElement("div");
    tag.className = "tag";
    tag.textContent = `[${res.rotulo}]`;

    const msg = document.createElement("div");
    msg.textContent = res.feedback;

    const delta = document.createElement("div");
    delta.className = "delta";
    delta.textContent = `pontos ${sinal(res.deltaPontos)} | consciência ${sinal(res.deltaConsciencia)}`;

    fb.append(tag, msg, delta);
    fb.hidden = false;

    $("btn-proxima").textContent = res.fim ? "VER RESULTADO" : "PRÓXIMA";
    $("btn-proxima").hidden = false;
    renderPlacar();
  }

  function mostrarFim() {
    const r = jogo.resultadoFinal();
    const s = jogo.estado();
    $("jogo").hidden = true;
    $("fim").hidden = false;
    $("fim-titulo").textContent = `> ${r.titulo}`;
    $("fim-texto").textContent = r.texto;
    $("fim-stats").textContent = `PONTOS: ${s.pontos} | CONSCIÊNCIA: ${s.consciencia}/${s.consciencia_max}`;
  }

  function iniciar() {
    jogo = Motor.criarJogo();
    $("fim").hidden = true;
    $("jogo").hidden = false;
    renderPergunta();
  }

  $("btn-enviar").addEventListener("click", () => {
    const txt = $("texto-livre").value.trim();
    if (!txt) return;
    mostrarResultado(jogo.responderTexto(txt));
  });

  $("btn-proxima").addEventListener("click", () => {
    if (resultado && resultado.fim) return mostrarFim();
    if (jogo.avancar()) renderPergunta();
  });

  $("btn-reiniciar").addEventListener("click", iniciar);

  iniciar();
})();
