import React, { useState, useEffect } from 'react';
import { X, Calendar as CalendarIcon, Clock, User, Users, FileText, CheckCircle, Plus } from 'lucide-react';
import { Agendamento, SALAS, HORARIOS_PADRAO, Sala } from '../types';
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

export default function BookingModal({ isOpen, onClose, booking, agendamentos }: BookingModalProps) {
  const [formData, setFormData] = useState({
    nomeProfissional: '',
    atividade: '',
    serieTurma: '',
    dataAgendamento: format(new Date(), 'yyyy-MM-dd'),
    horario: '',
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
        horario: booking.horario,
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
        horario: '',
        sala: 'Laboratório Steam',
        responsavelAgendamento: '',
        observacoes: '',
      });
      setCustomHours([]);
    }
  }, [booking, isOpen]);

  const allHours = Array.from(new Set([...HORARIOS_PADRAO, ...customHours])).sort();

  const isHourOccupied = (hour: string) => {
    return agendamentos.some(a => 
      a.status === 'ativo' && 
      a.dataAgendamento === formData.dataAgendamento && 
      a.sala === formData.sala && 
      a.horario === hour &&
      a.id !== booking?.id
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.horario) return toast.error('Selecione um horário');
    
    setLoading(true);
    try {
      if (booking) {
        await firestoreService.updateAgendamento(booking.id, {
          ...formData,
        }, formData.responsavelAgendamento);
        toast.success('Agendamento atualizado com sucesso!');
      } else {
        await firestoreService.createAgendamento({
          ...formData,
          status: 'ativo'
        });
        toast.success('Agendamento realizado com sucesso!');
      }
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao realizar agendamento');
    } finally {
      setLoading(false);
    }
  };

  const addCustomHour = () => {
    if (!newCustomHour) return;
    if (allHours.includes(newCustomHour)) {
      toast.error('Este horário já existe na lista');
      return;
    }
    setCustomHours([...customHours, newCustomHour]);
    setFormData({ ...formData, horario: newCustomHour });
    setNewCustomHour('');
    setShowAddCustomHour(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in duration-300">
        <div className="bg-slate-50 p-6 flex items-center justify-between border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-1.5 rounded-lg text-white">
              <CalendarIcon size={18} />
            </div>
            <h2 className="text-base font-bold text-slate-800">{booking ? 'Editar Agendamento' : 'Novo Agendamento'}</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 max-h-[80vh] overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Profissional */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <User size={12} /> Profissional
              </label>
              <input 
                required
                type="text"
                className="w-full bg-slate-50 border-slate-100 border rounded-lg px-4 py-2.5 text-sm outline-none focus:border-blue-500 transition-all font-medium"
                placeholder="Ex: Prof. José Silva"
                value={formData.nomeProfissional}
                onChange={(e) => setFormData({...formData, nomeProfissional: e.target.value})}
              />
            </div>

            {/* Atividade */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <CheckCircle size={12} /> Atividade
              </label>
              <input 
                required
                type="text"
                className="w-full bg-slate-50 border-slate-100 border rounded-lg px-4 py-2.5 text-sm outline-none focus:border-blue-500 transition-all font-medium"
                placeholder="Ex: Aula de Química"
                value={formData.atividade}
                onChange={(e) => setFormData({...formData, atividade: e.target.value})}
              />
            </div>

            {/* Serie/Turma */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Users size={12} /> Série / Turma
              </label>
              <input 
                required
                type="text"
                className="w-full bg-slate-50 border-slate-100 border rounded-lg px-4 py-2.5 text-sm outline-none focus:border-blue-500 transition-all font-medium"
                placeholder="Ex: 3º Ano A"
                value={formData.serieTurma}
                onChange={(e) => setFormData({...formData, serieTurma: e.target.value})}
              />
            </div>

            {/* Responsável */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <User size={12} /> Sou: (Seu Nome)
              </label>
              <input 
                required
                type="text"
                className="w-full bg-slate-50 border-slate-100 border rounded-lg px-4 py-2.5 text-sm outline-none focus:border-blue-500 transition-all font-medium"
                placeholder="Identifique-se"
                value={formData.responsavelAgendamento}
                onChange={(e) => setFormData({...formData, responsavelAgendamento: e.target.value})}
              />
            </div>

            {/* Sala */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sala Disponível</label>
              <select 
                value={formData.sala}
                onChange={(e) => setFormData({...formData, sala: e.target.value as Sala})}
                className="w-full bg-slate-50 border-slate-100 border rounded-lg px-4 py-2.5 text-sm outline-none focus:border-blue-500 transition-all font-bold text-slate-700"
              >
                {SALAS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            {/* Data */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <CalendarIcon size={12} /> Data
              </label>
              <input 
                required
                type="date"
                className="w-full bg-slate-50 border-slate-100 border rounded-lg px-4 py-2.5 text-sm outline-none focus:border-blue-500 transition-all font-bold text-slate-700"
                value={formData.dataAgendamento}
                onChange={(e) => setFormData({...formData, dataAgendamento: e.target.value})}
              />
            </div>

            {/* Horário Selection Grid */}
            <div className="md:col-span-2 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Clock size={12} /> Selecione o Horário
                </label>
                <button 
                  type="button"
                  onClick={() => setShowAddCustomHour(!showAddCustomHour)}
                  className="text-blue-600 text-[10px] font-bold uppercase tracking-widest hover:underline"
                >
                  + Personalizar
                </button>
              </div>

              {showAddCustomHour && (
                <div className="flex gap-2 p-2 bg-slate-50 rounded-lg mb-2 border border-slate-100 animate-in slide-in-from-top duration-300">
                  <input 
                    type="time"
                    className="flex-1 bg-white border-slate-200 rounded p-2 text-xs"
                    value={newCustomHour}
                    onChange={(e) => setNewCustomHour(e.target.value)}
                  />
                  <button 
                    type="button" 
                    onClick={addCustomHour}
                    className="bg-blue-600 text-white px-4 py-2 rounded font-bold uppercase tracking-widest text-[10px]"
                  >
                    OK
                  </button>
                </div>
              )}

              <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-2">
                {allHours.map(h => {
                  const occupied = isHourOccupied(h);
                  const selected = formData.horario === h;

                  return (
                    <button
                      key={h}
                      type="button"
                      disabled={occupied}
                      onClick={() => setFormData({...formData, horario: h})}
                      className={cn(
                        "py-2 px-1 text-[10px] font-bold rounded-md border transition-all uppercase tracking-tighter",
                        occupied && "bg-slate-100 text-slate-300 border-slate-100 cursor-not-allowed line-through",
                        selected && !occupied && "bg-blue-600 text-white border-blue-600 shadow-md",
                        !selected && !occupied && "bg-white text-slate-600 border-slate-100 hover:border-slate-300"
                      )}
                    >
                      {h}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Observações */}
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <FileText size={12} /> Observações Extras
              </label>
              <textarea 
                className="w-full bg-slate-50 border-slate-100 border rounded-lg px-4 py-2.5 text-sm outline-none focus:border-blue-500 transition-all resize-none h-20"
                placeholder="Opcional..."
                value={formData.observacoes}
                onChange={(e) => setFormData({...formData, observacoes: e.target.value})}
              />
            </div>
          </div>

          <div className="mt-8 flex gap-3">
            <button 
              type="button"
              onClick={onClose}
              className="px-6 py-3 rounded-lg border border-slate-100 text-slate-400 font-bold uppercase tracking-widest text-[10px] hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </button>
            <button 
              disabled={loading}
              type="submit"
              className="flex-1 py-3 rounded-lg bg-blue-600 text-white font-bold uppercase tracking-widest text-[10px] hover:bg-blue-700 shadow-lg shadow-blue-50 transition-all disabled:opacity-50 active:scale-95"
            >
              {loading ? 'Processando...' : (booking ? 'Salvar Edição' : 'Confirmar Reserva')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
