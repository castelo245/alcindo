import React from 'react';
import { ViewTab } from '../types';
import { 
  Building2, 
  Sparkles, 
  Wifi, 
  ShoppingCart, 
  Download,
  Laptop
} from 'lucide-react';

interface NavbarProps {
  currentTab: ViewTab;
  onTabChange: (tab: ViewTab) => void;
  onOpenCopilot: () => void;
  onOpenInstallModal: () => void;
  isOnline: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  currentTab, 
  onTabChange, 
  onOpenCopilot,
  onOpenInstallModal,
  isOnline 
}) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 px-4 py-3 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Logo & Marca */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-white font-black text-xl">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-white tracking-tight">ERP Gestor Pro</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                v2.5 Enterprise
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">Frente de Caixa, Estoque, Compras e Financeiro</p>
          </div>
        </div>

        {/* Status e Ações Rápidas */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Status Offline / Contingência NFC-e */}
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
            isOnline 
              ? 'bg-emerald-950/60 border-emerald-500/30 text-emerald-300' 
              : 'bg-amber-950/60 border-amber-500/40 text-amber-300'
          }`}>
            <Wifi className="w-3.5 h-3.5" />
            <span className="hidden md:inline">{isOnline ? 'SEFAZ Online' : 'Contingência Offline'}</span>
          </div>

          {/* Botão Baixar / Instalar App no Computador */}
          <button
            onClick={onOpenInstallModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 text-sky-300 border border-slate-700 transition-all shadow-sm"
            title="Como baixar e usar este software no seu dia a dia"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Baixar / Usar App</span>
          </button>

          {/* Atalho Rápido para PDV */}
          <button
            onClick={() => onTabChange('pdv')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
              currentTab === 'pdv'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30'
                : 'bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700'
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
            <span className="hidden sm:inline">Abrir PDV (F1)</span>
          </button>

          {/* Botão AI Copilot */}
          <button
            onClick={onOpenCopilot}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-md shadow-indigo-500/25 transition-all"
          >
            <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
            <span className="hidden sm:inline">IA Copilot</span>
          </button>
        </div>
      </div>
    </header>
  );
};
