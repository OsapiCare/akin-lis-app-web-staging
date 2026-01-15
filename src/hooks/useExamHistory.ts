export const mockExamHistory: ExamesTypes[] = [
  {
    id: 1,
    id_paciente: "1",
    id_unidade_de_saude: 1,
    data_agendamento: "2024-01-15",
    hora_agendamento: "09:00",
    status: "CONCLUIDO" as StatusClinico,
    status_financeiro: "PAGO" as StatusFinanceiro,
    status_reembolso: "SEM_REEMBOLSO" as StatusReembolso,
    id_tecnico_alocado: 1,
    data_pagamento: "2024-01-15T09:00:00.000Z",
    Paciente: {
      id: "1",
      nome_completo: "Maria Silva",
      id_sexo: 2,
      numero_identificacao: "123456789LA042",
      data_nascimento: "1990-01-01",
      data_ultima_visita: "2024-01-15T09:00:00.000Z",
      criado_aos: new Date(),
      contacto_telefonico: "",
      id_usuario: "1",
    },
    Exame: [
      {
        id: 1,
        data_agendamento: "2024-01-15",
        hora_agendamento: "09:00",
        data_formatada: "2024-01-15T09:00:00.000Z",
        duracao: null,
        status: "CONCLUIDO",
        status_pagamento: "PAGO",
        criado_aos: "2024-01-14T00:00:00.000Z",
        atualizado_aos: "2024-01-15T00:00:00.000Z",
        id_agendamento: 1,
        id_tipo_exame: 1,
        id_tecnico_alocado: "1",
        Tipo_Exame: {
          id: 1,
          nome: "Hemograma Completo",
          preco: 150.0,
        },
        Agendamento: {
          id: 1,
          atualizado_aos: "2024-01-15T00:00:00.000Z",
          Chefe_Laboratorio: {
            id: "1",
            nome: "Fabio",
            tipo: "CHEFE"
          },
          criado_aos: "2024-01-14T00:00:00.000Z",
          id_chefe_alocado: "1",
          id_paciente: 2,
          id_recepcionista: "3",
          id_unidade_de_saude: "1",
          Paciente: {
            id: 1,
            id_sexo: 1,
            nome_completo: "Luís Simão",
            contacto_telefonico: "987654252",
            numero_identificacao: "1234567890LA652"
          },
          status: "CONCLUIDO"
        },
        Tecnico_Laboratorio: null
      }
    ],
    data_formatada: "2024-01-15T09:00:00.000Z",
    duracao: null,
    status_pagamento: "PAGO",
    criado_aos: "2024-01-14T00:00:00.000Z",
    atualizado_aos: "2024-01-15T00:00:00.000Z",
    id_agendamento: 1,
    id_tipo_exame: 1,
    Tipo_Exame: {
      id: 1,
      nome: "Hemograma Completo",
      preco: 150.0
    },
    Tecnico_Laboratorio: {
      id: "TEC001",
      nome: "Dr. João Silva",
      email: "joao@exemplo.com"
    },
    Agendamento: {
      id: 1,
      id_paciente: 1,
      id_unidade_de_saude: "OSA2025",
      id_recepcionista: null,
      id_chefe_alocado: null,
      status: "CONCLUIDO",
      criado_aos: "2024-01-14T00:00:00.000Z",
      atualizado_aos: "2024-01-15T00:00:00.000Z",
      Paciente: {
        id: "1",
        nome_completo: "Maria Silva",
        id_sexo: 2,
        numero_identificacao: "123456789LA042",
        data_nascimento: "1990-01-01",
        data_ultima_visita: "2024-01-15T09:00:00.000Z",
        criado_aos: new Date("2024-01-14T00:00:00.000Z"),
        contacto_telefonico: "998726322",
        id_usuario: "1"
      },
      Chefe_Laboratorio: null
    }
  },
  {
    id: 2,
    id_paciente: "2",
    id_unidade_de_saude: 1,
    data_agendamento: "2024-01-14",
    hora_agendamento: "10:30",
    status: "CONCLUIDO" as StatusClinico,
    status_financeiro: "PAGO" as StatusFinanceiro,
    status_reembolso: "POR_REEMBOLSAR" as StatusReembolso,
    id_tecnico_alocado: 2,
    data_pagamento: "2024-01-14T10:30:00.000Z",
    Paciente: {
      id: "2",
      nome_completo: "João Santos",
      id_sexo: 1,
      numero_identificacao: "987654321LA042",
      data_nascimento: "1985-05-15",
      data_ultima_visita: "2024-01-14T10:30:00.000Z",
      criado_aos: new Date("2024-01-13T00:00:00.000Z"),
      contacto_telefonico: "1224353663",
      id_usuario: "2"
    },
    Exame: [
      {
        id: 2,
        data_agendamento: "2024-01-14",
        hora_agendamento: "10:30",
        data_formatada: "2024-01-14T10:30:00.000Z",
        duracao: null,
        status: "CONCLUIDO",
        status_pagamento: "PAGO",
        criado_aos: "2024-01-13T00:00:00.000Z",
        atualizado_aos: "2024-01-14T00:00:00.000Z",
        id_agendamento: 2,
        id_tipo_exame: 2,
        id_tecnico_alocado: "2",
        Tipo_Exame: {
          id: 2,
          nome: "Glicemia de Jejum",
          preco: 80.0,
        },
        Agendamento: {
          id: 2,
          atualizado_aos: "2024-01-14T00:00:00.000Z",
          Chefe_Laboratorio: {
            id: "2",
            nome: "Carlos",
            tipo: "CHEFE"
          },
          criado_aos: "2024-01-13T00:00:00.000Z",
          id_chefe_alocado: "2",
          id_paciente: 2,
          id_recepcionista: "3",
          id_unidade_de_saude: "1",
          Paciente: {
            id: 2,
            id_sexo: 1,
            nome_completo: "João Santos",
            contacto_telefonico: "1224353663",
            numero_identificacao: "987654321LA042"
          },
          status: "CONCLUIDO"
        },
        Tecnico_Laboratorio: null
      }
    ],
    data_formatada: "2024-01-14T10:30:00.000Z",
    duracao: null,
    status_pagamento: "PAGO",
    criado_aos: "2024-01-13T00:00:00.000Z",
    atualizado_aos: "2024-01-14T00:00:00.000Z",
    id_agendamento: 2,
    id_tipo_exame: 2,
    Tipo_Exame: {
      id: 2,
      nome: "Glicemia de Jejum",
      preco: 80.0
    },
    Tecnico_Laboratorio: {
      id: "TEC002",
      nome: "Dr. Ana Santos",
      email: "ana@exemplo.com"
    },
    Agendamento: {
      id: 2,
      id_paciente: 2,
      id_unidade_de_saude: "OSA2025",
      id_recepcionista: null,
      id_chefe_alocado: null,
      status: "CONCLUIDO",
      criado_aos: "2024-01-13T00:00:00.000Z",
      atualizado_aos: "2024-01-14T00:00:00.000Z",
      Paciente: {
        id: "2",
        nome_completo: "João Santos",
        id_sexo: 1,
        numero_identificacao: "987654321LA042",
        data_nascimento: "1985-05-15",
        data_ultima_visita: "2024-01-14T10:30:00.000Z",
        criado_aos: new Date("2024-01-13T00:00:00.000Z"),
        contacto_telefonico: "1224353663",
        id_usuario: "2"
      },
      Chefe_Laboratorio: null
    }
  },
  {
    id: 3,
    id_paciente: "3",
    id_unidade_de_saude: 1,
    data_agendamento: "2024-01-13",
    hora_agendamento: "14:00",
    status: "CANCELADO" as StatusClinico,
    status_financeiro: "CANCELADO" as StatusFinanceiro,
    status_reembolso: "REEMBOLSADO" as StatusReembolso,
    id_tecnico_alocado: null,
    data_pagamento: null,
    Paciente: {
      id: "3",
      nome_completo: "Ana Costa",
      id_sexo: 2,
      numero_identificacao: "456789123LA042",
      data_nascimento: "1992-08-22",
      data_ultima_visita: "2024-01-13T14:00:00.000Z",
      criado_aos: new Date("2024-01-12T00:00:00.000Z"),
      contacto_telefonico: "938475621",
      id_usuario: "3"
    },
    Exame: [
      {
        id: 3,
        data_agendamento: "2024-01-13",
        hora_agendamento: "14:00",
        data_formatada: "2024-01-13T14:00:00.000Z",
        duracao: null,
        status: "CANCELADO",
        status_pagamento: "NAO_PAGO",
        criado_aos: "2024-01-12T00:00:00.000Z",
        atualizado_aos: "2024-01-13T00:00:00.000Z",
        id_agendamento: 3,
        id_tipo_exame: 3,
        id_tecnico_alocado: null,
        Tipo_Exame: {
          id: 3,
          nome: "Urina Tipo I",
          preco: 120.0,
        },
        Agendamento: {
          id: 3,
          atualizado_aos: "2024-01-13T00:00:00.000Z",
          Chefe_Laboratorio: {
            id: "3",
            nome: "Ricardo",
            tipo: "CHEFE"
          },
          criado_aos: "2024-01-12T00:00:00.000Z",
          id_chefe_alocado: "3",
          id_paciente: 3,
          id_recepcionista: "3",
          id_unidade_de_saude: "1",
          Paciente: {
            id: 3,
            id_sexo: 2,
            nome_completo: "Ana Costa",
            contacto_telefonico: "938475621",
            numero_identificacao: "456789123LA042"
          },
          status: "CANCELADO"
        },
        Tecnico_Laboratorio: null
      }
    ],
    data_formatada: "2024-01-13T14:00:00.000Z",
    duracao: null,
    status_pagamento: "NAO_PAGO",
    criado_aos: "2024-01-12T00:00:00.000Z",
    atualizado_aos: "2024-01-13T00:00:00.000Z",
    id_agendamento: 3,
    id_tipo_exame: 3,
    Tipo_Exame: {
      id: 3,
      nome: "Urina Tipo I",
      preco: 120.0
    },
    Tecnico_Laboratorio: null,
    Agendamento: {
      id: 3,
      id_paciente: 3,
      id_unidade_de_saude: "OSA2025",
      id_recepcionista: null,
      id_chefe_alocado: null,
      status: "CANCELADO",
      criado_aos: "2024-01-12T00:00:00.000Z",
      atualizado_aos: "2024-01-13T00:00:00.000Z",
      Paciente: {
        id: "3",
        nome_completo: "Ana Costa",
        id_sexo: 2,
        numero_identificacao: "456789123LA042",
        data_nascimento: "1992-08-22",
        data_ultima_visita: "2024-01-13T14:00:00.000Z",
        criado_aos: new Date("2024-01-12T00:00:00.000Z"),
        contacto_telefonico: "938475621",
        id_usuario: "3"
      },
      Chefe_Laboratorio: null
    }
  }
];