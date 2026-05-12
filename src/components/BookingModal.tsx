import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar as CalendarIcon,
  Clock,
  User,
  Users,
  FileText,
  CheckCircle
} from 'lucide-react';

import {
  Agendamento,
  SALAS,
  HORARIOS_PADRAO,
  Sala
} from '../types';

import { firestoreService } from '../services/firestoreService';
import { toast } from 'react-hot-toast';
import { cn } from '../lib/utils';
import { format } from 'date-fns';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Agendamento | null;
  agendamentos: Agendamento[];
}

export default function BookingModal({
  isOpen,
  onClose,
  booking,
  agendamentos
}: BookingModalProps) {

  const [formData, setFormData] = useState({
    nomeProfissional: '',
    atividade: '',
    serieTurma: '',
    dataAgendamento: format(new Date(), 'yyyy-MM-dd'),

    // MULTI HORÁRIOS
    horarios: [] as string[],

    sala: 'Laboratório Steam' as Sala,
    responsavelAgendamento: '',
    observacoes: '',
  });

  const [loading, setLoading] = useState(false);

  const [customHours, setCustomHours] = useState<string[]>([]);
  const [showAddCustomHour, setShowAddCustomHour] = useState(false);
  const [newCustomHour, setNewCustomHour] = useState('');

  useEffect(() => {

    if (booking) {

      setFormData({
        nomeProfissional: booking.nomeProfissional,
        atividade: booking.atividade,
        serieTurma: booking.serieTurma,
        dataAgendamento: booking.dataAgendamento,

        // transforma em array
        horarios: [booking.horario],

        sala: booking.sala,
        responsavelAgendamento: booking.responsavelAgendamento,
        observacoes: booking.observacoes || '',
      });

      if (!HORARIOS_PADRAO.includes(booking.horario)) {
        setCustomHours([booking.horario]);
      }

    } else {

      setFormData({
        nomeProfissional: '',
        atividade: '',
        serieTurma: '',
        dataAgendamento: format(new Date(), 'yyyy-MM-dd'),

        horarios: [],

        sala: 'Laboratório Steam',
        responsavelAgendamento: '',
        observacoes: '',
      });

      setCustomHours([]);
    }

  }, [booking, isOpen]);

  const allHours = Array
    .from(new Set([...HORARIOS_PADRAO, ...customHours]))
    .sort();

  const isHourOccupied = (hour: string) => {

    return agendamentos.some(a =>
      a.status === 'ativo' &&
      a.dataAgendamento === formData.dataAgendamento &&
      a.sala === formData.sala &&
      a.horario === hour &&
      a.id !== booking?.id
    );
  };

  // =========================
  // SUBMIT
  // =========================
  const handleSubmit = async (e: React.FormEvent) => {

    e.preventDefault();

    if (formData.horarios.length === 0) {
      toast.error('Selecione pelo menos um horário');
      return;
    }

    if (loading) return;

    setLoading(true);

    try {

      const { horarios, ...resto } = formData;

      // EDITAR
      if (booking) {

        firestoreService.updateAgendamento(
          booking.id,
          {
            ...resto,
            horario: horarios[0]
          },
          formData.responsavelAgendamento
        );

        toast.success('Agendamento atualizado!');

      } else {

        // CRIA VÁRIOS
        for (const horario of horarios) {

          firestoreService.createAgendamento({
            ...resto,
            horario,
            status: 'ativo'
          });
        }

        toast.success('Agendamentos realizados!');
      }

      setTimeout(() => {
        setLoading(false);
        onClose();
      }, 300);

    } catch (error: any) {

      console.error(error);

      toast.error(
        error?.message ||
        'Erro ao realizar agendamento'
      );

      setLoading(false);
    }
  };

  // =========================
  // ADD HORÁRIO CUSTOM
  // =========================
  const addCustomHour = () => {

    if (!newCustomHour) return;

    if (allHours.includes(newCustomHour)) {

      toast.error('Este horário já existe');

      return;
    }

    setCustomHours([
      ...customHours,
      newCustomHour
    ]);

    setFormData({
      ...formData,
      horarios: [
        ...formData.horarios,
        newCustomHour
      ]
    });

    setNewCustomHour('');
    setShowAddCustomHour(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">

      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in duration-300">

        {/* HEADER */}
        <div className="bg-slate-50 p-6 flex items-center justify-between border-b border-slate-100">

          <div className="flex items-center gap-3">

            <div className="bg-blue-600 p-1.5 rounded-lg text-white">
              <CalendarIcon size={18} />
            </div>

            <h2 className="text-base font-bold text-slate-800">
              {booking
                ? 'Editar Agendamento'
                : 'Novo Agendamento'}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400"
          >
            <X size={18} />
          </button>
        </div>

        {/* FORM */}
        <form
          onSubmit={handleSubmit}
          className="p-8 max-h-[80vh] overflow-y-auto"
        >

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* PROFISSIONAL */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <User size={12} />
                Profissional
              </label>

              <input
                required
                type="text"
                className="w-full bg-slate-50 border rounded-lg px-4 py-2.5 text-sm"
                placeholder="Ex: Prof. José"
                value={formData.nomeProfissional}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    nomeProfissional: e.target.value
                  })
                }
              />
            </div>

            {/* ATIVIDADE */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <CheckCircle size={12} />
                Atividade
              </label>

              <input
                required
                type="text"
                className="w-full bg-slate-50 border rounded-lg px-4 py-2.5 text-sm"
                placeholder="Ex: Aula de Matemática"
                value={formData.atividade}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    atividade: e.target.value
                  })
                }
              />
            </div>

            {/* TURMA */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Users size={12} />
                Série / Turma
              </label>

              <input
                required
                type="text"
                className="w-full bg-slate-50 border rounded-lg px-4 py-2.5 text-sm"
                placeholder="Ex: 3º Ano A"
                value={formData.serieTurma}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    serieTurma: e.target.value
                  })
                }
              />
            </div>

            {/* RESPONSÁVEL */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Responsável
              </label>

              <input
                required
                type="text"
                className="w-full bg-slate-50 border rounded-lg px-4 py-2.5 text-sm"
                placeholder="Seu nome"
                value={formData.responsavelAgendamento}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    responsavelAgendamento: e.target.value
                  })
                }
              />
            </div>

            {/* SALA */}
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Sala
              </label>

              <select
                value={formData.sala}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    sala: e.target.value as Sala
                  })
                }
                className="w-full bg-slate-50 border rounded-lg px-4 py-2.5 text-sm"
              >
                {SALAS.map(s => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            {/* DATA */}
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Data
              </label>

              <input
                required
                type="date"
                className="w-full bg-slate-50 border rounded-lg px-4 py-2.5 text-sm"
                value={formData.dataAgendamento}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    dataAgendamento: e.target.value
                  })
                }
              />
            </div>

            {/* HORÁRIOS */}
            <div className="md:col-span-2 space-y-3">

              <div className="flex items-center justify-between">

                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Clock size={12} />
                  Horários
                </label>

                <button
                  type="button"
                  onClick={() =>
                    setShowAddCustomHour(!showAddCustomHour)
                  }
                  className="text-blue-600 text-[10px] font-bold uppercase"
                >
                  + Personalizar
                </button>
              </div>

              {/* CUSTOM HOUR */}
              {showAddCustomHour && (

                <div className="flex gap-2">

                  <input
                    type="time"
                    value={newCustomHour}
                    onChange={(e) =>
                      setNewCustomHour(e.target.value)
                    }
                    className="flex-1 border rounded-lg p-2 text-xs"
                  />

                  <button
                    type="button"
                    onClick={addCustomHour}
                    className="bg-blue-600 text-white px-4 rounded-lg text-xs"
                  >
                    OK
                  </button>
                </div>
              )}

              {/* GRID */}
              <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-2">

                {allHours.map(h => {

                  const occupied = isHourOccupied(h);

                  const selected =
                    formData.horarios.includes(h);

                  return (

                    <button
                      key={h}
                      type="button"
                      disabled={occupied}
                      onClick={() => {

                        const jaExiste =
                          formData.horarios.includes(h);

                        if (jaExiste) {

                          setFormData({
                            ...formData,
                            horarios:
                              formData.horarios.filter(
                                x => x !== h
                              )
                          });

                        } else {

                          setFormData({
                            ...formData,
                            horarios: [
                              ...formData.horarios,
                              h
                            ]
                          });
                        }
                      }}

                      className={cn(
                        "py-2 px-1 text-[10px] font-bold rounded-md border transition-all",

                        occupied &&
                        "bg-slate-100 text-slate-300 border-slate-100 cursor-not-allowed line-through",

                        selected &&
                        !occupied &&
                        "bg-blue-600 text-white border-blue-600",

                        !selected &&
                        !occupied &&
                        "bg-white text-slate-600 border-slate-100 hover:border-slate-300"
                      )}
                    >
                      {h}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* OBS */}
            <div className="md:col-span-2">

              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <FileText size={12} />
                Observações
              </label>

              <textarea
                className="w-full bg-slate-50 border rounded-lg px-4 py-2.5 text-sm h-20 resize-none"
                placeholder="Opcional..."
                value={formData.observacoes}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    observacoes: e.target.value
                  })
                }
              />
            </div>
          </div>

          {/* BOTÕES */}
          <div className="mt-8 flex gap-3">

            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 rounded-lg border border-slate-100 text-slate-400 font-bold text-[10px]"
            >
              Cancelar
            </button>

            <button
              disabled={loading}
              type="submit"
              className="flex-1 py-3 rounded-lg bg-blue-600 text-white font-bold text-[10px] disabled:opacity-50"
            >
              {loading
                ? 'Processando...'
                : booking
                  ? 'Salvar Edição'
                  : 'Confirmar Reserva'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}