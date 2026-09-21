import React, { useState } from 'react';
import { LancamentoFinanceiro, ContaBancaria, Pessoa, DadosBoleto } from '../types';
// Corrigido caminho de importação para ../services/storageService
import { storageService } from '../services/storageService';
import { 
  WalletCards, 
  ArrowUpCircle, 
  ArrowDownCircle, 
  CheckCircle2, 
  Clock, 
  Filter, 
  Plus, 
  Building,
  Barcode,
  Printer
} from 'lucide-react';

interface FinanceiroProps {
  titulos: LancamentoFinanceiro[];
  contas: ContaBancaria[];
  pessoas: Pessoa[];
  onRefresh: () => void;
  onEmitirBoleto?: (boleto: DadosBoleto) => void;
}

export const Financeiro: React.FC<FinanceiroProps> = ({ 
  titulos, 
  contas, 
  pessoas, 
  onRefresh,
  onEmitirBoleto 
}) => {
  const [tabTipo, setTabTipo] = useState<'RECEITA' | 'DESPESA'>('RECEITA');
  const [filtroStatus, setFiltroStatus] = useState<string>('TODOS');
  const [modalBaixa, setModalBaixa] = useState<LancamentoFinanceiro | null>(null);
  const [valorBaixa, setValorBaixa] = useState<number>(0);
  const [contaBaixaId, setContaBaixaId] = useState<number>(contas[0]?.id || 1);
  const [modalNovoTitulo, setModalNovoTitulo] = useState(false);
  const [novoTitulo, setNovoTitulo] = useState({
    pessoa_id: pessoas[0]?.id || 1,
    tipo: 'DESPESA' as 'RECEITA' | 'DESPESA',
    descricao: 'Conta de Energia Elétrica',
    valor_nominal: 350.00,
    data_vencimento: new Date().toISOString().split('T')[0]
  });
  const [feedback, setFeedback] = useState<string | null>(null);

  const titulosFiltrados = titulos.filter(t => {
    if (t.tipo !== tabTipo) return false;
    if (filtroStatus === 'TODOS') return true;
    return t.status === filtroStatus;
  });

  const totalReceberPendente = titulos
    .filter(t => t.tipo === 'RECEITA' && t.status === 'PENDENTE')
    .reduce((acc, t) => acc + (t.valor_nominal - t.valor_pago), 0);

  const totalPagarPendente = titulos
    .filter(t => t.tipo === 'DESPESA' && t.status === 'PENDENTE')
    .reduce((acc, t) => acc + (t.valor_nominal - t.valor_pago), 0);

  const handleOpenBaixa = (t: LancamentoFinanceiro) => {
    setModalBaixa(t);
    setValorBaixa(t.valor_nominal - t.valor_pago);
  };

  const handleExecutarBaixa = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalBaixa) return;

    const res = storageService.baixarTitulo(modalBaixa.id, valorBaixa, contaBaixaId);
    if (res.success) {
      setFeedback(`Baixa efetuada com sucesso! Conta bancária atualizada.`);
      setModalBaixa(null);
      onRefresh();
    } else {
      setFeedback(`Erro ao baixar título: ${res.error}`);
    }
    setTimeout(() => setFeedback(null), 3500);
  };

  const handleAbrirBoletoTitulo = (t: LancamentoFinanceiro) => {
    const boleto = storageService.assegurarBoletoParaTitulo(t.id);
    if (boleto && onEmitirBoleto) {
      onEmitirBoleto(boleto);
    }
  };

  const handleCriarTituloAvulso = (e: React.FormEvent) => {
    e.preventDefault();
    const pessoa = pessoas.find(p => p.id === Number(novoTitulo.pessoa_id));
    const conta = contas[0];
    const lista = storageService.getTitulos();

    lista.unshift({
      id: Date.now(),
      conta_id: conta.id,
      conta_nome: conta.descricao,
      pessoa_id: Number(novoTitulo.pessoa_id),
      pessoa_nome: pessoa?.nome_razao,
      tipo: novoTitulo.tipo,
      origem_tipo: 'AVULSO',
      origem_id: Date.now(),
      descricao: novoTitulo.descricao,
      valor_nominal: Number(novoTitulo.valor_nominal),
      valor_pago: 0,
      data_vencimento: novoTitulo.data_vencimento,
      status: 'PENDENTE'
    });

    storageService.saveTitulos(lista);
    setModalNovoTitulo(false);
    onRefresh();
    setFeedback('Novo lançamento financeiro cadastrado com sucesso!');
    setTimeout(() => setFeedback(null), 3500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Financeiro: Contas a Pagar & Receber</h1>
          <p className="text-sm text-slate-400">Controle de liquidez, emissão de Boletos Bancários e baixas de títulos.</p>
        </div>

        <button
          onClick={() => setModalNovoTitulo(true)}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-semibold shadow-md shadow-emerald-500/20"
        >
          <Plus className="w-4 h-4" />
          Novo Lançamento Avulso
        </button>
      </div>

      {feedback && (
        <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          {feedback}
        </div>
      )}

      {/* Cards de Saldos das Contas Bancárias */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {contas.map((c) => (
          <div key={c.id} className="bg-slate-800/60 border border-slate-700/60 p-4 rounded-2xl shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">{c.descricao}</span>
              <p className="text-xl font-bold text-white mt-1">R$ {c.saldo_atual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              <span className="text-[10px] text-slate-500">
                {c.tipo === 'CAIXA_FISICO' ? 'Caixa da Loja' : `Banco ${c.codigo_banco || '341'} • Carteira ${c.carteira || '109'}`}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-emerald-400">
              <Building className="w-5 h-5" />
            </div>
          </div>
        ))}
      </div>

      {/* Tabs Contas a Receber vs Pagar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-3">
        <div className="flex gap-2">
          <button
            onClick={() => setTabTipo('RECEITA')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              tabTipo === 'RECEITA'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <ArrowUpCircle className="w-4 h-4" />
            Contas a Receber (Pendente: R$ {totalReceberPendente.toFixed(2)})
          </button>

          <button
            onClick={() => setTabTipo('DESPESA')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              tabTipo === 'DESPESA'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <ArrowDownCircle className="w-4 h-4" />
            Contas a Pagar (Pendente: R$ {totalPagarPendente.toFixed(2)})
          </button>
        </div>

        {/* Filtros de Status */}
        <div className="flex items-center gap-1.5 bg-slate-800/80 p-1.5 rounded-xl border border-slate-700 text-xs">
          <Filter className="w-3.5 h-3.5 text-slate-400 ml-1" />
          {['TODOS', 'PENDENTE', 'PAGO', 'PARCIAL'].map(st => (
            <button
              key={st}
              onClick={() => setFiltroStatus(st)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                filtroStatus === st ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Tabela de Lançamentos */}
      <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-900/80 text-slate-400 border-b border-slate-700 uppercase font-semibold text-[10px]">
                <th className="py-3 px-4">Vencimento</th>
                <th className="py-3 px-4">Parceiro / Pessoa</th>
                <th className="py-3 px-4">Descrição</th>
                <th className="py-3 px-4">Conta Vinculada</th>
                <th className="py-3 px-4">Valor Nominal</th>
                <th className="py-3 px-4">Valor Pago/Rec</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {titulosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-slate-400">
                    Nenhum título encontrado nesta categoria.
                  </td>
                </tr>
              ) : (
                titulosFiltrados.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-mono font-medium text-slate-300">
                      {new Date(t.data_vencimento).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="py-3 px-4 font-semibold text-white">{t.pessoa_nome || 'Não Informado'}</td>
                    <td className="py-3 px-4 text-slate-300">
                      {t.descricao}
                      {t.boleto_dados && (
                        <span className="block text-[10px] text-amber-400 font-mono">
                          Nosso Nº: {t.boleto_dados.nosso_numero}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-400">{t.conta_nome || 'Caixa Geral'}</td>
                    <td className="py-3 px-4 font-bold text-white">R$ {t.valor_nominal.toFixed(2)}</td>
                    <td className="py-3 px-4 font-mono text-emerald-400">R$ {t.valor_pago.toFixed(2)}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        t.status === 'PAGO'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : t.status === 'PARCIAL'
                          ? 'bg-indigo-500/20 text-indigo-300'
                          : 'bg-amber-500/20 text-amber-300'
                      }`}>
                        {t.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                      {/* Botão Emitir Boleto para títulos a receber */}
                      {t.tipo === 'RECEITA' && onEmitirBoleto && (
                        <button
                          onClick={() => handleAbrirBoletoTitulo(t)}
                          title="Visualizar e Imprimir Boleto Bancário"
                          className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-bold text-[11px] rounded-lg inline-flex items-center gap-1 transition-all"
                        >
                          <Barcode className="w-3.5 h-3.5" />
                          Boleto
                        </button>
                      )}

                      {t.status !== 'PAGO' && t.status !== 'CANCELADO' && (
                        <button
                          onClick={() => handleOpenBaixa(t)}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg text-xs"
                        >
                          Baixar
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Baixa de Título */}
      {modalBaixa && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-2">Liquidar Título Financeiro</h3>
            <p className="text-xs text-slate-400 mb-4">{modalBaixa.descricao}</p>

            <form onSubmit={handleExecutarBaixa} className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Conta Bancária / Caixa de Movimento:</label>
                <select
                  value={contaBaixaId}
                  onChange={(e) => setContaBaixaId(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                >
                  {contas.map(c => (
                    <option key={c.id} value={c.id}>{c.descricao} (Saldo: R$ {c.saldo_atual.toFixed(2)})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Valor a Liquidar (R$):</label>
                <input
                  type="number"
                  step="0.01"
                  max={modalBaixa.valor_nominal - modalBaixa.valor_pago}
                  value={valorBaixa}
                  onChange={(e) => setValorBaixa(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  required
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Pendente original: R$ {(modalBaixa.valor_nominal - modalBaixa.valor_pago).toFixed(2)}
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalBaixa(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold"
                >
                  Confirmar Baixa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Novo Lançamento Avulso */}
      {modalNovoTitulo && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-3">Novo Lançamento a Pagar / Receber</h3>
            <form onSubmit={handleCriarTituloAvulso} className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Tipo de Lançamento:</label>
                <select
                  value={novoTitulo.tipo}
                  onChange={(e) => setNovoTitulo({ ...novoTitulo, tipo: e.target.value as any })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                >
                  <option value="DESPESA">Despesa (Contas a Pagar)</option>
                  <option value="RECEITA">Receita (Contas a Receber)</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Pessoa / Fornecedor / Cliente:</label>
                <select
                  value={novoTitulo.pessoa_id}
                  onChange={(e) => setNovoTitulo({ ...novoTitulo, pessoa_id: Number(e.target.value) })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                >
                  {pessoas.map(p => (
                    <option key={p.id} value={p.id}>{p.nome_razao}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Descrição / Histórico:</label>
                <input
                  type="text"
                  value={novoTitulo.descricao}
                  onChange={(e) => setNovoTitulo({ ...novoTitulo, descricao: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Valor (R$):</label>
                  <input
                    type="number"
                    step="0.01"
                    value={novoTitulo.valor_nominal}
                    onChange={(e) => setNovoTitulo({ ...novoTitulo, valor_nominal: Number(e.target.value) })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Vencimento:</label>
                  <input
                    type="date"
                    value={novoTitulo.data_vencimento}
                    onChange={(e) => setNovoTitulo({ ...novoTitulo, data_vencimento: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalNovoTitulo(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold"
                >
                  Salvar Título
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
