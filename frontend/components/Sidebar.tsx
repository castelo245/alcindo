import React from 'react';
  import { ViewTab } from '../types';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Receipt, 
  Truck, 
  Boxes, 
  WalletCards, 
  PieChart, 
  UsersRound,
  Sparkles,
  Download
} from 'lucide-react';

interface SidebarProps {
  currentTab: ViewTab;
  onTabChange: (tab: ViewTab) => void;
  onOpenInstallModal?: () => void;
  stockAlertCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  currentTab, 
  onTabChange, 
  onOpenInstallModal, 
  stockAlertCount 
}) => {
  const menuItems = [
    { id: 'dashboard' as ViewTab, label: 'Visão Geral', icon: LayoutDashboard },
    { id: 'pdv' as ViewTab, label: 'PDV Frente Caixa', icon: ShoppingCart, badge: 'Rápido' },
    { id: 'vendas' as ViewTab, label: 'Vendas & Pedidos', icon: Receipt },
    { 
      id: 'compras' as ViewTab, 
      label: 'Compras & XML', 
      icon: Truck, 
      alert: stockAlertCount > 0 ? stockAlertCount : undefined 
    },
    { id: 'estoque' as ViewTab, label: 'Estoque & Kardex', icon: Boxes, alert: stockAlertCount },
    { id: 'financeiro' as ViewTab, label: 'Financeiro (Pagar/Rec)', icon: WalletCards },
    { id: 'dre' as ViewTab, label: 'Fluxo Caixa & DRE', icon: PieChart },
    { id: 'cadastros' as ViewTab, label: 'Produtos & Pessoas', icon: UsersRound },
    { id: 'ai-copilot' as ViewTab, label: 'Copilot Analítico', icon: Sparkles, highlight: true },
  ];

  return (
    <aside className="w-full md:w-64 bg-slate-900/90 border-r border-slate-800 p-3 flex md:flex-col gap-1 shrink-0 overflow-x-auto md:overflow-visible">
      <div className="px-3 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider hidden md:block">
        Menu Principal
      </div>

      <nav className="flex md:flex-col gap-1 w-full">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap text-left ${
                isActive
                  ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80 border border-transparent'
              } ${item.highlight ? 'bg-gradient-to-r from-indigo-900/40 to-slate-800' : ''}`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : item.highlight ? 'text-indigo-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>

              {item.badge && (
                <span className="text-[10px] font-bold bg-emerald-500/30 text-emerald-300 px-1.5 py-0.5 rounded-md hidden lg:inline">
                  {item.badge}
                </span>
              )}

              {typeof item.alert === 'number' && item.alert > 0 && (
                <span className="text-[11px] font-bold bg-amber-500/30 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <span>{item.alert}</span>
                  <span className="text-[9px] uppercase hidden lg:inline">rep</span>
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Caixa de Download / Desktop e Backup */}
      {onOpenInstallModal && (
        <div className="mt-4 p-3 rounded-2xl bg-gradient-to-b from-slate-800/70 to-slate-900 border border-slate-700/80 hidden md:block">
          <div className="flex items-center gap-2 mb-1.5">
            <Download className="w-4 h-4 text-sky-400" />
            <span className="text-xs font-bold text-white">Baixar para Uso Diário</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed mb-2.5">
            Instale como app de desktop, faça backup dos dados ou rode localmente no seu computador.
          </p>
          <button
            onClick={onOpenInstallModal}
            className="w-full py-1.5 px-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-semibold transition-all text-center"
          >
            Instalar / Fazer Backup
          </button>
        </div>
      )}

      <div className="mt-auto hidden md:block p-3 rounded-xl bg-slate-800/40 border border-slate-800">
        <p className="text-xs text-amber-400 font-semibold mb-1 flex items-center gap-1">
          Monitor de Nível Mínimo
        </p>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          Gatilho automático ativado: pedidos de compra são sugeridos no momento em que o item atinge a margem mínima.
        </p>
      </div>
    </aside>
  );
};
