import React, { useState } from 'react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, User, Users } from 'lucide-react';
import { Agendamento, SALAS, CORES_SALA, TEXT_SALA, Sala } from '../types';
import { cn } from '../lib/utils';
import BookingDetails from './BookingDetails';

interface DashboardProps {
  agendamentos: Agendamento[];
  onEdit: (booking: Agendamento) => void;
}

export default function Dashboard({ agendamentos, onEdit }: DashboardProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(new Date());
  const [viewingBooking, setViewingBooking] = useState<Agendamento | null>(null);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

  const getDayAgendamentos = (day: Date) => {
    return agendamentos.filter(a => a.dataAgendamento === format(day, 'yyyy-MM-dd'));
  };

  const selectedDayAgendamentos = selectedDay ? getDayAgendamentos(selectedDay) : [];

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Calendar Grid */}
        <div className="xl:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
          <div className="p-4 flex items-center justify-between border-b border-slate-100">
            <div className="flex items-center gap-4">
              <h2 className="text-lg font-bold">
                {format(currentDate, 'MMMM yyyy', { locale: ptBR }).replace(/^\w/, (c) => c.toUpperCase())}
              </h2>
              <div className="flex bg-slate-100 rounded-md p-1">
                <button 
                  onClick={() => setCurrentDate(subMonths(currentDate, 1))}
                  className="px-2 py-1 hover:bg-white rounded transition-all"
                >
                  <ChevronLeft size={16} />
                </button>
                <button 
                  onClick={() => setCurrentDate(addMonths(currentDate, 1))}
                  className="px-2 py-1 hover:bg-white rounded transition-all"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
            <button 
              onClick={() => setCurrentDate(new Date())}
              className="px-3 py-1 text-xs font-semibold bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-lg transition-colors border border-slate-200"
            >
              Hoje
            </button>
          </div>

          <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/50">
            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(d => (
              <div key={d} className="py-2 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 flex-1">
            {calendarDays.map((day, idx) => {
              const dayAgendamentos = getDayAgendamentos(day);
              const isSelected = selectedDay && isSameDay(day, selectedDay);
              const isCurrentMonth = isSameMonth(day, monthStart);
              const isToday = isSameDay(day, new Date());

              return (
                <div 
                  key={idx}
                  onClick={() => setSelectedDay(day)}
                  className={cn(
                    "min-h-[100px] bg-white p-2 border-r border-b border-slate-50 cursor-pointer transition-all hover:bg-slate-50/50",
                    !isCurrentMonth && "opacity-30",
                    isSelected && "ring-2 ring-blue-500 ring-inset z-10"
                  )}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className={cn(
                        "text-sm font-medium w-7 h-7 flex items-center justify-center rounded-lg",
                        isToday && "bg-blue-600 text-white font-bold",
                        !isToday && isSelected && "bg-blue-50 text-blue-600 font-bold"
                    )}>
                      {format(day, 'd')}
                    </span>
                  </div>
                  
                  <div className="flex flex-col gap-1 overflow-hidden">
                    {dayAgendamentos.slice(0, 2).map(a => (
                      <div 
                        key={a.id}
                        className={cn(
                          "truncate text-[9px] px-1.5 py-0.5 rounded flex items-center gap-1",
                          a.status === 'cancelado' ? "bg-slate-300 text-white line-through" : `${CORES_SALA[a.sala]} text-white`
                        )}
                      >
                        <span className="font-bold opacity-80">{a.horario}</span>
                        <span className="truncate">{a.sala.split(' ')[0]}</span>
                      </div>
                    ))}
                    {dayAgendamentos.length > 2 && (
                      <div className="text-[9px] text-slate-400 font-bold pl-1 uppercase tracking-tighter">
                        + {dayAgendamentos.length - 2} items
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Legenda */}
          <div className="p-4 bg-slate-50 flex flex-wrap gap-x-6 gap-y-2 border-t border-slate-100">
            {SALAS.map(s => (
              <div key={s} className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                <div className={cn("w-2 h-2 rounded-full", CORES_SALA[s])} />
                {s}
              </div>
            ))}
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 opacity-60">
              <div className="w-2 h-2 rounded-full bg-slate-400" />
              Cancelado
            </div>
          </div>
        </div>

        {/* Sidebar Day View */}
        <div className="flex flex-col gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col h-full overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">
                  Agenda do dia
                </p>
                <h3 className="text-base font-bold text-slate-800">
                  {selectedDay ? format(selectedDay, "dd 'de' MMMM", { locale: ptBR }) : 'Selecione um dia'}
                </h3>
              </div>
              <div className="bg-white p-2 rounded-lg border border-slate-100 text-blue-600 shadow-sm">
                <CalendarIcon size={18} />
              </div>
            </div>

            <div className="p-4 space-y-4 overflow-y-auto max-h-[400px] flex-1 custom-scrollbar">
              {selectedDayAgendamentos.length === 0 ? (
                <div className="text-center py-12 flex flex-col items-center">
                  <div className="bg-slate-50 p-4 rounded-full mb-3 text-slate-200">
                    <Clock size={32} />
                  </div>
                  <p className="text-xs text-slate-400 font-medium italic">Nenhum agendamento para este dia.</p>
                </div>
              ) : (
                selectedDayAgendamentos
                  .sort((a, b) => a.horario.localeCompare(b.horario))
                  .map(a => (
                    <button 
                      key={a.id}
                      onClick={() => setViewingBooking(a)}
                      className={cn(
                        "w-full text-left p-3 rounded-lg border border-slate-100 transition-all hover:border-slate-300 group flex gap-3 h-auto",
                        a.status === 'cancelado' ? "bg-slate-50 opacity-60" : "bg-white"
                      )}
                    >
                      <div className={cn(
                        "w-1 shrink-0 rounded-full my-1",
                        a.status === 'cancelado' ? "bg-slate-300" : CORES_SALA[a.sala]
                      )} />
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[10px] font-bold text-slate-400">
                            {a.horario}
                          </span>
                          {a.status === 'cancelado' && (
                            <span className="text-[9px] bg-slate-200 text-slate-500 px-1.5 py-0.5 rounded uppercase font-bold">Cancelado</span>
                          )}
                        </div>
                        <h4 className={cn(
                          "text-sm font-bold truncate text-slate-800 group-hover:text-blue-600 transition-colors",
                          a.status === 'cancelado' && "line-through text-slate-400"
                        )}>
                          {a.nomeProfissional}
                        </h4>
                        <p className="text-[11px] text-slate-500 mt-0.5 truncate">{a.sala}</p>
                      </div>
                    </button>
                  ))
              )}
            </div>
          </div>
          
          {/* Próximos Eventos (Global) */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Clock size={14} className="text-blue-500" />
              Próximas Reservas
            </h3>
            <div className="space-y-4">
              {agendamentos
                .filter(a => a.status === 'ativo' && a.dataAgendamento >= format(new Date(), 'yyyy-MM-dd'))
                .sort((a, b) => {
                   if (a.dataAgendamento !== b.dataAgendamento) return a.dataAgendamento.localeCompare(b.dataAgendamento);
                   return a.horario.localeCompare(b.horario);
                })
                .slice(0, 4)
                .map(a => (
                  <div key={a.id} className="flex gap-3 items-center group cursor-pointer" onClick={() => setViewingBooking(a)}>
                    <div className={cn("w-1 h-8 rounded-full", CORES_SALA[a.sala])} />
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-bold text-slate-400">
                        {format(new Date(a.dataAgendamento + 'T00:00:00'), "dd/MM")} às {a.horario}
                      </p>
                      <p className="text-xs font-bold text-slate-700 truncate group-hover:text-blue-600">{a.nomeProfissional}</p>
                      <p className="text-[10px] text-slate-400 truncate">{a.sala} • {a.serieTurma}</p>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>

      {viewingBooking && (
        <BookingDetails 
          booking={viewingBooking}
          onClose={() => setViewingBooking(null)}
          onEdit={() => {
            onEdit(viewingBooking);
            setViewingBooking(null);
          }}
        />
      )}
    </div>
  );
}
