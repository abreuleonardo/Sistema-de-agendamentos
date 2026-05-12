import React from 'react';
import { History, User, Clock, Info } from 'lucide-react';
import { HistoricoItem } from '../types';
import { formatDateTime } from '../lib/utils';
import { cn } from '../lib/utils';

interface HistoryLogProps {
  historico: HistoricoItem[];
}

export default function HistoryLog({ historico }: HistoryLogProps) {
  return (
    <div className="flex flex-col gap-8 animate-in slide-in-from-right duration-500">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
            <History size={16} />
            Atendimento Recente
          </h2>
        </div>

        <div className="p-8 relative">
          {/* Timeline Line */}
          <div className="absolute left-10 top-0 bottom-0 w-px bg-slate-100" />

          <div className="space-y-6">
            {historico.length === 0 ? (
              <p className="text-center text-slate-300 py-20 font-bold uppercase tracking-widest text-[10px]">Sem registros de atividade.</p>
            ) : (
              historico.map((item) => (
                <div key={item.id} className="relative pl-10 group">
                  {/* Timeline Dot */}
                  <div className={cn(
                    "absolute left-[-5px] top-1.5 w-2.5 h-2.5 rounded-full border-2 border-white transition-all group-hover:scale-150 z-10",
                    item.acao === 'Criação' ? 'bg-blue-500' : 
                    item.acao === 'Cancelamento' ? 'bg-slate-400' :
                    item.acao === 'Exclusão' ? 'bg-amber-500' :
                    item.acao === 'Aviso' ? 'bg-emerald-500' : 'bg-slate-300'
                  )} />

                  <div className="bg-slate-50 group-hover:bg-white border-slate-50 border p-4 rounded-lg transition-all group-hover:shadow-sm group-hover:border-slate-200">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                       <div className="flex items-center gap-3">
                        <span className="text-[10px] font-bold text-slate-800 uppercase tracking-widest">
                          {item.acao}
                        </span>
                        <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
                          <Clock size={10} />
                          {formatDateTime(item.criadoEm)}
                        </div>
                       </div>
                       <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                        <User size={10} />
                        {item.usuario}
                       </div>
                    </div>
                    <p className="text-slate-600 text-xs leading-relaxed">{item.detalhes}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
