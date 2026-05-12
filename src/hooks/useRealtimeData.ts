import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Agendamento, Aviso, HistoricoItem } from '../types';

export function useRealtimeData() {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [avisos, setAvisos] = useState<Aviso[]>([]);
  const [historico, setHistorico] = useState<HistoricoItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let carregados = 0;

    const finalizarCarregamento = () => {
      carregados++;

      if (carregados >= 3) {
        setLoading(false);
      }
    };

    // AGENDAMENTOS
    const qAgendamentos = query(
      collection(db, 'agendamentos'),
      orderBy('criadoEm', 'desc')
    );

    const unsubAgendamentos = onSnapshot(
      qAgendamentos,
      (snapshot) => {
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Agendamento[];

        setAgendamentos(data);
        finalizarCarregamento();
      },
      (error) => {
        console.error('Erro agendamentos:', error);
        finalizarCarregamento();
      }
    );

    // AVISOS
    const qAvisos = query(
      collection(db, 'avisos'),
      orderBy('criadoEm', 'desc')
    );

    const unsubAvisos = onSnapshot(
      qAvisos,
      (snapshot) => {
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Aviso[];

        setAvisos(data);
        finalizarCarregamento();
      },
      (error) => {
        console.error('Erro avisos:', error);
        finalizarCarregamento();
      }
    );

    // HISTÓRICO
    const qHistorico = query(
      collection(db, 'historico'),
      orderBy('criadoEm', 'desc')
    );

    const unsubHistorico = onSnapshot(
      qHistorico,
      (snapshot) => {
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as HistoricoItem[];

        setHistorico(data);
        finalizarCarregamento();
      },
      (error) => {
        console.error('Erro histórico:', error);
        finalizarCarregamento();
      }
    );

    // Segurança extra:
    setTimeout(() => {
      setLoading(false);
    }, 5000);

    return () => {
      unsubAgendamentos();
      unsubAvisos();
      unsubHistorico();
    };
  }, []);

  return {
    agendamentos,
    avisos,
    historico,
    loading
  };
}