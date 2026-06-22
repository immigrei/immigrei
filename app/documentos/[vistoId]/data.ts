export type Agencia = "USCIS" | "NVC" | "DOS" | "DOL" | "EOIR";

export type KitCaminho = "consulado" | "cos" | "manutencao";

export interface KitMeta {
  caminho: KitCaminho;
  preco: string;
  alertaCritico?: string;
}

export interface Documento {
  id: string;
  nome: string;
  descricao: string;
  agencia: Agencia;
  formulario?: string;
  obrigatorio: boolean;
}

export interface GrupoDocumentos {
  titulo: string;
  descricao: string;
  documentos: Documento[];
}

export interface ChecklistVisto {
  vistoId: string;
  codigo: string;
  nome: string;
  intro: string;
  kit?: KitMeta;
  grupos: GrupoDocumentos[];
}

const checklists: Record<string, ChecklistVisto> = {
  f1: {
    vistoId: "f1",
    codigo: "F-1",
    nome: "Estudante Acadêmico",
    intro:
      "O processo começa na escola americana, que emite o I-20. Com ele, você paga a taxa SEVIS e agenda a entrevista consular.",
    grupos: [
      {
        titulo: "Formulários obrigatórios",
        descricao: "Preenchidos online antes da entrevista consular",
        documentos: [
          {
            id: "ds160",
            nome: "DS-160 — Formulário de visto não-imigrante",
            descricao:
              "Preenchido no site do Departamento de Estado. Leva de 1 a 2 horas. Guarde o número de confirmação.",
            agencia: "DOS",
            formulario: "DS-160",
            obrigatorio: true,
          },
          {
            id: "i901",
            nome: "Comprovante de pagamento da taxa SEVIS (I-901)",
            descricao:
              "Taxa de US$350 paga no site fmjfee.com antes da entrevista. O SEVIS ID está no I-20.",
            agencia: "USCIS",
            formulario: "I-901",
            obrigatorio: true,
          },
        ],
      },
      {
        titulo: "Documentos da escola",
        descricao: "Emitidos pela instituição de ensino nos EUA",
        documentos: [
          {
            id: "i20",
            nome: "I-20 — Certificado de Elegibilidade",
            descricao:
              "Emitido pelo DSO da escola. Deve conter seu nome, SEVIS ID, datas do programa e valor mínimo de recursos necessários.",
            agencia: "USCIS",
            formulario: "I-20",
            obrigatorio: true,
          },
          {
            id: "carta-aceite",
            nome: "Carta de aceitação da instituição",
            descricao:
              "Confirmação oficial de que você foi aceito no programa de estudos.",
            agencia: "DOS",
            obrigatorio: true,
          },
        ],
      },
      {
        titulo: "Documentos pessoais",
        descricao: "Apresentados na entrevista no consulado americano",
        documentos: [
          {
            id: "passaporte",
            nome: "Passaporte válido",
            descricao:
              "Deve ser válido por pelo menos 6 meses além da data prevista de saída dos EUA.",
            agencia: "DOS",
            obrigatorio: true,
          },
          {
            id: "foto",
            nome: "Foto no padrão americano",
            descricao:
              "5x5 cm, fundo branco, tirada nos últimos 6 meses. Veja o guia no site do consulado.",
            agencia: "DOS",
            obrigatorio: true,
          },
          {
            id: "financeiro",
            nome: "Comprovante de recursos financeiros",
            descricao:
              "Extratos bancários dos últimos 3 meses mostrando saldo suficiente para cobrir 1 ano de estudos. Carta de patrocinador se aplicável.",
            agencia: "DOS",
            obrigatorio: true,
          },
          {
            id: "historico",
            nome: "Histórico escolar e diplomas anteriores",
            descricao:
              "Tradução juramentada se o documento estiver em português.",
            agencia: "DOS",
            obrigatorio: false,
          },
          {
            id: "vinculo",
            nome: "Comprovante de vínculo com o Brasil",
            descricao:
              "Escritura de imóvel, contrato de trabalho, certidão de nascimento de filhos — qualquer documento que comprove que você tem razões para voltar.",
            agencia: "DOS",
            obrigatorio: false,
          },
        ],
      },
    ],
  },

  m1: {
    vistoId: "m1",
    codigo: "M-1",
    nome: "Estudante Técnico",
    intro:
      "Similar ao F-1, mas para programas vocacionais. O I-20 M-1 é emitido pela escola técnica credenciada pelo SEVP.",
    grupos: [
      {
        titulo: "Formulários obrigatórios",
        descricao: "Preenchidos online antes da entrevista consular",
        documentos: [
          {
            id: "ds160",
            nome: "DS-160 — Formulário de visto não-imigrante",
            descricao:
              "Preenchido no site do Departamento de Estado antes de agendar entrevista.",
            agencia: "DOS",
            formulario: "DS-160",
            obrigatorio: true,
          },
          {
            id: "i901",
            nome: "Comprovante de pagamento da taxa SEVIS (I-901)",
            descricao: "Taxa de US$350 paga em fmjfee.com. O SEVIS ID está no I-20.",
            agencia: "USCIS",
            formulario: "I-901",
            obrigatorio: true,
          },
        ],
      },
      {
        titulo: "Documentos da escola técnica",
        descricao: "Emitidos pela instituição vocacional credenciada",
        documentos: [
          {
            id: "i20",
            nome: "I-20 M-1 — Certificado de Elegibilidade",
            descricao:
              "Versão M-1 do I-20, emitido pela escola vocacional aprovada pelo SEVP.",
            agencia: "USCIS",
            formulario: "I-20",
            obrigatorio: true,
          },
          {
            id: "carta-aceite",
            nome: "Carta de aceitação do programa",
            descricao: "Confirmando o curso, duração e custo total.",
            agencia: "DOS",
            obrigatorio: true,
          },
        ],
      },
      {
        titulo: "Documentos pessoais",
        descricao: "Apresentados na entrevista consular",
        documentos: [
          {
            id: "passaporte",
            nome: "Passaporte válido",
            descricao: "Validade mínima de 6 meses além do período de estudo.",
            agencia: "DOS",
            obrigatorio: true,
          },
          {
            id: "foto",
            nome: "Foto no padrão americano",
            descricao: "5x5 cm, fundo branco, recente.",
            agencia: "DOS",
            obrigatorio: true,
          },
          {
            id: "financeiro",
            nome: "Comprovante financeiro",
            descricao:
              "Recursos suficientes para todo o curso + despesas de vida. Extratos dos últimos 3 meses.",
            agencia: "DOS",
            obrigatorio: true,
          },
          {
            id: "vinculo",
            nome: "Comprovante de vínculo com o Brasil",
            descricao:
              "Documentos que provem intenção de retornar ao Brasil após o curso.",
            agencia: "DOS",
            obrigatorio: false,
          },
        ],
      },
    ],
  },

  j1: {
    vistoId: "j1",
    codigo: "J-1",
    nome: "Intercâmbio Cultural",
    intro:
      "O J-1 é patrocinado por uma organização autorizada pelo Departamento de Estado. O DS-2019 substitui o I-20 do F-1.",
    kit: {
      caminho: "consulado",
      preco: "R$ 147",
    },
    grupos: [
      {
        titulo: "Formulários obrigatórios",
        descricao: "Preenchidos antes da entrevista",
        documentos: [
          {
            id: "ds160",
            nome: "DS-160 — Formulário de visto não-imigrante",
            descricao: "Preenchido online no site do Departamento de Estado.",
            agencia: "DOS",
            formulario: "DS-160",
            obrigatorio: true,
          },
          {
            id: "sevis",
            nome: "Comprovante de pagamento da taxa SEVIS",
            descricao:
              "Taxa de US$220 (programas Work and Travel) ou US$35 (outros programas) em fmjfee.com.",
            agencia: "USCIS",
            obrigatorio: true,
          },
        ],
      },
      {
        titulo: "Documentos do patrocinador",
        descricao: "Emitidos pela organização de intercâmbio autorizada pelo DOS",
        documentos: [
          {
            id: "ds2019",
            nome: "DS-2019 — Certificado de Elegibilidade",
            descricao:
              "Emitido pelo patrocinador autorizado. Contém o número SEVIS e detalhes do programa.",
            agencia: "DOS",
            formulario: "DS-2019",
            obrigatorio: true,
          },
          {
            id: "carta-patrocinador",
            nome: "Carta do patrocinador",
            descricao:
              "Confirmando sua participação no programa, função e cobertura financeira.",
            agencia: "DOS",
            obrigatorio: true,
          },
        ],
      },
      {
        titulo: "Documentos pessoais",
        descricao: "Apresentados na entrevista consular",
        documentos: [
          {
            id: "passaporte",
            nome: "Passaporte válido",
            descricao: "Válido por pelo menos 6 meses além do término do programa.",
            agencia: "DOS",
            obrigatorio: true,
          },
          {
            id: "foto",
            nome: "Foto no padrão americano",
            descricao: "5x5 cm, fundo branco.",
            agencia: "DOS",
            obrigatorio: true,
          },
          {
            id: "financeiro",
            nome: "Comprovante financeiro",
            descricao:
              "Prova de que você tem recursos para se sustentar caso o programa não cubra todas as despesas.",
            agencia: "DOS",
            obrigatorio: false,
          },
          {
            id: "regra2anos",
            nome: "Verificação da regra dos 2 anos",
            descricao:
              "Alguns programas J-1 exigem retorno ao país de origem por 2 anos antes de mudar para outro status. Confirme com seu patrocinador se sua categoria tem essa exigência.",
            agencia: "DOS",
            obrigatorio: false,
          },
        ],
      },
    ],
  },

  h1b: {
    vistoId: "h1b",
    codigo: "H-1B",
    nome: "Trabalhador Especialista",
    intro:
      "O H-1B é iniciado pelo empregador americano, não pelo trabalhador. O processo envolve o Departamento do Trabalho (DOL) e o USCIS antes da entrevista consular.",
    kit: {
      caminho: "consulado",
      preco: "R$ 197",
      alertaCritico: "O H-1B exige patrocínio do empregador e está sujeito a sorteio anual (cap de 65.000 vagas + 20.000 para mestrado).",
    },
    grupos: [
      {
        titulo: "Responsabilidade do empregador",
        descricao:
          "Seu empregador americano deve iniciar esses passos — você não pode fazer isso sozinho",
        documentos: [
          {
            id: "lca",
            nome: "Labor Condition Application (LCA) aprovada",
            descricao:
              "O empregador submete ao DOL e recebe aprovação em 7 dias. Define seu salário mínimo e localização de trabalho.",
            agencia: "DOL",
            obrigatorio: true,
          },
          {
            id: "i129",
            nome: "Formulário I-129 — Petição pelo empregador",
            descricao:
              "O empregador envia ao USCIS com a LCA aprovada. Deve ser submetido durante o período de registro de sorteio (março).",
            agencia: "USCIS",
            formulario: "I-129",
            obrigatorio: true,
          },
          {
            id: "i797",
            nome: "I-797 — Aviso de Aprovação",
            descricao:
              "Recebido após aprovação do I-129 pelo USCIS. Necessário para a entrevista consular.",
            agencia: "USCIS",
            formulario: "I-797",
            obrigatorio: true,
          },
        ],
      },
      {
        titulo: "Formulários do trabalhador",
        descricao: "Preenchidos por você para a entrevista consular",
        documentos: [
          {
            id: "ds160",
            nome: "DS-160 — Formulário de visto não-imigrante",
            descricao:
              "Preenchido após receber o I-797 aprovado. Use a data de início da petição como data de atividade.",
            agencia: "DOS",
            formulario: "DS-160",
            obrigatorio: true,
          },
        ],
      },
      {
        titulo: "Documentos pessoais e profissionais",
        descricao: "Apresentados na entrevista consular",
        documentos: [
          {
            id: "passaporte",
            nome: "Passaporte válido",
            descricao: "Válido por pelo menos 6 meses além do período de trabalho.",
            agencia: "DOS",
            obrigatorio: true,
          },
          {
            id: "foto",
            nome: "Foto no padrão americano",
            descricao: "5x5 cm, fundo branco.",
            agencia: "DOS",
            obrigatorio: true,
          },
          {
            id: "diploma",
            nome: "Diploma e histórico acadêmico",
            descricao:
              "Comprovando grau equivalente a bacharel americano na área de especialidade. Tradução juramentada se em português.",
            agencia: "DOS",
            obrigatorio: true,
          },
          {
            id: "curriculo",
            nome: "Currículo profissional",
            descricao:
              "Detalhando experiência na área especializada relacionada à função.",
            agencia: "DOS",
            obrigatorio: true,
          },
          {
            id: "carta-emprego",
            nome: "Carta de oferta de emprego",
            descricao:
              "Do empregador americano descrevendo o cargo, salário e condições de trabalho.",
            agencia: "DOS",
            obrigatorio: true,
          },
        ],
      },
    ],
  },

  o1: {
    vistoId: "o1",
    codigo: "O-1",
    nome: "Habilidade Extraordinária",
    intro:
      "O O-1 exige evidências robustas de reconhecimento extraordinário. O empregador ou agente americano faz a petição. Sem sorteio, sem cap.",
    kit: {
      caminho: "consulado",
      preco: "R$ 197",
    },
    grupos: [
      {
        titulo: "Petição pelo empregador ou agente",
        descricao: "Iniciada por um patrocinador americano antes da entrevista",
        documentos: [
          {
            id: "i129o",
            nome: "Formulário I-129 com classificação O-1",
            descricao:
              "Submetido pelo empregador ou agente ao USCIS com toda a documentação de suporte.",
            agencia: "USCIS",
            formulario: "I-129",
            obrigatorio: true,
          },
          {
            id: "i797",
            nome: "I-797 — Aviso de Aprovação",
            descricao:
              "Confirmação de aprovação da petição O-1 pelo USCIS. Necessário para o visto.",
            agencia: "USCIS",
            formulario: "I-797",
            obrigatorio: true,
          },
          {
            id: "carta-agente",
            nome: "Carta explicativa do agente/empregador",
            descricao:
              "Descrevendo a natureza dos serviços, eventos ou produções, e por que o beneficiário é extraordinário.",
            agencia: "USCIS",
            obrigatorio: true,
          },
          {
            id: "consulta",
            nome: "Consulta de associação da área (Advisory Opinion)",
            descricao:
              "Carta de associação profissional ou sindicato da área confirmando o nível extraordinário. Obrigatório para a maioria das categorias O-1.",
            agencia: "USCIS",
            obrigatorio: true,
          },
        ],
      },
      {
        titulo: "Evidências de habilidade extraordinária",
        descricao:
          "Apresente pelo menos 3 das categorias abaixo (USCIS exige evidências de reconhecimento nacional ou internacional)",
        documentos: [
          {
            id: "premios",
            nome: "Prêmios e reconhecimentos de destaque",
            descricao:
              "Troféus, certificados, prêmios de competições ou associações reconhecidas na área.",
            agencia: "USCIS",
            obrigatorio: false,
          },
          {
            id: "midia",
            nome: "Cobertura de mídia",
            descricao:
              "Artigos em jornais, revistas, sites ou programas de TV que destacam seu trabalho ou realizações.",
            agencia: "USCIS",
            obrigatorio: false,
          },
          {
            id: "salario",
            nome: "Comprovante de salário alto",
            descricao:
              "Contratos ou declarações de renda mostrando remuneração superior à média da área.",
            agencia: "USCIS",
            obrigatorio: false,
          },
          {
            id: "contribuicoes",
            nome: "Contribuições originais de destaque",
            descricao:
              "Publicações, patentes, projetos ou inovações com impacto reconhecido.",
            agencia: "USCIS",
            obrigatorio: false,
          },
          {
            id: "membro-associacoes",
            nome: "Membros em associações de excelência",
            descricao:
              "Participação em organizações que exigem conquistas extraordinárias para ingresso.",
            agencia: "USCIS",
            obrigatorio: false,
          },
        ],
      },
      {
        titulo: "Documentos para a entrevista consular",
        descricao: "Apresentados no consulado americano após aprovação do I-129",
        documentos: [
          {
            id: "ds160",
            nome: "DS-160 — Formulário de visto não-imigrante",
            descricao: "Preenchido após receber o I-797 aprovado.",
            agencia: "DOS",
            formulario: "DS-160",
            obrigatorio: true,
          },
          {
            id: "passaporte",
            nome: "Passaporte válido",
            descricao: "Válido por pelo menos 6 meses além do período de trabalho.",
            agencia: "DOS",
            obrigatorio: true,
          },
          {
            id: "foto",
            nome: "Foto no padrão americano",
            descricao: "5x5 cm, fundo branco.",
            agencia: "DOS",
            obrigatorio: true,
          },
        ],
      },
    ],
  },

  l1: {
    vistoId: "l1",
    codigo: "L-1",
    nome: "Transferência Intracompanhia",
    intro:
      "O L-1 exige que a empresa exista nos dois países e que você tenha trabalhado para ela no exterior por pelo menos 1 ano nos últimos 3 anos, em cargo executivo, gerencial ou especialista.",
    kit: {
      caminho: "consulado",
      preco: "R$ 147",
    },
    grupos: [
      {
        titulo: "Petição da empresa",
        descricao:
          "Iniciada pela empresa americana com documentação da relação entre as entidades",
        documentos: [
          {
            id: "i129l",
            nome: "Formulário I-129 com classificação L",
            descricao:
              "O empregador americano submete ao USCIS documentando a relação entre empresa-mãe e filial/subsidiária.",
            agencia: "USCIS",
            formulario: "I-129",
            obrigatorio: true,
          },
          {
            id: "i797",
            nome: "I-797 — Aviso de Aprovação",
            descricao:
              "Confirmação de aprovação da petição L-1 pelo USCIS.",
            agencia: "USCIS",
            formulario: "I-797",
            obrigatorio: true,
          },
          {
            id: "docs-empresa",
            nome: "Documentos da relação entre empresas",
            descricao:
              "Registros corporativos, estrutura acionária ou contrato que comprove que as entidades nos dois países são parte da mesma organização.",
            agencia: "USCIS",
            obrigatorio: true,
          },
        ],
      },
      {
        titulo: "Comprovação do empregado",
        descricao:
          "Documentos que comprovem o vínculo e cargo na empresa no exterior",
        documentos: [
          {
            id: "carta-empresa",
            nome: "Carta da empresa descrevendo funções",
            descricao:
              "Detalhando o cargo ocupado no exterior, as funções gerenciais/executivas e a proposta nos EUA.",
            agencia: "USCIS",
            obrigatorio: true,
          },
          {
            id: "comprovante-emprego",
            nome: "Comprovantes de 1 ano de trabalho no exterior",
            descricao:
              "Contracheques, contratos de trabalho ou declarações da empresa no exterior confirmando o período.",
            agencia: "USCIS",
            obrigatorio: true,
          },
        ],
      },
      {
        titulo: "Documentos para a entrevista consular",
        descricao: "Apresentados no consulado após aprovação do I-129",
        documentos: [
          {
            id: "ds160",
            nome: "DS-160 — Formulário de visto não-imigrante",
            descricao: "Preenchido após receber o I-797 aprovado.",
            agencia: "DOS",
            formulario: "DS-160",
            obrigatorio: true,
          },
          {
            id: "passaporte",
            nome: "Passaporte válido",
            descricao: "Válido por pelo menos 6 meses além do período de transferência.",
            agencia: "DOS",
            obrigatorio: true,
          },
          {
            id: "foto",
            nome: "Foto no padrão americano",
            descricao: "5x5 cm, fundo branco.",
            agencia: "DOS",
            obrigatorio: true,
          },
        ],
      },
    ],
  },

  eb2niw: {
    vistoId: "eb2niw",
    codigo: "EB-2 NIW",
    nome: "Green Card por Interesse Nacional",
    intro:
      "O EB-2 NIW dispensa patrocínio de empregador — você mesmo submete a petição ao USCIS. O processo pode ser feito dentro dos EUA (Ajuste de Status) ou pelo consulado (Processamento Consular via NVC).",
    kit: {
      caminho: "cos",
      preco: "R$ 347",
    },
    grupos: [
      {
        titulo: "Petição ao USCIS",
        descricao: "Você mesmo submete — não precisa de patrocínio de empregador",
        documentos: [
          {
            id: "i140",
            nome: "Formulário I-140 — Petição de Imigrante",
            descricao:
              "Submetido ao USCIS com todas as evidências de habilidade avançada e interesse nacional. Taxa atual: US$715.",
            agencia: "USCIS",
            formulario: "I-140",
            obrigatorio: true,
          },
          {
            id: "carta-niw",
            nome: "Carta de petição (cover letter)",
            descricao:
              "Argumentando como seu trabalho beneficia os EUA nos termos do teste Matter of Dhanasar (3 critérios).",
            agencia: "USCIS",
            obrigatorio: true,
          },
        ],
      },
      {
        titulo: "Evidências de grau avançado ou habilidade excepcional",
        descricao: "Comprove que você tem grau avançado (mestrado/doutorado) OU habilidade excepcional",
        documentos: [
          {
            id: "diploma",
            nome: "Diploma de mestrado ou doutorado",
            descricao:
              "Traduzido e com avaliação equivalência americana (credential evaluation).",
            agencia: "USCIS",
            obrigatorio: false,
          },
          {
            id: "publicacoes",
            nome: "Publicações acadêmicas ou técnicas",
            descricao:
              "Artigos em revistas revisadas por pares, livros, relatórios técnicos.",
            agencia: "USCIS",
            obrigatorio: false,
          },
          {
            id: "citacoes",
            nome: "Evidências de citações e impacto",
            descricao:
              "Google Scholar ou Web of Science mostrando número de citações e h-index.",
            agencia: "USCIS",
            obrigatorio: false,
          },
          {
            id: "cartas-recomendacao",
            nome: "Cartas de recomendação de especialistas independentes",
            descricao:
              "De professores, pesquisadores ou profissionais de destaque que não são seus colaboradores diretos.",
            agencia: "USCIS",
            obrigatorio: false,
          },
        ],
      },
      {
        titulo: "Ajuste de Status (se já está nos EUA)",
        descricao: "Depois que o I-140 é aprovado e o número de visto está disponível",
        documentos: [
          {
            id: "i485",
            nome: "Formulário I-485 — Pedido de Residência Permanente",
            descricao:
              "Submetido após o I-140 aprovado e número de visto disponível no Boletim de Vistos.",
            agencia: "USCIS",
            formulario: "I-485",
            obrigatorio: false,
          },
          {
            id: "i693",
            nome: "Formulário I-693 — Exame médico",
            descricao:
              "Realizado por médico civil autorizado pelo USCIS (civil surgeon). Inclui vacinas e exame de saúde.",
            agencia: "USCIS",
            formulario: "I-693",
            obrigatorio: false,
          },
          {
            id: "biometria",
            nome: "Biometria (impressões digitais e foto)",
            descricao:
              "Agendada pelo USCIS após submissão do I-485. Realizada em Application Support Center.",
            agencia: "USCIS",
            obrigatorio: false,
          },
        ],
      },
      {
        titulo: "Processamento Consular via NVC (se estiver fora dos EUA)",
        descricao: "Alternativa ao Ajuste de Status — feito pelo consulado com coordenação do NVC",
        documentos: [
          {
            id: "ds260",
            nome: "Formulário DS-260 — Pedido de Visto de Imigrante",
            descricao:
              "Preenchido online no portal do NVC após o caso ser transferido do USCIS.",
            agencia: "NVC",
            formulario: "DS-260",
            obrigatorio: false,
          },
          {
            id: "docs-civis",
            nome: "Documentos civis (certidão de nascimento, casamento, etc.)",
            descricao:
              "Enviados ao NVC para análise antes de agendar entrevista consular. Tradução juramentada obrigatória.",
            agencia: "NVC",
            obrigatorio: false,
          },
        ],
      },
    ],
  },

  "f1-cos": {
    vistoId: "f1-cos",
    codigo: "F-1",
    nome: "Mudança para F-1 (dentro dos EUA)",
    intro: "Você está nos EUA com outro visto e quer mudar para o F-1 sem sair do país. O processo é feito pelo formulário I-539 direto com o USCIS — sem entrevista consular, mas exige status válido no dia do protocolo.",
    kit: {
      caminho: "cos",
      preco: "R$ 247",
      alertaCritico: "Seu status atual precisa estar válido no dia do protocolo. Visto expirado ou status violado bloqueia o I-539.",
    },
    grupos: [
      {
        titulo: "Antes de começar — verificações críticas",
        descricao: "Erros aqui resultam em negação automática",
        documentos: [
          {
            id: "status-valido",
            nome: "Confirmar que você ainda está em status válido",
            descricao: "O I-539 exige que você mantenha status no dia do protocolo. Se seu visto ou status de admissão já venceu, o caminho está fechado. Verifique o I-94 em i94.cbp.dhs.gov.",
            agencia: "USCIS",
            obrigatorio: true,
          },
          {
            id: "escola-proximidade",
            nome: "Confirmar que a escola fica próxima à sua residência",
            descricao: "Escola presencial longe da sua casa é motivo de negação — a USCIS considera o programa implausível. Verifique a distância antes de escolher a instituição.",
            agencia: "USCIS",
            obrigatorio: true,
          },
          {
            id: "escola-sevp",
            nome: "Confirmar que a escola é SEVP-certificada",
            descricao: "Verifique em studyinthestates.dhs.gov. Escola não certificada não pode emitir o I-20 necessário para o I-539.",
            agencia: "USCIS",
            obrigatorio: true,
          },
        ],
      },
      {
        titulo: "Formulário I-539 e documentos da escola",
        descricao: "Core do processo — preenchidos e enviados por correio ao USCIS",
        documentos: [
          {
            id: "i539",
            nome: "Formulário I-539 — Application to Extend/Change Nonimmigrant Status",
            descricao: "Taxa atual: US$370. Enviado por correio (Vermont ou California Service Center conforme seu estado). Não há entrevista — o USCIS analisa o processo internamente.",
            agencia: "USCIS",
            formulario: "I-539",
            obrigatorio: true,
          },
          {
            id: "i20-cos",
            nome: "I-20 assinado pela escola e pelo aluno",
            descricao: "Emitido pela escola SEVP. Conferir SEVIS ID, datas do programa e valor total de recursos exigidos.",
            agencia: "USCIS",
            formulario: "I-20",
            obrigatorio: true,
          },
        ],
      },
      {
        titulo: "Documentação financeira pessoal — ponto crítico",
        descricao: "A USCIS exige prova de acesso pessoal aos fundos — não da empresa ou de terceiros",
        documentos: [
          {
            id: "extrato-pessoal",
            nome: "Extrato bancário pessoal — últimos 6 meses, PDF oficial",
            descricao: "Deve estar no seu nome. Extrato da empresa não é aceito. Print de tela não é aceito. Precisa mostrar saldo médio suficiente para cobrir o programa.",
            agencia: "DOS",
            obrigatorio: true,
          },
          {
            id: "carta-sponsor-cos",
            nome: "Carta de sponsor + comprovante de renda do sponsor",
            descricao: "Se um familiar vai bancar os estudos: carta assinada explicando o vínculo e os valores, mais extrato ou declaração de renda do sponsor. Template incluso no kit.",
            agencia: "DOS",
            obrigatorio: false,
          },
        ],
      },
      {
        titulo: "Provar atividades consistentes com seu status atual",
        descricao: "A USCIS verifica se você realmente estava fazendo o que seu visto autoriza",
        documentos: [
          {
            id: "atividades-b2",
            nome: "Fotos com data e localização ativadas (se veio como B-2)",
            descricao: "Passeios, estadias, eventos — comprova que a intenção original era turismo, não estudar desde o início.",
            agencia: "DOS",
            obrigatorio: false,
          },
          {
            id: "historico-admissoes",
            nome: "Histórico completo de entradas e saídas dos EUA",
            descricao: "Extraído do I-94 em i94.cbp.dhs.gov. Declarar todas as admissões no I-539 Part 2. Omitir qualquer entrada resulta em negação imediata.",
            agencia: "USCIS",
            obrigatorio: true,
          },
        ],
      },
      {
        titulo: "Envio e acompanhamento",
        descricao: "Após reunir toda a documentação",
        documentos: [
          {
            id: "money-order",
            nome: "Money order ou cheque para a taxa de US$370",
            descricao: "Pago à ordem de 'US Department of Homeland Security'. Cheque pessoal também é aceito. Cartão de crédito não.",
            agencia: "USCIS",
            obrigatorio: true,
          },
          {
            id: "i797-recebimento",
            nome: "I-797 — Aviso de recebimento (guarde este documento)",
            descricao: "Enviado pelo USCIS após receber seu I-539. Prova que você protocolou enquanto estava em status. Prazo médio de análise: 4–8 meses.",
            agencia: "USCIS",
            formulario: "I-797",
            obrigatorio: true,
          },
        ],
      },
    ],
  },

  "f1-renovacao": {
    vistoId: "f1-renovacao",
    codigo: "F-1",
    nome: "Renovação, extensão e transferência F-1",
    intro: "Você já tem o F-1 e precisa estender o programa, transferir de escola ou renovar o carimbo do visto para poder viajar. Cada situação tem um caminho diferente — a maioria não envolve o USCIS.",
    kit: {
      caminho: "manutencao",
      preco: "R$ 147",
    },
    grupos: [
      {
        titulo: "Extensão do programa (I-20 vai vencer)",
        descricao: "Feito direto com a escola — sem formulário do USCIS",
        documentos: [
          {
            id: "extensao-i20",
            nome: "Solicitar extensão do I-20 ao DSO antes do vencimento",
            descricao: "O DSO (Designated School Official) atualiza seu registro no SEVIS com a nova data de término. Solicite com pelo menos 30 dias de antecedência. Não há taxa federal para essa operação.",
            agencia: "USCIS",
            obrigatorio: true,
          },
          {
            id: "justificativa-extensao",
            nome: "Justificativa acadêmica ou médica para a extensão",
            descricao: "A extensão exige motivo comprovado: carga horária reduzida, doença, mudança de programa. O DSO documenta isso no SEVIS.",
            agencia: "USCIS",
            obrigatorio: true,
          },
        ],
      },
      {
        titulo: "Transferência para outra escola",
        descricao: "Transferência SEVIS — sem o USCIS, mas com prazo rígido",
        documentos: [
          {
            id: "transfer-sevis",
            nome: "Solicitar transferência SEVIS ao DSO da escola atual",
            descricao: "O DSO libera o SEVIS para a nova escola. Você tem até 15 dias após o encerramento do programa atual para começar na nova instituição.",
            agencia: "USCIS",
            obrigatorio: true,
          },
          {
            id: "i20-nova-escola",
            nome: "I-20 emitido pela nova escola",
            descricao: "A nova escola emite o I-20 após receber a transferência SEVIS. Sem esse documento, a matrícula não ativa o status F-1.",
            agencia: "USCIS",
            formulario: "I-20",
            obrigatorio: true,
          },
        ],
      },
      {
        titulo: "Renovação do carimbo do visto (para viajar)",
        descricao: "Feito no consulado — exige sair dos EUA. Verifique sua situação antes de viajar.",
        documentos: [
          {
            id: "verificar-unlawful-presence",
            nome: "Verificar unlawful presence com seu DSO antes de qualquer viagem",
            descricao: "O visto expirado não afeta seu status F-1 dentro dos EUA, mas sair do país pode disparar barreiras de reentrada de 3 ou 10 anos se houver unlawful presence acumulada. Confirme com seu DSO antes de comprar passagem.",
            agencia: "USCIS",
            obrigatorio: true,
          },
          {
            id: "ds160-renovacao",
            nome: "DS-160 — novo formulário para a entrevista consular",
            descricao: "Preenchido no site do Departamento de Estado. Use os dados do I-20 atual e do programa em andamento.",
            agencia: "DOS",
            formulario: "DS-160",
            obrigatorio: true,
          },
          {
            id: "i20-valido",
            nome: "I-20 válido e assinado pelo DSO",
            descricao: "O I-20 para viagem deve ter a assinatura do DSO emitida nos últimos 12 meses.",
            agencia: "USCIS",
            formulario: "I-20",
            obrigatorio: true,
          },
          {
            id: "comprovante-matricula",
            nome: "Comprovante de matrícula ativa e notas",
            descricao: "Transcript e carta da escola confirmando que você está regularmente matriculado e em dia com o programa.",
            agencia: "DOS",
            obrigatorio: true,
          },
        ],
      },
    ],
  },

  "m1-cos": {
    vistoId: "m1-cos",
    codigo: "M-1",
    nome: "Mudança para M-1 (dentro dos EUA)",
    intro: "Você está nos EUA com outro visto e quer mudar para o M-1 para fazer um curso técnico ou vocacional. O processo usa o mesmo formulário I-539, mas com uma restrição permanente importante: quem entra no M-1 não pode mudar para o F-1 dentro dos EUA depois.",
    kit: {
      caminho: "cos",
      preco: "R$ 247",
      alertaCritico: "Quem entra no M-1 NÃO pode mudar para F-1 dentro dos EUA. Se houver qualquer chance de querer fazer curso acadêmico no futuro, avalie o F-1 antes de escolher o M-1.",
    },
    grupos: [
      {
        titulo: "Antes de começar — restrição permanente",
        descricao: "Leia antes de protocolar",
        documentos: [
          {
            id: "restricao-m1-f1",
            nome: "Confirmar que o M-1 é a escolha definitiva para seu plano",
            descricao: "A restrição M-1 → F-1 dentro dos EUA é prevista em lei e não tem exceção. Se no futuro quiser cursar faculdade, inglês certificado ou qualquer programa acadêmico, precisará sair dos EUA e aplicar o F-1 pelo consulado.",
            agencia: "USCIS",
            obrigatorio: true,
          },
          {
            id: "status-valido-m1",
            nome: "Confirmar que você está em status válido",
            descricao: "Mesma regra do F-1 COS: o I-539 exige status válido no protocolo. Verifique seu I-94 em i94.cbp.dhs.gov.",
            agencia: "USCIS",
            obrigatorio: true,
          },
        ],
      },
      {
        titulo: "Formulário I-539 e documentos da escola técnica",
        descricao: "Taxa US$370 — enviado por correio ao USCIS",
        documentos: [
          {
            id: "i539-m1",
            nome: "Formulário I-539",
            descricao: "Mesmo formulário do F-1 COS. Indique a mudança para M-1 na Part 2. Taxa: US$370 por money order.",
            agencia: "USCIS",
            formulario: "I-539",
            obrigatorio: true,
          },
          {
            id: "i20-m1-cos",
            nome: "I-20 M-1 emitido pela escola técnica SEVP",
            descricao: "A versão M-1 do I-20, emitida pela escola vocacional credenciada. Duração máxima: 1 ano (prorrogável). Confirme que a escola fica próxima à sua residência.",
            agencia: "USCIS",
            formulario: "I-20",
            obrigatorio: true,
          },
        ],
      },
      {
        titulo: "Documentação financeira",
        descricao: "Mesmos critérios do F-1 COS — acesso pessoal comprovado",
        documentos: [
          {
            id: "extrato-pessoal-m1",
            nome: "Extrato bancário pessoal — últimos 6 meses, PDF oficial",
            descricao: "No seu nome. Deve cobrir mensalidade + moradia + despesas de vida pelo período do curso.",
            agencia: "DOS",
            obrigatorio: true,
          },
          {
            id: "carta-sponsor-m1",
            nome: "Carta de sponsor + comprovante de renda (se aplicável)",
            descricao: "Se um familiar vai financiar o curso. Template incluso no kit.",
            agencia: "DOS",
            obrigatorio: false,
          },
        ],
      },
      {
        titulo: "Envio e acompanhamento",
        descricao: "Prazo médio de análise: 4–8 meses",
        documentos: [
          {
            id: "i797-m1",
            nome: "I-797 — Aviso de recebimento",
            descricao: "Enviado pelo USCIS após receber o I-539. Prova que você protocolou em status. Guarde este documento. Premium Processing disponível: I-907 (US$1.965) para análise em 15 dias úteis.",
            agencia: "USCIS",
            formulario: "I-797",
            obrigatorio: true,
          },
        ],
      },
    ],
  },

  b1: {
    vistoId: "b1",
    codigo: "B-1",
    nome: "Visitante de Negócios",
    intro:
      "O B-1 é para visitas de negócios — reuniões, contratos, treinamentos. Não autoriza trabalho remunerado. O processo é direto: DS-160 + entrevista.",
    kit: {
      caminho: "consulado",
      preco: "R$ 97",
    },
    grupos: [
      {
        titulo: "Formulários obrigatórios",
        descricao: "Preenchidos antes da entrevista consular",
        documentos: [
          {
            id: "ds160",
            nome: "DS-160 — Formulário de visto não-imigrante",
            descricao: "Preenchido no site do Departamento de Estado.",
            agencia: "DOS",
            formulario: "DS-160",
            obrigatorio: true,
          },
        ],
      },
      {
        titulo: "Documentos do propósito de negócios",
        descricao: "Comprovando a finalidade da viagem",
        documentos: [
          {
            id: "carta-convite",
            nome: "Carta de convite da empresa americana",
            descricao:
              "Descrevendo o propósito das reuniões, eventos ou negociações.",
            agencia: "DOS",
            obrigatorio: true,
          },
          {
            id: "carta-empresa-br",
            nome: "Carta da empresa brasileira",
            descricao:
              "Confirmando seu cargo, o propósito da viagem e que as despesas serão cobertas.",
            agencia: "DOS",
            obrigatorio: true,
          },
          {
            id: "agenda",
            nome: "Agenda ou itinerário da viagem",
            descricao:
              "Datas de reuniões, eventos ou conferências com os nomes e endereços das empresas visitadas.",
            agencia: "DOS",
            obrigatorio: false,
          },
        ],
      },
      {
        titulo: "Documentos pessoais",
        descricao: "Apresentados na entrevista consular",
        documentos: [
          {
            id: "passaporte",
            nome: "Passaporte válido",
            descricao: "Válido por pelo menos 6 meses além da data de retorno.",
            agencia: "DOS",
            obrigatorio: true,
          },
          {
            id: "foto",
            nome: "Foto no padrão americano",
            descricao: "5x5 cm, fundo branco.",
            agencia: "DOS",
            obrigatorio: true,
          },
          {
            id: "financeiro",
            nome: "Comprovante financeiro",
            descricao:
              "Extratos bancários mostrando recursos suficientes para a viagem.",
            agencia: "DOS",
            obrigatorio: true,
          },
          {
            id: "vinculo",
            nome: "Comprovante de vínculo com o Brasil",
            descricao:
              "Contrato de trabalho, escritura de imóvel, família — qualquer documento que comprove que você tem razões para voltar.",
            agencia: "DOS",
            obrigatorio: true,
          },
        ],
      },
    ],
  },
  "h1b-cos": {
    vistoId: "h1b-cos",
    codigo: "H-1B",
    nome: "H-1B Change of Status (dentro dos EUA)",
    intro:
      "Você está nos EUA e seu empregador quer mudar seu status para H-1B sem você sair do país. O processo é idêntico ao H-1B consular — mas em vez de entrevista, o USCIS aprova o I-129 com COS e emite o I-797 com nova data de início de status.",
    kit: {
      caminho: "cos",
      preco: "R$ 197",
      alertaCritico: "Somente o empregador pode protocolar o I-129. Você fornece documentos, o employer e o advogado fazem a petição.",
    },
    grupos: [
      {
        titulo: "O que o funcionário precisa reunir para o empregador",
        descricao: "Documentos que você entrega ao RH ou ao advogado do empregador",
        documentos: [
          {
            id: "diploma-h1b-cos",
            nome: "Diploma e histórico acadêmico",
            descricao:
              "Cópia do diploma de bacharel ou equivalente na área de especialidade. Com tradução juramentada se em português.",
            agencia: "USCIS",
            obrigatorio: true,
          },
          {
            id: "curriculo-h1b-cos",
            nome: "Currículo profissional detalhado",
            descricao:
              "Listando experiências anteriores na área especializada. O advogado usa para construir o argumento de especialidade.",
            agencia: "USCIS",
            obrigatorio: true,
          },
          {
            id: "historico-trabalho",
            nome: "Histórico de empregos anteriores",
            descricao:
              "Cartas de emprego, contracheques ou declarações de empregadores anteriores comprovando experiência na especialidade.",
            agencia: "USCIS",
            obrigatorio: true,
          },
          {
            id: "passaporte-h1b-cos",
            nome: "Cópia do passaporte e do I-94",
            descricao:
              "Para que o advogado confirme status atual e histórico de admissões. Extraia o I-94 em i94.cbp.dhs.gov.",
            agencia: "USCIS",
            obrigatorio: true,
          },
          {
            id: "status-atual-cos",
            nome: "Documentos do status atual (ex: I-20, visto, I-797)",
            descricao:
              "Cópias de todos os documentos de status imigratório atual. O advogado precisa confirmar que você está em status válido.",
            agencia: "USCIS",
            obrigatorio: true,
          },
        ],
      },
      {
        titulo: "O que esperar do processo",
        descricao: "Etapas conduzidas pelo empregador e pelo advogado — você acompanha, não executa",
        documentos: [
          {
            id: "lca-cos",
            nome: "LCA — Labor Condition Application (DOL)",
            descricao:
              "O empregador submete ao Departamento do Trabalho. Aprovação em ~7 dias úteis. Define salário mínimo e local de trabalho.",
            agencia: "DOL",
            obrigatorio: true,
          },
          {
            id: "i129-cos",
            nome: "Formulário I-129 com COS — submetido pelo empregador",
            descricao:
              "O empregador envia ao USCIS com a LCA aprovada e seu pacote de documentos. Se aprovado com COS, o USCIS emite o I-797 autorizando o novo status.",
            agencia: "USCIS",
            formulario: "I-129",
            obrigatorio: true,
          },
          {
            id: "i797-cos",
            nome: "I-797 — Aprovação com Change of Status",
            descricao:
              "Confirma que seu status mudou para H-1B dentro dos EUA. Guarde este documento — substitui o carimbo de visto para fins de status interno.",
            agencia: "USCIS",
            formulario: "I-797",
            obrigatorio: true,
          },
        ],
      },
      {
        titulo: "Documentos de suporte à petição",
        descricao: "Fortalecem o caso — especialmente úteis se a petição for contestada",
        documentos: [
          {
            id: "cartas-rec-h1b",
            nome: "Cartas de recomendação profissional",
            descricao:
              "De gestores ou colegas sêniores descrevendo suas funções especializadas. Ajudam a demonstrar que o cargo é de especialidade.",
            agencia: "USCIS",
            obrigatorio: false,
          },
          {
            id: "portfolio-h1b",
            nome: "Portfólio ou amostras de trabalho",
            descricao:
              "Projetos, relatórios, código ou qualquer material que ilustre a natureza especializada do trabalho.",
            agencia: "USCIS",
            obrigatorio: false,
          },
          {
            id: "comprovante-salario-atual",
            nome: "Comprovantes de salário atual",
            descricao:
              "Contracheques dos últimos 3 meses ou declaração do empregador atual confirmando remuneração.",
            agencia: "USCIS",
            obrigatorio: false,
          },
        ],
      },
    ],
  },

  "o1-cos": {
    vistoId: "o1-cos",
    codigo: "O-1",
    nome: "O-1 Change of Status (dentro dos EUA)",
    intro:
      "Você está nos EUA e quer mudar seu status para O-1 sem sair do país. O empregador ou agente americano submete o I-129 com COS ao USCIS. Autônomos e freelancers precisam de um agente americano — sem agente, não há petição.",
    kit: {
      caminho: "cos",
      preco: "R$ 197",
      alertaCritico: "Você precisa de um empregador ou agente americano para protocolar o I-129. Autônomos precisam de um agente.",
    },
    grupos: [
      {
        titulo: "Evidências de habilidade extraordinária (foco em COS)",
        descricao: "Apresente pelo menos 3 das categorias — mesmas do O-1 consular, mas narrativa adaptada para COS",
        documentos: [
          {
            id: "premios-cos",
            nome: "Prêmios e reconhecimentos de destaque",
            descricao:
              "Troféus, certificados, prêmios de competições ou associações reconhecidas na área.",
            agencia: "USCIS",
            obrigatorio: false,
          },
          {
            id: "midia-cos",
            nome: "Cobertura de mídia",
            descricao:
              "Artigos em jornais, revistas, sites ou programas de TV que destacam seu trabalho ou realizações.",
            agencia: "USCIS",
            obrigatorio: false,
          },
          {
            id: "salario-alto-cos",
            nome: "Comprovante de remuneração alta",
            descricao:
              "Contratos ou declarações de renda mostrando remuneração superior à média da área.",
            agencia: "USCIS",
            obrigatorio: false,
          },
          {
            id: "contribuicoes-cos",
            nome: "Contribuições originais de destaque",
            descricao:
              "Publicações, patentes, projetos ou inovações com impacto reconhecido.",
            agencia: "USCIS",
            obrigatorio: false,
          },
          {
            id: "membros-cos",
            nome: "Membros em associações de excelência",
            descricao:
              "Participação em organizações que exigem conquistas extraordinárias para ingresso.",
            agencia: "USCIS",
            obrigatorio: false,
          },
        ],
      },
      {
        titulo: "Documentos pessoais para o empregador/agente",
        descricao: "Entregues ao seu empregador ou agente americano para montar a petição",
        documentos: [
          {
            id: "passaporte-o1-cos",
            nome: "Cópia do passaporte e do I-94",
            descricao:
              "Confirma identidade e status imigratório atual. Extraia o I-94 em i94.cbp.dhs.gov.",
            agencia: "USCIS",
            obrigatorio: true,
          },
          {
            id: "docs-status-o1",
            nome: "Documentos do status atual (visto, I-797, I-20, etc.)",
            descricao:
              "Cópias de todos os documentos de status imigratório. O USCIS precisa confirmar que você está em status válido.",
            agencia: "USCIS",
            obrigatorio: true,
          },
          {
            id: "contrato-oferta-o1",
            nome: "Contrato ou carta de oferta do empregador/agente",
            descricao:
              "Descrevendo os serviços, projetos ou eventos para os quais você foi contratado nos EUA.",
            agencia: "USCIS",
            obrigatorio: true,
          },
        ],
      },
      {
        titulo: "Advisory Opinion da associação da área",
        descricao: "Exigido pelo USCIS para a maioria das categorias O-1",
        documentos: [
          {
            id: "advisory-opinion",
            nome: "Carta da associação profissional ou sindicato da área",
            descricao:
              "Confirmando que seu trabalho é reconhecido como extraordinário no setor. O agente ou advogado normalmente coordena essa solicitação.",
            agencia: "USCIS",
            obrigatorio: true,
          },
        ],
      },
      {
        titulo: "Contrato ou carta de oferta",
        descricao: "Documentação formal da relação de trabalho nos EUA",
        documentos: [
          {
            id: "contrato-formal-o1",
            nome: "Contrato assinado entre você e o empregador/agente",
            descricao:
              "Especificando escopo, prazo e remuneração. Pode ser um contrato de prestação de serviços se você for freelancer com agente.",
            agencia: "USCIS",
            obrigatorio: true,
          },
          {
            id: "i797-o1-cos",
            nome: "I-797 — Aprovação com Change of Status",
            descricao:
              "Emitido após aprovação do I-129 com COS. Confirma a mudança de status para O-1 dentro dos EUA.",
            agencia: "USCIS",
            formulario: "I-797",
            obrigatorio: true,
          },
        ],
      },
    ],
  },

  "l1-cos": {
    vistoId: "l1-cos",
    codigo: "L-1",
    nome: "L-1 Change of Status (dentro dos EUA)",
    intro:
      "Você está nos EUA com outro status e sua empresa quer regularizar sua situação como L-1 sem que você saia do país. A empresa nos EUA e no exterior precisam ter relação corporativa comprovada, e você precisa ter trabalhado na empresa no exterior por pelo menos 1 ano nos últimos 3 anos.",
    kit: {
      caminho: "cos",
      preco: "R$ 147",
      alertaCritico: "A empresa nos EUA e no exterior precisam ter relação corporativa comprovada (subsidiária, afiliada ou empresa-mãe).",
    },
    grupos: [
      {
        titulo: "Documentos do funcionário para a empresa",
        descricao: "Você entrega esses documentos ao RH ou advogado da empresa para montar a petição",
        documentos: [
          {
            id: "passaporte-l1-cos",
            nome: "Cópia do passaporte e do I-94",
            descricao:
              "Confirma identidade e status atual. Extraia o I-94 em i94.cbp.dhs.gov.",
            agencia: "USCIS",
            obrigatorio: true,
          },
          {
            id: "docs-status-l1",
            nome: "Documentos do status imigratório atual",
            descricao:
              "Cópias do visto atual, I-797 ou I-20, conforme aplicável. O advogado confirma que você está em status válido.",
            agencia: "USCIS",
            obrigatorio: true,
          },
          {
            id: "carta-funcoes-l1",
            nome: "Carta da empresa descrevendo cargo e funções",
            descricao:
              "Detalhando o cargo no exterior (gerencial, executivo ou especialista), as responsabilidades e a proposta de função nos EUA.",
            agencia: "USCIS",
            obrigatorio: true,
          },
        ],
      },
      {
        titulo: "Comprovação de 1 ano de trabalho no exterior",
        descricao: "Exigência central do L-1 — sem ela o pedido não avança",
        documentos: [
          {
            id: "contracheques-exterior",
            nome: "Contracheques ou comprovantes de salário no exterior",
            descricao:
              "Dos últimos 3 anos, mostrando pelo menos 12 meses contínuos de trabalho na empresa estrangeira.",
            agencia: "USCIS",
            obrigatorio: true,
          },
          {
            id: "contrato-exterior",
            nome: "Contrato de trabalho ou carta da empresa estrangeira",
            descricao:
              "Confirmando datas de início e término, cargo e tipo de relação empregatícia.",
            agencia: "USCIS",
            obrigatorio: true,
          },
          {
            id: "registros-empresa-ext",
            nome: "Registros corporativos da empresa no exterior",
            descricao:
              "Documentos que comprovem a existência legal da empresa estrangeira e sua relação com a entidade americana.",
            agencia: "USCIS",
            obrigatorio: true,
          },
        ],
      },
      {
        titulo: "Descrição do cargo gerencial, executivo ou especialista",
        descricao: "O cargo nos EUA deve se encaixar em uma dessas três categorias — o advogado documenta isso no I-129",
        documentos: [
          {
            id: "descricao-cargo-eua",
            nome: "Descrição detalhada do cargo nos EUA",
            descricao:
              "Responsabilidades, subordinados (se gerencial), decisões estratégicas (se executivo) ou conhecimento especializado (se especialista). Documento crítico para aprovação.",
            agencia: "USCIS",
            obrigatorio: true,
          },
          {
            id: "i129-l1-cos",
            nome: "Formulário I-129 com classificação L e COS",
            descricao:
              "Submetido pelo empregador americano ao USCIS com toda a documentação. Se aprovado com COS, você recebe o I-797 com novo status.",
            agencia: "USCIS",
            formulario: "I-129",
            obrigatorio: true,
          },
          {
            id: "i797-l1-cos",
            nome: "I-797 — Aprovação com Change of Status",
            descricao:
              "Confirma a mudança de status para L-1 dentro dos EUA. Guarde este documento.",
            agencia: "USCIS",
            formulario: "I-797",
            obrigatorio: true,
          },
        ],
      },
    ],
  },

  "j1-extensao": {
    vistoId: "j1-extensao",
    codigo: "J-1",
    nome: "Extensão do J-1 via patrocinador",
    intro:
      "Extensão do programa J-1 — feita pelo patrocinador no SEVIS, sem necessidade de novo formulário do USCIS ou do Departamento de Estado.",
    kit: {
      caminho: "manutencao",
      preco: "R$ 97",
    },
    grupos: [
      {
        titulo: "Solicitar extensão ao patrocinador antes do vencimento do DS-2019",
        descricao: "O patrocinador atualiza o SEVIS — você não envia nada ao USCIS ou ao consulado",
        documentos: [
          {
            id: "solicitar-extensao-j1",
            nome: "Solicitação formal de extensão ao patrocinador",
            descricao:
              "Entre em contato com o patrocinador (Responsible Officer) antes do vencimento do DS-2019. Cada programa tem prazo mínimo de aviso — geralmente 30 a 60 dias antes.",
            agencia: "DOS",
            obrigatorio: true,
          },
          {
            id: "justificativa-extensao-j1",
            nome: "Justificativa para a extensão",
            descricao:
              "Carta ou formulário do patrocinador exigindo motivo válido: conclusão do programa, aprovação acadêmica ou continuidade de projeto. O patrocinador define os critérios.",
            agencia: "DOS",
            obrigatorio: true,
          },
        ],
      },
      {
        titulo: "Verificar a regra dos 2 anos antes de qualquer mudança de status",
        descricao: "Importante antes de planejar qualquer próximo passo imigratório",
        documentos: [
          {
            id: "regra-2-anos-check",
            nome: "Verificar se seu programa está sujeito à regra dos 2 anos",
            descricao:
              "Alguns programas J-1 exigem retorno ao país de origem por 2 anos antes de mudar para outro status ou obter green card. Confirme com seu patrocinador (Responsible Officer) ou consulte o DS-2019 — o campo 'Exchange Visitor Subject to Two-Year Rule' indica se a restrição se aplica.",
            agencia: "DOS",
            obrigatorio: true,
          },
          {
            id: "waiver-j1",
            nome: "Waiver da regra dos 2 anos (se aplicável)",
            descricao:
              "Se você estiver sujeito à regra e quiser mudar de status sem sair dos EUA, precisará de um waiver. Os caminhos incluem: interesse do governo americano, hardship excepcional ao cônjuge/filho americano, ou objeção do país de origem.",
            agencia: "DOS",
            obrigatorio: false,
          },
        ],
      },
      {
        titulo: "DS-2019 atualizado",
        descricao: "Documento central da extensão — emitido pelo patrocinador",
        documentos: [
          {
            id: "ds2019-atualizado",
            nome: "DS-2019 com nova data de término",
            descricao:
              "Emitido pelo patrocinador após aprovação da extensão no SEVIS. Guarde o DS-2019 original e o novo — ambos podem ser solicitados futuramente.",
            agencia: "DOS",
            formulario: "DS-2019",
            obrigatorio: true,
          },
        ],
      },
    ],
  },

  "eb2niw-brasil": {
    vistoId: "eb2niw-brasil",
    codigo: "EB-2 NIW",
    nome: "EB-2 NIW — Processamento Consular (fora dos EUA)",
    intro:
      "Para quem está fora dos EUA: após a aprovação do I-140 pelo USCIS, o processo segue pelo NVC (National Visa Center) até a entrevista consular no Brasil.",
    kit: {
      caminho: "consulado",
      preco: "R$ 297",
    },
    grupos: [
      {
        titulo: "I-140 aprovado — base de tudo",
        descricao: "Sem o I-140 aprovado, o processo consular não começa",
        documentos: [
          {
            id: "i140-aprovado",
            nome: "I-140 aprovado pelo USCIS",
            descricao:
              "A petição de imigrante deve estar aprovada antes de qualquer passo consular. Se ainda não submeteu o I-140, esse é o primeiro passo.",
            agencia: "USCIS",
            formulario: "I-140",
            obrigatorio: true,
          },
          {
            id: "boletim-vistos",
            nome: "Verificar disponibilidade de número de visto no Visa Bulletin",
            descricao:
              "O Visa Bulletin do Departamento de Estado (publicado mensalmente) indica se um número de visto está disponível para a sua categoria e país de nascimento. Para brasileiros no EB-2, verifique a coluna 'All Chargeability Areas Except Those Listed'.",
            agencia: "DOS",
            obrigatorio: true,
          },
        ],
      },
      {
        titulo: "Registro no NVC e DS-260",
        descricao: "Após o USCIS transferir o caso ao NVC, você receberá um número de caso",
        documentos: [
          {
            id: "nvc-registro",
            nome: "Criar conta e registrar caso no portal do NVC (CEAC)",
            descricao:
              "O NVC envia um aviso por e-mail com o número de caso. Acesse ceac.state.gov para criar o perfil e pagar as taxas de agendamento.",
            agencia: "NVC",
            obrigatorio: true,
          },
          {
            id: "ds260",
            nome: "DS-260 — Formulário de Pedido de Visto de Imigrante",
            descricao:
              "Preenchido online no portal CEAC. Formulário longo — dedique pelo menos 2 horas. Após enviar, não pode ser editado sem entrar em contato com o NVC.",
            agencia: "NVC",
            formulario: "DS-260",
            obrigatorio: true,
          },
          {
            id: "taxa-affidavit",
            nome: "Pagamento das taxas do NVC",
            descricao:
              "Taxa de processamento do formulário IV (US$325) e taxa do Affidavit of Support (US$120), pagas no portal CEAC.",
            agencia: "NVC",
            obrigatorio: true,
          },
        ],
      },
      {
        titulo: "Documentos civis com tradução juramentada",
        descricao: "Enviados ao NVC antes de agendar a entrevista consular",
        documentos: [
          {
            id: "cert-nascimento-br",
            nome: "Certidão de nascimento (original + tradução juramentada)",
            descricao:
              "Original em português + tradução juramentada para o inglês. O NVC aceita cópias certificadas — não precisa ser o documento original.",
            agencia: "NVC",
            obrigatorio: true,
          },
          {
            id: "cert-casamento-br",
            nome: "Certidão de casamento (se aplicável)",
            descricao:
              "Original + tradução juramentada. Se divorciado, inclua também a certidão de divórcio.",
            agencia: "NVC",
            obrigatorio: false,
          },
          {
            id: "antecedentes-br",
            nome: "Certidão de antecedentes criminais",
            descricao:
              "Emitida pela Polícia Federal do Brasil e pelos estados onde você residiu por mais de 6 meses após os 16 anos. Cada certidão precisa de tradução juramentada.",
            agencia: "NVC",
            obrigatorio: true,
          },
        ],
      },
      {
        titulo: "Exame médico",
        descricao: "Realizado por médico autorizado pelo Departamento de Estado no Brasil",
        documentos: [
          {
            id: "medico-autorizado",
            nome: "Agendar exame com médico civil autorizado (Panel Physician)",
            descricao:
              "No Brasil, os médicos autorizados estão no Rio de Janeiro e em São Paulo. Liste os médicos em travel.state.gov. O exame inclui: raio-X, exame de sangue, histórico vacinal e avaliação geral.",
            agencia: "DOS",
            obrigatorio: true,
          },
          {
            id: "ds5540",
            nome: "DS-5540 — Health History and Physical Examination",
            descricao:
              "Preenchido pelo médico durante o exame. Fica em envelope lacrado e é entregue por você na entrevista consular. Não abra o envelope.",
            agencia: "DOS",
            formulario: "DS-5540",
            obrigatorio: true,
          },
          {
            id: "cartao-vacinas",
            nome: "Cartão de vacinas",
            descricao:
              "Leve o cartão completo para o médico verificar. Vacinas faltantes são aplicadas no mesmo dia — isso pode aumentar o custo do exame.",
            agencia: "DOS",
            obrigatorio: true,
          },
        ],
      },
      {
        titulo: "Entrevista no consulado americano no Brasil",
        descricao: "Etapa final — conduzida no consulado após o NVC aprovar toda a documentação",
        documentos: [
          {
            id: "agendamento-consular",
            nome: "Agendamento da entrevista consular via portal do NVC",
            descricao:
              "O NVC notifica quando você pode agendar. Consulados com visto de imigrante no Brasil: São Paulo e Rio de Janeiro.",
            agencia: "DOS",
            obrigatorio: true,
          },
          {
            id: "passaporte-entrevista",
            nome: "Passaporte válido",
            descricao:
              "Válido por pelo menos 6 meses além da data prevista de entrada nos EUA.",
            agencia: "DOS",
            obrigatorio: true,
          },
          {
            id: "foto-consular",
            nome: "Foto no padrão americano",
            descricao: "5x5 cm, fundo branco, tirada nos últimos 6 meses.",
            agencia: "DOS",
            obrigatorio: true,
          },
          {
            id: "ds260-confirmacao",
            nome: "Página de confirmação do DS-260",
            descricao:
              "Impressa após o envio do formulário no portal CEAC. O oficial consular verifica no sistema.",
            agencia: "DOS",
            obrigatorio: true,
          },
        ],
      },
    ],
  },

  e2: {
    vistoId: "e2",
    codigo: "E-2",
    nome: "Visto de Investidor",
    intro:
      "O E-2 é um visto de investidor para nacionais de países com tratado de amizade e comércio com os EUA. Exige investimento substancial em um negócio americano e participação ativa na gestão.",
    kit: {
      caminho: "consulado",
      preco: "R$ 347",
      alertaCritico: "O E-2 NÃO está disponível para brasileiros. Disponível para nacionais de países com tratado com os EUA: Portugal, Alemanha, França, Itália, Espanha, Japão, Coreia do Sul, entre outros.",
    },
    grupos: [
      {
        titulo: "Elegibilidade e requisitos básicos",
        descricao: "Confirme antes de iniciar qualquer documentação",
        documentos: [
          {
            id: "nacionalidade-tratado",
            nome: "Confirmar nacionalidade de país com tratado E-2",
            descricao:
              "Você precisa ser nacional de um país que tenha tratado de investimento com os EUA. A lista está em travel.state.gov. Brasileiros não são elegíveis.",
            agencia: "DOS",
            obrigatorio: true,
          },
          {
            id: "investimento-substancial",
            nome: "Confirmar valor do investimento (geralmente US$100k+)",
            descricao:
              "O USCIS e o consulado não fixam um valor mínimo, mas o investimento deve ser 'substancial' em relação ao custo total do negócio. Para negócios de baixo custo, valores menores podem ser aceitos se representarem proporção alta do total.",
            agencia: "DOS",
            obrigatorio: true,
          },
          {
            id: "propriedade-empresa",
            nome: "Confirmar propriedade de pelo menos 50% da empresa",
            descricao:
              "Você precisa ser o principal investidor e ter controle efetivo da empresa. Sócios minoritários não se qualificam como titular E-2.",
            agencia: "DOS",
            obrigatorio: true,
          },
          {
            id: "papel-ativo",
            nome: "Confirmar papel ativo na gestão da empresa",
            descricao:
              "O E-2 não é para investidores passivos. Você precisa dirigir e desenvolver o negócio ativamente.",
            agencia: "DOS",
            obrigatorio: true,
          },
        ],
      },
      {
        titulo: "Documentos do investimento",
        descricao: "Comprovam que o dinheiro foi comprometido e investido no negócio americano",
        documentos: [
          {
            id: "contrato-compra-empresa",
            nome: "Contrato de compra/venda da empresa ou investimento",
            descricao:
              "Se comprou uma empresa existente: contrato de compra e venda assinado. Se criou uma nova: contrato social, registros corporativos e comprovante de capitalização.",
            agencia: "DOS",
            obrigatorio: true,
          },
          {
            id: "extratos-transferencia",
            nome: "Extratos bancários mostrando transferência dos fundos",
            descricao:
              "Comprovando que o dinheiro saiu da sua conta pessoal e entrou na empresa americana. O rastro financeiro precisa ser completo e claro.",
            agencia: "DOS",
            obrigatorio: true,
          },
          {
            id: "origem-fundos",
            nome: "Prova de origem lícita dos fundos",
            descricao:
              "Declarações de imposto de renda, escrituras, contratos de venda de imóvel ou empresa, herança documentada — qualquer fonte que explique de onde veio o dinheiro investido.",
            agencia: "DOS",
            obrigatorio: true,
          },
          {
            id: "avaliacao-empresa",
            nome: "Avaliação de mercado da empresa (se comprou negócio existente)",
            descricao:
              "Feita por avaliador independente. Ajuda a demonstrar que o investimento é substancial em relação ao valor total do negócio.",
            agencia: "DOS",
            obrigatorio: false,
          },
        ],
      },
      {
        titulo: "Documentos da empresa",
        descricao: "Comprovam que a empresa é real, ativa e com potencial de crescimento",
        documentos: [
          {
            id: "plano-negocios",
            nome: "Plano de negócios detalhado (projeção de 5 anos)",
            descricao:
              "Incluindo projeções financeiras, estratégia de crescimento, número de empregos gerados para americanos e análise de mercado. Um dos documentos mais importantes da petição.",
            agencia: "DOS",
            obrigatorio: true,
          },
          {
            id: "registros-corporativos",
            nome: "Registros corporativos da empresa americana",
            descricao:
              "Articles of Incorporation, Operating Agreement (LLC) ou Bylaws (Corp), e evidência de registro no estado.",
            agencia: "DOS",
            obrigatorio: true,
          },
          {
            id: "alvara",
            nome: "Alvará de funcionamento (business license)",
            descricao:
              "Emitido pelo município ou condado onde a empresa opera. Comprova que a empresa está legalmente autorizada a funcionar.",
            agencia: "DOS",
            obrigatorio: true,
          },
          {
            id: "projecoes-financeiras",
            nome: "Projeções financeiras e extratos da empresa",
            descricao:
              "Se a empresa já opera: extratos bancários da empresa e declarações de imposto (Form 1120 ou 1065). Se é nova: projeções elaboradas por contador.",
            agencia: "DOS",
            obrigatorio: true,
          },
        ],
      },
      {
        titulo: "DS-160 e entrevista consular",
        descricao: "Etapa final do processo — agendada no consulado americano do seu país",
        documentos: [
          {
            id: "ds160-e2",
            nome: "DS-160 — Formulário de visto não-imigrante",
            descricao:
              "Preenchido no site do Departamento de Estado. Selecione a categoria E-2 no campo de tipo de visto.",
            agencia: "DOS",
            formulario: "DS-160",
            obrigatorio: true,
          },
          {
            id: "passaporte-e2",
            nome: "Passaporte válido",
            descricao: "Válido por pelo menos 6 meses além do período de validade do visto.",
            agencia: "DOS",
            obrigatorio: true,
          },
          {
            id: "foto-e2",
            nome: "Foto no padrão americano",
            descricao: "5x5 cm, fundo branco, tirada nos últimos 6 meses.",
            agencia: "DOS",
            obrigatorio: true,
          },
          {
            id: "taxa-mrv",
            nome: "Comprovante de pagamento da taxa MRV",
            descricao:
              "Taxa de solicitação de visto não-imigrante paga no site do consulado. Guarde o comprovante para agendar a entrevista.",
            agencia: "DOS",
            obrigatorio: true,
          },
        ],
      },
      {
        titulo: "Renovação do E-2",
        descricao: "O E-2 pode ser renovado indefinidamente — desde que o investimento e a empresa estejam ativos",
        documentos: [
          {
            id: "comprovante-operacao",
            nome: "Comprovante de que a empresa continua em operação",
            descricao:
              "Extratos bancários recentes, declarações de imposto, contratos ativos, folha de pagamento de funcionários — qualquer evidência de que a empresa está funcionando.",
            agencia: "DOS",
            obrigatorio: true,
          },
          {
            id: "ds160-renovacao-e2",
            nome: "Novo DS-160 para renovação",
            descricao:
              "A renovação do E-2 é feita pelo consulado — não pelo USCIS. Você precisa agendar nova entrevista consular.",
            agencia: "DOS",
            formulario: "DS-160",
            obrigatorio: true,
          },
          {
            id: "plano-negocios-atualizado",
            nome: "Plano de negócios atualizado",
            descricao:
              "Com resultados reais vs. projeções anteriores e planos para os próximos anos. Mostra que o negócio está crescendo e cumprindo o propósito original do E-2.",
            agencia: "DOS",
            obrigatorio: true,
          },
        ],
      },
    ],
  },
};

export default checklists;
