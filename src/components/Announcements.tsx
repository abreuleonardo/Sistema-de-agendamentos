import React, { useState } from 'react';
import { MessageSquare, Trash2 } from 'lucide-react';
import { Aviso } from '../types';
import { firestoreService } from '../services/firestoreService';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface AnnouncementsProps {
  avisos: Aviso[];
}

export default function Announcements({ avisos }: AnnouncementsProps) {
  const [mensagem, setMensagem] = useState('');
  const [autor, setAutor] = useState('');
  const [loading, setLoading] = useState(false);

  const formatarData = (data: any) => {
    try {
      if (!data) return 'Agora';

      if (data?.seconds) {
        return format(
          new Date(data.seconds * 1000),
          'dd/MM/yyyy HH:mm',
          { locale: ptBR }
        );
      }

      return 'Agora';
    } catch {
      return 'Agora';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!mensagem.trim() || !autor.trim()) {
      toast.error('Preencha mensagem e seu nome');
      return;
    }

    try {
      setLoading(true);

      await firestoreService.createAviso(
        mensagem.trim(),
        autor.trim()
      );

      setMensagem('');
      setAutor('');

      toast.success('Aviso publicado!');
    } catch (error) {
      console.error(error);
      toast.error('Erro ao publicar aviso');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    const nome = prompt('Digite seu nome para confirmar');

    if (!nome) return;

    try {
      await firestoreService.deleteAviso(id, nome);
      toast.success('Aviso removido');
    } catch (error) {
      console.error(error);
      toast.error('Erro ao remover aviso');
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        
        {/* HEADER */}
        <div className="p-4 border-b border-slate-100 bg-slate-50">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
            <MessageSquare size={16} />
            Quadro de Avisos
          </h2>
        </div>

        <div className="p-6">

          {/* FORM */}
          <form
            onSubmit={handleSubmit}
            className="bg-slate-50 p-5 rounded-xl border border-slate-100 mb-8 space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">
                  Seu nome
                </label>

                <input
                  type="text"
                  value={autor}
                  onChange={(e) => setAutor(e.target.value)}
                  placeholder="Digite seu nome"
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500"
                />
              </div>

              <div className="md:col-span-3">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">
                  Comunicado
                </label>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={mensagem}
                    onChange={(e) => setMensagem(e.target.value)}
                    placeholder="Digite o aviso..."
                    className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500"
                  />

                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-5 rounded-lg font-bold text-sm transition-all disabled:opacity-50"
                  >
                    {loading ? 'Postando...' : 'Postar'}
                  </button>
                </div>
              </div>

            </div>
          </form>

          {/* LISTA */}
          <div className="space-y-4">
            {avisos.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare
                  className="mx-auto text-slate-300 mb-3"
                  size={40}
                />

                <p className="text-slate-400 text-sm">
                  Nenhum aviso publicado.
                </p>
              </div>
            ) : (
              avisos.map((aviso) => (
                <div
                  key={aviso.id}
                  className="bg-slate-50 border border-slate-100 rounded-xl p-4 group"
                >
                  <div className="flex items-start justify-between gap-4">
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className="font-bold text-slate-700 text-sm">
                          {aviso.autor}
                        </span>

                        <span className="text-xs text-slate-400">
                          • {formatarData(aviso.criadoEm)}
                        </span>
                      </div>

                      <p className="text-sm text-slate-600 whitespace-pre-wrap break-words">
                        {aviso.mensagem}
                      </p>
                    </div>

                    <button
                      onClick={() => handleDelete(aviso.id)}
                      className="opacity-0 group-hover:opacity-100 transition-all text-slate-300 hover:text-red-500"
                    >
                      <Trash2 size={16} />
                    </button>

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