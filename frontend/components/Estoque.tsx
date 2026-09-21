import React, { useState } from 'react';
import { Produto, EstoqueMovimentacao, ViewTab } from '../types';
// Corrigido caminho de importação para ../services/storageService
import { storageService } from '../services/storageService';
import { 
  Boxes, 
  ArrowDownLeft, 
  ArrowUpRight, 
  RotateCcw, 
  AlertTriangle, 
  Plus, 
  History, 
  Search,
  ShoppingCart,
  Zap,
  ArrowRight
} from 'lucide-react';

interface EstoqueProps {
  produtos: Produto[];
  movimentacoes: EstoqueMovimentacao[];
  onRefresh: () => void;
  onNavigateTab?: (tab: ViewTab) => void;
}

export const Estoque: React.FC<EstoqueProps> = ({ 
  produtos, 
  movimentacoes, 
  onRefresh,
  onNavigateTab 
}) => {
  const [busca, setBusca] = useState('');
  const [modalAjuste, setModalAjuste] = useState(false);
  const [produtoAjusteId, setProdutoAjusteId] = useState<number>(produtos[0]?.id || 1);
  const [novaQuantidade, setNovaQuantidade] = useState<number>(10);
  const [motivoAjuste, setMotivoAjuste] = useState('Inventário Físico Periódico');

  // Consulta automática das sugestões geradas pela regra de estoque mínimo
  const sugestoes = storageService.obterSugestoesCompra();

  const produtosFiltrados = produtos.filter(p => 
    p.descricao.toLowerCase().includes(busca.toLowerCase()) || 
    p.codigo_barras.includes(busca)
  );

  const handleSalvarAjuste = (e: React.FormEvent) => {
    e.preventDefault();
    const prods = storageService.getProdutos();
    const movs = storageService.getMovimentacoes();

    const prod = prods.find(p => p.id === produtoAjusteId);
    if (!prod) return;

    const saldoAnterior = prod.estoque_atual;
    const diferenca = novaQuantidade - saldoAnterior;
    prod.estoque_atual = novaQuantidade;

    movs.unshift({
      id: Date.now(),
      produto_id: prod.id,
      produto_nome: prod.descricao,
      tipo: 'AJUSTE',
      quantidade: Math.abs(diferenca),
      saldo_anterior: saldoAnterior,
      saldo_posterior: novaQuantidade,
      origem_tipo: 'BALANCO',
      origem_id: Date.now(),
      data_movimentacao: new Date().toISOString(),
      observacao: `${motivoAjuste} (Diferença: ${diferenca >= 0 ? '+' : ''}${diferenca} un)`
    });

    storageService.saveProdutos(prods);
    storageService.saveMovimentacoes(movs);
    setModalAjuste(false);
    onRefresh();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Controle de Estoque & Kardex</h1>
          <p className="text-sm text-slate-400">Trilha de auditoria obrigatória de cada movimentação física e monitoramento de reposição.</p>
        </div>

        <div className="flex items-center gap-2">
          {sugestoes.length > 0 && onNavigateTab && (
            <button
              onClick={() => onNavigateTab('compras')}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-bold transition-all"
            >
              <Zap className="w-4 h-4 text-amber-400" />
              Ver {sugestoes.length} Sugestões de Compra
            </button>
          )}

          <button
            onClick={() => setModalAjuste(true)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold transition-all"
          >
            <RotateCcw className="w-4 h-4 text-emerald-400" />
            Ajuste de Balanço / Inventário
          </button>
        </div>
      </div>

      {/* BANNER DE INTEGRAÇÃO ESTOQUE -> COMPRAS */}
      {sugestoes.length > 0 && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/50 via-slate-900 to-slate-900 border border-amber-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                Alerta de Nível Mínimo Atingido
                <span className="text-[10px] bg-amber-500 text-slate-950 px-1.5 py-0.2 rounded font-extrabold">
                  {sugestoes.length} itens
                </span>
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                A regra de reposição calculou automaticamente a necessidade de compra para manter a operação sem desabastecimento.
              </p>
            </div>
          </div>

          {onNavigateTab && (
            <button
              onClick={() => onNavigateTab('compras')}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shrink-0 flex items-center gap-1.5 transition-all shadow-md shadow-amber-500/20"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              Gerar Pedidos de Compra
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      {/* Grid: Saldo por Produto e Kardex */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Lista de Saldos Atuais (6 cols) */}
        <div className="lg:col-span-6 bg-slate-800/60 border border-slate-700/60 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Boxes className="w-4 h-4 text-emerald-400" />
              Saldos Atuais em Estoque
            </h2>

            <div className="relative w-44">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Filtrar..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-8 pr-2 py-1.5 text-xs text-white"
              />
            </div>
          </div>

          <div className="overflow-x-auto max-h-[500px]">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-900/80 text-slate-400 border-b border-slate-700 uppercase font-semibold text-[10px]">
                  <th className="py-2.5 px-3">Produto</th>
                  <th className="py-2.5 px-3">Custo Médio</th>
                  <th className="py-2.5 px-3">Venda</th>
                  <th className="py-2.5 px-3 text-right">Saldo Atual</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {produtosFiltrados.map((p) => {
                  const isAbaixoMinimo = p.estoque_atual <= p.estoque_minimo;
                  return (
                    <tr key={p.id} className="hover:bg-slate-800/40">
                      <td className="py-2.5 px-3">
                        <span className="font-semibold text-white block">{p.descricao}</span>
                        <span className="text-[10px] text-slate-400 font-mono">Cód: {p.codigo_barras}</span>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-300">R$ {p.preco_custo.toFixed(2)}</td>
                      <td className="py-2.5 px-3 font-mono text-emerald-400">R$ {p.preco_venda.toFixed(2)}</td>
                      <td className="py-2.5 px-3 text-right">
                        <span className={`font-bold px-2 py-0.5 rounded text-xs inline-block ${
                          isAbaixoMinimo ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'text-slate-200'
                        }`}>
                          {p.estoque_atual} un
                        </span>
                        <span className="text-[10px] text-slate-500 block">Min: {p.estoque_minimo}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Trilha de Auditoria Kardex (6 cols) */}
        <div className="lg:col-span-6 bg-slate-800/60 border border-slate-700/60 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <History className="w-4 h-4 text-sky-400" />
              Auditoria Kardex (Livro de Movimentações)
            </h2>
            <span className="text-xs text-slate-400">{movimentacoes.length} registros</span>
          </div>

          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
            {movimentacoes.map((mov) => {
              const isEntrada = mov.tipo === 'ENTRADA';
              const isAjuste = mov.tipo === 'AJUSTE';
              return (
                <div key={mov.id} className="p-3 rounded-xl bg-slate-900/80 border border-slate-700/80 flex items-start justify-between gap-3 text-xs">
                  <div className="flex items-start gap-2.5">
                    <div className={`p-1.5 rounded-lg mt-0.5 ${
                      isEntrada 
                        ? 'bg-emerald-500/20 text-emerald-400' 
                        : isAjuste 
                        ? 'bg-amber-500/20 text-amber-300'
                        : 'bg-rose-500/20 text-rose-400'
                    }`}>
                      {isEntrada ? <ArrowDownLeft className="w-3.5 h-3.5" /> : <ArrowUpRight className="w-3.5 h-3.5" />}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-200">{mov.produto_nome}</p>
                      <p className="text-[11px] text-slate-400">{mov.observacao || `Origem: ${mov.origem_tipo}`}</p>
                      <span className="text-[10px] text-slate-500">
                        {new Date(mov.data_movimentacao).toLocaleString('pt-BR')}
                      </span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className={`font-bold ${
                      isEntrada ? 'text-emerald-400' : isAjuste ? 'text-amber-300' : 'text-rose-400'
                    }`}>
                      {isEntrada ? '+' : '-'}{mov.quantidade} un
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      Saldo: {mov.saldo_anterior} → {mov.saldo_posterior}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Modal Ajuste de Balanço */}
      {modalAjuste && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-3">Ajuste de Saldo Físico</h3>
            <form onSubmit={handleSalvarAjuste} className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Produto a Ajustar:</label>
                <select
                  value={produtoAjusteId}
                  onChange={(e) => setProdutoAjusteId(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                >
                  {produtos.map(p => (
                    <option key={p.id} value={p.id}>{p.descricao} (Atual: {p.estoque_atual})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Nova Quantidade Real Contada:</label>
                <input
                  type="number"
                  min="0"
                  value={novaQuantidade}
                  onChange={(e) => setNovaQuantidade(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Justificativa do Ajuste:</label>
                <input
                  type="text"
                  value={motivoAjuste}
                  onChange={(e) => setMotivoAjuste(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalAjuste(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold"
                >
                  Gravar no Kardex
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
