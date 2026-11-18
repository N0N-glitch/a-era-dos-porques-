// ===== CONFIGURAÇÃO E CATEGORIAS =====
const CONFIG = {
  consciencia_inicial: 50,
  consciencia_max: 100,
  ranks: [
    { min: 75, titulo: "MENTOR DESPERTO", texto: "Você explicou o mundo com carinho e clareza. As crianças confiam em você." },
    { min: 40, titulo: "ADULTO MEDIANO", texto: "Entre acertos e escorregões, a curiosidade das crianças sobreviveu." },
    { min: 1,  titulo: "CAOS CONTROLADO", texto: "As crianças saíram com mais dúvidas do que entraram." }
  ],
  colapso: {
    titulo: "COLAPSO DE CONSCIÊNCIA",
    texto: "Suas respostas esgotaram a paciência (e a confiança) das crianças."
  }
};

const TIPOS = ["sensata", "zueira", "tecnica"];

const CATEGORIAS = {
  sensata: {
    rotulo: "SENSATA",
    pontos: 10,
    consciencia: 15,
    feedbacks: [
      "A criança arregalou os olhos. Entendeu e ainda quer saber mais!",
      "Resposta na medida certa: simples, verdadeira e lúdica.",
      "Curiosidade alimentada com carinho. Boa."
    ]
  },
  zueira: {
    rotulo: "ZUEIRA",
    pontos: 5,
    consciencia: -5,
    feedbacks: [
      "A criança riu... e continua sem saber a resposta.",
      "Engraçado, mas a dúvida continua lá, intacta.",
      "Boa piada. Só que ela vai repetir isso na escola amanhã."
    ]
  },
  tecnica: {
    rotulo: "TÉCNICA DEMAIS",
    pontos: 2,
    consciencia: -10,
    feedbacks: [
      "Correto, porém a criança travou no meio da frase e foi brincar.",
      "Verdade científica, mas ninguém com essa idade sobrevive a isso.",
      "A criança te olhou como se você falasse outro idioma."
    ]
  },
  indefinida: {
    rotulo: "INDEFINIDA",
    pontos: 0,
    consciencia: -3,
    feedbacks: [
      "A criança inclinou a cabeça. Não ficou claro o que você quis dizer.",
      "Hmm... isso não respondeu o porquê. Tente explicar de outro jeito."
    ]
  }
};

// ===== PALAVRAS-CHAVE GLOBAIS (já sem acento, minúsculas) =====
// Até 4 letras: palavra exata. 5+ letras: prefixo. Com espaço: frase.
const PALAVRAS_GLOBAIS = {
  sensata: [
    "imagina", "vamos", "sabe quando", "pequenin", "gostos", "quentinh",
    "brincar", "magico", "aprend", "natureza", "cuidar", "exemplo"
  ],
  zueira: [
    "pergunta pro google", "pergunta pra sua mae", "pergunta pro seu pai",
    "alien", "extraterrestre", "dinossauro", "superheroi", "pizza", "meme",
    "tiktok", "youtube", "zoeira", "brincadeira"
  ],
  tecnica: [
    "molecul", "atomo", "quimic", "fisic", "biolog", "celula", "proteina",
    "hormonio", "processo", "mecanismo", "fenomeno", "sistema", "neuronio",
    "estrutura", "composicao", "taxa", "cientific"
  ]
};

// ===== BANCO DE PERGUNTAS =====
const PERGUNTAS = [
  {
    id: "ar-invisivel",
    texto: "Por que o ar é invisível?",
    imagem: "criança soprando uma pena",
    respostas: {
      sensata: ["O ar é feito de pedacinhos tão, tão pequenininhos que os olhos não conseguem ver. Mas você sente quando o vento bate no rosto!"],
      zueira: ["Porque ele tem vergonha de aparecer em fotos."],
      tecnica: ["O ar é uma mistura de nitrogênio (78%) e oxigênio (21%). Suas moléculas são muito menores que o comprimento de onda da luz visível, então não há espalhamento perceptível."]
    },
    palavras: {
      sensata: ["vento", "respir", "enxerg", "olhos", "sentir", "sinto", "pedacinh"],
      zueira: ["vergonha", "fantasma", "ninja", "segredo", "invisivel de proposito"],
      tecnica: ["nitrogenio", "oxigenio", "comprimento de onda", "espalhamento", "gases"]
    }
  },
  {
    id: "como-nasci",
    texto: "Como eu nasci?",
    imagem: "barriga de grávida desenhada com giz",
    respostas: {
      sensata: ["Você cresceu na barriga da mamãe, bem quentinho, até estar pronto para conhecer o mundo. Todo mundo começou assim!"],
      zueira: ["A cegonha te entregou, mas errou o endereço duas vezes."],
      tecnica: ["Um espermatozoide fecundou um óvulo, formando um zigoto que se dividiu em embrião e feto até o parto."]
    },
    palavras: {
      sensata: ["barriga", "mamae", "crescer", "cresceu", "amor", "bebe", "familia"],
      zueira: ["cegonha", "repolho", "correio", "sedex", "entrega", "comprei", "amazon"],
      tecnica: ["espermatozoide", "ovulo", "zigoto", "embriao", "fecunda", "utero", "placenta", "cromossom"]
    }
  },
  {
    id: "ceu-azul",
    texto: "Por que o céu é azul?",
    imagem: "céu azul com uma única nuvem",
    respostas: {
      sensata: ["A luz do Sol tem todas as cores misturadas. O azul se espalha mais pelo céu, por isso a gente vê tudo azulzinho!"],
      zueira: ["Porque acabou a tinta branca e só tinha azul no estoque."],
      tecnica: ["Espalhamento de Rayleigh: a intensidade é proporcional a 1/λ⁴, então comprimentos de onda curtos se dispersam mais na atmosfera."]
    },
    palavras: {
      sensata: ["luz", "sol", "cores", "espalh", "azulzinh", "arco iris"],
      zueira: ["tinta", "estoque", "pintor", "promocao", "mercado"],
      tecnica: ["rayleigh", "comprimento de onda", "dispers", "atmosfer", "lambda", "frequencia", "refrac"]
    }
  },
  {
    id: "morte",
    texto: "Por que as pessoas morrem?",
    imagem: "flor murchando e uma nova brotando",
    respostas: {
      sensata: ["Todo ser vivo tem um tempo de vida. O corpo vai ficando cansado até parar de funcionar. Por isso a gente cuida de quem ama e guarda as lembranças."],
      zueira: ["Pra liberar espaço no WhatsApp do universo."],
      tecnica: ["A morte ocorre pela falência dos sistemas orgânicos, cessação da atividade cerebral e parada cardiorrespiratória, seguidas de necrose celular."]
    },
    palavras: {
      sensata: ["tempo", "cansad", "cuida", "saudade", "lembranc", "ciclo", "vida", "amor"],
      zueira: ["whatsapp", "espaco", "memoria", "vaga", "atualizacao", "bug", "storage"],
      tecnica: ["falencia", "cerebral", "cardio", "necrose", "orgao", "apoptose", "organic"]
    }
  },
  {
    id: "dormir",
    texto: "Por que a gente tem que dormir?",
    imagem: "criança bocejando com ursinho",
    respostas: {
      sensata: ["Dormir é a hora do corpo descansar e recarregar as energias. E o cérebro aproveita para guardar tudo o que você aprendeu!"],
      zueira: ["Pra dar tempo do celular carregar também."],
      tecnica: ["Durante o sono REM e não REM ocorrem consolidação de memória, liberação de hormônio do crescimento e depuração glinfática."]
    },
    palavras: {
      sensata: ["descans", "energia", "recarreg", "cansad", "sonho", "sonhar", "forca"],
      zueira: ["celular", "bateria", "wifi", "netflix", "preguica", "cama"],
      tecnica: ["rem", "melatonina", "glinfatic", "consolidac", "hormonio", "circadian", "neurotransmissor"]
    }
  },
  {
    id: "mar-salgado",
    texto: "Por que o mar é salgado?",
    imagem: "onda quebrando na praia",
    respostas: {
      sensata: ["Os rios levam um pouquinho de sal das pedras para o mar há milhões de anos. Quando a água evapora, o sal fica lá!"],
      zueira: ["Alguém esqueceu de temperar e jogou um caminhão de sal."],
      tecnica: ["A salinidade média é cerca de 35 g/kg, principalmente íons de cloreto e sódio oriundos do intemperismo e da atividade hidrotermal."]
    },
    palavras: {
      sensata: ["rios", "pedras", "evapor", "chuva", "pouquinho", "anos"],
      zueira: ["tempero", "tempera", "caminhao", "cozinh", "macarrao", "batata frita"],
      tecnica: ["salinidade", "cloreto", "sodio", "ions", "intemperismo", "hidrotermal"]
    }
  }
];
