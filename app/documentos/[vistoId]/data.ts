export type Agencia = "USCIS" | "NVC" | "DOS" | "DOL" | "EOIR" | "CBP";

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
  // When set, this item has an interactive PT-BR filler that exports the
  // official form in English (see lib/forms/*). Links to
  // /documentos/[vistoId]/formulario/[formId].
  formId?: string;
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
            nome: "DS-160 — Formulário de visto não-imigrante (colinha disponível)",
            descricao:
              "Preenchido no site do Departamento de Estado. Leva de 1 a 2 horas. Guarde o número de confirmação.",
            agencia: "DOS",
            formulario: "DS-160",
            formId: "ds-160",
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
            nome: "DS-160 — Formulário de visto não-imigrante (colinha disponível)",
            descricao:
              "Preenchido no site do Departamento de Estado antes de agendar entrevista.",
            agencia: "DOS",
            formulario: "DS-160",
            formId: "ds-160",
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
            nome: "DS-160 — Formulário de visto não-imigrante (colinha disponível)",
            descricao: "Preenchido online no site do Departamento de Estado.",
            agencia: "DOS",
            formulario: "DS-160",
            formId: "ds-160",
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
            nome: "DS-160 — Formulário de visto não-imigrante (colinha disponível)",
            descricao:
              "Preenchido após receber o I-797 aprovado. Use a data de início da petição como data de atividade.",
            agencia: "DOS",
            formulario: "DS-160",
            formId: "ds-160",
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
            nome: "DS-160 — Formulário de visto não-imigrante (colinha disponível)",
            descricao: "Preenchido após receber o I-797 aprovado.",
            agencia: "DOS",
            formulario: "DS-160",
            formId: "ds-160",
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
            nome: "DS-160 — Formulário de visto não-imigrante (colinha disponível)",
            descricao: "Preenchido após receber o I-797 aprovado.",
            agencia: "DOS",
            formulario: "DS-160",
            formId: "ds-160",
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
            id: "i20-cos",
            nome: "I-20 assinado pela escola e pelo aluno",
            descricao: "Emitido pela escola SEVP. Conferir SEVIS ID, datas do programa e valor total de recursos exigidos.",
            agencia: "USCIS",
            formulario: "I-20",
            obrigatorio: true,
          },
          {
            id: "i901-cos",
            nome: "Comprovante de pagamento da taxa SEVIS (I-901)",
            descricao: "Obrigatória mesmo por dentro dos EUA: US$350 pagos em fmjfee.com com o SEVIS ID do I-20, ANTES de enviar o I-539.",
            agencia: "USCIS",
            formulario: "I-901",
            obrigatorio: true,
          },
          {
            id: "i539",
            nome: "Formulário I-539 — Application to Extend/Change Nonimmigrant Status",
            descricao: "Taxa atual: US$370. Enviado por correio (Vermont ou California Service Center conforme seu estado). Não há entrevista — o USCIS analisa o processo internamente.",
            agencia: "USCIS",
            formulario: "I-539",
            formId: "i-539",
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
            formId: "ds-160",
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

  "f1-opt": {
    vistoId: "f1-opt",
    codigo: "F-1",
    nome: "OPT — autorização de trabalho (I-765)",
    intro: "Você concluiu (ou vai concluir) o curso e quer trabalhar na sua área com o OPT. O pedido vai ao USCIS pelo Formulário I-765, com a recomendação de OPT do seu DSO no I-20. Aqui você preenche o I-765 em português e exporta o formulário oficial em inglês.",
    kit: {
      caminho: "manutencao",
      preco: "R$ 147",
    },
    grupos: [
      {
        titulo: "Formulário do USCIS",
        descricao: "Preencha em português e exporte o formulário oficial em inglês",
        documentos: [
          {
            id: "i765",
            nome: "I-765 — Pedido de Autorização de Trabalho",
            descricao: "O formulário do EAD para o OPT. Preencha aqui em português; o immigrei exporta o PDF oficial preenchido em inglês para você conferir, assinar e enviar.",
            agencia: "USCIS",
            formulario: "I-765",
            formId: "i-765",
            obrigatorio: true,
          },
        ],
      },
      {
        titulo: "Documentos da escola",
        descricao: "Emitidos pelo seu DSO — sem eles o USCIS nega o OPT",
        documentos: [
          {
            id: "i20-opt",
            nome: "I-20 com a recomendação de OPT do DSO",
            descricao: "O DSO registra a recomendação de OPT no SEVIS e emite um I-20 novo com essa anotação. O pedido do I-765 precisa ser enviado dentro de 30 dias após essa recomendação.",
            agencia: "USCIS",
            formulario: "I-20",
            obrigatorio: true,
          },
        ],
      },
      {
        titulo: "Comprovantes para anexar ao I-765",
        descricao: "Enviados junto do formulário",
        documentos: [
          {
            id: "foto-passport",
            nome: "2 fotos padrão passaporte (EUA)",
            descricao: "Fotos coloridas 2x2 polegadas, tiradas nos últimos 30 dias.",
            agencia: "USCIS",
            obrigatorio: true,
          },
          {
            id: "i94-opt",
            nome: "Cópia do I-94 mais recente",
            descricao: "Baixe em i94.cbp.dhs.gov. Comprova sua entrada e status atual.",
            agencia: "USCIS",
            obrigatorio: true,
          },
          {
            id: "passport-opt",
            nome: "Cópia do passaporte e do visto F-1",
            descricao: "Página de identificação do passaporte (válido) e o carimbo/visto F-1.",
            agencia: "USCIS",
            obrigatorio: true,
          },
          {
            id: "ead-anterior",
            nome: "Cópia de EAD anterior (se já teve)",
            descricao: "Se você já teve um EAD antes, inclua frente e verso. Se nunca teve, pule.",
            agencia: "USCIS",
            obrigatorio: false,
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
            id: "i20-m1-cos",
            nome: "I-20 M-1 emitido pela escola técnica SEVP",
            descricao: "A versão M-1 do I-20, emitida pela escola vocacional credenciada. Duração máxima: 1 ano (prorrogável). Confirme que a escola fica próxima à sua residência.",
            agencia: "USCIS",
            formulario: "I-20",
            obrigatorio: true,
          },
          {
            id: "i901-m1-cos",
            nome: "Comprovante de pagamento da taxa SEVIS (I-901)",
            descricao: "Obrigatória mesmo por dentro dos EUA: US$350 pagos em fmjfee.com com o SEVIS ID do I-20, ANTES de enviar o I-539.",
            agencia: "USCIS",
            formulario: "I-901",
            obrigatorio: true,
          },
          {
            id: "i539-m1",
            nome: "Formulário I-539",
            descricao: "Mesmo formulário do F-1 COS. Indique a mudança para M-1 na Part 2. Taxa: US$370 por money order.",
            agencia: "USCIS",
            formulario: "I-539",
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
            nome: "DS-160 — Formulário de visto não-imigrante (colinha disponível)",
            descricao: "Preenchido no site do Departamento de Estado.",
            agencia: "DOS",
            formulario: "DS-160",
            formId: "ds-160",
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
            nome: "DS-160 — Formulário de visto não-imigrante (colinha disponível)",
            descricao:
              "Preenchido no site do Departamento de Estado. Selecione a categoria E-2 no campo de tipo de visto.",
            agencia: "DOS",
            formulario: "DS-160",
            formId: "ds-160",
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
            formId: "ds-160",
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

  e1: {
    vistoId: "e1",
    codigo: "E-1",
    nome: "Visto de Comerciante por Tratado",
    intro:
      "O E-1 é para nacionais de países com tratado de comércio com os EUA que mantêm comércio internacional substancial e contínuo com os americanos — exportação, importação, serviços, tecnologia.",
    kit: {
      caminho: "consulado",
      preco: "R$ 347",
      alertaCritico:
        "O E-1 NÃO está disponível para brasileiros — o Brasil não tem tratado de comércio e navegação com os EUA. Disponível para nacionais de países com tratado (lista em travel.state.gov), incluindo brasileiros com dupla cidadania qualificante.",
    },
    grupos: [
      {
        titulo: "Elegibilidade e requisitos básicos",
        descricao: "Confirme antes de iniciar qualquer documentação",
        documentos: [
          {
            id: "nacionalidade-tratado",
            nome: "Confirmar nacionalidade de país com tratado E-1",
            descricao:
              "Você precisa ser nacional de um país com tratado de comércio e navegação com os EUA. A lista está em travel.state.gov. Brasileiros não são elegíveis — dupla cidadania de país com tratado qualifica.",
            agencia: "DOS",
            obrigatorio: true,
          },
          {
            id: "comercio-substancial",
            nome: "Confirmar comércio substancial e contínuo com os EUA",
            descricao:
              "Fluxo contínuo de transações internacionais entre a sua empresa e os EUA. O número de transações pesa mais que o valor individual de cada uma — não há valor mínimo legal.",
            agencia: "DOS",
            obrigatorio: true,
          },
          {
            id: "comercio-principal",
            nome: "Confirmar que 50%+ do comércio internacional é com os EUA",
            descricao:
              "Mais da metade do volume de comércio internacional da empresa precisa ser entre os EUA e o país do tratado. Comércio com outros países não conta para esse percentual.",
            agencia: "DOS",
            obrigatorio: true,
          },
        ],
      },
      {
        titulo: "Documentos do comércio",
        descricao: "Comprovam o fluxo real e contínuo de transações com os EUA",
        documentos: [
          {
            id: "contratos-comercio",
            nome: "Contratos, faturas e conhecimentos de embarque",
            descricao:
              "Histórico de transações com clientes/fornecedores americanos: contratos assinados, invoices, bills of lading, comprovantes de pagamento internacional.",
            agencia: "DOS",
            obrigatorio: true,
          },
          {
            id: "demonstrativos-volume",
            nome: "Demonstrativo do volume de comércio por país",
            descricao:
              "Planilha ou relatório contábil separando o comércio internacional por destino, comprovando que os EUA respondem por mais de 50% do volume.",
            agencia: "DOS",
            obrigatorio: true,
          },
          {
            id: "registros-empresa",
            nome: "Registros corporativos e composição societária",
            descricao:
              "Documentos da empresa mostrando que 50%+ da propriedade é de nacionais do país do tratado.",
            agencia: "DOS",
            obrigatorio: true,
          },
        ],
      },
      {
        titulo: "Aplicação consular",
        descricao: "O E-1 de fora dos EUA é sempre pelo consulado",
        documentos: [
          {
            id: "ds-160",
            nome: "Formulário DS-160 preenchido",
            descricao: "Aplicação online de visto não-imigrante, com foto e confirmação impressa.",
            agencia: "DOS",
            formulario: "DS-160",
            formId: "ds-160",
            obrigatorio: true,
          },
          {
            id: "ds-156e",
            nome: "Formulário DS-156E (aplicação de tratado)",
            descricao:
              "Formulário específico das categorias E, com os dados da empresa, do comércio e do aplicante.",
            agencia: "DOS",
            formulario: "DS-156E",
            obrigatorio: true,
          },
          {
            id: "entrevista-consular",
            nome: "Entrevista na seção de vistos E do consulado",
            descricao:
              "Consulados têm filas próprias para vistos de tratado. A empresa e o fluxo de comércio são o centro da conversa.",
            agencia: "DOS",
            obrigatorio: true,
          },
        ],
      },
    ],
  },

  esta: {
    vistoId: "esta",
    codigo: "ESTA",
    nome: "Autorização de Viagem (Visa Waiver Program)",
    intro:
      "O ESTA é a autorização eletrônica para cidadãos de países do Visa Waiver Program visitarem os EUA por até 90 dias sem visto. Não vale para brasileiros — o Brasil não participa do programa.",
    kit: {
      caminho: "consulado",
      preco: "R$ 97",
      alertaCritico:
        "O Brasil NÃO participa do Visa Waiver Program — brasileiros usam o visto B-1/B-2. O ESTA vale para cidadãos dos ~40 países participantes (Europa Ocidental, Japão, Coreia do Sul, Austrália, Chile, entre outros). Os 90 dias não se estendem e não permitem mudança de status.",
    },
    grupos: [
      {
        titulo: "Elegibilidade",
        descricao: "Confirme antes de aplicar",
        documentos: [
          {
            id: "nacionalidade-vwp",
            nome: "Confirmar cidadania de país do Visa Waiver Program",
            descricao:
              "A lista oficial está em travel.state.gov. Dupla cidadania ou visitas anteriores a certos países (Cuba desde 2021; Irã, Iraque, Coreia do Norte, Síria e outros desde 2011) removem a elegibilidade — nesses casos, o caminho é o visto B no consulado.",
            agencia: "DOS",
            obrigatorio: true,
          },
          {
            id: "epassport",
            nome: "Passaporte eletrônico (e-passport) válido",
            descricao:
              "Obrigatório ter passaporte com chip eletrônico (símbolo na capa), válido por pelo menos 6 meses além da data planejada de saída dos EUA.",
            agencia: "CBP",
            obrigatorio: true,
          },
          {
            id: "proposito-visita",
            nome: "Confirmar que o propósito cabe numa visita",
            descricao:
              "Turismo, reuniões de negócios, conferências — o mesmo escopo do visto B. Estudar, trabalhar ou morar exigem o visto da categoria certa; entrar pelo VWP com outro plano é declaração falsa na entrada.",
            agencia: "CBP",
            obrigatorio: true,
          },
        ],
      },
      {
        titulo: "Aplicação e viagem",
        descricao: "O ESTA é 100% online, direto com o CBP",
        documentos: [
          {
            id: "colinha-esta",
            nome: "Colinha — respostas prontas para colar no esta.cbp.dhs.gov",
            descricao:
              "Responda em português aqui, receba um resumo bilíngue com o que digitar em cada tela do ESTA — o preenchimento oficial continua sendo feito por você, direto no site do CBP.",
            agencia: "CBP",
            formulario: "ESTA",
            formId: "esta",
            obrigatorio: false,
          },
          {
            id: "aplicacao-esta",
            nome: "Aplicação ESTA no site oficial do CBP",
            descricao:
              "Somente em esta.cbp.dhs.gov (cuidado com sites intermediários que cobram a mais). Aplique assim que começar a planejar a viagem — a aprovação costuma sair em minutos, mas pode levar até 72h.",
            agencia: "CBP",
            obrigatorio: true,
          },
          {
            id: "regra-90-dias",
            nome: "Entender o limite inegociável de 90 dias",
            descricao:
              "A estadia máxima é 90 dias, sem extensão e sem mudança de status por dentro. Passar do prazo remove a elegibilidade futura ao VWP e inicia presença irregular automaticamente.",
            agencia: "CBP",
            obrigatorio: true,
          },
          {
            id: "validade-esta",
            nome: "Conferir a validade do ESTA antes de cada viagem",
            descricao:
              "A autorização vale para múltiplas entradas por até 2 anos (ou até o passaporte vencer, o que vier primeiro). Novo passaporte = novo ESTA.",
            agencia: "CBP",
            obrigatorio: false,
          },
        ],
      },
    ],
  },
  "familia-ir": {
    vistoId: "familia-ir",
    codigo: "IR-1/IR-2",
    nome: "Família de Cidadão Americano (via consular)",
    intro:
      "Cônjuges, filhos e pais de cidadãos americanos são parentes imediatos — não entram em fila de espera. O processo tem duas fases: a petição I-130 no USCIS (protocolada pelo cidadão) e depois o visto de imigrante no consulado (DS-260 via NVC).",
    kit: {
      caminho: "consulado",
      preco: "R$ 247",
      alertaCritico:
        "Quem protocola a I-130 é o parente cidadão americano (o peticionário) — não o imigrante. E enquanto o processo consular corre, pedir visto de turista ou tentar entrar nos EUA pode ser negado por intenção imigratória declarada.",
    },
    grupos: [
      {
        titulo: "Se você está fora de status hoje",
        descricao: "Overstay ou entrada pelo ESTA/VWP mudam o processo — mas parente imediato de cidadão tem uma exceção real",
        documentos: [
          {
            id: "familiair-overstay",
            nome: "Overstay: a exceção do parente imediato (INA §245(a))",
            descricao:
              "Cônjuge, pai/mãe ou filho(a) solteiro(a) menor de 21 de cidadão americano que entrou nos EUA com inspeção pode ajustar o status por dentro (I-130 + I-485 concorrentes), mesmo com overstay. Como você não sai do país, as barras de 3/10 anos (INA §212(a)(9)(B)) nunca disparam. A forma de entrada e as provas do vínculo genuíno decidem o caso — vale reunir isso com um profissional antes de protocolar.",
            agencia: "USCIS",
            obrigatorio: false,
          },
          {
            id: "familiair-esta",
            nome: "Entrou pelo ESTA/VWP: regra dos 90 dias e prova de intenção",
            descricao:
              "Quem entra com ESTA/Visa Waiver Program e decide ajustar o status por casamento com cidadão precisa cuidar da aparência de intenção imigratória na entrada — ajustar rápido demais (nos primeiros 90 dias) pode levantar suspeita de má-fé na entrada. Documentar quando o relacionamento e a decisão de casar realmente começaram é essencial.",
            agencia: "CBP",
            obrigatorio: false,
          },
        ],
      },
      {
        titulo: "Fase 1 — Petição I-130 no USCIS",
        descricao: "Protocolada pelo parente cidadão americano; prova o vínculo familiar",
        documentos: [
          {
            id: "i130",
            nome: "Formulário I-130 — quem preenche é o PARENTE cidadão/green card (peticionário)",
            descricao:
              "Preenchido e assinado pelo peticionário — o parente que É cidadão ou residente. Taxa atual: US$675 em papel ou US$625 online (my.uscis.gov). Cada beneficiário exige uma I-130 própria.",
            agencia: "USCIS",
            formulario: "I-130",
            formId: "i-130",
            obrigatorio: true,
          },
          {
            id: "i130a",
            nome: "Formulário I-130A — quem preenche é QUEM VAI RECEBER o green card (cônjuge beneficiário)",
            descricao:
              "Obrigatório somente quando o beneficiário é cônjuge — acompanha a I-130 no mesmo envelope. Filhos e pais não precisam. Se o beneficiário mora fora dos EUA, preenche mas não precisa assinar.",
            agencia: "USCIS",
            formulario: "I-130A",
            formId: "i-130a",
            obrigatorio: false,
          },
          {
            id: "prova-cidadania",
            nome: "Prova de cidadania do peticionário",
            descricao:
              "Cópia do passaporte americano, certidão de nascimento nos EUA ou certificado de naturalização.",
            agencia: "USCIS",
            obrigatorio: true,
          },
          {
            id: "certidoes-vinculo",
            nome: "Certidões que provam o vínculo",
            descricao:
              "Certidão de casamento (cônjuge) ou de nascimento (filho/pai). Documentos brasileiros precisam de tradução certificada para o inglês.",
            agencia: "USCIS",
            obrigatorio: true,
          },
          {
            id: "prova-relacionamento",
            nome: "Prova de relacionamento genuíno (casos de cônjuge)",
            descricao:
              "Fotos juntos, contas conjuntas, contrato de aluguel, mensagens ao longo do tempo. O USCIS avalia se o casamento é de boa-fé — capriche nesta parte.",
            agencia: "USCIS",
            obrigatorio: false,
          },
          {
            id: "g1145",
            nome: "Formulário G-1145 — aviso por e-mail/SMS quando o USCIS receber (opcional)",
            descricao:
              "Grampeie na frente do pacote da I-130 para saber por e-mail/SMS quando o USCIS aceitar — não substitui o recibo oficial I-797C, que chega pelo correio.",
            agencia: "USCIS",
            formulario: "G-1145",
            formId: "g-1145",
            obrigatorio: false,
          },
        ],
      },
      {
        titulo: "Fase 2 — NVC e visto de imigrante (DS-260)",
        descricao: "Depois da aprovação da I-130, o caso vai ao National Visa Center",
        documentos: [
          {
            id: "ds260",
            nome: "Formulário DS-260 — Immigrant Visa Application",
            descricao:
              "Preenchido online no portal CEAC (ceac.state.gov) pelo imigrante, após pagar as taxas do NVC (US$325 do visto + US$120 do Affidavit of Support).",
            agencia: "DOS",
            formulario: "DS-260",
            obrigatorio: true,
          },
          {
            id: "i864",
            nome: "Formulário I-864 — quem preenche é o PARENTE cidadão/green card (patrocinador)",
            descricao:
              "O peticionário assume responsabilidade financeira pelo imigrante. Exige renda de pelo menos 125% da linha de pobreza — se não alcançar, um co-patrocinador (joint sponsor) pode assinar outro I-864.",
            agencia: "USCIS",
            formulario: "I-864",
            formId: "i-864",
            obrigatorio: true,
          },
          {
            id: "i485",
            nome: "Formulário I-485 — quem preenche é QUEM VAI RECEBER o green card (se já estiver nos EUA)",
            descricao:
              "Rota alternativa ao DS-260: se o beneficiário está DENTRO dos EUA em situação elegível, pede o ajuste de status com o I-485 em vez do processo consular. O wizard cobre as 14 partes, incluindo as 86 perguntas de elegibilidade da Parte 9.",
            agencia: "USCIS",
            formulario: "I-485",
            formId: "i-485",
            obrigatorio: false,
          },
          {
            id: "i765aos",
            nome: "Formulário I-765 (c)(9) — permissão de TRABALHO enquanto o I-485 corre",
            descricao:
              "Só para quem escolheu a rota do I-485 (dentro dos EUA): o EAD categoria (c)(9) permite trabalhar legalmente enquanto o ajuste está pendente. Protocolado junto com o I-485, sem taxa adicional.",
            agencia: "USCIS",
            formulario: "I-765",
            formId: "i-765-aos",
            obrigatorio: false,
          },
          {
            id: "i131",
            nome: "Formulário I-131 — permissão de VIAGEM enquanto o I-485 corre (advance parole)",
            descricao:
              "Opcional, só para a rota do I-485. A regra geral é: protocolou o ajuste, fica nos EUA até o fim. O advance parole existe para emergências (só viaje com ele aprovado e em mãos — sair sem ele = pedido abandonado). Quem tem tempo de permanência irregular não deve viajar de jeito nenhum, nem com o parole: a saída pode ativar as barras de 3/10 anos.",
            agencia: "USCIS",
            formulario: "I-131",
            formId: "i-131",
            obrigatorio: false,
          },
          {
            id: "documentos-civis",
            nome: "Documentos civis do imigrante",
            descricao:
              "Certidão de nascimento, antecedentes criminais (certidão da Polícia Federal), certidão de casamento e divórcios anteriores, passaporte válido — enviados ao NVC pelo CEAC.",
            agencia: "DOS",
            obrigatorio: true,
          },
        ],
      },
      {
        titulo: "Fase 3 — Exame médico e entrevista",
        descricao: "Marcados depois que o NVC declara o caso documentarily complete",
        documentos: [
          {
            id: "exame-medico",
            nome: "Exame médico com médico credenciado",
            descricao:
              "Somente com os médicos autorizados pelo consulado (lista no site da embaixada). No Brasil, feito no Rio de Janeiro ou São Paulo poucos dias antes da entrevista.",
            agencia: "DOS",
            obrigatorio: true,
          },
          {
            id: "entrevista-consular",
            nome: "Entrevista consular de visto de imigrante",
            descricao:
              "No Brasil, entrevistas de visto de imigrante acontecem no Consulado do Rio de Janeiro. Leve todos os originais das certidões enviadas ao NVC.",
            agencia: "DOS",
            obrigatorio: true,
          },
          {
            id: "taxa-uscis-imigrante",
            nome: "USCIS Immigrant Fee (US$235)",
            descricao:
              "Paga online após o visto aprovado e ANTES de viajar — é ela que gera o Green Card físico depois da entrada.",
            agencia: "USCIS",
            obrigatorio: true,
          },
        ],
      },
    ],
  },

  "k1": {
    vistoId: "k1",
    codigo: "K-1",
    nome: "Noivo(a) de Cidadão Americano",
    intro:
      "O visto K-1 é para quem vai se CASAR nos EUA em até 90 dias após a entrada — não é um visto de casamento em si, é um visto de noivado. O processo tem três fases: a petição I-129F no USCIS (protocolada pelo cidadão), o visto K-1 no consulado (DS-160), e depois o casamento + ajuste de status (I-485) dentro do prazo de 90 dias.",
    kit: {
      caminho: "consulado",
      preco: "R$ 247",
      alertaCritico:
        "O casamento precisa acontecer dentro de 90 dias da entrada nos EUA — sem prorrogação. Se não casar nesse prazo, o status K-1 vence e não pode ser trocado por outro visto; a pessoa precisa deixar os EUA. Depois de casar, o ajuste de status (I-485) é obrigatório e não é automático.",
    },
    grupos: [
      {
        titulo: "Se você já está nos EUA hoje (overstay ou ESTA/VWP)",
        descricao: "O K-1 é para quem vai entrar de FORA dos EUA — se você já está aqui, pode não ser a rota certa",
        documentos: [
          {
            id: "k1-ja-nos-eua",
            nome: "Já está nos EUA com o prazo vencido ou entrou pelo ESTA/VWP?",
            descricao:
              "O K-1 pressupõe entrada consular vindo de fora — não é possível 'trocar' pra K-1 estando já nos EUA. Se você já está aqui e é noivo(a) de cidadão americano, casar agora e ajustar o status por dentro (I-130 + I-485 concorrentes) costuma ser o caminho mais realista — mesma exceção de parente imediato do INA §245(a) que já vale para cônjuges. Veja o kit Família de Cidadão Americano (IR-1/IR-2) e avalie com um profissional qual dos dois se aplica ao seu caso.",
            agencia: "USCIS",
            obrigatorio: false,
          },
        ],
      },
      {
        titulo: "Fase 1 — Petição I-129F no USCIS",
        descricao: "Protocolada pelo cidadão americano; prova o noivado genuíno e o encontro pessoal recente",
        documentos: [
          {
            id: "i129f",
            nome: "Formulário I-129F — quem preenche é o CIDADÃO AMERICANO (peticionário)",
            descricao:
              "Preenchido e assinado pelo peticionário. Taxa atual: US$675. Exige prova de encontro pessoal com o(a) noivo(a) nos últimos 2 anos — reúna fotos, passagens e carimbos de passaporte antes de começar.",
            agencia: "USCIS",
            formulario: "I-129F",
            formId: "i-129f",
            obrigatorio: true,
          },
          {
            id: "g1145",
            nome: "Formulário G-1145 — aviso por e-mail/SMS quando o USCIS receber (opcional)",
            descricao:
              "Grampeie na frente do pacote da I-129F para saber por e-mail/SMS quando o USCIS aceitar.",
            agencia: "USCIS",
            formulario: "G-1145",
            formId: "g-1145",
            obrigatorio: false,
          },
          {
            id: "prova-cidadania",
            nome: "Prova de cidadania do peticionário",
            descricao:
              "Cópia do passaporte americano, certidão de nascimento nos EUA ou certificado de naturalização.",
            agencia: "USCIS",
            obrigatorio: true,
          },
          {
            id: "prova-encontro",
            nome: "Prova de encontro pessoal nos últimos 2 anos",
            descricao:
              "Passagens aéreas, carimbos de entrada/saída no passaporte, fotos juntos com data. Sem isso (ou uma exceção bem documentada), a petição é negada.",
            agencia: "USCIS",
            obrigatorio: true,
          },
          {
            id: "declaracao-solteiro",
            nome: "Declaração de que ambos estão livres para casar",
            descricao:
              "Certidões de divórcio ou óbito de casamentos anteriores, se houver — tanto do peticionário quanto do(a) noivo(a).",
            agencia: "USCIS",
            obrigatorio: false,
          },
        ],
      },
      {
        titulo: "Fase 2 — Visto K-1 no consulado",
        descricao: "Depois da aprovação da I-129F, o caso vai ao NVC e depois ao consulado no Brasil",
        documentos: [
          {
            id: "ds160",
            nome: "Formulário DS-160 — Online Nonimmigrant Visa Application",
            descricao:
              "Preenchido online pelo(a) noivo(a) no site do CEAC antes da entrevista consular.",
            agencia: "DOS",
            formulario: "DS-160",
            formId: "ds-160",
            obrigatorio: true,
          },
          {
            id: "exame-medico-k1",
            nome: "Exame médico com médico credenciado",
            descricao:
              "Somente com os médicos autorizados pelo consulado — no Brasil, feito no Rio de Janeiro ou São Paulo antes da entrevista.",
            agencia: "DOS",
            obrigatorio: true,
          },
          {
            id: "entrevista-k1",
            nome: "Entrevista consular de visto K-1",
            descricao:
              "No Brasil, entrevistas de visto de não-imigrante acontecem no Consulado do Rio de Janeiro, São Paulo, Recife, Porto Alegre ou Brasília, conforme o distrito.",
            agencia: "DOS",
            obrigatorio: true,
          },
          {
            id: "documentos-civis-k1",
            nome: "Documentos civis do(a) noivo(a)",
            descricao:
              "Certidão de nascimento, antecedentes criminais (certidão da Polícia Federal), passaporte válido, certidões de divórcio anteriores.",
            agencia: "DOS",
            obrigatorio: true,
          },
        ],
      },
      {
        titulo: "Fase 3 — Casamento e ajuste de status (90 dias)",
        descricao: "Depois da entrada nos EUA com o visto K-1 — o relógio dos 90 dias já está correndo",
        documentos: [
          {
            id: "casamento-civil",
            nome: "Casamento civil dentro de 90 dias",
            descricao:
              "O casamento precisa acontecer dentro dos 90 dias da entrada — sem exceção nem prorrogação. Guarde a certidão de casamento americana, ela é peça central do próximo passo.",
            agencia: "CBP",
            obrigatorio: true,
          },
          {
            id: "i485-k1",
            nome: "Formulário I-485 — ajuste de status depois de casar",
            descricao:
              "Preenchido pelo cônjuge (ex-noivo(a)) depois do casamento, para trocar o status K-1 por green card. Não é automático — sem esse pedido, o status K-1 vence e vira permanência irregular.",
            agencia: "USCIS",
            formulario: "I-485",
            formId: "i-485",
            obrigatorio: true,
          },
          {
            id: "i765-k1",
            nome: "Formulário I-765 (c)(9) — permissão de trabalho enquanto o I-485 corre",
            descricao: "Protocolado junto com o I-485, sem taxa adicional.",
            agencia: "USCIS",
            formulario: "I-765",
            formId: "i-765-aos",
            obrigatorio: false,
          },
          {
            id: "i864-k1",
            nome: "Formulário I-864 — quem preenche é o CIDADÃO (patrocinador)",
            descricao:
              "O cônjuge cidadão assume responsabilidade financeira. Exige renda de pelo menos 125% da linha de pobreza.",
            agencia: "USCIS",
            formulario: "I-864",
            formId: "i-864",
            obrigatorio: true,
          },
        ],
      },
    ],
  },

  "family-gc": {
    vistoId: "family-gc",
    codigo: "F2A/F2B",
    nome: "Cônjuge ou Filho de Residente Permanente",
    intro:
      "Diferente de família de cidadão americano, cônjuge e filho solteiro de quem já tem Green Card entram numa categoria de preferência (F2A ou F2B) — com fila numérica de verdade. O processo tem três fases: a petição I-130 no USCIS (protocolada pelo titular do Green Card), a espera até a data de prioridade ficar current, e só então o visto de imigrante (consulado) ou o ajuste de status (dentro dos EUA).",
    kit: {
      caminho: "consulado",
      preco: "R$ 247",
      alertaCritico:
        "Quem protocola a I-130 é o TITULAR do Green Card (o peticionário) — não o beneficiário. E, ao contrário de família de cidadão, aqui existe fila real: nada acontece na Fase 3 antes da data de prioridade da I-130 ficar current no Boletim de Vistos, categoria F2A ou F2B, para o país de nascimento do beneficiário.",
    },
    grupos: [
      {
        titulo: "Fase 1 — Petição I-130 no USCIS",
        descricao: "Protocolada pelo titular do Green Card; prova o vínculo familiar e o próprio status de residente",
        documentos: [
          {
            id: "i130-fgc",
            nome: "Formulário I-130 — quem preenche é o TITULAR do Green Card (peticionário)",
            descricao:
              "Preenchido e assinado pelo peticionário — o parente que já tem Green Card. Cada beneficiário exige uma I-130 própria. Confira a taxa atual em uscis.gov/i-130.",
            agencia: "USCIS",
            formulario: "I-130",
            formId: "i-130",
            obrigatorio: true,
          },
          {
            id: "i130a-fgc",
            nome: "Formulário I-130A — quem preenche é O CÔNJUGE beneficiário",
            descricao:
              "Obrigatório somente na categoria F2A (cônjuge) — acompanha a I-130 no mesmo envelope. Filhos (F2A ou F2B) não precisam.",
            agencia: "USCIS",
            formulario: "I-130A",
            formId: "i-130a",
            obrigatorio: false,
          },
          {
            id: "prova-green-card",
            nome: "Prova do Green Card do peticionário",
            descricao: "Cópia da frente e verso do cartão de residente permanente válido.",
            agencia: "USCIS",
            obrigatorio: true,
          },
          {
            id: "certidoes-vinculo-fgc",
            nome: "Certidões que provam o vínculo",
            descricao:
              "Certidão de casamento (F2A cônjuge) ou de nascimento (F2A/F2B filho), com tradução certificada se em português. Filho F2B precisa provar que continua solteiro.",
            agencia: "USCIS",
            obrigatorio: true,
          },
          {
            id: "g1145-fgc",
            nome: "Formulário G-1145 — aviso por e-mail/SMS quando o USCIS receber (opcional)",
            descricao: "Grampeie na frente do pacote da I-130 para saber por e-mail/SMS quando o USCIS aceitar.",
            agencia: "USCIS",
            formulario: "G-1145",
            formId: "g-1145",
            obrigatorio: false,
          },
        ],
      },
      {
        titulo: "Fase 2 — Aguardar a data de prioridade",
        descricao: "Não há o que protocolar aqui — é acompanhar o Boletim de Vistos até a categoria F2A/F2B ficar current",
        documentos: [
          {
            id: "acompanhar-bulletin",
            nome: "Acompanhar a categoria F2A ou F2B no Boletim de Vistos",
            descricao:
              "A data de prioridade é a data em que a I-130 foi protocolada. Quando ela fica \"current\" na categoria certa (para o país de nascimento do beneficiário), a Fase 3 pode começar. F2A costuma andar mais rápido que F2B.",
            agencia: "DOS",
            obrigatorio: true,
          },
          {
            id: "manter-endereco-atualizado",
            nome: "Manter endereço e contato atualizados no NVC",
            descricao:
              "Depois da aprovação da I-130, o caso já fica registrado no National Visa Center — atualize endereço se mudar, para não perder a notificação quando a data virar current.",
            agencia: "DOS",
            obrigatorio: false,
          },
        ],
      },
      {
        titulo: "Fase 3 — Visto de imigrante (DS-260) ou ajuste de status (I-485)",
        descricao: "Só começa depois que a data de prioridade está current",
        documentos: [
          {
            id: "ds260-fgc",
            nome: "Formulário DS-260 — Immigrant Visa Application",
            descricao: "Preenchido online no portal CEAC pelo beneficiário, se estiver fora dos EUA.",
            agencia: "DOS",
            formulario: "DS-260",
            obrigatorio: false,
          },
          {
            id: "i485-fgc",
            nome: "Formulário I-485 — se o beneficiário já estiver nos EUA em status válido",
            descricao:
              "Rota alternativa ao DS-260: ajuste de status dentro dos EUA, só possível quando a data de prioridade já está current E o beneficiário está em situação elegível.",
            agencia: "USCIS",
            formulario: "I-485",
            formId: "i-485",
            obrigatorio: false,
          },
          {
            id: "i864-fgc",
            nome: "Formulário I-864 — quem preenche é o TITULAR do Green Card (patrocinador)",
            descricao: "Exige renda de pelo menos 125% da linha de pobreza — se não alcançar, um co-patrocinador pode assinar outro I-864.",
            agencia: "USCIS",
            formulario: "I-864",
            formId: "i-864",
            obrigatorio: true,
          },
          {
            id: "documentos-civis-fgc",
            nome: "Documentos civis do beneficiário",
            descricao: "Certidão de nascimento, antecedentes criminais, passaporte válido — para o consulado ou para o I-485.",
            agencia: "DOS",
            obrigatorio: true,
          },
        ],
      },
    ],
  },

  "eb5": {
    vistoId: "eb5",
    codigo: "EB-5",
    nome: "Green Card por Investimento",
    intro:
      "O EB-5 dá Green Card direto a quem investe capital próprio em negócio americano que crie empregos — sem patrocinador, sem oferta de emprego. O processo tem três fases: a petição inicial (I-526E, para investimento via Regional Center, ou I-526 para negócio próprio direto), o Green Card condicional de 2 anos, e a remoção das condições (I-829) provando que o investimento e os empregos se concretizaram de verdade.",
    kit: {
      caminho: "consulado",
      preco: "R$ 297",
      alertaCritico:
        "A parte que mais atrasa o caso é a origem lícita do capital — documentar de onde veio o dinheiro (herança, venda de empresa, poupança) exige tempo. Comece a organizar essa documentação antes de escolher o projeto.",
    },
    grupos: [
      {
        titulo: "Fase 1 — Petição inicial (I-526E ou I-526)",
        descricao: "Prova a origem do capital e o plano de negócio que vai gerar os empregos",
        documentos: [
          {
            id: "i526e",
            nome: "Formulário I-526E — investimento via Regional Center",
            descricao:
              "Para quem investe num projeto de terceiros (Regional Center) — o formato mais comum hoje. Não existe preenchimento automático ainda; monte o dossiê com o time do projeto e um advogado de imigração.",
            agencia: "USCIS",
            formulario: "I-526E",
            obrigatorio: false,
          },
          {
            id: "i526",
            nome: "Formulário I-526 — investimento direto (negócio próprio)",
            descricao: "Para quem estrutura e opera o próprio negócio nos EUA, sem Regional Center.",
            agencia: "USCIS",
            formulario: "I-526",
            obrigatorio: false,
          },
          {
            id: "prova-origem-capital",
            nome: "Prova da origem lícita do capital",
            descricao:
              "Documentação completa de onde veio o dinheiro investido — declarações de imposto de renda, contratos de venda, escrituras, extratos bancários com o histórico da movimentação.",
            agencia: "USCIS",
            obrigatorio: true,
          },
          {
            id: "plano-negocio-eb5",
            nome: "Plano de negócio e prova de criação de empregos",
            descricao: "Projeção de pelo menos 10 empregos em tempo integral para trabalhadores americanos, documentada conforme o tipo de projeto.",
            agencia: "USCIS",
            obrigatorio: true,
          },
        ],
      },
      {
        titulo: "Fase 2 — Green Card condicional (2 anos)",
        descricao: "Via ajuste de status (se já nos EUA em status válido) ou processo consular pelo NVC",
        documentos: [
          {
            id: "i485-eb5",
            nome: "Formulário I-485 — se já estiver nos EUA em status válido",
            descricao: "Ajuste de status depois da aprovação do I-526E/I-526.",
            agencia: "USCIS",
            formulario: "I-485",
            formId: "i-485",
            obrigatorio: false,
          },
          {
            id: "ds260-eb5",
            nome: "Formulário DS-260 — se estiver fora dos EUA",
            descricao: "Processo consular via NVC, alternativo ao ajuste de status.",
            agencia: "DOS",
            formulario: "DS-260",
            obrigatorio: false,
          },
          {
            id: "i131-eb5",
            nome: "Formulário I-131 — permissão de viagem enquanto o I-485 corre (opcional)",
            descricao: "Só para quem escolheu o ajuste de status dentro dos EUA.",
            agencia: "USCIS",
            formulario: "I-131",
            formId: "i-131",
            obrigatorio: false,
          },
          {
            id: "i765-eb5",
            nome: "Formulário I-765 (c)(9) — permissão de trabalho enquanto o I-485 corre (opcional)",
            descricao: "Só para quem escolheu o ajuste de status dentro dos EUA, sem taxa adicional.",
            agencia: "USCIS",
            formulario: "I-765",
            formId: "i-765-aos",
            obrigatorio: false,
          },
        ],
      },
      {
        titulo: "Fase 3 — Remoção das condições (I-829)",
        descricao: "Protocolado nos 90 dias antes do vencimento do Green Card condicional",
        documentos: [
          {
            id: "i829",
            nome: "Formulário I-829 — remoção das condições",
            descricao:
              "Prova que o investimento continuou e que os empregos foram criados ou preservados de verdade. Aprovado, vira Green Card permanente, sem condição.",
            agencia: "USCIS",
            formulario: "I-829",
            obrigatorio: true,
          },
        ],
      },
    ],
  },

  "asylee": {
    vistoId: "asylee",
    codigo: "Asilo",
    nome: "Proteção Humanitária (Asilo)",
    intro:
      "O asilo protege quem tem fundado temor de perseguição no país de origem por raça, religião, nacionalidade, opinião política ou grupo social. Só pode ser pedido dentro dos EUA ou na fronteira — nunca pelo consulado no Brasil. É um caso sensível: use este guia para se organizar, mas o acompanhamento de um advogado de imigração licenciado é fortemente recomendado.",
    kit: {
      caminho: "manutencao",
      preco: "R$ 297",
      alertaCritico:
        "O I-589 precisa, em regra, ser protocolado até 1 ano da sua última entrada nos EUA. Perder esse prazo sem uma exceção bem documentada (mudança de circunstâncias ou circunstâncias extraordinárias) pode fechar a porta do asilo afirmativo — não deixe para depois.",
    },
    grupos: [
      {
        titulo: "Fase 1 — Pedido de asilo (I-589)",
        descricao: "Dentro do prazo de 1 ano da última entrada — sem taxa de protocolo",
        documentos: [
          {
            id: "i589",
            nome: "Formulário I-589 — Application for Asylum and for Withholding of Removal",
            descricao:
              "Sem taxa de protocolo. Reúna evidências do fundado temor de perseguição antes de preencher — declaração pessoal detalhada, documentos, notícias, laudos, o que sustentar o caso.",
            agencia: "USCIS",
            formulario: "I-589",
            obrigatorio: true,
          },
          {
            id: "evidencias-perseguicao",
            nome: "Evidências do fundado temor de perseguição",
            descricao:
              "Boletins de ocorrência, laudos médicos ou psicológicos, notícias, declarações de testemunhas — o que documentar o motivo do pedido.",
            agencia: "USCIS",
            obrigatorio: true,
          },
        ],
      },
      {
        titulo: "Fase 2 — Autorização de trabalho enquanto o caso tramita",
        descricao: "Só pode ser pedida 150 dias depois do protocolo do I-589 ainda pendente",
        documentos: [
          {
            id: "i765-asylee",
            nome: "Formulário I-765 (c)(8) — autorização de trabalho",
            descricao:
              "Protocolado só depois de 150 dias do I-589 pendente. O EAD em si não sai antes de 180 dias — o relógio pode pausar se o atraso for causado pelo próprio requerente.",
            agencia: "USCIS",
            formulario: "I-765",
            formId: "i-765",
            obrigatorio: false,
          },
        ],
      },
      {
        titulo: "Fase 3 — Entrevista ou audiência",
        descricao: "Caso afirmativo: entrevista no USCIS. Caso defensivo (já em processo de remoção): audiência na corte de imigração",
        documentos: [
          {
            id: "entrevista-asilo",
            nome: "Entrevista de asilo (afirmativo) ou audiência (defensivo)",
            descricao:
              "Afirmativo: entrevista no Asylum Office do USCIS. Defensivo: decidido por um juiz de imigração na corte (EOIR), não pelo USCIS.",
            agencia: "EOIR",
            obrigatorio: true,
          },
        ],
      },
      {
        titulo: "Fase 4 — Depois da concessão: Green Card",
        descricao: "1 ano após o asilo concedido, é possível pedir a residência permanente",
        documentos: [
          {
            id: "i485-asylee",
            nome: "Formulário I-485 — ajuste de status por asilo",
            descricao: "Protocolado 1 ano ou mais após a concessão do asilo. Não é automático — precisa ser pedido.",
            agencia: "USCIS",
            formulario: "I-485",
            formId: "i-485",
            obrigatorio: true,
          },
        ],
      },
    ],
  },

  "overstay-sem-vinculo": {
    vistoId: "overstay-sem-vinculo",
    codigo: "Portas estreitas",
    nome: "Passou do prazo, sem vínculo familiar qualificado",
    intro:
      "Diferente de F-1, EB-5, asilo ou família de green card, esse perfil não tem um processo único a seguir — as portas que existem dependem de fatos específicos do seu caso, não de um formulário padrão. Uma delas NÃO é o asilo: pedir sem um temor fundado de perseguição real (raça, religião, opinião política, nacionalidade, grupo social) não passa de uma avaliação séria, e um pedido considerado frívolo fecha permanentemente qualquer benefício futuro de imigração (INA §208(d)(6)) — nunca é uma tática para 'ganhar tempo'. O Brasil também não está na lista de países com TPS hoje. Por isso este mapa serve para você entender as portas reais antes de falar com um profissional — não para preencher sozinho.",
    grupos: [
      {
        titulo: "Waiver de presença ilegal (I-601 / I-601A)",
        descricao: "Só existe se você já tem base para um visto de imigrante — o waiver perdoa a presença ilegal, não cria elegibilidade",
        documentos: [
          {
            id: "i601a-base",
            nome: "Já existe uma petição de imigrante em andamento ou aprovada?",
            descricao:
              "Familiar (I-130), trabalhista (I-140) ou seleção na loteria DV. Sem uma dessas bases, o I-601A não tem onde se apoiar.",
            agencia: "USCIS",
            obrigatorio: true,
          },
          {
            id: "i601a-hardship",
            nome: "Hardship extremo a cônjuge ou pai/mãe cidadão(ã) americano(a) ou residente permanente",
            descricao:
              "O waiver exige provar sofrimento extremo dessa pessoa qualificada caso você não consiga voltar — não basta o seu próprio hardship.",
            agencia: "USCIS",
            formulario: "I-601A",
            obrigatorio: true,
          },
        ],
      },
      {
        titulo: "Cancelamento de remoção (non-LPR)",
        descricao: "Só é possível dentro de um processo de remoção perante um juiz de imigração — não é um pedido espontâneo ao USCIS",
        documentos: [
          {
            id: "cancelacao-10anos",
            nome: "10 anos de presença física contínua nos EUA",
            descricao: "Contados até a data de início do processo de remoção (Notice to Appear).",
            agencia: "EOIR",
            obrigatorio: true,
          },
          {
            id: "cancelacao-moral",
            nome: "Bons antecedentes morais nesse período",
            descricao: "Sem condenações das listadas em INA §212(a)(2), §237(a)(2) ou §237(a)(3).",
            agencia: "EOIR",
            obrigatorio: true,
          },
          {
            id: "cancelacao-hardship",
            nome: "Hardship 'excepcional e extraordinariamente incomum' a parente qualificado",
            descricao: "Cônjuge, pai/mãe ou filho(a) cidadão(ã) americano(a) ou residente permanente.",
            agencia: "EOIR",
            formulario: "EOIR-42B",
            obrigatorio: true,
          },
        ],
      },
      {
        titulo: "VAWA — auto-petição (I-360)",
        descricao: "Para quem sofreu abuso de cônjuge ou pai/mãe cidadão(ã)/residente — exige ter tido esse vínculo",
        documentos: [
          {
            id: "vawa-vinculo",
            nome: "Vínculo qualificado com o(a) agressor(a)",
            descricao: "Cônjuge ou filho(a) de cidadão(ã)/residente abusivo, ou pai/mãe de filho(a) cidadão(ã) 21+ que sofreu abuso.",
            agencia: "USCIS",
            obrigatorio: true,
          },
          {
            id: "vawa-abuso",
            nome: "Prova de violência ou crueldade extrema",
            descricao: "Pode ser protocolado sem o conhecimento ou consentimento do(a) agressor(a).",
            agencia: "USCIS",
            formulario: "I-360",
            obrigatorio: true,
          },
        ],
      },
      {
        titulo: "U-visa — vítima de crime",
        descricao: "Para quem foi vítima de um crime qualificado nos EUA e colaborou com a investigação",
        documentos: [
          {
            id: "u-visa-vitima",
            nome: "Vítima de crime qualificado com abuso físico ou mental substancial",
            descricao: "O crime precisa ter ocorrido nos EUA ou violado lei americana.",
            agencia: "USCIS",
            obrigatorio: true,
          },
          {
            id: "u-visa-certificacao",
            nome: "Certificação de utilidade (I-918B) da polícia ou promotoria",
            descricao: "Sem a certificação de que você ajudou (ou vai ajudar) a investigação, a petição não avança.",
            agencia: "USCIS",
            formulario: "I-918",
            obrigatorio: true,
          },
        ],
      },
      {
        titulo: "T-visa — vítima de tráfico humano",
        descricao: "Estrutura parecida com o U-visa, mas para vítimas de tráfico de pessoas (trabalho ou sexual)",
        documentos: [
          {
            id: "t-visa-vitima",
            nome: "Vítima de tráfico humano, presente nos EUA por causa do tráfico",
            descricao: "Trabalho forçado ou tráfico sexual — a presença nos EUA precisa decorrer diretamente disso.",
            agencia: "USCIS",
            formulario: "I-914",
            obrigatorio: true,
          },
        ],
      },
    ],
  },

  n400: {
    vistoId: "n400",
    codigo: "N-400",
    nome: "Naturalização — Cidadania Americana",
    intro:
      "Você já tem o Green Card — a naturalização é a última etapa da jornada. Regra geral: 5 anos como residente, ou 3 se casado(a) e vivendo com cidadão americano. Dá para protocolar até 90 dias antes de completar o prazo.",
    kit: { caminho: "manutencao", preco: "R$ 197" },
    grupos: [
      {
        titulo: "Confirmar elegibilidade",
        descricao: "O relógio de residência e presença física precisam bater antes de protocolar",
        documentos: [
          {
            id: "n400-tempo-residencia",
            nome: "5 anos como residente (ou 3, se casado(a) e vivendo com cidadão)",
            descricao: "Contados desde a data em que o Green Card foi aprovado.",
            agencia: "USCIS",
            obrigatorio: true,
          },
          {
            id: "n400-presenca-fisica",
            nome: "Residência contínua e presença física em pelo menos metade do período",
            descricao: "Viagens de 6 meses ou mais podem quebrar a residência contínua — some suas ausências antes de protocolar.",
            agencia: "USCIS",
            obrigatorio: true,
          },
        ],
      },
      {
        titulo: "Levantar o histórico",
        descricao: "O N-400 pergunta tudo — viagens, endereços, empregos e impostos dos últimos 5 anos",
        documentos: [
          {
            id: "n400-viagens",
            nome: "Lista de viagens internacionais dos últimos 5 anos",
            descricao: "Datas de saída e retorno de cada viagem fora dos EUA.",
            agencia: "USCIS",
            obrigatorio: true,
          },
          {
            id: "n400-enderecos-empregos",
            nome: "Endereços e empregadores dos últimos 5 anos",
            descricao: "Histórico completo, sem lacunas.",
            agencia: "USCIS",
            obrigatorio: true,
          },
          {
            id: "n400-impostos",
            nome: "Declaração de imposto em dia",
            descricao: "Pendências criminais ou de impostos merecem análise profissional antes de protocolar — o N-400 reabre todo o seu histórico de imigração.",
            agencia: "USCIS",
            obrigatorio: false,
          },
        ],
      },
      {
        titulo: "Protocolar o N-400",
        descricao: "US$710 online ou US$760 em papel — renda entre 150–400% da linha da pobreza paga US$380",
        documentos: [
          {
            id: "n400-formulario",
            nome: "Formulário N-400 — Application for Naturalization",
            descricao: "Pode ser protocolado até 90 dias antes de completar o prazo de residência.",
            agencia: "USCIS",
            formulario: "N-400",
            formId: "n-400",
            obrigatorio: true,
          },
        ],
      },
      {
        titulo: "Biometria, entrevista e juramento",
        descricao: "Últimas etapas antes de se tornar cidadão americano",
        documentos: [
          {
            id: "n400-biometria",
            nome: "Biometria",
            descricao: "Coleta de digitais e foto.",
            agencia: "USCIS",
            obrigatorio: true,
          },
          {
            id: "n400-entrevista",
            nome: "Entrevista, teste de inglês e cívica",
            descricao: "As perguntas do teste cívico são públicas, disponíveis no site do USCIS.",
            agencia: "USCIS",
            obrigatorio: true,
          },
          {
            id: "n400-juramento",
            nome: "Cerimônia de juramento",
            descricao: "Você se torna cidadão americano.",
            agencia: "USCIS",
            obrigatorio: true,
          },
        ],
      },
    ],
  },

  i90: {
    vistoId: "i90",
    codigo: "I-90",
    nome: "Renovação do Green Card",
    intro:
      "O cartão de 10 anos se renova com o I-90 — processo direto com o USCIS, sem entrevista consular. Renove se já venceu ou vence nos próximos 6 meses. Green Card CONDICIONAL de 2 anos (por casamento) é outro processo — I-751, protocolado nos 90 dias antes do vencimento, nunca o I-90.",
    kit: { caminho: "manutencao", preco: "R$ 97" },
    grupos: [
      {
        titulo: "Conferir o cartão",
        descricao: "Confirme qual processo se aplica ao seu caso antes de protocolar",
        documentos: [
          {
            id: "i90-tipo-cartao",
            nome: "Confirmar se o cartão é de 10 anos (I-90) ou condicional de 2 anos (I-751)",
            descricao: "São formulários diferentes — protocolar o errado atrasa o processo inteiro.",
            agencia: "USCIS",
            obrigatorio: true,
          },
        ],
      },
      {
        titulo: "Protocolar o I-90",
        descricao: "US$415 online ou US$465 em papel, direto na conta USCIS",
        documentos: [
          {
            id: "i90-formulario",
            nome: "Formulário I-90 — Application to Replace Permanent Resident Card",
            descricao: "Vencido ou a vencer em 6 meses: hora de renovar.",
            agencia: "USCIS",
            formulario: "I-90",
            formId: "i-90",
            obrigatorio: true,
          },
        ],
      },
      {
        titulo: "Recibo, biometria e novo cartão",
        descricao: "O I-797 de recebimento já estende a validade do cartão vencido",
        documentos: [
          {
            id: "i90-recibo",
            nome: "Guardar o recibo I-797",
            descricao: "Estende a validade do cartão vencido — guarde junto do cartão antigo para trabalho e viagens. Não viaje com o cartão vencido sem o recibo.",
            agencia: "USCIS",
            formulario: "I-797",
            obrigatorio: true,
          },
          {
            id: "i90-biometria",
            nome: "Biometria, se convocada",
            descricao: "Reuso de biometria é comum — muitos casos nem têm apontamento.",
            agencia: "USCIS",
            obrigatorio: false,
          },
        ],
      },
    ],
  },

  i131: {
    vistoId: "i131",
    codigo: "I-131",
    nome: "Reentry Permit — Permissão de Reentrada",
    intro:
      "Protege seu Green Card em ausências de até 2 anos fora dos EUA. Precisa ser protocolado ANTES de sair do país — não dá para pedir já estando fora. A biometria também é feita nos EUA, antes da viagem.",
    kit: {
      caminho: "manutencao",
      preco: "R$ 147",
      alertaCritico: "Se você já saiu dos EUA sem protocolar o I-131 antes, esse caminho não se aplica mais ao seu caso — fale com um profissional para avaliar as alternativas.",
    },
    grupos: [
      {
        titulo: "Confirmar que você ainda está nos EUA",
        descricao: "Requisito inegociável — o I-131 precisa ser protocolado antes da saída",
        documentos: [
          {
            id: "i131-ainda-nos-eua",
            nome: "Você ainda não saiu dos EUA para a viagem que motivou o pedido",
            descricao: "Ausências de 6 meses ou mais sem o Reentry Permit podem ser lidas como abandono da residência.",
            agencia: "USCIS",
            obrigatorio: true,
          },
        ],
      },
      {
        titulo: "Protocolar o I-131",
        descricao: "Formulário para residentes permanentes que vão ficar fora por até 2 anos",
        documentos: [
          {
            id: "i131-formulario",
            nome: "Formulário I-131 — Application for Travel Document",
            descricao: "Categoria Reentry Permit, especificamente para titulares de Green Card.",
            agencia: "USCIS",
            formulario: "I-131",
            formId: "i-131",
            obrigatorio: true,
          },
        ],
      },
      {
        titulo: "Biometria antes de viajar",
        descricao: "Feita nos EUA — não é possível completar de fora do país",
        documentos: [
          {
            id: "i131-biometria",
            nome: "Comparecer à biometria após protocolar",
            descricao: "O USCIS agenda a coleta de digitais e foto antes de você viajar.",
            agencia: "USCIS",
            obrigatorio: true,
          },
        ],
      },
      {
        titulo: "Levar o comprovante na viagem",
        descricao: "O recibo já serve de prova até o documento final ficar pronto",
        documentos: [
          {
            id: "i131-recibo-viagem",
            nome: "Recibo do I-131 (e o documento final, quando sair)",
            descricao: "Leve junto do Green Card e do passaporte na reentrada.",
            agencia: "USCIS",
            obrigatorio: true,
          },
        ],
      },
    ],
  },

  "b1-cos": {
    vistoId: "b1-cos",
    codigo: "B-1/B-2",
    nome: "Extensão ou mudança de status — dentro dos EUA",
    intro:
      "Você está nos EUA em status B-1/B-2. O prazo que vale é o do seu I-94, não o carimbo do visto no passaporte — ele define até quando você pode ficar. Extensão ou mudança de status precisam ser protocoladas antes do I-94 vencer, nunca depois.",
    kit: { caminho: "manutencao", preco: "R$ 97" },
    grupos: [
      {
        titulo: "Conferir o prazo do I-94",
        descricao: "i94.cbp.dhs.gov mostra a data exata de saída obrigatória",
        documentos: [
          {
            id: "b1cos-i94",
            nome: "Confirmar a data de vencimento do I-94",
            descricao: "Passar do prazo sem pedido protocolado começa a contar presença irregular.",
            agencia: "CBP",
            obrigatorio: true,
          },
        ],
      },
      {
        titulo: "Extensão de permanência (I-539)",
        descricao: "US$370 — pedida antes do I-94 vencer, com justificativa",
        documentos: [
          {
            id: "b1cos-i539",
            nome: "Formulário I-539 — Application to Extend/Change Nonimmigrant Status",
            descricao: "Justificativa comum: negócio ou tratamento médico ainda em andamento.",
            agencia: "USCIS",
            formulario: "I-539",
            formId: "i-539",
            obrigatorio: true,
          },
        ],
      },
      {
        titulo: "Mudança de status, se for o caso",
        descricao: "Quer estudar (F-1), trabalhar ou seguir outro caminho? Muda-se antes do prazo vencer",
        documentos: [
          {
            id: "b1cos-mudanca-status",
            nome: "Definir o visto de destino antes de protocolar",
            descricao: "B-1/B-2 não autoriza trabalho remunerado nos EUA, nem para empresa brasileira remota — só reuniões, negociações e turismo.",
            agencia: "USCIS",
            obrigatorio: false,
          },
        ],
      },
    ],
  },

  "e2-cos": {
    vistoId: "e2-cos",
    codigo: "E-2",
    nome: "E-2 — Mudança de status dentro dos EUA",
    intro:
      "Você está nos EUA e quer o E-2 sem passar pelo consulado. A mudança de status usa o I-129 direto com o USCIS — sem DS-160, sem entrevista — mas os requisitos de nacionalidade, investimento e gestão ativa são os mesmos do processo consular.",
    kit: {
      caminho: "cos",
      preco: "R$ 197",
      alertaCritico: "O E-2 não leva direto ao Green Card — as pontes comuns são EB-5, EB-1C (executivo) ou EB-2 NIW.",
    },
    grupos: [
      {
        titulo: "Confirmar os 4 requisitos",
        descricao: "Nacionalidade de país com tratado, investimento substancial, controle de pelo menos 50% e papel ativo na gestão",
        documentos: [
          {
            id: "e2cos-requisitos",
            nome: "Nacionalidade, investimento, controle e papel ativo",
            descricao: "Os mesmos 4 requisitos do E-2 consular — só muda o formulário e o órgão que analisa.",
            agencia: "USCIS",
            obrigatorio: true,
          },
        ],
      },
      {
        titulo: "Montar o plano de negócios",
        descricao: "Prova de origem e aplicação dos fundos, mais o plano do negócio nos EUA",
        documentos: [
          {
            id: "e2cos-plano-negocio",
            nome: "Plano de negócios e prova de origem dos fundos",
            descricao: "Documentação completa de como o capital chegou e será usado no negócio americano.",
            agencia: "USCIS",
            obrigatorio: true,
          },
        ],
      },
      {
        titulo: "I-129 com classificação E-2 e COS",
        descricao: "Submetido ao USCIS — sem consulado, sem DS-160",
        documentos: [
          {
            id: "e2cos-i129",
            nome: "Formulário I-129 — Petition for a Nonimmigrant Worker (E-2)",
            descricao: "Renovável sem limite enquanto o negócio operar de verdade.",
            agencia: "USCIS",
            formulario: "I-129",
            obrigatorio: true,
          },
        ],
      },
    ],
  },

  "e1-cos": {
    vistoId: "e1-cos",
    codigo: "E-1",
    nome: "E-1 — Mudança de status dentro dos EUA",
    intro:
      "Você está nos EUA e quer o E-1 sem passar pelo consulado. A mudança de status usa o I-129 direto com o USCIS — sem DS-160, sem entrevista — mas o volume de comércio bilateral exigido é o mesmo do processo consular.",
    kit: {
      caminho: "cos",
      preco: "R$ 197",
      alertaCritico: "O E-1 não leva direto ao Green Card — executivos podem olhar o EB-1C; perfis qualificados, o EB-2 NIW.",
    },
    grupos: [
      {
        titulo: "Confirmar o comércio substancial",
        descricao: "Histórico documentado: contratos e faturas mostrando o volume bilateral entre os dois países",
        documentos: [
          {
            id: "e1cos-comercio",
            nome: "Mais de 50% do volume de comércio da empresa entre os dois países",
            descricao: "Mesmo requisito do E-1 consular.",
            agencia: "USCIS",
            obrigatorio: true,
          },
        ],
      },
      {
        titulo: "Montar o dossiê comercial",
        descricao: "Documentação da empresa e do comércio, sem os formulários consulares",
        documentos: [
          {
            id: "e1cos-dossie",
            nome: "Dossiê comercial completo",
            descricao: "Contratos, faturas e documentação societária da empresa.",
            agencia: "USCIS",
            obrigatorio: true,
          },
        ],
      },
      {
        titulo: "I-129 com classificação E-1 e COS",
        descricao: "Submetido ao USCIS — sem consulado, sem DS-160",
        documentos: [
          {
            id: "e1cos-i129",
            nome: "Formulário I-129 — Petition for a Nonimmigrant Worker (E-1)",
            descricao: "Renovável sem limite enquanto o comércio substancial continuar.",
            agencia: "USCIS",
            formulario: "I-129",
            obrigatorio: true,
          },
        ],
      },
    ],
  },

  "dependente-cos": {
    vistoId: "dependente-cos",
    codigo: "F-2/H-4/L-2/J-2",
    nome: "Extensão de status de dependente",
    intro:
      "A extensão do dependente está sempre atrelada à extensão do titular principal (F-1, H-1B, L-1 ou J-1) — é o mesmo formulário I-539, mas o que cada categoria pode ou não fazer enquanto espera varia bastante.",
    kit: { caminho: "manutencao", preco: "R$ 97" },
    grupos: [
      {
        titulo: "Confirmar a extensão do titular principal",
        descricao: "O dependente não pode estender sozinho — depende do status do titular estar em dia",
        documentos: [
          {
            id: "dep-titular-status",
            nome: "Titular principal com extensão protocolada ou aprovada",
            descricao: "F-2 depende do F-1, H-4 do H-1B, L-2 do L-1, J-2 do J-1.",
            agencia: "USCIS",
            obrigatorio: true,
          },
        ],
      },
      {
        titulo: "Protocolar o I-539 do dependente",
        descricao: "Pode ser protocolado junto com o do titular ou logo em seguida",
        documentos: [
          {
            id: "dep-i539",
            nome: "Formulário I-539 — Application to Extend/Change Nonimmigrant Status",
            descricao: "Um I-539 por dependente (ou um coletivo para a família, conforme o caso).",
            agencia: "USCIS",
            formulario: "I-539",
            formId: "i-539",
            obrigatorio: true,
          },
        ],
      },
      {
        titulo: "Autorização de trabalho, se a categoria permitir",
        descricao: "Varia por tipo de dependente — confirme antes de trabalhar",
        documentos: [
          {
            id: "dep-h4-trabalho",
            nome: "H-4: autorização de trabalho só em casos específicos",
            descricao: "Depende do titular H-1B já ter petição de green card em estágio avançado (I-140 aprovado ou PERM/I-140 pendente há tempo suficiente).",
            agencia: "USCIS",
            formulario: "I-765",
            obrigatorio: false,
          },
          {
            id: "dep-l2-trabalho",
            nome: "L-2: autorização de trabalho automática com o status aprovado",
            descricao: "Cônjuge L-2 pode trabalhar sem pedido separado de autorização, uma vez com o status L-2 aprovado.",
            agencia: "USCIS",
            obrigatorio: false,
          },
          {
            id: "dep-j2-trabalho",
            nome: "J-2: pode pedir autorização de trabalho (I-765)",
            descricao: "Precisa de aprovação separada do USCIS antes de começar a trabalhar.",
            agencia: "USCIS",
            formulario: "I-765",
            obrigatorio: false,
          },
          {
            id: "dep-f2-trabalho",
            nome: "F-2: sem autorização de trabalho",
            descricao: "Dependente de F-1 não pode trabalhar nos EUA em nenhuma circunstância.",
            agencia: "USCIS",
            obrigatorio: false,
          },
        ],
      },
    ],
  },

  "dv-lottery": {
    vistoId: "dv-lottery",
    codigo: "DV Lottery",
    nome: "Diversity Visa Program — Loteria de Vistos",
    intro:
      "Programa anual do governo americano para países com baixa imigração para os EUA — até 55.000 vistos de imigrante por ano, sorteados entre quem se inscreveu. A inscrição é eletrônica e gratuita. Atenção: o Brasil foi excluído do programa nos últimos ciclos por ter enviado muitos imigrantes — confirme a elegibilidade do seu país de nascimento no ciclo atual antes de se inscrever.",
    kit: {
      caminho: "consulado",
      preco: "R$ 47",
      alertaCritico: "As datas de inscrição mudam a cada ciclo (o período do DV-2027, por exemplo, ainda não tinha sido anunciado na última verificação) — confira sempre a data atual em dvprogram.state.gov antes de qualquer prazo.",
    },
    grupos: [
      {
        titulo: "Confirmar elegibilidade",
        descricao: "País de nascimento elegível + educação ou experiência profissional",
        documentos: [
          {
            id: "dv-pais-elegivel",
            nome: "País de nascimento elegível no ciclo atual",
            descricao: "A lista de países excluídos muda a cada ano — confira em dvprogram.state.gov antes de se inscrever.",
            agencia: "DOS",
            obrigatorio: true,
          },
          {
            id: "dv-educacao-experiencia",
            nome: "Ensino médio completo OU 2 anos de experiência em ocupação que exija ao menos 2 anos de treinamento",
            descricao: "Nos últimos 5 anos, na data da inscrição.",
            agencia: "DOS",
            obrigatorio: true,
          },
        ],
      },
      {
        titulo: "Inscrição eletrônica gratuita",
        descricao: "Só em dvprogram.state.gov, durante o período de inscrição do ciclo — sem custo, sem papel",
        documentos: [
          {
            id: "dv-inscricao",
            nome: "Formulário eletrônico E-DV",
            descricao: "Nenhuma inscrição em papel ou fora do site oficial é válida — desconfie de terceiros cobrando pela inscrição em si.",
            agencia: "DOS",
            obrigatorio: true,
          },
        ],
      },
      {
        titulo: "Verificar o resultado",
        descricao: "Não existe carta física — o resultado sai só no site oficial",
        documentos: [
          {
            id: "dv-resultado",
            nome: "Entry Status Check no site oficial",
            descricao: "Consulte com o número de confirmação recebido na inscrição.",
            agencia: "DOS",
            obrigatorio: true,
          },
        ],
      },
      {
        titulo: "Se selecionado",
        descricao: "Selecionado não é aprovado — ainda falta o processo do visto de imigrante",
        documentos: [
          {
            id: "dv-ds260",
            nome: "Formulário DS-260 — Immigrant Visa Application",
            descricao: "Protocolado depois da seleção, dentro do ano fiscal do programa (nunca depois de 30 de setembro do ano do ciclo).",
            agencia: "DOS",
            formulario: "DS-260",
            obrigatorio: true,
          },
          {
            id: "dv-entrevista",
            nome: "Entrevista consular",
            descricao: "Última etapa antes da emissão do visto de imigrante.",
            agencia: "DOS",
            obrigatorio: true,
          },
        ],
      },
    ],
  },

  "family-gc-overstay": {
    vistoId: "family-gc-overstay",
    codigo: "F2A + Overstay",
    nome: "Familiar com Green Card, você em overstay",
    intro:
      "Seu familiar residente permanente já pode peticionar você agora — o protocolo garante seu lugar na fila F2A. Mas com overstay, o ajuste de status por dentro nessa categoria, em regra, não é permitido. O que acontece depois depende de qual dos dois cenários chega primeiro: seu familiar se naturalizar, ou sua vez na fila chegar. Não saia dos EUA sem análise individual — as barras de 3/10 anos disparam na saída (INA §212(a)(9)(B)).",
    kit: {
      caminho: "manutencao",
      preco: "R$ 147",
      alertaCritico: "Protocolar o I-130 agora sempre vale a pena — garante a data de prioridade — mesmo que o próximo passo ainda dependa de qual cenário se confirmar.",
    },
    grupos: [
      {
        titulo: "Fase 1 — Protocolar a petição agora",
        descricao: "Vale a pena independente de qual cenário abaixo vai se confirmar — a data de protocolo é sua posição na fila",
        documentos: [
          {
            id: "fgcov-i130",
            nome: "Formulário I-130 — protocolado pelo familiar residente permanente",
            descricao: "A data de recebimento pelo USCIS vira sua priority date na categoria F2A.",
            agencia: "USCIS",
            formulario: "I-130",
            obrigatorio: true,
          },
        ],
      },
      {
        titulo: "Cenário A — Seu familiar se naturaliza antes da sua vez",
        descricao: "Você vira parente imediato de cidadão — sem fila, ajuste por dentro possível",
        documentos: [
          {
            id: "fgcov-naturalizacao-familiar",
            nome: "Familiar se naturaliza (N-400) antes da sua data ficar current",
            descricao: "Nesse caso, você deixa a categoria F2A e vira parente imediato — o ajuste por dentro (I-485) abre, e as barras de 3/10 anos nunca disparam porque você não sai do país.",
            agencia: "USCIS",
            obrigatorio: false,
          },
        ],
      },
      {
        titulo: "Cenário B — Sua vez chega antes da naturalização",
        descricao: "O ajuste por dentro nessa categoria com overstay, em regra, não é permitido — decisão exige análise individual",
        documentos: [
          {
            id: "fgcov-analise-profissional",
            nome: "Avaliação com um profissional antes de qualquer decisão",
            descricao: "As opções nesse cenário (aguardar mais, processo consular com waiver I-601/I-601A, ou outra rota) dependem de fatos do seu caso — histórico de entrada, tempo de overstay e mais.",
            agencia: "USCIS",
            obrigatorio: true,
          },
        ],
      },
    ],
  },
};

export default checklists;
