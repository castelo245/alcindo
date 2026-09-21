import React from 'react';
import { Produto, Venda, LancamentoFinanceiro, ContaBancaria, ViewTab } from '../types';
// Corrigido caminho de importação para ../services/storageService
import { storageService } from '../services/storageService';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  AlertTriangle, 
  ShoppingCart, 
  Receipt, 
  ArrowUpRight,
  Boxes,
  Clock,
  Zap,
  ArrowRight
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';

interface DashboardProps {
  produtos: Produto[];
  vendas: Venda[];
  titulos: LancamentoFinanceiro[];
  contas: ContaBancaria[];
  onNavigate: (tab: ViewTab) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  produtos,
  vendas,
  titulos,
  contas,
  onNavigate
}) => {
  // Cálculos de Resumo
  const totalSaldoBancario = contas.reduce((acc, c) => acc + c.saldo_atual, 0);

  const receitasRecebidas = titulos
    .filter(t => t.tipo === 'RECEITA' && t.status === 'PAGO')
    .reduce((acc, t) => acc + t.valor_pago, 0);

  const despesasPagas = titulos
    .filter(t => t.tipo === 'DESPESA' && t.status === 'PAGO')
    .reduce((acc, t) => acc + t.valor_pago, 0);

  const titulosVencendoHojeOuPendentes = titulos.filter(
    t => t.status === 'PENDENTE'
  );

  const sugestoesCompra = storageService.obterSugestoesCompra();

  const produtosAbaixoMinimo = produtos.filter(
    p => p.estoque_atual <= p.estoque_minimo && p.ativo
  );

  // Vendas de hoje
  const hojeStr = new Date().toISOString().split('T')[0];
  const vendasHoje = vendas.filter(v => v.data_venda.startsWith(hojeStr) && v.status === 'CONCLUIDA');
  const faturamentoHoje = vendasHoje.reduce((acc, v) => acc + v.valor_total, 0);

  const dadosGrafico = [
    { dia: 'Seg', receita: 1200, despesa: 400 },
    { dia: 'Ter', receita: 2100, despesa: 850 },
    { dia: 'Qua', receita: 1800, despesa: 1200 },
    { dia: 'Qui', receita: 2900, despesa: 600 },
    { dia: 'Sex', receita: 3400, despesa: 1100 },
    { dia: 'Sáb', receita: 4100, despesa: 900 },
    { dia: 'Hoje', receita: faturamentoHoje || 1950, despesa: 350 },
  ];

  return (
    <div className="space-y-6">
      {/* Header do Módulo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Painel de Controle Executivo</h1>
          <p className="text-sm text-slate-400">Visão consolidada do fluxo operacional, saldos e estoque.</p>
        </div>
        <div className="flex items-center gap-2">
          {sugestoesCompra.length > 0 && (
            <button 
              onClick={() => onNavigate('compras')}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold shadow-md shadow-amber-500/20 transition-all"
            >
              <Zap className="w-3.5 h-3.5" />
              Repor {sugestoesCompra.length} Itens Mínimos
            </button>
          )}

          <button 
            onClick={() => onNavigate('pdv')}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-emerald-600/30 transition-all"
          >
            <ShoppingCart className="w-4 h-4" />
            Nova Venda PDV
          </button>
        </div>
      </div>

      {/* Grid de Cards KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card Saldo em Caixa & Bancos */}
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-4 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Saldo Líquido Atual</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-white">
              R$ {totalSaldoBancario.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
              Distribuído em {contas.length} contas bancárias
            </p>
          </div>
        </div>

        {/* Card Faturamento Hoje */}
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-4 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Vendas Hoje</span>
            <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-sky-300">
              R$ {faturamentoHoje.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
              {vendasHoje.length} venda(s) registradas hoje
            </p>
          </div>
        </div>

        {/* Card Contas a Pagar Pendentes */}
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-4 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Títulos Pendentes</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-amber-300">
              {titulosVencendoHojeOuPendentes.length}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Aguardando pagamento ou recebimento
            </p>
          </div>
        </div>

        {/* Card Alerta de Estoque Crítico / Mínimo */}
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-4 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Gatilho de Reposição</span>
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-rose-400">
              {produtosAbaixoMinimo.length} item(ns)
            </div>
            <p className="text-xs text-slate-400 mt-1">
              No ou abaixo do limite mínimo definido
            </p>
          </div>
        </div>
      </div>

      {/* Grid Gráfico & Alertas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gráfico de Entradas vs Saídas */}
        <div className="lg:col-span-2 bg-slate-800/60 border border-slate-700/60 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-white">Fluxo de Caixa Operacional</h2>
              <p className="text-xs text-slate-400">Comparativo das receitas brutas e saídas financeiras</p>
            </div>
            <button 
              onClick={() => onNavigate('dre')}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1"
            >
              DRE Completa <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dadosGrafico} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="receitasGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                  </linearGradient>
                  <linearGradient id="despesasGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.6} />
                <XAxis dataKey="dia" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', color: '#fff' }}
                  formatter={(val: any) => [`R$ ${Number(val).toFixed(2)}`, '']}
                />
                <Area type="monotone" dataKey="receita" name="Receita" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#receitasGrad)" />
                <Area type="monotone" dataKey="despesa" name="Despesa" stroke="#f43f5e" strokeWidth={2} fillOpacity={1} fill="url(#despesasGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Lista de Alertas de Reposição e Ação Direta de Compra */}
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Boxes className="w-4 h-4 text-amber-400" />
                Sugestões Automáticas de Compra
              </h2>
              <button 
                onClick={() => onNavigate('compras')}
                className="text-xs text-amber-400 hover:underline font-semibold flex items-center gap-1"
              >
                Ver Todas <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {sugestoesCompra.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs">
                Nenhum produto em nível crítico no momento.
              </div>
            ) : (
              <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                {sugestoesCompra.map((sug) => (
                  <div key={sug.produto_id} className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-700/80 flex items-center justify-between gap-3">
                    <div className="truncate">
                      <p className="text-xs font-semibold text-slate-200 truncate">{sug.descricao}</p>
                      <p className="text-[11px] text-slate-400">
                        Atual: <strong className="text-rose-400">{sug.estoque_atual} un</strong> | Mínimo: {sug.estoque_minimo}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs font-bold text-emerald-400 block">
                        +{sug.quantidade_sugerida} un
                      </span>
                      <span className="text-[10px] text-slate-400">
                        R$ {sug.custo_total_previsto.toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => onNavigate('compras')}
            className="w-full mt-4 py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-xs font-bold text-slate-950 transition-all text-center flex items-center justify-center gap-1.5"
          >
            <Zap className="w-3.5 h-3.5" />
            Converter Sugestões em Pedido de Compra
          </button>
        </div>
      </div>
    </div>
  );
};
