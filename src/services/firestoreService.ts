import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  getDocs, 
  serverTimestamp
} from 'firebase/firestore';

import { db } from '../firebase/config';
import { Agendamento, Aviso, Sala, HistoricoItem } from '../types';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
) {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    operationType,
    path
  };

  console.error('Firestore Error:', errInfo);

  throw new Error(
    error instanceof Error
      ? error.message
      : 'Erro no Firestore'
  );
}

export const firestoreService = {

  // =========================
  // CHECK CONFLICT
  // =========================
  async checkConflict(
    fecha: string,
    horario: string,
    sala: Sala,
    excludeId?: string
  ): Promise<boolean> {

    const path = 'agendamentos';

    try {

      // Busca SOMENTE pela data
      // evitando índice composto do Firebase
      const q = query(
        collection(db, path),
        where('dataAgendamento', '==', fecha)
      );

      const snapshot = await getDocs(q);

      // Filtra manualmente
      const docs = snapshot.docs.filter(d => {

        const data = d.data();

        return (
          d.id !== excludeId &&
          data.horario === horario &&
          data.sala === sala &&
          data.status === 'ativo'
        );
      });

      return docs.length > 0;

    } catch (error) {

      console.error('Erro ao verificar conflito:', error);

      return false;
    }
  },

  // =========================
  // CREATE AGENDAMENTO
  // =========================
  async createAgendamento(
    data: Omit<Agendamento, 'id' | 'criadoEm'>
  ) {

    const path = 'agendamentos';

    const isConflict = await this.checkConflict(
      data.dataAgendamento,
      data.horario,
      data.sala
    );

    if (isConflict) {
      throw new Error(
        'Este horário já está reservado para esta sala.'
      );
    }

    try {

      const docRef = await addDoc(
        collection(db, path),
        {
          ...data,
          criadoEm: serverTimestamp()
        }
      );

      // Histórico NÃO trava o fluxo
      this.logHistorico({
        acao: 'Criação',
        detalhes:
          `Agendamento criado para ${data.nomeProfissional} ` +
          `na sala ${data.sala} ` +
          `(${data.dataAgendamento} às ${data.horario})`,
        usuario: data.responsavelAgendamento
      });

      return docRef.id;

    } catch (error) {

      handleFirestoreError(
        error,
        OperationType.CREATE,
        path
      );
    }
  },

  // =========================
  // UPDATE
  // =========================
  async updateAgendamento(
    id: string,
    data: Partial<Agendamento>,
    usuario: string
  ) {

    const path = `agendamentos/${id}`;

    try {

      const docRef = doc(db, 'agendamentos', id);

      await updateDoc(docRef, data);

      this.logHistorico({
        acao: 'Edição',
        detalhes: `Agendamento ${id} atualizado.`,
        usuario
      });

    } catch (error) {

      handleFirestoreError(
        error,
        OperationType.UPDATE,
        path
      );
    }
  },

  // =========================
  // CANCELAR
  // =========================
  async cancelAgendamento(
    id: string,
    motivo: string,
    usuario: string
  ) {

    const path = `agendamentos/${id}`;

    try {

      const docRef = doc(db, 'agendamentos', id);

      await updateDoc(docRef, {
        status: 'cancelado',
        motivoCancelamento: motivo
      });

      this.logHistorico({
        acao: 'Cancelamento',
        detalhes:
          `Agendamento ${id} cancelado. ` +
          `Motivo: ${motivo}`,
        usuario
      });

    } catch (error) {

      handleFirestoreError(
        error,
        OperationType.UPDATE,
        path
      );
    }
  },

  // =========================
  // DELETE
  // =========================
  async deleteAgendamento(
    id: string,
    usuario: string
  ) {

    const path = `agendamentos/${id}`;

    try {

      const docRef = doc(db, 'agendamentos', id);

      await deleteDoc(docRef);

      this.logHistorico({
        acao: 'Exclusão',
        detalhes:
          `Agendamento ${id} excluído permanentemente.`,
        usuario
      });

    } catch (error) {

      handleFirestoreError(
        error,
        OperationType.DELETE,
        path
      );
    }
  },

  // =========================
  // CREATE AVISO
  // =========================
  async createAviso(
    mensagem: string,
    autor: string
  ) {

    const path = 'avisos';

    try {

      const docRef = await addDoc(
        collection(db, path),
        {
          mensagem,
          autor,
          criadoEm: serverTimestamp()
        }
      );

      this.logHistorico({
        acao: 'Aviso',
        detalhes:
          `Aviso publicado: "${mensagem.substring(0, 30)}..."`,
        usuario: autor
      });

      return docRef.id;

    } catch (error) {

      handleFirestoreError(
        error,
        OperationType.CREATE,
        path
      );
    }
  },

  // =========================
  // DELETE AVISO
  // =========================
  async deleteAviso(
    id: string,
    usuario: string
  ) {

    const path = `avisos/${id}`;

    try {

      const docRef = doc(db, 'avisos', id);

      await deleteDoc(docRef);

      this.logHistorico({
        acao: 'Aviso Excluído',
        detalhes: `Aviso ${id} excluído.`,
        usuario
      });

    } catch (error) {

      handleFirestoreError(
        error,
        OperationType.DELETE,
        path
      );
    }
  },

  // =========================
  // HISTÓRICO
  // =========================
  async logHistorico(
    item: Omit<HistoricoItem, 'id' | 'criadoEm'>
  ) {

    const path = 'historico';

    try {

      await addDoc(
        collection(db, path),
        {
          ...item,
          criadoEm: serverTimestamp()
        }
      );

    } catch (error) {

      console.error(
        'Erro ao salvar histórico:',
        error
      );
    }
  }
};