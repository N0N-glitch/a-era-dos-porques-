// ============================================================
// DADOS DO JOGO: configuração, dificuldades, textos e banco de perguntas.
// Aqui não há lógica de jogo (isso fica no motor.js).
// ============================================================

// ---------- Configuração da partida ----------
// Fixo em 5 por enquanto. O motor já aceita outro valor via
// Motor.criarPartida({ numPerguntas: N }) para personalização futura.
const CONFIG_PARTIDA = {
  PERGUNTAS_POR_RODADA: 5
};

const IDADES = [4, 5, 6];
const TIPOS = ["sensata", "zueira", "tecnica"];

// Limite base de palavras antes de a resposta ser vista como "complexa demais"
// (criança menor = tolerância menor). A dificuldade ajusta esse valor.
const LIMITE_TECNICO_BASE = { 4: 16, 5: 20, 6: 24 };

// ---------- Dificuldades ----------
// delta: quanto cada tipo de resposta muda a consciência.
// meta: arredondado de (nº de perguntas x delta.sensata x fatorMeta).
// fimSeNegativo: encerra a rodada se a consciência ficar abaixo de zero.
const DIFICULDADES = {
  facil: {
    rotulo: "Fácil",
    descricao: "Muita paciência. Os erros custam pouco.",
    delta: { sensata: 12, zueira: -2, tecnica: -4, indefinida: -1 },
    fatorMeta: 0.5,
    ajusteTecnico: 4,
    fimSeNegativo: false
  },
  medio: {
    rotulo: "Médio",
    descricao: "O equilíbrio ideal para começar.",
    delta: { sensata: 10, zueira: -4, tecnica: -8, indefinida: -3 },
    fatorMeta: 0.6,
    ajusteTecnico: 0,
    fimSeNegativo: false
  },
  dificil: {
    rotulo: "Difícil",
    descricao: "Poucos deslizes são perdoados.",
    delta: { sensata: 10, zueira: -6, tecnica: -10, indefinida: -5 },
    fatorMeta: 0.7,
    ajusteTecnico: -2,
    fimSeNegativo: false
  },
  hard: {
    rotulo: "Hard Mode",
    subtitulo: "Última Chance",
    descricao: "Se a consciência cair abaixo de zero, a rodada acaba na hora.",
    delta: { sensata: 10, zueira: -8, tecnica: -12, indefinida: -6 },
    fatorMeta: 0.8,
    ajusteTecnico: -4,
    fimSeNegativo: true
  }
};

// ---------- Textos de feedback ----------
const CATEGORIAS = {
  sensata: {
    rotulo: "Resposta sensata",
    feedbacks: [
      "Os olhinhos brilharam. A criança entendeu e já quer saber mais!",
      "Explicação do tamanho certo, com carinho. A criança sorriu.",
      "A criança assentiu devagar: \"Ahh, agora faz sentido!\""
    ]
  },
  zueira: {
    rotulo: "Resposta zueira",
    feedbacks: [
      "A criança deu uma gargalhada... mas a dúvida continua lá.",
      "Foi engraçado! Só que ela ainda não sabe a resposta de verdade.",
      "A criança riu, mas franziu a testa: \"Mas por que, de verdade?\""
    ]
  },
  tecnica: {
    rotulo: "Complexa demais",
    feedbacks: [
      "A criança ficou olhando para o nada. Perdeu você no meio da explicação.",
      "Ela bocejou. Foi muita palavra grande de uma vez.",
      "A criança coçou a cabeça: \"Não entendi nada, mas parece importante.\""
    ]
  },
  indefinida: {
    rotulo: "Resposta confusa",
    feedbacks: [
      "A criança inclinou a cabeça. Não ficou claro o que você quis dizer.",
      "Hmm... isso não respondeu o porquê. Que tal explicar de outro jeito?"
    ]
  }
};

const ROTULOS_ESTADO = {
  neutro: "Equilibrada",
  alerta: "Em construção",
  ok: "Suficiente para passar",
  perigo: "Em estresse"
};

const RESULTADOS = {
  aprovado: {
    titulo: "A criança dormiu tranquila",
    texto: "Suas respostas deixaram a curiosidade em paz e o coração quentinho. Missão cumprida!"
  },
  quase: {
    titulo: "Quase lá",
    texto: "A criança aprendeu bastante, mas ainda ficou com um pouco de dúvida. Na próxima você chega lá."
  },
  dificil: {
    titulo: "Uma noite difícil",
    texto: "Foram muitas perguntas e poucas respostas que ajudaram. Respire, tome um chá e tente de novo."
  },
  colapso: {
    titulo: "Última chance perdida",
    texto: "A criança perdeu a paciência. No Modo Última Chance não existe volta."
  }
};

// ---------- Palavras-chave globais (comparadas sem acento) ----------
// Até 4 letras: palavra exata. 5+ letras: prefixo. Com espaço: frase.
const PALAVRAS_GLOBAIS = {
  sensata: [
    "imagina", "vamos", "sabe quando", "pequenin", "quentinh", "brincar",
    "magico", "aprender", "natureza", "cuidar", "exemplo", "pertinho"
  ],
  zueira: [
    "pergunta pro google", "pergunta pra sua mae", "pergunta pro seu pai",
    "alien", "extraterrestre", "superheroi", "meme", "tiktok", "youtube",
    "zoeira", "brincadeira"
  ],
  tecnica: [
    "molecul", "atomo", "quimic", "fisic", "biolog", "proteina", "processo",
    "mecanismo", "fenomeno", "neuronio", "estrutura", "composicao", "cientific"
  ]
};

// ============================================================
// BANCO DE PERGUNTAS: 15 por faixa etária (45 no total).
// P(pergunta, [sensatas], [zueiras], [técnicas],
//   "palavras-chave sensatas", "zueiras", "técnicas")
// Para adicionar respostas, coloque mais textos nas listas.
// Palavras-chave separadas por vírgula (acento é ignorado).
// ============================================================
const semAcento = (s) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
const lista = (s) => s.split(",").map((x) => semAcento(x.trim())).filter(Boolean);

const P = (texto, sensata, zueira, tecnica, ks, kz, kt) => ({
  texto,
  respostas: { sensata, zueira, tecnica },
  palavras: { sensata: lista(ks), zueira: lista(kz), tecnica: lista(kt) }
});

const BANCO = {
  // ----------------------------- 4 ANOS -----------------------------
  4: [
    P("Por que o céu é azul?",
      ["A luz do sol tem todas as cores misturadas, e o azul se espalha pelo céu todinho. Por isso a gente vê tudo azulzinho!"],
      ["Porque o céu escolheu o azul como cor favorita e ninguém conseguiu convencer ele do contrário."],
      ["É o espalhamento de Rayleigh: comprimentos de onda curtos se dispersam mais na atmosfera, em proporção inversa à quarta potência da frequência."],
      "luz,sol,cores,espalh,azulzinh,misturad,arco iris",
      "favorita,escolheu,tinta,pintor,estoque",
      "rayleigh,comprimento de onda,dispers,atmosfer,frequencia,refrac"),

    P("Onde fica o vento quando ele não está soprando?",
      ["O vento é o ar se mexendo. Quando ele para, o ar fica bem quietinho em volta da gente, esperando pra se mexer de novo!"],
      ["Ele fica escondido dentro do ventilador, tirando uma sonequinha."],
      ["O vento é o deslocamento de massas de ar causado por diferenças de pressão atmosférica; quando o gradiente se equilibra, o movimento cessa."],
      "ar,mexendo,quietinh,descansa,soprar,sopra,respiramos",
      "ventilador,sonequinha,escondido,soneca,gaveta",
      "pressao,massas,gradiente,atmosferic,deslocamento,equilibr"),

    P("Por que a lua me segue no carro?",
      ["A lua está tão, tão longe que parece andar junto com a gente. É como um amigo gigante que acompanha todo mundo lá de cima!"],
      ["Porque ela gosta de você e já decorou o caminho da sua casa."],
      ["Por estar a cerca de 384 mil km, a paralaxe é desprezível e seu deslocamento angular aparente é praticamente nulo."],
      "longe,distante,gigante,acompanh,amigo,pertinho",
      "decorou,gosta de voce,stalker,persegue,espiao,seguindo",
      "paralaxe,angular,km,quilometro,desprezivel,aparente"),

    P("De onde vem a chuva?",
      ["A água do mar e dos rios sobe pro céu, vira nuvem, e quando a nuvem fica pesadinha de água, ela cai de volta como chuva!"],
      ["As nuvens choram quando ficam com saudade do sol."],
      ["A evaporação e a condensação formam gotículas que, ao coalescerem, precipitam por gravidade quando superam a sustentação das correntes ascendentes."],
      "nuvem,nuvens,agua,sobe,mar,rios,pesadinh,cai",
      "choram,choro,saudade,torneira,regador",
      "evaporacao,condensacao,goticula,precipit,coalesc,sustentacao,ciclo hidrologico"),

    P("Por que eu tenho que dormir?",
      ["Dormir é a hora do corpo descansar e recarregar as energias. Enquanto você dorme, você cresce e fica forte pra brincar amanhã!"],
      ["Pra dar tempo de o celular carregar também."],
      ["O sono REM e não REM promove a consolidação da memória, a liberação de hormônio do crescimento e a depuração glinfática."],
      "descans,energia,recarreg,crescer,cresce,forte,sonho,cansad",
      "celular,bateria,wifi,netflix,preguica",
      "rem,melatonina,glinfatic,consolidac,hormonio,circadian"),

    P("Por que eu tenho medo do escuro?",
      ["No escuro a gente não vê direito, e o cérebro imagina coisas. Mas o seu quarto é o mesmo de sempre, e eu estou aqui pertinho de você."],
      ["Porque o escuro é o lugar onde moram os fantasmas que pagaram aluguel adiantado."],
      ["A escotofobia é uma resposta da amígdala à ausência de estímulos visuais, ativando o sistema límbico de defesa."],
      "imagina,cerebro,enxerg,quarto,pertinho,seguranca,protej,abrac,luz",
      "fantasma,monstro,aluguel,vampiro,assombr",
      "escotofobia,amigdala,limbico,estimulo,visuais,neurolog"),

    P("Como eu nasci?",
      ["Você cresceu na barriga da mamãe, bem quentinho, até estar pronto pra conhecer o mundo. Todo mundo começou assim!"],
      ["A cegonha te entregou, mas errou o endereço duas vezes."],
      ["Um espermatozoide fecundou um óvulo, formando um zigoto que se dividiu em embrião e feto até o parto."],
      "barriga,mamae,crescer,cresceu,amor,quentinh,familia",
      "cegonha,repolho,correio,sedex,entrega,amazon",
      "espermatozoide,ovulo,zigoto,embriao,fecunda,utero,placenta,cromossom"),

    P("Por que o ar é invisível?",
      ["O ar é feito de pedacinhos tão pequenininhos que os olhos não conseguem ver. Mas você sente quando o vento bate no rosto!"],
      ["Porque ele tem vergonha de aparecer em fotos."],
      ["O ar é uma mistura de nitrogênio e oxigênio cujas moléculas são menores que o comprimento de onda da luz visível, sem espalhamento perceptível."],
      "pedacinh,pequenin,olhos,sente,vento,respir,enxerg",
      "vergonha,fantasma,ninja,segredo,fotos",
      "nitrogenio,oxigenio,comprimento de onda,espalhamento,gases,molecul"),

    P("Por que o fogo queima?",
      ["O fogo é muito, muito quente, e o calor machuca nossa pele. Por isso a gente nunca mexe no fogo sozinho e chama um adulto."],
      ["Porque ele é mal-humorado e não gosta de ser tocado."],
      ["A combustão é uma reação exotérmica de oxidação que libera energia térmica suficiente para desnaturar proteínas da epiderme."],
      "quente,calor,machuca,pele,adulto,cuidado,perigo",
      "mal humorado,humor,bravo,nervoso,dragao",
      "combustao,exotermica,oxidacao,termica,desnatur,epiderme,reacao"),

    P("Por que o gelo derrete?",
      ["Quando o gelo fica no calorzinho, ele esquenta e vira água de novo. Gelo gosta de lugar bem geladinho!"],
      ["Porque ele não aguenta a pressão e se desmancha em lágrimas."],
      ["O gelo absorve calor do ambiente até atingir o ponto de fusão a 0 °C, quando a energia vence as ligações de hidrogênio do cristal."],
      "calor,calorzinh,esquenta,agua,geladinh,sol",
      "lagrimas,pressao,chorando,desmancha",
      "fusao,ligacoes,hidrogenio,cristal,entalpia,absorve"),

    P("Por que minha barriga faz barulho?",
      ["É a sua barriga trabalhando! Quando está vazia ou digerindo a comida, ela se mexe e faz uns barulhinhos. Às vezes é só fome!"],
      ["É um dragãozinho morando aí dentro, pedindo lanche."],
      ["Os borborigmos são ruídos do peristaltismo, em que o movimento de gases e líquidos pelo trato gastrointestinal produz vibração."],
      "fome,vazia,comida,trabalhando,mexe,barulhinh,lanche",
      "dragao,monstro,bicho,alien,gremlin",
      "borborigmo,peristalt,gastrointestinal,intestin,digestao,gases"),

    P("Por que o sol some de noite?",
      ["O sol não some, ele vai iluminar o outro lado do mundo! A Terra vai girando devagarzinho, e aqui fica de noite pra gente descansar."],
      ["Ele vai ao banheiro e demora umas doze horas."],
      ["A rotação da Terra em torno do próprio eixo faz o hemisfério ficar fora da incidência da luz solar, num período de cerca de 24 horas."],
      "gira,girando,outro lado,mundo,terra,devagarzinh,descansar",
      "banheiro,ferias,cochil,trabalho,aposentado,dorme",
      "rotacao,eixo,hemisferio,incidencia,translacao,orbita"),

    P("Por que os passarinhos voam?",
      ["Eles têm asas e penas leves, e batem as asinhas pra subir no ar. Nós não temos asas, mas a gente pode imaginar que voa!"],
      ["Porque eles esqueceram a carteira de motorista pra dirigir."],
      ["O voo depende de sustentação aerodinâmica gerada pelo perfil das asas, com ossos pneumáticos que reduzem a massa corporal."],
      "asas,asinhas,penas,leves,ar,pular,imaginar",
      "carteira,motorista,onibus,aviao,foguete,capa",
      "aerodinam,sustentacao,pneumatic,perfil,massa,voo"),

    P("Por que eu preciso tomar banho?",
      ["O banho leva embora a sujeirinha e os micróbios que a gente não vê. Depois você fica cheirosinho, limpinho e protegido!"],
      ["Pra você não virar um monstro de lama no meio da noite."],
      ["A higiene corporal remove sebo, suor e microrganismos da epiderme, reduzindo a proliferação bacteriana e a produção de odores."],
      "sujeira,sujeirinh,microb,limpinh,cheirosinh,protegid,germes",
      "monstro,lama,porquinho,ogro,lixo",
      "higiene,sebo,epiderme,proliferacao,bacteriana,microrganismo"),

    P("Por que as plantas precisam de água?",
      ["Assim como você bebe água pra ficar forte, as plantas bebem pelas raízes pra crescer e ficar bem verdinhas!"],
      ["Porque elas ficam com sede de tanto ouvir a gente falar."],
      ["A água é necessária para a fotossíntese e para o transporte de nutrientes via xilema, além de manter a turgescência celular."],
      "raiz,raizes,beber,bebem,crescer,sede,verdinh,forte",
      "ouvir,fofoca,conversa,tagarela",
      "fotossintese,xilema,turgescencia,nutrientes,osmose,estomato")
  ],

  // ----------------------------- 5 ANOS -----------------------------
  5: [
    P("Por que o mar é salgado?",
      ["Os rios levam um pouquinho de sal das pedras para o mar há milhões de anos. Quando a água evapora, o sal fica lá!"],
      ["Alguém esqueceu de temperar e jogou um caminhão de sal."],
      ["A salinidade média é cerca de 35 g/kg, principalmente íons de cloreto e sódio oriundos do intemperismo e da atividade hidrotermal."],
      "rios,pedras,evapor,chuva,pouquinh,anos",
      "tempero,tempera,caminhao,cozinh,macarrao,batata frita",
      "salinidade,cloreto,sodio,ions,intemperismo,hidrotermal"),

    P("Por que o bebê fica na barriga da mamãe?",
      ["Lá dentro é quentinho e protegido. O bebê vai crescendo e ficando fortinho até estar pronto pra nascer e conhecer a família!"],
      ["É o hotel mais barato do mundo: só paga com abraços."],
      ["O útero fornece nutrição e proteção via placenta e líquido amniótico durante as quarenta semanas de gestação."],
      "quentinh,protegid,crescendo,fortinh,nascer,familia,cuidad",
      "hotel,barato,abracos,airbnb,pousada,aluguel",
      "utero,uterin,placenta,amniotic,gestacao,nutricao,semanas,feto"),

    P("Por que as estrelas brilham?",
      ["As estrelas são bolas gigantes de fogo muito, muito longe. Elas brilham tanto que a gente enxerga a luzinha delas aqui da Terra!"],
      ["São lanterninhas que os astronautas esqueceram ligadas."],
      ["As estrelas brilham pela fusão nuclear do hidrogênio em hélio em seus núcleos, liberando fótons que viajam milhares de anos até nós."],
      "fogo,longe,luzinh,gigante,sol,bolas,noite",
      "lanterna,lanterninh,astronauta,led,pisca pisca,natal",
      "fusao,nuclear,hidrogenio,helio,fotons,nucleo,plasma"),

    P("Por que existe trovão?",
      ["Quando cai um raio, o ar esquenta rapidinho e faz um estrondo enorme no céu. O raio é a luz, o trovão é o barulhão!"],
      ["É o céu arrotando depois de comer muita nuvem."],
      ["O raio aquece o ar a cerca de 30.000 °C em microssegundos, gerando uma onda de choque supersônica que percebemos como trovão."],
      "raio,ar,esquenta,barulhao,estrondo,luz,tempestade",
      "arrota,arrotando,ceu bravo,bateria,tambor,panela",
      "onda de choque,supersonic,microssegundos,eletrica,descarga,plasma,ionizacao"),

    P("Por que a gente sonha?",
      ["Enquanto você dorme, seu cérebro continua brincando com as lembranças do dia e inventa histórias. Sonhar é como um cinema só seu!"],
      ["É o canal de TV do cérebro, que só passa reprise."],
      ["Os sonhos ocorrem principalmente no sono REM, quando a atividade cortical ativa o reprocessamento de memórias e emoções."],
      "cerebro,lembranc,historias,inventa,brincando,cinema,dorme",
      "tv,canal,reprise,netflix,novela,youtube",
      "rem,cortical,reprocessamento,memorias,neuronio,sinapse,onirica"),

    P("Por que a gente fica com soluço?",
      ["É um solavanco na barriguinha que faz o ar entrar rápido. Respirar devagar ou tomar um golinho de água ajuda a passar!"],
      ["É um passarinho preso na garganta que quer sair e cantar."],
      ["O soluço é uma contração involuntária do diafragma seguida do fechamento súbito da glote, que produz o som característico."],
      "barriguinh,respirar,devagar,golinh,agua,ar,solavanco",
      "passarinho,garganta,cantar,sapo,alien,fantasma",
      "diafragma,glote,involuntaria,contracao,nervo frenico,espasmo"),

    P("Para onde vai a água do ralo?",
      ["Ela desce por canos escondidos até um lugar onde fica limpinha, pra depois voltar pros rios e pro mar. A água faz uma viagem grandona!"],
      ["Vai para o mundo dos ralos, onde vivem as meias que sumiram."],
      ["A água residual segue pela rede de esgoto até estações de tratamento, onde passa por processos físicos, biológicos e químicos."],
      "canos,limpinh,rios,mar,viagem,escondid,tubos",
      "meias,meia,mundo dos ralos,jacare,tartaruga,ninja",
      "esgoto,tratamento,residual,biologic,quimic,efluente,estacao"),

    P("Por que a gente tem que comer verdura?",
      ["As verduras têm vitaminas que deixam o corpo forte, os olhos bons e a gente cheio de energia pra correr e brincar!"],
      ["Pra quando os coelhos vierem pedir ajuda, você falar a língua deles."],
      ["Verduras fornecem micronutrientes, fibras e antioxidantes que modulam a microbiota e reduzem o estresse oxidativo."],
      "vitamina,forte,energia,corpo,saude,saudavel,crescer",
      "coelho,hulk,popeye,tartaruga,horta,dinossauro",
      "micronutrientes,fibras,antioxidantes,microbiota,oxidativo,metabol"),

    P("Por que o arco-íris tem cores?",
      ["A luz do sol parece branca, mas tem todas as cores escondidas. Quando atravessa as gotinhas de chuva, elas se separam e aparecem!"],
      ["Um unicórnio passou por ali e derrubou os potes de tinta."],
      ["A refração e a dispersão da luz nas gotículas separam os comprimentos de onda, formando o espectro visível em ordem."],
      "luz,sol,gotinh,chuva,escondid,separam,branca",
      "unicornio,tinta,potes,duende,pote de ouro,fada",
      "refracao,dispersao,espectro,comprimento de onda,goticula,visivel"),

    P("Por que os cachorros latem?",
      ["É o jeito deles de conversar! Latem pra dizer que estão felizes, com fome, com medo ou pra avisar que alguém chegou."],
      ["Eles estão tentando aprender português, mas só chegaram na letra A."],
      ["A vocalização canina é uma comunicação acústica que transmite estado emocional, hierarquia e alerta territorial."],
      "conversar,felizes,fome,medo,avisar,jeito,falar",
      "portugues,ingles,aula,idioma,celular,vizinho",
      "vocalizacao,canina,acustica,hierarquia,territorial,etologia"),

    P("Por que a gente chora?",
      ["Chorar é o jeito do corpo mostrar que a gente sentiu algo muito forte, como tristeza, susto ou até alegria. Depois a gente se sente mais leve."],
      ["É a torneira dos olhos, que ninguém consertou."],
      ["O choro emocional ativa as glândulas lacrimais por estímulo do sistema nervoso parassimpático, liberando lágrimas ricas em hormônios do estresse."],
      "sentimento,sentiu,tristeza,susto,alegria,leve,abrac,emocao",
      "torneira,vazamento,cebola,encanador,chuveiro,conserto",
      "lacrimais,parassimpatico,glandulas,hormonios,estresse,lacrimal"),

    P("Por que o dinheiro existe?",
      ["O dinheiro é um jeito de trocar coisas. Em vez de levar um monte de ovos pro mercado, a gente usa dinheiro pra comprar o que precisa!"],
      ["Porque as notas gostam de passear de mão em mão."],
      ["O dinheiro é meio de troca, unidade de conta e reserva de valor, e reduz os custos de transação da economia de escambo."],
      "troca,trocar,comprar,mercado,precisa,trabalho,ovos",
      "passear,notas gostam,arvore,imprimir,pirata,tesouro",
      "unidade de conta,reserva de valor,escambo,economia,inflacao,transacao"),

    P("Por que o avião não cai?",
      ["As asas do avião seguram o ar por baixo, como a gente sente a mão no vento do carro. E os motores empurram ele pra frente!"],
      ["Ele agarra nas nuvens com as unhas."],
      ["A sustentação resulta da diferença de pressão entre o extradorso e o intradorso da asa, segundo o princípio de Bernoulli e a terceira lei de Newton."],
      "asas,ar,vento,motores,empurram,segura,voar",
      "unhas,nuvens,cola,fita,velcro,ima",
      "sustentacao,extradorso,bernoulli,newton,pressao,aerodinam"),

    P("Por que as pessoas ficam velhinhas?",
      ["Com o passar dos anos o corpo vai ficando cansadinho e cheio de histórias. Os vovôs e as vovós sabem muita coisa porque viveram muito!"],
      ["É que elas esquecem de trocar a bateria."],
      ["O envelhecimento resulta do encurtamento dos telômeros e do acúmulo de danos celulares que reduzem a capacidade regenerativa."],
      "anos,cansadinh,historias,viveram,vovo,vovos,sabem",
      "bateria,pilha,carregar,expirar,validade,prazo",
      "telomeros,celulares,regenerativa,envelhecimento,senescencia,dna"),

    P("Por que meu cabelo cresce?",
      ["Embaixo da pele tem raizinhas bem pequenas que fazem o cabelo crescer um pouquinho todo dia, como grama no jardim!"],
      ["É o jeito do cabelo tentar fugir da sua cabeça."],
      ["Os folículos pilosos produzem queratina em ciclos de crescimento, repouso e queda controlados por hormônios e fatores genéticos."],
      "raizinh,pele,grama,jardim,pouquinh,crescer,todo dia",
      "fugir,fuga,cabeca,alien,planta,milho",
      "foliculo,queratina,hormonios,geneticos,capilar,anagenese")
  ],

  // ----------------------------- 6 ANOS -----------------------------
  6: [
    P("Por que as pessoas morrem?",
      ["Todo ser vivo tem um tempo de vida. Um dia o corpo fica cansado e para de funcionar. Por isso a gente cuida de quem ama e guarda as lembranças."],
      ["Pra liberar espaço no WhatsApp do universo."],
      ["A morte ocorre pela falência dos sistemas orgânicos, com cessação da atividade cerebral e parada cardiorrespiratória, seguidas de necrose celular."],
      "tempo,cansad,cuida,saudade,lembranc,ciclo,vida,amor",
      "whatsapp,espaco,memoria,vaga,atualizacao,bug",
      "falencia,cerebral,cardio,necrose,orgao,apoptose,organic"),

    P("Onde eu estava antes de nascer?",
      ["Antes de nascer você ainda não existia, mas sua família já sonhava com você. Quando você chegou, todo mundo ficou muito feliz!"],
      ["Você estava na fila do parque de diversões do universo."],
      ["Antes da fecundação, sua existência era apenas potencial genético distribuído entre gametas de dois indivíduos."],
      "familia,sonhava,esperando,feliz,chegou,amor,mamae",
      "fila,parque,universo,nuvem,planeta,estoque",
      "fecundacao,genetico,gametas,potencial,celulas,dna"),

    P("Por que eu tenho que ir à escola?",
      ["Na escola você aprende coisas novas, faz amigos e descobre o que mais gosta. É como ganhar poderes novos todo dia pra entender o mundo!"],
      ["Porque os adultos precisam de um lugar pra guardar as crianças enquanto trabalham."],
      ["A educação formal é um direito garantido por lei que promove a socialização, a alfabetização e a formação de competências cognitivas."],
      "aprende,aprender,amigos,novas,descobre,mundo,professor",
      "guardar,adultos,prisao,castigo,sorvete,recreio infinito",
      "educacao formal,socializacao,alfabetizacao,cognitiv,competencias,lei,curriculo"),

    P("Por que o sol é quente?",
      ["O sol é uma bola gigante de fogo bem, bem longe. Mesmo de tão longe, o calor dele chega até a gente e esquenta o dia!"],
      ["Porque ele esqueceu de desligar o fogão."],
      ["No núcleo solar, a fusão nuclear converte hidrogênio em hélio a 15 milhões de graus Celsius, irradiando energia por todo o espectro eletromagnético."],
      "fogo,bola,gigante,calor,longe,esquenta,luz",
      "fogao,forno,churrasqueira,secador,microondas,panela",
      "fusao,nuclear,hidrogenio,helio,celsius,eletromagnetic,irradi"),

    P("Por que as pessoas brigam?",
      ["Às vezes a gente quer coisas diferentes ou fica com raiva, e brigar parece o jeito mais fácil. Mas conversar e pedir desculpa resolve melhor!"],
      ["Porque alguém comeu o último pedaço de pizza."],
      ["Conflitos interpessoais emergem da divergência de interesses e da dificuldade de regulação emocional, mediados por vieses cognitivos."],
      "raiva,conversar,desculpa,diferentes,respeitar,sentimento,entender",
      "pizza,sorvete,controle,videogame,pedaco,ultimo",
      "conflito,interpessoal,regulacao,vieses,divergencia,cognitiv,psicolog"),

    P("Por que as pessoas falam línguas diferentes?",
      ["Cada lugar do mundo foi inventando suas palavras ao longo de milhares de anos, como cada família tem seu jeito de falar. Dá pra aprender várias!"],
      ["Foi um castigo de uma torre muito alta, e deu tudo errado."],
      ["As línguas evoluem por deriva linguística, isolamento geográfico e contato cultural ao longo de milênios, originando famílias linguísticas distintas."],
      "lugar,mundo,palavras,aprender,familia,jeito,paises",
      "torre,castigo,alien,robo,bebe,passaro",
      "linguistic,deriva,evoluem,milenios,etimolog,fonolog,dialeto"),

    P("Por que a Terra gira?",
      ["Quando a Terra nasceu, ela já veio rodando, e como no espaço não tem nada pra frear, ela continua girando. Por isso temos dia e noite!"],
      ["Ela está dançando sem parar desde que a música começou."],
      ["A rotação resulta da conservação do momento angular da nebulosa protoplanetária que originou o sistema solar."],
      "rodando,espaco,frear,dia,noite,girando,nasceu",
      "dancando,danca,musica,piao,roda gigante,tontura,carrossel",
      "momento angular,nebulosa,protoplanetaria,conservacao,inercia,gravitac"),

    P("Onde termina o universo?",
      ["Ninguém sabe ao certo! É tão grande que nem os cientistas conseguiram ver o fim. É uma das perguntas mais misteriosas que existem."],
      ["Termina onde fica o balcão de devolução de perguntas difíceis."],
      ["O universo observável tem raio de cerca de 46 bilhões de anos-luz, e sua topologia global permanece desconhecida e em expansão."],
      "ninguem sabe,grande,misterio,cientistas,descobrir,fim,imenso",
      "balcao,devolucao,placa,loja,fila,wifi",
      "observavel,anos luz,topologia,expansao,cosmologia,bilhoes,big bang"),

    P("Por que mentir é errado?",
      ["Quando a gente mente, as pessoas deixam de confiar em nós e podem ficar tristes. Falar a verdade, mesmo quando é difícil, faz os outros gostarem ainda mais da gente."],
      ["Porque o nariz cresce e você nunca mais cabe em camisa pequena."],
      ["A mentira rompe o contrato social de confiança mútua, o que gera custos de monitoramento e deterioração de vínculos."],
      "confiar,confianca,verdade,tristes,amigos,honest,sinceridade",
      "nariz,pinoquio,cresce,coelho,castigo",
      "contrato social,monitoramento,deterioracao,vinculos,etica,deontolog"),

    P("Por que a gente fica doente?",
      ["Existem uns bichinhos bem pequenos, os micróbios, que entram no corpo. Mas o corpo tem soldadinhos que lutam contra eles, e descansar e tomar remédio ajuda!"],
      ["O corpo entra em greve quando passa muito tempo sem sorvete."],
      ["A infecção ocorre quando patógenos superam as barreiras imunológicas e se replicam, desencadeando resposta inflamatória sistêmica."],
      "microb,bichinh,soldadinh,descansar,remedio,medico,defesa",
      "greve,sorvete,pinguim,preguica,ferias,escola",
      "patogeno,imunolog,replicam,inflamatoria,sistemica,infeccao,virus,bacteria"),

    P("Como o celular funciona?",
      ["Dentro do celular tem um cérebrinho eletrônico que entende os toques da sua mão e usa ondas invisíveis pra falar com outros aparelhos."],
      ["Tem um monte de duendes minúsculos lá dentro mandando mensagens correndo."],
      ["Um SoC integra processador, memória e modem que modulam sinais de radiofrequência para trocar pacotes de dados com torres de celular."],
      "cerebrinh,toque,ondas,aparelho,tela,eletronic,bateria",
      "duende,minusculo,correndo,hamster,fadinha,pombo",
      "soc,processador,radiofrequencia,pacotes,modem,modulam,algoritmo"),

    P("Por que os dinossauros sumiram?",
      ["Um pedregulho gigante veio do espaço e bateu na Terra, e o clima mudou muito. Os dinossauros não conseguiram se adaptar, mas as aves de hoje são parentes deles!"],
      ["Foram fazer um piquenique e nunca mais voltaram."],
      ["O impacto de Chicxulub há 66 milhões de anos causou uma extinção em massa por invernos de impacto e colapso das cadeias tróficas."],
      "espaco,pedregulho,asteroide,clima,mudou,adaptar,aves",
      "piquenique,ferias,voltaram,mudaram,greve,festa",
      "chicxulub,extincao,milhoes de anos,cadeias troficas,impacto,cretaceo,estratigraf"),

    P("Por que o tempo passa?",
      ["O tempo é o jeito da gente contar as coisas que acontecem: o dia, a noite, o seu aniversário. Ele passa porque tudo no mundo vai mudando um pouquinho."],
      ["É que o relógio está sempre com pressa."],
      ["A flecha do tempo decorre da segunda lei da termodinâmica: a entropia de um sistema isolado tende a aumentar."],
      "contar,dia,noite,aniversario,mudando,relogio,mundo",
      "pressa,preguica,tartaruga,coelho,corre,atrasado",
      "entropia,termodinamica,flecha do tempo,relatividade,espaco tempo,isolado"),

    P("Por que eu não posso ter tudo o que eu quero?",
      ["Porque as coisas custam dinheiro e esforço, e é bom dividir com os outros. Esperar também deixa a gente mais feliz quando finalmente ganha!"],
      ["Porque senão a loja de brinquedos ia falir e o dono viraria dragão."],
      ["A escassez de recursos impõe escolhas alocativas, pois desejos ilimitados confrontam orçamentos finitos."],
      "esperar,dividir,custam,dinheiro,esforco,outros,paciencia",
      "falir,dragao,loja,brinquedos,lampada,genio",
      "escassez,alocativ,orcamento,recursos,economia,desejos ilimitados"),

    P("Por que os animais não falam?",
      ["Os animais falam do jeito deles: com sons, gestos e cheiros! Só que o corpo e o cérebro dos humanos são feitos pra usar palavras."],
      ["Eles falam, mas só quando você não está olhando."],
      ["A fala humana depende de adaptações anatômicas, como a laringe baixa, e de circuitos neurais como a área de Broca, ausentes nos demais animais."],
      "sons,gestos,cheiros,jeito,cerebro,palavras,comunicam",
      "olhando,segredo,disfarce,espiao,tradutor,papagaio",
      "laringe,broca,neural,anatomic,adaptacoes,circuitos,linguagem")
  ]
};

// Identificadores automáticos: "5-3" = terceira pergunta de 5 anos
Object.entries(BANCO).forEach(([idade, perguntas]) => {
  perguntas.forEach((q, i) => {
    q.id = `${idade}-${i + 1}`;
    q.idade = Number(idade);
  });
});
