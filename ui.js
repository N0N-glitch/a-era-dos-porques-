// ============================================================
// INTERFACE DE TEXTO (etapa 2)
// Depende de: dados.js (banco) e motor.js (lógica).
// FASE VISUAL FUTURA: arte, animações e imagens dos personagens
// entram depois. Nenhuma regra do jogo deve ser escrita aqui:
// esta camada só mostra o que o Motor devolve.
// ============================================================
(() => {
  const $ = (id) => document.getElementById(id);

  // ---------- Ajustes da interface (mexa só aqui) ----------
  const UI = {
    MODO_DIGITACAO: "letra",   // "letra" ou "palavra"
    MS_POR_LETRA: 28,
    MS_POR_PALAVRA: 130,
    MS_PAUSA_PONTUACAO: 220,   // pausa extra após . ! ? , ; :
    MS_PAUSA_AVANCO: 3500,     // tempo até avançar sozinho após o feedback
    MS_FADE: 250,              // deve combinar com a transição do #jogo no CSS
    INSTANTANEO: window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
  };

  // ---------- Estado da interface ----------
  // fase: "digitando" | "resposta" | "feedback" | "fim"
  let fase = "digitando";
  let jogo = null;
  let resultado = null;
  let digitacao = null;      // controlador da digitação em andamento
  let timerAvanco = null;

  // ---------- Efeito de máquina de escrever ----------
  function cancelarDigitacao() {
    if (digitacao) digitacao.cancelar();
  }

  function digitar(el, texto, aoTerminar) {
    cancelarDigitacao();
    el.textContent = "";
    el.classList.add("digitando");

    const unidades = UI.MODO_DIGITACAO === "palavra"
      ? texto.split(/(\s+)/).filter((u) => u !== "")
      : Array.from(texto);
    const msBase = UI.MODO_DIGITACAO === "palavra" ? UI.MS_POR_PALAVRA : UI.MS_POR_LETRA;

    let i = 0;
    let timer = null;
    let encerrado = false;

    const encerrar = () => {
      encerrado = true;
      clearTimeout(timer);
      el.classList.remove("digitando");
      digitacao = null;
    };

    const concluir = () => {
      if (encerrado) return;
      el.textContent = texto;
      encerrar();
      if (aoTerminar) aoTerminar();
    };

    const passo = () => {
      if (i >= unidades.length) return concluir();
      const u = unidades[i++];
      el.textContent += u;
      const pausa = /[.!?,;:]\s*$/.test(u) ? UI.MS_PAUSA_PONTUACAO : 0;
      timer = setTimeout(passo, msBase + pausa);
    };

    digitacao = { pular: concluir, cancelar: encerrar };

    if (UI.INSTANTANEO) return concluir();
    passo();
  }

  // ---------- Placar ----------
  function renderPlacar() {
    const s = jogo.estado();
    $("pontos").textContent = s.pontos;
    $("consciencia-valor").textContent = s.consciencia;
    $("medidor-barra").style.width = (s.consciencia / s.consciencia_max) * 100 + "%";
    $("progresso").textContent = `PERGUNTA ${s.numero}/${s.total}`;
  }

  // ---------- Controle do campo de resposta ----------
  function travarResposta(sim) {
    $("texto-livre").disabled = sim;
    $("btn-enviar").disabled = sim;
  }

  function aviso(msg) {
    $("aviso").textContent = msg || "";
  }

  // ---------- Fluxo: mostrar pergunta ----------
  function mostrarPergunta() {
    const p = jogo.perguntaAtual();
    resultado = null;
    fase = "digitando";

    $("personagem").textContent = `[ IMAGEM: ${p.imagem} ]`;
    $("eco").hidden = true;
    $("feedback").hidden = true;
    $("btn-continuar").hidden = true;
    $("resposta").hidden = false;
    $("dica-pular").hidden = false;
    $("texto-livre").value = "";
    aviso("");
    travarResposta(true);
    renderPlacar();

    digitar($("dialogo-texto"), p.texto, () => {
      fase = "resposta";
      $("dica-pular").hidden = true;
      travarResposta(false);
      $("texto-livre").focus();
    });
  }

  // ---------- Fluxo: enviar resposta ----------
  function enviar() {
    if (fase !== "resposta") return;

    const txt = $("texto-livre").value.trim();
    if (!txt) {
      aviso("Escreva uma resposta antes de enviar.");
      return;
    }

    fase = "feedback";
    aviso("");
    travarResposta(true);
    $("resposta").hidden = true;

    // Eco do que o jogador disse
    $("eco").textContent = "VOCÊ: " + txt;
    $("eco").hidden = false;

    // O Motor valida e pontua
    const res = jogo.responderTexto(txt);
    if (!res) return;
    resultado = res;
    renderPlacar();

    // Pontuação + categoria
    const sinal = (n) => (n > 0 ? "+" + n : String(n));
    $("feedback-meta").innerHTML = "";
    const tag = document.createElement("span");
    tag.className = "tag";
    tag.textContent = `[${res.rotulo}]`;
    $("feedback-meta").append(
      tag,
      ` pontos ${sinal(res.deltaPontos)} | consciência ${sinal(res.deltaConsciencia)}`
    );
    $("feedback").hidden = false;

    // Reação da criança digitada; depois avança sozinho (ou pelo botão)
    $("btn-continuar").textContent = res.fim ? "VER RESULTADO >" : "CONTINUAR >";
    digitar($("feedback-texto"), res.feedback, () => {
      $("btn-continuar").hidden = false;
      timerAvanco = setTimeout(avancar, UI.MS_PAUSA_AVANCO);
    });
  }

  // ---------- Fluxo: avançar ----------
  function avancar() {
    if (fase !== "feedback" || !resultado) return;
    clearTimeout(timerAvanco);
    cancelarDigitacao();
    fase = "transicao";

    const aoSair = () => {
      if (resultado.fim) {
        mostrarFim();
      } else if (jogo.avancar()) {
        mostrarPergunta();
      }
      $("jogo").classList.remove("saindo");
    };

    if (UI.INSTANTANEO) return aoSair();
    $("jogo").classList.add("saindo");
    setTimeout(aoSair, UI.MS_FADE);
  }

  function mostrarFim() {
    fase = "fim";
    const r = jogo.resultadoFinal();
    const s = jogo.estado();
    $("jogo").hidden = true;
    $("fim").hidden = false;
    $("fim-titulo").textContent = `> ${r.titulo}`;
    $("fim-texto").textContent = r.texto;
    $("fim-stats").textContent =
      `PONTOS: ${s.pontos} | CONSCIÊNCIA: ${s.consciencia}/${s.consciencia_max}`;
  }

  function iniciar() {
    clearTimeout(timerAvanco);
    cancelarDigitacao();
    jogo = Motor.criarJogo();
    $("fim").hidden = true;
    $("jogo").hidden = false;
    $("jogo").classList.remove("saindo");
    mostrarPergunta();
  }

  // ---------- Eventos ----------
  $("btn-enviar").addEventListener("click", enviar);

  // Enter envia; Shift+Enter quebra linha
  $("texto-livre").addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      enviar();
    }
  });

  // Tocar na caixa de diálogo pula a digitação
  $("dialogo").addEventListener("click", () => {
    if (digitacao) digitacao.pular();
  });
  $("feedback").addEventListener("click", () => {
    if (digitacao) digitacao.pular();
  });

  $("btn-continuar").addEventListener("click", avancar);
  $("btn-reiniciar").addEventListener("click", iniciar);

  iniciar();
})();
