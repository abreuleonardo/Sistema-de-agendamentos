export type Sala = 'Laboratório Steam' | 'Sala Google' | 'Sala Gourmet' | 'Auditório';

export type StatusAgendamento = 'ativo' | 'cancelado';

export interface Agendamento {
  id: string;
  nomeProfissional: string;
  atividade: string;
  serieTurma: string;
  dataAgendamento: string; // ISO format: YYYY-MM-DD
  horario: string;
  sala: Sala;
  responsavelAgendamento: string;
  observacoes: string;
  status: StatusAgendamento;
  motivoCancelamento?: string;
  criadoEm: any; // Firestore Timestamp
}

export interface Aviso {
  id: string;
  mensagem: string;
  autor: string;
  criadoEm: any; // Firestore Timestamp
}

export interface HistoricoItem {
  id: string;
  acao: string;
  detalhes: string;
  usuario: string;
  criadoEm: any; // Firestore Timestamp
}

export const SALAS: Sala[] = ['Laboratório Steam', 'Sala Google', 'Sala Gourmet', 'Auditório'];

export const HORARIOS_PADRAO = [
  '07:10', '08:10', '08:50', '09:20', '09:40', '10:30', '11:00', '11:30',
  '12:00', '13:00', '14:00', '15:00', '16:00', '16:30', '17:00', '17:30'
];

export const CORES_SALA: Record<Sala, string> = {
  'Laboratório Steam': 'bg-red-500',
  'Sala Google': 'bg-emerald-500',
  'Sala Gourmet': 'bg-amber-500',
  'Auditório': 'bg-purple-500',
};

export const BORDER_SALA: Record<Sala, string> = {
  'Laboratório Steam': 'border-red-500',
  'Sala Google': 'border-emerald-500',
  'Sala Gourmet': 'border-amber-500',
  'Auditório': 'border-purple-500',
};

export const TEXT_SALA: Record<Sala, string> = {
  'Laboratório Steam': 'text-red-600',
  'Sala Google': 'text-emerald-600',
  'Sala Gourmet': 'text-amber-600',
  'Auditório': 'text-purple-600',
};
