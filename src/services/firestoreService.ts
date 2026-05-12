import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  getDocs, 
  serverTimestamp,
  orderBy
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

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export const firestoreService = {
  // --- AGENDAMENTOS ---
  async checkConflict(fecha: string, horario: string, sala: Sala, excludeId?: string): Promise<boolean> {
    const path = 'agendamentos';
    try {
      const q = query(
        collection(db, path),
        where('dataAgendamento', '==', fecha),
        where('horario', '==', horario),
        where('sala', '==', sala),
        where('status', '==', 'ativo')
      );
      const snapshot = await getDocs(q);
      const docs = snapshot.docs.filter(d => d.id !== excludeId);
      return docs.length > 0;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
      return false;
    }
  },

  async createAgendamento(data: Omit<Agendamento, 'id' | 'criadoEm'>) {
    const path = 'agendamentos';
    const isConflict = await this.checkConflict(data.dataAgendamento, data.horario, data.sala);
    if (isConflict) throw new Error('Este horário já está reservado para esta sala.');

    try {
      const docRef = await addDoc(collection(db, path), {
        ...data,
        criadoEm: serverTimestamp()
      });
      
      await this.logHistorico({
        acao: 'Criação',
        detalhes: `Agendamento criado para ${data.nomeProfissional} na sala ${data.sala} (${data.dataAgendamento} às ${data.horario})`,
        usuario: data.responsavelAgendamento
      });

      return docRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  },

  async updateAgendamento(id: string, data: Partial<Agendamento>, usuario: string) {
    const path = `agendamentos/${id}`;
    try {
      const docRef = doc(db, 'agendamentos', id);
      await updateDoc(docRef, data);
      
      await this.logHistorico({
        acao: 'Edição',
        detalhes: `Agendamento ${id} atualizado.`,
        usuario: usuario
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  async cancelAgendamento(id: string, motivo: string, usuario: string) {
    const path = `agendamentos/${id}`;
    try {
      const docRef = doc(db, 'agendamentos', id);
      await updateDoc(docRef, {
        status: 'cancelado',
        motivoCancelamento: motivo
      });
      
      await this.logHistorico({
        acao: 'Cancelamento',
        detalhes: `Agendamento ${id} cancelado. Motivo: ${motivo}`,
        usuario: usuario
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  async deleteAgendamento(id: string, usuario: string) {
    const path = `agendamentos/${id}`;
    try {
      const docRef = doc(db, 'agendamentos', id);
      await deleteDoc(docRef);
      
      await this.logHistorico({
        acao: 'Exclusão',
        detalhes: `Agendamento ${id} excluído permanentemente.`,
        usuario: usuario
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  },

  // --- AVISOS ---
  async createAviso(mensagem: string, autor: string) {
    const path = 'avisos';
    try {
      const docRef = await addDoc(collection(db, path), {
        mensagem,
        autor,
        criadoEm: serverTimestamp()
      });

      await this.logHistorico({
        acao: 'Aviso',
        detalhes: `Aviso publicado: "${mensagem.substring(0, 30)}..."`,
        usuario: autor
      });

      return docRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  },

  async deleteAviso(id: string, usuario: string) {
    const path = `avisos/${id}`;
    try {
      const docRef = doc(db, 'avisos', id);
      await deleteDoc(docRef);
      
      await this.logHistorico({
        acao: 'Aviso Excluído',
        detalhes: `Aviso ${id} excluído.`,
        usuario: usuario
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  },

  // --- HISTORICO ---
  async logHistorico(item: Omit<HistoricoItem, 'id' | 'criadoEm'>) {
    const path = 'historico';
    try {
      await addDoc(collection(db, path), {
        ...item,
        criadoEm: serverTimestamp()
      });
    } catch (error) {
      console.error('Erro ao logar histórico:', error);
    }
  }
};
