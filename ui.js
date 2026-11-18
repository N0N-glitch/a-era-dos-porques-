// ============================================================
// INTERFACE: telas, digitação, painel de consciência e eventos.
// Nenhuma regra do jogo mora aqui: tudo vem do Motor.
// FASE VISUAL FUTURA: a arte dos personagens e as animações
// refinadas entram depois; o avatar atual é só um placeholder.
// ============================================================
(() => {
  const $ = (id) => document.getElementById(id);

  // ---------- Ajustes da interface ----------
  const UI = {
    MODO_DIGITACAO: "palavra",  // "palavra" ou "letra"
    MS_POR_PALAVRA: 140,
    MS_POR_LETRA: 30,
    MS_PAUSA_PONTUACAO: 260,    // pausa extra após . ! ? , ; :
    AUTO_AVANCO_MS: 6500,       // avanço automático após o feedback (0 desliga)
    MS_FADE: 250,
    INSTANTANEO: window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
  };

  const TELAS = ["menu", "regras", "setup", "jogo", "fim"];

  // ---------- Estado ----------
  // fase: "digitando" | "resposta" | "feedback" | "transicao" | "fim"
  let fase = "digitando";
  let jogo = null;
  let resultado = null;
  let digitacao = null;
  let timerAvanco = null;
  let config = { idade: 5, dificuldade: "medio" };

  function mostrarTela(nome) {
    TELAS.forEach((t) => { $("tela-" + t).hidden = t !== nome; });
    window.scrollTo(0, 0);
  }

  // ---------- Efeito de digitação ----------
  function cancelarDigitacao() {
    if (digitacao) digitacao.cancelar();
  }

  function digitar(el, texto, aoTerminar) {
    cancelarDigitacao();
    el.textContent = "";
    el.classList.add("digitando");

    const porPalavra = UI.MODO_DIGITACAO === "palavra";
    const unidades = porPalavra
      ? texto.split(/(\s+)/).filter((u) => u !== "")
      : Array.from(texto);
    const msBase = porPalavra ? UI.MS_POR_PALAVRA : UI.MS_POR_LETRA;

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
      // Em modo palavra os espaços são unidades próprias: sem espera extra neles
      const ehEspaco = /^\s+$/.test(u);
      const pausa = /[.!?,;:]$/.test(u) ? UI.MS_PAUSA_PONTUACAO : 0;
      timer = setTimeout(passo, ehEspaco ? 0 : msBase + pausa);
    };

    digitacao = { pular: concluir, cancelar: encerrar };
    if (UI.INSTANTANEO) return concluir();
    passo();
  }

  // ---------- Setup (montado a partir do dados.js) ----------
  function opcaoRadio(nome, valor, titulo, desc, marcado) {
    const label = document.createElement("label");
    label.className = "opcao";

    const input = document.createElement("input");
    input.type = "radio";
    input.name = nome;
    input.value = valor;
    input.checked = marcado;
    input.addEventListener("change", () => {
      config[nome] = nome === "idade" ? Number(valor) : valor;
    });

    const corpo = document.createElement("span");
    corpo.className = "opcao-corpo";
    const t = document.createElement("strong");
    t.textContent = titulo;
    corpo.appendChild(t);
    if (desc) {
      const d = document.createElement("small");
      d.textContent = desc;
      corpo.appendChild(d);
    }

    label.append(input, corpo);
    return label;
  }

  function montarSetup() {
    const idades = $("opcoes-idade");
    const difs = $("opcoes-dif");
    idades.innerHTML = "";
    difs.innerHTML = "";

    IDADES.forEach((i) =>
      idades.appendChild(opcaoRadio("idade", String(i), `${i} anos`, "", i === config.idade))
    );
    Object.entries(DIFICULDADES).forEach(([id, d]) => {
      const titulo = d.subtitulo ? `${d.rotulo} (${d.subtitulo})` : d.rotulo;
      difs.appendChild(opcaoRadio("dificuldade", id, titulo, d.descricao, id === config.dificuldade));
    });

    $("qtd-perguntas").textContent = CONFIG_PARTIDA.PERGUNTAS_POR_RODADA;
    $("regra-qtd").textContent = CONFIG_PARTIDA.PERGUNTAS_POR_RODADA;
  }

  // ---------- Painel de consciência ----------
  function renderConsciencia() {
    const s = jogo.estado();
    $("painel-consciencia").className = "painel estado-" + s.corEstado;
    $("consciencia-valor").textContent = (s.consciencia > 0 ? "+" : "") + s.consciencia;
    $("consciencia-meta").textContent = s.meta;
    $("consciencia-rotulo").textContent = ROTULOS_ESTADO[s.corEstado];

    const ref = s.consciencia >= 0 ? s.meta : Math.max(10, s.meta / 2);
    const pct = Math.min(100, (Math.abs(s.consciencia) / ref) * 100);
    $("consciencia-barra").style.width = pct + "%";

    $("hud-progresso").textContent = `Pergunta ${s.numero} de ${s.total}`;
    $("hud-config").textContent = `${s.idade} anos · ${s.dificuldade.rotulo}`;
  }

  // ---------- Fluxo da partida ----------
  function iniciarPartida() {
    clearTimeout(timerAvanco);
    cancelarDigitacao();
    jogo = Motor.criarPartida({ idade: config.idade, dificuldade: config.dificuldade });
    $("tela-jogo").classList.remove("saindo");
    mostrarTela("jogo");
    mostrarPergunta();
  }

  function travarResposta(sim) {
    $("texto-livre").disabled = sim;
    $("btn-enviar").disabled = sim;
  }

  function mostrarPergunta() {
    const p = jogo.perguntaAtual();
    resultado = null;
    fase = "digitando";

    $("eco").hidden = true;
    $("feedback").hidden = true;
    $("feedback-dica").hidden = true;
    $("btn-continuar").hidden = true;
    $("resposta").hidden = false;
    $("dica-pular").hidden = false;
    $("texto-livre").value = "";
    $("aviso").textContent = "";
    travarResposta(true);
    renderConsciencia();

    digitar($("dialogo-texto"), p.texto, () => {
      fase = "resposta";
      $("dica-pular").hidden = true;
      travarResposta(false);
      $("texto-livre").focus();
    });
  }

  function enviar() {
    if (fase !== "resposta") return;

    const txt = $("texto-livre").value.trim();
    if (!txt) {
      $("aviso").textContent = "Escreva uma resposta antes de enviar.";
      return;
    }

    const res = jogo.responderTexto(txt);
    if (!res) return;

    fase = "feedback";
    resultado = res;
    $("aviso").textContent = "";
    travarResposta(true);
    $("resposta").hidden = true;

    $("eco").textContent = "Você: " + txt;
    $("eco").hidden = false;

    renderConsciencia();

    // Categoria + variação da consciência
    const meta = $("feedback-meta");
    meta.innerHTML = "";
    const tag = document.createElement("span");
    tag.className = "tag";
    tag.textContent = res.rotulo;
    const delta = (res.delta > 0 ? "+" : "") + res.delta;
    meta.append(tag, ` · consciência ${delta}`);
    $("feedback").hidden = false;

    $("btn-continuar").textContent = res.fim ? "Ver resultado" : "Continuar";

    // Reação da criança digitada; depois o botão (e o avanço automático)
    digitar($("feedback-texto"), res.feedback, () => {
      if (res.dica) {
        $("feedback-dica").textContent = "Uma boa resposta seria: " + res.dica;
        $("feedback-dica").hidden = false;
      }
      $("btn-continuar").hidden = false;
      if (UI.AUTO_AVANCO_MS > 0) timerAvanco = setTimeout(avancar, UI.AUTO_AVANCO_MS);
    });
  }

  function avancar() {
    if (fase !== "feedback" || !resultado) return;
    clearTimeout(timerAvanco);
    cancelarDigitacao();
    fase = "transicao";

    const aoSair = () => {
      if (resultado.fim) mostrarFim();
      else if (jogo.avancar()) mostrarPergunta();
      $("tela-jogo").classList.remove("saindo");
    };

    if (UI.INSTANTANEO) return aoSair();
    $("tela-jogo").classList.add("saindo");
    setTimeout(aoSair, UI.MS_FADE);
  }

  function mostrarFim() {
    fase = "fim";
    const r = jogo.resultadoFinal();
    $("fim-titulo").textContent = r.titulo;
    $("fim-texto").textContent = r.texto;

    const linhas = [
      ["Consciência final", `${r.consciencia} (meta: ${r.meta})`],
      ["Respostas sensatas", r.contagem.sensata],
      ["Respostas zueiras", r.contagem.zueira],
      ["Complexas demais", r.contagem.tecnica],
      ["Confusas", r.contagem.indefinida]
    ];
    const box = $("fim-stats");
    box.innerHTML = "";
    linhas.forEach(([rotulo, valor]) => {
      const linha = document.createElement("div");
      linha.className = "linha";
      const a = document.createElement("span");
      a.textContent = rotulo;
      const b = document.createElement("strong");
      b.textContent = valor;
      linha.append(a, b);
      box.appendChild(linha);
    });

    mostrarTela("fim");
  }

  // ---------- Eventos ----------
  // Menu e onboarding
  $("btn-sim").addEventListener("click", () => mostrarTela("regras"));
  $("btn-nao").addEventListener("click", () => { $("msg-nao").hidden = false; });
  $("btn-ok").addEventListener("click", () => { montarSetup(); mostrarTela("setup"); });

  // Setup
  $("btn-iniciar").addEventListener("click", iniciarPartida);
  $("btn-voltar-setup").addEventListener("click", () => mostrarTela("menu"));

  // Jogo
  $("btn-enviar").addEventListener("click", enviar);
  $("texto-livre").addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {   // Enter envia; Shift+Enter quebra linha
      e.preventDefault();
      enviar();
    }
  });
  $("dialogo").addEventListener("click", () => { if (digitacao) digitacao.pular(); });
  $("feedback").addEventListener("click", () => { if (digitacao) digitacao.pular(); });
  $("btn-continuar").addEventListener("click", avancar);

  // Resultado
  $("btn-repetir").addEventListener("click", iniciarPartida);
  $("btn-config").addEventListener("click", () => { montarSetup(); mostrarTela("setup"); });
  $("btn-menu").addEventListener("click", () => { $("msg-nao").hidden = true; mostrarTela("menu"); });

  // Início
  montarSetup();
  mostrarTela("menu");
})();
