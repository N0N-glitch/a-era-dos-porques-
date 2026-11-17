// ===== MOTOR: lógica pura, sem DOM =====
const Motor = (() => {
  const normalizar = (t) =>
    String(t || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s]/g, " ")
      .replace(/\s+/g, " ")
      .trim();

  const sortear = (arr) => arr[Math.floor(Math.random() * arr.length)];

  const embaralhar = (arr) => {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  // Pontua uma palavra-chave contra o texto normalizado
  function pontuarPalavra(kw, norm, tokens) {
    if (kw.includes(" ")) return (" " + norm + " ").includes(" " + kw + " ") ? 2 : 0;
    const achou = tokens.some((t) => (kw.length <= 4 ? t === kw : t.startsWith(kw)));
    return achou ? 1 : 0;
  }

  // ===== CLASSIFICADOR DE TEXTO LIVRE =====
  // Retorna { categoria, scores }
  function classificar(texto, pergunta) {
    const norm = normalizar(texto);
    const tokens = norm ? norm.split(" ") : [];
    const scores = { sensata: 0, zueira: 0, tecnica: 0 };

    if (tokens.length < 2) return { categoria: "indefinida", scores };

    // 1) Palavras-chave (globais + da pergunta)
    for (const tipo of TIPOS) {
      const lista = [
        ...(PALAVRAS_GLOBAIS[tipo] || []),
        ...((pergunta && pergunta.palavras && pergunta.palavras[tipo]) || [])
      ];
      for (const kw of lista) scores[tipo] += pontuarPalavra(kw, norm, tokens);
    }

    // 2) Heurísticas
    if (/\bk{3,}|\b(ha){2,}|\b(rs)+\b|\blol\b/.test(norm)) scores.zueira += 2;
    if (tokens.length >= 22) scores.tecnica += 1;
    if (/[\d%^λ]/.test(String(texto))) scores.tecnica += 1;
    if (tokens.filter((t) => t.length >= 11).length >= 3) scores.tecnica += 1;
    if (tokens.some((t) => /(inho|inha|inhos|inhas)$/.test(t))) scores.sensata += 1;

    // 3) Vencedor (empate: ordem de TIPOS)
    let melhor = null;
    let max = 0;
    for (const tipo of TIPOS) {
      if (scores[tipo] > max) { max = scores[tipo]; melhor = tipo; }
    }
    return { categoria: melhor || "indefinida", scores };
  }

  // ===== JOGO =====
  function criarJogo() {
    const ordem = embaralhar(PERGUNTAS.map((_, i) => i));
    const e = {
      pontos: 0,
      consciencia: CONFIG.consciencia_inicial,
      indice: 0,
      respondida: false,
      colapso: false,
      historico: []
    };
    let opcoesAtuais = null;

    const perguntaAtual = () => PERGUNTAS[ordem[e.indice]];

    function opcoes() {
      if (!opcoesAtuais) {
        const p = perguntaAtual();
        opcoesAtuais = embaralhar(
          TIPOS.map((tipo) => ({ tipo, texto: sortear(p.respostas[tipo]) }))
        );
      }
      return opcoesAtuais;
    }

    function aplicar(categoria, origem) {
      if (e.respondida) return null;
      e.respondida = true;

      const c = CATEGORIAS[categoria];
      e.pontos += c.pontos;
      e.consciencia = Math.max(0, Math.min(CONFIG.consciencia_max, e.consciencia + c.consciencia));
      e.colapso = e.consciencia <= 0;
      e.historico.push({ pergunta: perguntaAtual().id, categoria, origem });

      const ultima = e.indice >= ordem.length - 1;
      return {
        categoria,
        rotulo: c.rotulo,
        feedback: sortear(c.feedbacks),
        deltaPontos: c.pontos,
        deltaConsciencia: c.consciencia,
        fim: ultima || e.colapso
      };
    }

    function responderOpcao(tipo) {
      if (!TIPOS.includes(tipo)) return null;
      return aplicar(tipo, "opcao");
    }

    function responderTexto(texto) {
      const { categoria } = classificar(texto, perguntaAtual());
      return aplicar(categoria, "texto");
    }

    function avancar() {
      if (!e.respondida || e.colapso || e.indice >= ordem.length - 1) return false;
      e.indice++;
      e.respondida = false;
      opcoesAtuais = null;
      return true;
    }

    function resultadoFinal() {
      if (e.colapso) return { ...CONFIG.colapso };
      return { ...CONFIG.ranks.find((r) => e.consciencia >= r.min) };
    }

    function estado() {
      return {
        pontos: e.pontos,
        consciencia: e.consciencia,
        consciencia_max: CONFIG.consciencia_max,
        numero: e.indice + 1,
        total: ordem.length,
        historico: [...e.historico]
      };
    }

    return { perguntaAtual, opcoes, responderOpcao, responderTexto, avancar, resultadoFinal, estado };
  }

  return { classificar, criarJogo, normalizar };
})();
