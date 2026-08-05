export interface Guia {
  id:          string;
  titulo:      string;
  categoria:   "Documentos Iniciais" | "Finanças & Crédito" | "Mobilidade" | "Saúde" | "Empreendedorismo";
  tempoLeitura: string;
  resumo:      string;
  passos:      string[];
  dicaChave:   string;
  fonteOficial: { nome: string; url: string };
  // Bloco extra opcional — usado hoje só pela lista de estados do guia de
  // DMV. Origem: pesquisa cruzada (NILC + outras fontes, ago/2026); a lista
  // de estados muda com legislação estadual, então sempre reconfirmar antes
  // de tratar como definitiva.
  infoExtra?: { titulo: string; texto: string; itens: string[] };
}

// Conteúdo editorial — "o que fazer depois que o visto sai". Sem status
// pessoal pra rastrear (diferente do Acompanhamento USCIS), por isso não
// depende de nenhuma API: é guia de processo, curado e revisável à mão,
// no mesmo espírito de content/leis. Sempre linkar a fonte oficial, nunca
// inventar valor ou prazo que mude com frequência.
const guias: Guia[] = [
  {
    id: "ssn",
    titulo: "Como tirar o Social Security Number (SSN)",
    categoria: "Documentos Iniciais",
    tempoLeitura: "4 min",
    resumo:
      "O SSN é o documento que destrava quase tudo nos EUA: abrir conta em banco, tirar carteira de motorista em muitos estados, ser contratado. Nem todo visto dá direito a ele — confirme antes de ir à agência.",
    passos: [
      "Confirme se seu status permite trabalhar nos EUA (a maioria dos vistos de estudante e turismo NÃO dá direito a SSN — só a autorização de trabalho, quando existir, garante isso).",
      "Preencha o formulário SS-5 (Application for a Social Security Card) — disponível em ssa.gov, gratuito.",
      "Reúna os originais: passaporte com visto/carimbo de entrada, I-94 (baixe em i94.cbp.dhs.gov) e, se aplicável, o documento que comprova autorização de trabalho (EAD, I-20 com autorização de CPT/OPT, DS-2019, etc.).",
      "Agende ou compareça a uma agência do Social Security (SSA) — não precisa de agendamento na maioria dos estados, mas confirme no site local.",
      "O cartão físico chega pelo correio em 2 a 4 semanas. Guarde o número assim que for informado na agência — você não precisa esperar o cartão físico para usá-lo.",
    ],
    dicaChave:
      "Peça na agência um comprovante por escrito de que você deu entrada no pedido — alguns empregadores e bancos aceitam esse papel enquanto o cartão não chega.",
    fonteOficial: { nome: "Social Security Administration", url: "https://www.ssa.gov/number-card" },
  },
  {
    id: "dmv",
    titulo: "Como tirar a carteira de motorista (DMV)",
    categoria: "Mobilidade",
    tempoLeitura: "5 min",
    resumo:
      "Não existe DMV federal — cada estado tem suas próprias regras, taxas e provas. O processo abaixo é o roteiro geral; os detalhes exatos (documentos aceitos, se sua CNH brasileira serve para dirigir por um tempo) variam por estado.",
    passos: [
      "Descubra o nome do órgão no seu estado (DMV, BMV, MVD ou Secretary of State, dependendo de onde você mora) e acesse o site oficial dele — nunca sites de terceiros que cobram para 'agendar'.",
      "Verifique o tempo mínimo de residência no estado (varia de imediato até 30+ dias) e se sua CNH brasileira permite dirigir por um período de transição.",
      "Reúna comprovante de identidade (passaporte + visto), comprovante de status legal (I-94) e dois comprovantes de endereço no estado (conta de luz, contrato de aluguel, extrato bancário).",
      "Estude o manual do motorista do seu estado (gratuito, em inglês — alguns estados oferecem em português ou espanhol) para a prova teórica.",
      "Agende a prova teórica e, depois de aprovado, a prova prática de direção. Alguns estados emitem uma permissão temporária (learner's permit) entre as duas etapas.",
    ],
    dicaChave:
      "Praticamente todo estado tem simulados oficiais gratuitos da prova teórica no próprio site do DMV — não pague por 'cursos preparatórios' de terceiros.",
    fonteOficial: { nome: "USA.gov — State DMVs", url: "https://www.usa.gov/motor-vehicle-services" },
    infoExtra: {
      titulo: "Estados que emitem carteira independente de status migratório",
      texto:
        "19 estados + o Distrito de Columbia emitem carteira de motorista mesmo sem status migratório regular (a carteira não serve como ID federal — não embarca em voo doméstico nem entra em prédio federal, só habilita a dirigir e costuma valer como ID estadual). Exige documento de identidade (geralmente passaporte estrangeiro) + comprovantes de residência no estado — os detalhes exatos variam, confirme sempre no site oficial do DMV do seu estado antes de agir.",
      itens: [
        "California", "Colorado", "Connecticut", "Delaware", "Hawaii", "Illinois",
        "Maryland", "Massachusetts", "Minnesota", "Nevada", "New Jersey", "New Mexico",
        "New York", "Oregon", "Rhode Island", "Utah", "Vermont", "Virginia",
        "Washington", "Washington D.C.",
      ],
    },
  },
  {
    id: "credit-score",
    titulo: "Como construir seu Credit Score do zero",
    categoria: "Finanças & Crédito",
    tempoLeitura: "6 min",
    resumo:
      "Seu histórico de crédito do Brasil não vale nada nos EUA — todo mundo começa do zero aqui, imigrante ou não. O score é o que define juros de cartão, aprovação de aluguel e até algumas contratações.",
    passos: [
      "Abra uma conta bancária americana (checking + savings) assim que tiver SSN ou ITIN — é o primeiro passo antes de qualquer produto de crédito.",
      "Peça um 'secured credit card' (cartão com depósito de garantia) no seu próprio banco ou em emissoras como Discover/Capital One — é o produto mais acessível para quem não tem histórico.",
      "Use o cartão para gastos pequenos e recorrentes (assinatura, gasolina) e pague o valor TOTAL da fatura todo mês — usar menos de 30% do limite e nunca atrasar é o que mais constrói o score.",
      "Depois de 6 a 12 meses de uso responsável, peça upgrade para um cartão sem garantia ou abra um segundo cartão para aumentar seu limite total disponível.",
      "Acompanhe seu score gratuitamente pelo app do seu banco ou por annualcreditreport.com (o único site oficial de relatório gratuito nos EUA) — desconfie de qualquer outro site que peça cartão de crédito para 'checar de graça'.",
    ],
    dicaChave:
      "Nunca cancele o primeiro cartão depois de conseguir um melhor — tempo de conta aberta (credit history length) também conta para o score, então é melhor manter e não usar do que fechar.",
    fonteOficial: { nome: "Consumer Financial Protection Bureau", url: "https://www.consumerfinance.gov/consumer-tools/credit-reports-and-scores/" },
  },
  {
    id: "aca-marketplace",
    titulo: "Como escolher plano de saúde no ACA Marketplace",
    categoria: "Saúde",
    tempoLeitura: "5 min",
    resumo:
      "Nos EUA não existe SUS — sem plano de saúde, uma emergência pode custar dezenas de milhares de dólares. O Marketplace (criado pelo Affordable Care Act) é onde a maioria dos imigrantes elegíveis compra plano individual, com possível desconto conforme a renda.",
    passos: [
      "Confirme se seu status permite comprar plano no Marketplace (a maioria dos vistos de trabalho e residentes permanentes pode; turismo geralmente não é elegível e depende de seguro-viagem à parte).",
      "Acesse healthcare.gov (ou o site do marketplace do seu estado, se ele tiver um próprio, como Covered California) — nunca pague para 'ajuda' de terceiros para se inscrever, o processo é gratuito.",
      "A inscrição só é aberta no período de Open Enrollment (geralmente nov–jan) — fora dele, só é possível entrar por um 'evento de vida qualificado' (mudança de emprego, casamento, chegada ao país).",
      "Compare os planos pelas categorias Bronze/Silver/Gold/Platinum — Bronze tem mensalidade menor mas você paga mais no atendimento; Gold/Platinum é o oposto. Silver costuma ter o melhor custo-benefício para quem tem direito a desconto por renda.",
      "Informe sua renda estimada do ano corretamente — é isso que define se você recebe subsídio (premium tax credit) reduzindo a mensalidade.",
    ],
    dicaChave:
      "Verifique se o médico/hospital que você já usa está na rede (network) do plano antes de escolher — plano mais barato que não cobre seu médico de confiança sai caro na prática.",
    fonteOficial: { nome: "HealthCare.gov", url: "https://www.healthcare.gov" },
  },
  {
    id: "itin",
    titulo: "Como tirar o ITIN (Individual Taxpayer Identification Number)",
    categoria: "Documentos Iniciais",
    tempoLeitura: "4 min",
    resumo:
      "O ITIN é o número de identificação fiscal para quem precisa declarar imposto nos EUA mas não tem direito a SSN — não dá autorização de trabalho, mas é o que te deixa abrir conta em banco, tirar crédito e ser sócio de empresa mesmo sem SSN.",
    passos: [
      "Confirme que você realmente precisa de um ITIN e não de um SSN — eles não se acumulam: quem tem direito a SSN não pode (nem precisa) tirar ITIN.",
      "Preencha o formulário W-7 (Application for IRS Individual Taxpayer Identification Number), disponível gratuitamente em irs.gov.",
      "Normalmente o W-7 é enviado junto com sua primeira declaração de imposto de renda (Form 1040) — é a evidência de que você tem uma obrigação fiscal legítima.",
      "Reúna um documento que prove identidade e 'foreign status' — o passaporte sozinho já serve para as duas coisas; sem ele, o IRS aceita combinações de outros documentos (carteira de identidade estrangeira com foto, certidão de nascimento, CNH estrangeira).",
      "Envie pelo correio ao IRS, entregue pessoalmente num Taxpayer Assistance Center, ou use um Certifying Acceptance Agent (CAA) — profissional autorizado pelo IRS que confere os originais e evita ter que enviar seu passaporte pelo correio.",
    ],
    dicaChave:
      "O IRS só aceita o W-7 em papel — não existe pedido totalmente online. Se não quiser mandar seu passaporte original pelo correio, procure um Certifying Acceptance Agent (CAA) perto de você; ele autentica os documentos na hora.",
    fonteOficial: { nome: "IRS — Individual Taxpayer Identification Number", url: "https://www.irs.gov/individuals/individual-taxpayer-identification-number" },
  },
  {
    id: "abrir-empresa",
    titulo: "Como abrir uma empresa (LLC) nos EUA",
    categoria: "Empreendedorismo",
    tempoLeitura: "6 min",
    resumo:
      "Não existe uma 'abertura de empresa federal' — o registro é sempre no estado. Boa notícia: você não precisa ter status migratório específico, nem SSN, para ser dono de uma LLC americana. É comum abrir a empresa antes mesmo de resolver o visto.",
    passos: [
      "Escolha o estado de registro — não precisa ser onde você mora; Delaware, Wyoming e Novo México são populares por taxa baixa e privacidade, mas se você vai operar fisicamente em outro estado, provavelmente vai precisar se registrar lá também ('foreign qualification').",
      "Escolha um nome disponível e registre os Articles of Organization no site do Secretary of State (ou órgão equivalente) do estado escolhido — taxa e prazo variam por estado.",
      "Contrate ou designe um Registered Agent no estado (obrigatório em todo estado) — é quem recebe notificações judiciais e correspondência oficial em nome da empresa.",
      "Peça o EIN (Employer Identification Number) gratuitamente no site do IRS — é o CNPJ americano, necessário para abrir conta bancária empresarial mesmo sem SSN (nesse caso, o pedido de EIN é feito por telefone/fax/correio em vez do formulário online).",
      "Abra a conta bancária empresarial com o EIN e os documentos de formação da LLC — a maioria dos bancos grandes exige presença física para não-residentes, então isso costuma ser feito numa viagem aos EUA.",
    ],
    dicaChave:
      "LLC não é visto de trabalho: ser dono/sócio de uma empresa americana não te dá, por si só, autorização para trabalhar nos EUA. Se seu objetivo é usar a empresa como base para um visto (E-2, L-1, EB-5), planeje a estrutura societária com um advogado de imigração ANTES de registrar — corrigir depois costuma ser mais caro que fazer certo da primeira vez.",
    fonteOficial: { nome: "IRS — Employer Identification Number (EIN)", url: "https://www.irs.gov/businesses/small-businesses-self-employed/apply-for-an-employer-identification-number-ein-online" },
  },
];

export default guias;
