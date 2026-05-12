import React, { useState, useMemo } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { 
  Calendar as CalendarIcon, 
  Plus, 
  MessageSquare, 
  History, 
  Filter, 
  Search,
  ChevronLeft,
  ChevronRight,
  Loader2
} from 'lucide-react';
import { useRealtimeData } from './hooks/useRealtimeData';
import { SALAS, Sala, Agendamento, StatusAgendamento } from './types';
import Dashboard from './components/Dashboard';
import BookingModal from './components/BookingModal';
import Announcements from './components/Announcements';
import HistoryLog from './components/HistoryLog';
import { cn } from './lib/utils';

type Tab = 'dashboard' | 'avisos' | 'historico';

export default function App() {
  const { agendamentos, avisos, historico, loading } = useRealtimeData();
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState<Agendamento | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSala, setSelectedSala] = useState<Sala | 'Todas'>('Todas');
  const [statusFilter, setStatusFilter] = useState<StatusAgendamento | 'Todas'>('Todas');

  const filteredAgendamentos = useMemo(() => {
    return agendamentos.filter(a => {
      const matchesSearch = a.nomeProfissional.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           a.atividade.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSala = selectedSala === 'Todas' || a.sala === selectedSala;
      const matchesStatus = statusFilter === 'Todas' || a.status === statusFilter;
      return matchesSearch && matchesSala && matchesStatus;
    });
  }, [agendamentos, searchTerm, selectedSala, statusFilter]);

  const openBookingModal = (booking: Agendamento | null = null) => {
    setEditingBooking(booking);
    setIsModalOpen(true);
  };

  if (loading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-blue-500 mb-4" size={48} />
        <p className="text-gray-600 font-medium">Carregando Sistema...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-gray-900 font-sans">
      <Toaster position="top-right" />
      
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg text-white">
              <CalendarIcon size={24} />
            </div>
            <h1 className="text-xl font-semibold tracking-tight hidden sm:block">
              Sistema de Agendamento <span className="text-slate-400 font-normal">| Supervisão Escolar</span>
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider text-slate-500">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> Sincronizado em tempo real
            </div>
            <button 
              onClick={() => openBookingModal()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 text-sm font-semibold transition-all shadow-sm active:scale-95"
            >
              <Plus size={18} />
              <span className="hidden xs:block">Novo Agendamento</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar / Navigation */}
          <aside className="w-full lg:w-64 flex flex-col gap-6 shrink-0">
            <nav className="bg-white p-2 rounded-2xl shadow-sm border border-slate-200">
              <button 
                onClick={() => setActiveTab('dashboard')}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all",
                  activeTab === 'dashboard' ? "bg-blue-50 text-blue-600" : "text-slate-500 hover:bg-slate-50"
                )}
              >
                <CalendarIcon size={20} />
                Dashboard
              </button>
              <button 
                onClick={() => setActiveTab('avisos')}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all mt-1",
                  activeTab === 'avisos' ? "bg-blue-50 text-blue-600" : "text-slate-500 hover:bg-slate-50"
                )}
              >
                <MessageSquare size={20} />
                Quadro de Avisos
                {avisos.length > 0 && (
                  <span className="ml-auto bg-blue-600 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                    {avisos.length}
                  </span>
                )}
              </button>
              <button 
                onClick={() => setActiveTab('historico')}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all mt-1",
                  activeTab === 'historico' ? "bg-blue-50 text-blue-600" : "text-slate-500 hover:bg-slate-50"
                )}
              >
                <History size={20} />
                Histórico
              </button>
            </nav>

            {activeTab === 'dashboard' && (
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col gap-5">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                  <Filter size={14} />
                  Filtros
                </div>
                
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                    <input 
                      type="text" 
                      placeholder="Pesquisar..."
                      className="w-full pl-9 pr-4 py-2 bg-slate-50 border-slate-100 border focus:border-blue-500 focus:bg-white rounded-lg text-xs transition-all outline-none"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-2 block">Salas</label>
                    <select 
                      value={selectedSala}
                      onChange={(e) => setSelectedSala(e.target.value as any)}
                      className="w-full text-xs bg-slate-50 border-slate-100 border rounded-lg p-2 focus:border-blue-500 outline-none"
                    >
                      <option value="Todas">Todas as Salas</option>
                      {SALAS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-2 block">Status</label>
                    <select 
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value as any)}
                      className="w-full text-xs bg-slate-50 border-slate-100 border rounded-lg p-2 focus:border-blue-500 outline-none"
                    >
                      <option value="Todas">Todos</option>
                      <option value="ativo">Ativos</option>
                      <option value="cancelado">Cancelados</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </aside>

          {/* Content Area */}
          <div className="flex-1">
            {activeTab === 'dashboard' && (
              <Dashboard 
                agendamentos={filteredAgendamentos} 
                onEdit={openBookingModal}
              />
            )}
            {activeTab === 'avisos' && (
              <Announcements avisos={avisos} />
            )}
            {activeTab === 'historico' && (
              <HistoryLog historico={historico} />
            )}
          </div>
        </div>
      </main>

      <BookingModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        booking={editingBooking}
        agendamentos={agendamentos}
      />
    </div>
  );
}
