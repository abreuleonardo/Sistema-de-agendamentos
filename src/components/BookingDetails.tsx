import React, { useState } from 'react';
import { X, Calendar as CalendarIcon, Clock, User, Users, FileText, Trash2, Ban, Edit, MapPin } from 'lucide-react';
import { Agendamento, CORES_SALA, TEXT_SALA } from '../types';
import { firestoreService } from '../services/firestoreService';
import { toast } from 'react-hot-toast';
import { cn, formatDateTime } from '../lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface BookingDetailsProps {
  booking: Agendamento;
  onClose: () => void;
  onEdit: () => void;
}

export default function BookingDetails({ booking, onClose, onEdit }: BookingDetailsProps) {
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [motivoCancelamento, setMotivoCancelamento] = useState('');
  const [loading, setLoading] = useState(false);
  const [usuario, setUsuario] = useState('');

  const handleCancel = async () => {
    if (!motivoCancelamento || !usuario) return toast.error('Preencha o motivo e seu nome');
    setLoading(true);
    try {
      await firestoreService.cancelAgendamento(booking.id, motivoCancelamento, usuario);
      toast.success('Agendamento cancelado com sucesso');
      onClose();
    } catch (e) {
      toast.error('Erro ao cancelar agendamento');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!usuario) return toast.error('Informe seu nome');
    setLoading(true);
    try {
      await firestoreService.deleteAgendamento(booking.id, usuario);
      toast.success('Agendamento removido permanentemente');
      onClose();
    } catch (e) {
      toast.error('Erro ao excluir agendamento');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        {/* Subdued Banner */}
        <div className={cn(
          "h-24 p-6 flex flex-col justify-end",
          booking.status === 'cancelado' ? "bg-slate-100" : "bg-slate-50 border-b border-slate-100"
        )}>
          <div className="absolute top-4 right-4">
            <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400">
              <X size={18} />
            </button>
          </div>
          <div className="flex items-center gap-2 mb-1">
            <span className={cn(
              "text-[9px] font-bold uppercase tracking-[0.2em] px-2 py-0.5 rounded",
              booking.status === 'cancelado' ? "bg-slate-300 text-slate-600" : TEXT_SALA[booking.sala] + " bg-white border border-slate-100"
            )}>
              {booking.status === 'cancelado' ? 'Reserva Cancelada' : booking.sala}
            </span>
          </div>
        </div>

        <div className="p-8">
          <div className="mb-6">
             <h2 className={cn(
               "text-2xl font-bold text-slate-800 tracking-tight",
               booking.status === 'cancelado' && "line-through opacity-50"
             )}>
              {booking.nomeProfissional}
            </h2>
            <div className="flex items-center gap-3 mt-1 text-slate-400 font-bold uppercase tracking-widest text-[10px]">
              <div className="flex items-center gap-1">
                <CalendarIcon size={10} />
                {format(new Date(booking.dataAgendamento + 'T00:00:00'), "dd/MM/yyyy", { locale: ptBR })}
              </div>
              <div className="flex items-center gap-1">
                <Clock size={10} />
                {booking.horario}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-8">
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                <Users size={12} /> Público
              </p>
              <p className="font-bold text-slate-700 text-sm">{booking.serieTurma}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                <User size={12} /> Agendado por
              </p>
              <p className="font-bold text-slate-700 text-sm">{booking.responsavelAgendamento}</p>
            </div>
          </div>

          <div className="space-y-2 mb-8 p-5 bg-slate-50 rounded-xl border border-slate-100">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
              <CheckCircle size={12} /> Objetivo / Atividade
            </p>
            <p className="text-sm font-bold text-slate-800 leading-relaxed">{booking.atividade}</p>
            {booking.observacoes && (
              <p className="text-xs text-slate-500 mt-2 pt-2 border-t border-slate-200 italic">{booking.observacoes}</p>
            )}
          </div>

          {booking.status === 'cancelado' && (
            <div className="mb-8 p-4 bg-slate-100 border border-slate-200 rounded-xl">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-1">
                <Ban size={12} /> Motivo do Cancelamento
              </p>
              <p className="text-xs font-bold text-slate-600">{booking.motivoCancelamento}</p>
            </div>
          )}

          {/* Actions */}
          {!showCancelConfirm && !showDeleteConfirm && (
            <div className="space-y-3">
              {booking.status === 'ativo' && (
                <div className="flex gap-3">
                  <button 
                    onClick={onEdit}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg border border-slate-200 text-slate-600 font-bold text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all active:scale-95"
                  >
                    <Edit size={14} /> Editar
                  </button>
                  <button 
                    onClick={() => setShowCancelConfirm(true)}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg bg-slate-50 text-slate-500 font-bold text-[10px] uppercase tracking-widest hover:bg-slate-100 transition-all active:scale-95"
                  >
                    <Ban size={14} /> Cancelar
                  </button>
                </div>
              )}
              <button 
                onClick={() => setShowDeleteConfirm(true)}
                className="w-full flex items-center justify-center gap-2 py-3 text-slate-300 font-bold text-[9px] uppercase tracking-widest hover:text-red-400 transition-colors"
              >
                <Trash2 size={12} /> Remover Permanentemente
              </button>
            </div>
          )}

          {/* Confirmations... (Simplified for minimalist look) */}
          {showCancelConfirm && (
            <div className="space-y-4 animate-in slide-in-from-bottom duration-300">
               <div className="grid grid-cols-2 gap-4">
                 <div className="col-span-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Quem está cancelando?</label>
                    <input 
                      type="text"
                      className="w-full bg-slate-50 border-slate-100 border rounded-lg p-2 text-xs outline-none"
                      value={usuario}
                      onChange={(e) => setUsuario(e.target.value)}
                    />
                 </div>
                 <div className="col-span-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Motivo</label>
                    <select 
                      className="w-full bg-slate-50 border-slate-100 border rounded-lg p-2 text-xs outline-none"
                      value={motivoCancelamento}
                      onChange={(e) => setMotivoCancelamento(e.target.value)}
                    >
                      <option value="">Selecione...</option>
                      <option value="Professor faltou">Professor faltou</option>
                      <option value="Evento adiado">Evento adiado</option>
                      <option value="Sala em manutenção">Sala em manutenção</option>
                      <option value="Outro">Outro</option>
                    </select>
                 </div>
               </div>
               <div className="flex gap-2 pt-2">
                 <button onClick={() => setShowCancelConfirm(false)} className="flex-1 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Voltar</button>
                 <button onClick={handleCancel} disabled={loading} className="flex-1 py-3 bg-slate-800 text-white rounded-lg text-[10px] font-bold uppercase tracking-widest">Confirmar</button>
               </div>
            </div>
          )}

          {showDeleteConfirm && (
            <div className="space-y-4 animate-in slide-in-from-bottom duration-300">
              <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest text-center">Excluir permanentemente?</p>
              <input 
                type="text"
                className="w-full bg-slate-50 border-slate-100 border rounded-lg p-2 text-xs outline-none"
                placeholder="Seu nome para confirmar"
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
              />
              <div className="flex gap-2">
                <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Voltar</button>
                <button onClick={handleDelete} disabled={loading} className="flex-1 py-3 bg-red-600 text-white rounded-lg text-[10px] font-bold uppercase tracking-widest">Sim, Excluir</button>
              </div>
            </div>
          )}

          <div className="mt-8 pt-4 border-t border-slate-100 flex justify-between items-center text-[8px] font-bold text-slate-300 uppercase tracking-widest">
             <span>REF: {booking.id.slice(0, 8)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
