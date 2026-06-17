export type Agencia = "USCIS" | "NVC" | "DOS" | "DOL" | "EOIR";

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

  b1: {
    vistoId: "b1",
    codigo: "B-1",
    nome: "Visitante de Negócios",
    intro:
      "O B-1 é para visitas de negócios — reuniões, contratos, treinamentos. Não autoriza trabalho remunerado. O processo é direto: DS-160 + entrevista.",
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
};

export default checklists;
