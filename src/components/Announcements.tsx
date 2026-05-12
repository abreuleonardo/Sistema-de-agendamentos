import React, { useState } from 'react';
import { MessageSquare, Send, Trash2, User, Clock } from 'lucide-react';
import { Aviso } from '../types';
import { firestoreService } from '../services/firestoreService';
import { toast } from 'react-hot-toast';
import { formatDateTime } from '../lib/utils';

interface AnnouncementsProps {
  avisos: Aviso[];
}

export default function Announcements({ avisos }: AnnouncementsProps) {
  const [mensagem, setMensagem] = useState('');
  const [autor, setAutor] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mensagem || !autor) return toast.error('Preencha mensagem e seu nome');
    
    setLoading(true);
    try {
      await firestoreService.createAviso(mensagem, autor);
      setMensagem('');
      toast.success('Comunicado enviado!');
    } catch (e) {
      toast.error('Erro ao enviar aviso');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    const nome = prompt('Informe seu nome para confirmar a exclusão:');
    if (!nome) return;
    
    try {
      await firestoreService.deleteAviso(id, nome);
      toast.success('Aviso excluído');
    } catch (e) {
      toast.error('Erro ao excluir aviso');
    }
  };

  return (
    <div className="flex flex-col gap-8 animate-in slide-in-from-right duration-500">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
            <MessageSquare size={16} />
            Quadro de Avisos
          </h2>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit} className="bg-slate-50 p-5 rounded-xl border border-slate-100 mb-8 space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="w-full md:w-1/3">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 shadow-none block">Autor</label>
                <input 
                  type="text"
                  className="w-full bg-white border-slate-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-blue-500 transition-colors"
                  placeholder="Seu nome"
                  value={autor}
                  onChange={(e) => setAutor(e.target.value)}
                />
              </div>
              <div className="flex-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Comunicado</label>
                <div className="flex gap-2">
                  <input 
                    type="text"
                    className="flex-1 bg-white border-slate-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-blue-500 transition-colors"
                    placeholder="Escreva algo para todos..."
                    value={mensagem}
                    onChange={(e) => setMensagem(e.target.value)}
                  />
                  <button 
                    disabled={loading}
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all font-bold text-xs disabled:opacity-50 active:scale-95 shadow-sm"
                  >
                    Postar
                  </button>
                </div>
              </div>
            </div>
          </form>

          <div className="space-y-4">
            {avisos.length === 0 ? (
              <div className="text-center py-20 px-4">
                <div className="bg-slate-50 p-6 rounded-full w-fit mx-auto mb-4 border border-slate-100">
                  <MessageSquare className="text-slate-200" size={40} />
                </div>
                <h3 className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Nenhum comunicado no momento</h3>
              </div>
            ) : (
              avisos.map((aviso, idx) => (
                <div key={aviso.id} className={cn(
                  "group relative bg-slate-50 border-slate-100 border-l-4 p-4 rounded-lg transition-all hover:bg-white hover:border-slate-300",
                  idx % 2 === 0 ? "border-l-blue-400" : "border-l-amber-400"
                )}>
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800 text-xs">{aviso.autor}</span>
                      <span className="text-[10px] text-slate-400 font-medium">• {formatDateTime(aviso.criadoEm)}</span>
                    </div>
                    <button 
                      onClick={() => handleDelete(aviso.id)}
                      className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 transition-all"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <p className="text-slate-600 text-sm leading-relaxed">{aviso.mensagem}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
