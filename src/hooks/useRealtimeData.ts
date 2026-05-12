import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Agendamento, Aviso, HistoricoItem } from '../types';

export function useRealtimeData() {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [avisos, setAvisos] = useState<Aviso[]>([]);
  const [historico, setHistorico] = useState<HistoricoItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const qAgendamentos = query(collection(db, 'agendamentos'), orderBy('criadoEm', 'desc'));
    const unsubAgendamentos = onSnapshot(qAgendamentos, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Agendamento[];
      setAgendamentos(data);
      setLoading(false);
    }, (error) => {
      console.error('Error listening to agendamentos:', error);
    });

    const qAvisos = query(collection(db, 'avisos'), orderBy('criadoEm', 'desc'));
    const unsubAvisos = onSnapshot(qAvisos, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Aviso[];
      setAvisos(data);
    }, (error) => {
      console.error('Error listening to avisos:', error);
    });

    const qHistorico = query(collection(db, 'historico'), orderBy('criadoEm', 'desc'));
    const unsubHistorico = onSnapshot(qHistorico, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as HistoricoItem[];
      setHistorico(data);
    }, (error) => {
      console.error('Error listening to historico:', error);
    });

    return () => {
      unsubAgendamentos();
      unsubAvisos();
      unsubHistorico();
    };
  }, []);

  return { agendamentos, avisos, historico, loading };
}
