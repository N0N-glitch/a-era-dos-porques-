// ============================================================
// MOTOR: regras do jogo, sorteio e classificador. Sem DOM.
// Depende de dados.js.
// ============================================================
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

  // Palavras comuns que não contam como "semelhança" com as respostas cadastradas
  const STOP = new Set([
    "porque", "tambem", "quando", "ainda", "sempre", "muito", "muita",
    "pouco", "fazer", "coisa", "coisas", "essas", "esses", "aquele", "onde"
  ]);

  // Cache das palavras de cada resposta cadastrada (por pergunta)
  const cacheRefs = new WeakMap();
  function refsDaPergunta(p) {
    if (!p) return null;
    if (!cacheRefs.has(p)) {
      const refs = {};
      for (const tipo of TIPOS) {
        refs[tipo] = new Set();
        (p.respostas[tipo] || []).forEach((txt) =>
          normalizar(txt).split(" ").forEach((t) => {
            if (t.length >= 5 && !STOP.has(t)) refs[tipo].add(t);
          })
        );
      }
      cacheRefs.set(p, refs);
    }
    return cacheRefs.get(p);
  }

  function pontuarPalavra(kw, norm, tokens) {
    if (kw.includes(" ")) return (" " + norm + " ").includes(" " + kw + " ") ? 2 : 0;
    const achou = tokens.some((t) => (kw.length <= 4 ? t === kw : t.startsWith(kw)));
    return achou ? 1 : 0;
  }

  function limiteTecnico(ctx) {
    const base = LIMITE_TECNICO_BASE[ctx.idade] || 20;
    const ajuste = (DIFICULDADES[ctx.dificuldade] || {}).ajusteTecnico || 0;
    return base + ajuste;
  }

  // ===== CLASSIFICADOR DE TEXTO LIVRE =====
  // ctx: { idade, dificuldade } (ajusta o limite de "complexo demais")
  function classificar(texto, pergunta, ctx = {}) {
    const norm = normalizar(texto);
    const tokens = norm ? norm.split(" ") : [];
    const scores = { sensata: 0, zueira: 0, tecnica: 0 };

    if (tokens.length < 2) return { categoria: "indefinida", scores };

    // 1) Palavras-chave (globais + da pergunta)
    for (const tipo of TIPOS) {
      const kws = [
        ...(PALAVRAS_GLOBAIS[tipo] || []),
        ...((pergunta && pergunta.palavras && pergunta.palavras[tipo]) || [])
      ];
      for (const kw of kws) scores[tipo] += pontuarPalavra(kw, norm, tokens);
    }

    // 2) Semelhança com as respostas cadastradas da pergunta
    const refs = refsDaPergunta(pergunta);
    if (refs) {
      const conteudo = new Set(tokens.filter((t) => t.length >= 5 && !STOP.has(t)));
      for (const tipo of TIPOS) {
        let n = 0;
        conteudo.forEach((t) => { if (refs[tipo].has(t)) n++; });
        scores[tipo] += Math.min(n, 3);
      }
    }

    // 3) Heurísticas
    if (/\bk{3,}|\b(ha){2,}|\b(rs)+\b|\blol\b/.test(norm)) scores.zueira += 2;
    if (tokens.length >= limiteTecnico(ctx)) scores.tecnica += 2;
    if (/[\d%^λ]/.test(String(texto))) scores.tecnica += 1;
    if (tokens.filter((t) => t.length >= 11).length >= 3) scores.tecnica += 1;
    if (tokens.some((t) => /(inho|inha|inhos|inhas)$/.test(t))) scores.sensata += 1;

    // 4) Vencedor (empate: sensata, zueira, técnica)
    let melhor = null;
    let max = 0;
    for (const tipo of TIPOS) {
      if (scores[tipo] > max) { max = scores[tipo]; melhor = tipo; }
    }
    return { categoria: melhor || "indefinida", scores };
  }

  // Cor/estado do painel de consciência
  function estadoConsciencia(valor, meta) {
    if (valor < 0) return "perigo";
    if (valor === 0) return "neutro";
    if (valor >= meta) return "ok";
    return "alerta";
  }

  // ===== PARTIDA =====
  // opcoes: { idade, dificuldade, numPerguntas }
  function criarPartida(opcoes = {}) {
    const idade = IDADES.includes(opcoes.idade) ? opcoes.idade : 5;
    const difId = DIFICULDADES[opcoes.dificuldade] ? opcoes.dificuldade : "medio";
    const dif = DIFICULDADES[difId];
    const pool = BANCO[idade];

    const pedido = Number.isInteger(opcoes.numPerguntas)
      ? opcoes.numPerguntas
      : CONFIG_PARTIDA.PERGUNTAS_POR_RODADA;
    const total = Math.max(1, Math.min(pedido, pool.length));

    const rodada = embaralhar(pool).slice(0, total);
    const meta = Math.round(total * dif.delta.sensata * dif.fatorMeta);
    const ctx = { idade, dificuldade: difId };

    const e = {
      consciencia: 0,            // começa obrigatoriamente em zero
      indice: 0,
      respondida: false,
      motivoFim: null,           // "ultima" | "colapso"
      contagem: { sensata: 0, zueira: 0, tecnica: 0, indefinida: 0 },
      historico: []
    };

    const perguntaAtual = () => rodada[e.indice];

    function responderTexto(texto) {
      if (e.respondida || e.motivoFim) return null;
      const { categoria } = classificar(texto, perguntaAtual(), ctx);
      return aplicar(categoria, texto);
    }

    function aplicar(categoria, texto) {
      e.respondida = true;
      const delta = dif.delta[categoria];
      e.consciencia += delta;
      e.contagem[categoria]++;
      e.historico.push({ pergunta: perguntaAtual().id, categoria, texto });

      const ultima = e.indice >= rodada.length - 1;
      const colapso = dif.fimSeNegativo && e.consciencia < 0;
      if (colapso) e.motivoFim = "colapso";
      else if (ultima) e.motivoFim = "ultima";

      return {
        categoria,
        rotulo: CATEGORIAS[categoria].rotulo,
        feedback: sortear(CATEGORIAS[categoria].feedbacks),
        // Em caso de erro, sugere uma resposta sensata cadastrada
        dica: categoria === "sensata" ? null : sortear(perguntaAtual().respostas.sensata),
        delta,
        consciencia: e.consciencia,
        fim: Boolean(e.motivoFim),
        motivoFim: e.motivoFim
      };
    }

    function avancar() {
      if (!e.respondida || e.motivoFim) return false;
      e.indice++;
      e.respondida = false;
      return true;
    }

    function resultadoFinal() {
      let r;
      if (e.motivoFim === "colapso") r = RESULTADOS.colapso;
      else if (e.consciencia >= meta) r = RESULTADOS.aprovado;
      else if (e.consciencia >= 0) r = RESULTADOS.quase;
      else r = RESULTADOS.dificil;
      return {
        ...r,
        aprovado: e.motivoFim !== "colapso" && e.consciencia >= meta,
        consciencia: e.consciencia,
        meta,
        contagem: { ...e.contagem }
      };
    }

    function estado() {
      return {
        idade,
        dificuldade: dif,
        numero: e.indice + 1,
        total: rodada.length,
        consciencia: e.consciencia,
        meta,
        corEstado: estadoConsciencia(e.consciencia, meta),
        contagem: { ...e.contagem }
      };
    }

    return { perguntaAtual, responderTexto, avancar, resultadoFinal, estado };
  }

  return { classificar, criarPartida, estadoConsciencia, normalizar };
})();
