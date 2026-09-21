import React, { useState } from 'react';
import { Produto, Pessoa, CompraEntrada, SugestaoCompra } from '../types';
// Corrigido caminho de importação para ../services/storageService
import { storageService } from '../services/storageService';
import { 
  Truck, 
  FileCode, 
  CheckCircle, 
  AlertCircle, 
  Calculator, 
  PlusCircle, 
  Boxes,
  Zap,
  ShoppingCart,
  TrendingDown,
  Layers,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';

interface ComprasProps {
  produtos: Produto[];
  pessoas: Pessoa[];
  onRefresh: () => void;
  onNavigateTab?: (tab: any) => void;
}

export const Compras: React.FC<ComprasProps> = ({ produtos, pessoas, onRefresh, onNavigateTab }) => {
  const [subAba, setSubAba] = useState<'SUGESTOES' | 'NOVA_COMPRA' | 'HISTORICO'>('SUGESTOES');
  const [chaveNfe, setChaveNfe] = useState(`3525${Math.floor(100000000000000000 + Math.random() * 900000000000000000)}`);
  const fornecedores = pessoas.filter(p => p.papel === 'FORNECEDOR' || p.papel === 'AMBOS');
  const [fornecedorId, setFornecedorId] = useState<number>(fornecedores[0]?.id || 1);
  const [itensCompra, setItensCompra] = useState<{ produto_id: number; quantidade: number; custo_unitario: number }[]>([
    { produto_id: produtos[0]?.id || 1, quantidade: 20, custo_unitario: (produtos[0]?.preco_custo || 15) * 1.05 }
  ]);
  const [condicaoPgto, setCondicaoPgto] = useState('Boleto 30 Dias');
  const [diasVencimento, setDiasVencimento] = useState(30);
  const [mensagem, setMensagem] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  // Lista dinâmica gerada pela lógica de estoque mínimo
  const sugestoesCompra = storageService.obterSugestoesCompra();
  const comprasRealizadas = storageService.getCompras();

  // Orçamento total estimado para reposição
  const totalInvestimentoSugerido = sugestoesCompra.reduce((acc, s) => acc + s.custo_total_previsto, 0);
  const totalItensCriticos = sugestoesCompra.filter(s => s.gravidade === 'CRITICA' || s.gravidade === 'ALERTA').length;

  // Carregar uma sugestão específica para o formulário de compra
  const handleCarregarSugestaoParaForm = (sug: SugestaoCompra) => {
    setChaveNfe(`PED-COMPRA-${Date.now().toString().slice(-6)}`);
    if (sug.fornecedor_sugerido_id) {
      setFornecedorId(sug.fornecedor_sugerido_id);
    }
    setItensCompra([
      {
        produto_id: sug.produto_id,
        quantidade: sug.quantidade_sugerida,
        custo_unitario: sug.custo_unitario_estimado
      }
    ]);
    setSubAba('NOVA_COMPRA');
    setMensagem(`Sugestão para "${sug.descricao}" carregada. Ajuste as quantidades ou confirme o pedido.`);
    setTimeout(() => setMensagem(null), 4000);
  };

  // Carregar todas as sugestões em lote para gerar uma grande ordem de compra de reposição
  const handleCarregarTodasSugestoes = () => {
    if (sugestoesCompra.length === 0) return;

    setChaveNfe(`ORDEM-LOTE-${Date.now().toString().slice(-6)}`);
    const itensMapeados = sugestoesCompra.map(s => ({
      produto_id: s.produto_id,
      quantidade: s.quantidade_sugerida,
      custo_unitario: s.custo_unitario_estimado
    }));

    setItensCompra(itensMapeados);
    setSubAba('NOVA_COMPRA');
    setMensagem(`${sugestoesCompra.length} itens de reposição crítica carregados no formulário.`);
    setTimeout(() => setMensagem(null), 4000);
  };

  // Executar compra automática direta de uma sugestão com 1 clique
  const handleComprarDiretoSugestao = (sug: SugestaoCompra) => {
    const payload = {
      chave_nfe: `AUTO-REP-${Math.floor(100000 + Math.random() * 900000)}`,
      fornecedor_id: sug.fornecedor_sugerido_id || fornecedores[0]?.id || 1,
      itens: [
        {
          produto_id: sug.produto_id,
          quantidade: sug.quantidade_sugerida,
          custo_unitario: sug.custo_unitario_estimado
        }
      ],
      condicao_pgto: 'Boleto Faturado 30D',
      dias_vencimento: 30
    };

    const res = storageService.processarEntradaCompras(payload);
    if (res.success) {
      setMensagem(`Ordem de compra gerada com sucesso para "${sug.descricao}"! Estoque reabastecido e título a pagar lançado.`);
      onRefresh();
    } else {
      setErro(res.error || 'Falha ao processar compra automática');
    }
    setTimeout(() => {
      setMensagem(null);
      setErro(null);
    }, 4500);
  };

  // Simular leitura de XML padrão NF-e
  const handleSimularXML = () => {
    const randomChave = `3525${Math.floor(100000000000000000 + Math.random() * 900000000000000000)}`;
    setChaveNfe(randomChave);
    setItensCompra([
      { produto_id: 1, quantidade: 30, custo_unitario: 19.50 },
      { produto_id: 2, quantidade: 15, custo_unitario: 26.00 }
    ]);
    setSubAba('NOVA_COMPRA');
    setMensagem('XML da NF-e simulado e mapeado com sucesso! Verifique os custos médios calculados.');
    setTimeout(() => setMensagem(null), 4000);
  };

  const handleAddItem = () => {
    const prod = produtos[0];
    setItensCompra(prev => [
      ...prev,
      { produto_id: prod ? prod.id : 1, quantidade: 10, custo_unitario: prod ? prod.preco_custo : 20 }
    ]);
  };

  const handleUpdateItem = (index: number, field: string, val: any) => {
    setItensCompra(prev => prev.map((item, i) => {
      if (i === index) {
        if (field === 'produto_id') {
          const prod = produtos.find(p => p.id === Number(val));
          return { ...item, produto_id: Number(val), custo_unitario: prod ? prod.preco_custo : item.custo_unitario };
        }
        return { ...item, [field]: Number(val) };
      }
      return item;
    }));
  };

  const handleRemoveItem = (index: number) => {
    setItensCompra(prev => prev.filter((_, i) => i !== index));
  };

  const handleConfirmarEntrada = (e: React.FormEvent) => {
    e.preventDefault();
    if (itensCompra.length === 0) {
      setErro('Insira ao menos um item para processar a entrada de estoque.');
      setTimeout(() => setErro(null), 3000);
      return;
    }

    const payload = {
      chave_nfe: chaveNfe,
      fornecedor_id: fornecedorId,
      itens: itensCompra,
      condicao_pgto: condicaoPgto,
      dias_vencimento: Number(diasVencimento) || 30
    };

    const res = storageService.processarEntradaCompras(payload);
    if (res.success) {
      setMensagem('Entrada confirmada! Estoque atualizado, Custo Médio Ponderado recalculado e Título a Pagar registrado no financeiro.');
      onRefresh();
      setChaveNfe(`3525${Math.floor(100000000000000000 + Math.random() * 900000000000000000)}`);
      setSubAba('HISTORICO');
    } else {
      setErro(res.error || 'Erro na entrada');
    }
    setTimeout(() => {
      setMensagem(null);
      setErro(null);
    }, 5000);
  };

  const totalCompra = itensCompra.reduce((acc, it) => acc + (it.quantidade * it.custo_unitario), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white tracking-tight">Compras & Reposição de Estoque</h1>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              Integrado com Kardex
            </span>
          </div>
          <p className="text-sm text-slate-400">
            Regra automatizada: monitoramento contínuo de estoque mínimo e geração inteligente de pedidos de compra.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSimularXML}
            className="flex items-center gap-2 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all"
          >
            <FileCode className="w-4 h-4" />
            Importar XML NF-e
          </button>
        </div>
      </div>

      {mensagem && (
        <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 shrink-0" />
          {mensagem}
        </div>
      )}

      {erro && (
        <div className="p-3 bg-rose-500/20 border border-rose-500/40 rounded-xl text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {erro}
        </div>
      )}

      {/* Navegação entre Sub-abas */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex gap-2">
          <button
            onClick={() => setSubAba('SUGESTOES')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              subAba === 'SUGESTOES'
                ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Zap className="w-4 h-4 text-amber-200" />
            Sugestões Automáticas ({sugestoesCompra.length})
          </button>

          <button
            onClick={() => setSubAba('NOVA_COMPRA')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              subAba === 'NOVA_COMPRA'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            Formulário / Entrada Manual
          </button>

          <button
            onClick={() => setSubAba('HISTORICO')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              subAba === 'HISTORICO'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Truck className="w-4 h-4" />
            Entradas Realizadas ({comprasRealizadas.length})
          </button>
        </div>

        {subAba === 'SUGESTOES' && sugestoesCompra.length > 0 && (
          <button
            onClick={handleCarregarTodasSugestoes}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition-all"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            Comprar Todos em Lote (R$ {totalInvestimentoSugerido.toFixed(2)})
          </button>
        )}
      </div>

      {/* ABA 1: SUGESTÕES AUTOMÁTICAS DE REPOSIÇÃO */}
      {subAba === 'SUGESTOES' && (
        <div className="space-y-4">
          {/* Cards de Métricas da Reposição Automática */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-800/60 border border-slate-700/60 p-4 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Itens para Reposição</span>
                <p className="text-2xl font-bold text-amber-400 mt-0.5">{sugestoesCompra.length} produtos</p>
                <span className="text-xs text-rose-400 font-medium">{totalItensCriticos} em estado crítico ou alerta</span>
              </div>
              <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400">
                <ShieldAlert className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-slate-800/60 border border-slate-700/60 p-4 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Investimento Estimado</span>
                <p className="text-2xl font-bold text-white mt-0.5">R$ {totalInvestimentoSugerido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                <span className="text-xs text-slate-400">Calculado pelo Custo Médio</span>
              </div>
              <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400">
                <Calculator className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-slate-800/60 border border-slate-700/60 p-4 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Regra de Gatilho</span>
                <p className="text-sm font-bold text-slate-200 mt-1">Estoque Atual &le; Estoque Mínimo</p>
                <span className="text-[11px] text-slate-400 block mt-0.5">Lote Econômico: Déficit + Pulmão Seguro</span>
              </div>
              <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400">
                <Zap className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Lista de Sugestões Geradas */}
          <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400" />
                  Sugestões Calculadas Automaticamente
                </h2>
                <p className="text-xs text-slate-400">
                  O sistema identificou estes produtos que atingiram ou romperam a margem de segurança.
                </p>
              </div>
            </div>

            {sugestoesCompra.length === 0 ? (
              <div className="text-center py-12 text-slate-400 bg-slate-900/40 rounded-xl border border-slate-800">
                <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-2 opacity-80" />
                <p className="text-sm font-semibold text-slate-200">Estoque Saudável!</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  Nenhum produto atingiu o nível mínimo definido no momento.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sugestoesCompra.map((sug) => {
                  const isCritica = sug.gravidade === 'CRITICA';
                  const isAlerta = sug.gravidade === 'ALERTA';

                  return (
                    <div
                      key={sug.produto_id}
                      className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                        isCritica
                          ? 'bg-rose-950/20 border-rose-500/40 hover:border-rose-500'
                          : isAlerta
                          ? 'bg-amber-950/20 border-amber-500/40 hover:border-amber-500'
                          : 'bg-slate-900/80 border-slate-700/80 hover:border-slate-600'
                      }`}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <div className="truncate">
                            <span className="text-[10px] font-mono text-slate-400 block">{sug.codigo_barras}</span>
                            <h3 className="text-sm font-bold text-white truncate mt-0.5">{sug.descricao}</h3>
                            <span className="text-[11px] text-slate-400">
                              Fornecedor Sugerido: <strong className="text-slate-200">{sug.fornecedor_nome}</strong>
                            </span>
                          </div>

                          <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full shrink-0 ${
                            isCritica
                              ? 'bg-rose-500/30 text-rose-300 border border-rose-500/50'
                              : isAlerta
                              ? 'bg-amber-500/30 text-amber-300 border border-amber-500/50'
                              : 'bg-slate-700 text-slate-300'
                          }`}>
                            {isCritica ? 'Zerado (Crítico)' : isAlerta ? 'Abaixo do Mínimo' : 'No Mínimo'}
                          </span>
                        </div>

                        {/* Comparativo de Níveis */}
                        <div className="grid grid-cols-3 gap-2 my-3 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
                          <div>
                            <span className="text-[10px] text-slate-400 block">Estoque Atual</span>
                            <span className={`text-sm font-bold ${isCritica ? 'text-rose-400' : 'text-amber-300'}`}>
                              {sug.estoque_atual} un
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 block">Estoque Mínimo</span>
                            <span className="text-sm font-bold text-slate-300">
                              {sug.estoque_minimo} un
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] text-emerald-400 block font-semibold">Qtd Sugerida</span>
                            <span className="text-sm font-extrabold text-emerald-300">
                              +{sug.quantidade_sugerida} un
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-xs text-slate-400 pb-2">
                          <span>Custo Médio Unitário: R$ {sug.custo_unitario_estimado.toFixed(2)}</span>
                          <span className="font-bold text-emerald-400">
                            Total: R$ {sug.custo_total_previsto.toFixed(2)}
                          </span>
                        </div>
                      </div>

                      {/* Ações de Conversão da Sugestão */}
                      <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                        <button
                          onClick={() => handleCarregarSugestaoParaForm(sug)}
                          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all"
                        >
                          Personalizar Qtd
                        </button>

                        <button
                          onClick={() => handleComprarDiretoSugestao(sug)}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/30 transition-all flex items-center gap-1.5"
                        >
                          <Zap className="w-3.5 h-3.5" />
                          Gerar Pedido Automático
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ABA 2: FORMULÁRIO DE COMPRA / ENTRADA MANUAL E XML */}
      {subAba === 'NOVA_COMPRA' && (
        <form onSubmit={handleConfirmarEntrada} className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-700 pb-3">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Truck className="w-4 h-4 text-emerald-400" />
                Registrar Ordem de Compra / Entrada de Estoque
              </h2>
              <p className="text-xs text-slate-400">
                Os itens inseridos atualizarão o estoque e o Custo Médio Ponderado no Kardex.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="text-xs font-semibold text-slate-300 block mb-1">Identificador / Chave NF-e:</label>
              <input
                type="text"
                value={chaveNfe}
                onChange={(e) => setChaveNfe(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-emerald-300"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Fornecedor Emitente:</label>
              <select
                value={fornecedorId}
                onChange={(e) => setFornecedorId(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
              >
                {fornecedores.map(f => (
                  <option key={f.id} value={f.id}>{f.nome_razao} ({f.cpf_cnpj})</option>
                ))}
              </select>
            </div>
          </div>

          {/* Mapeamento de Itens e Custo Médio Ponderado */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Calculator className="w-4 h-4 text-emerald-400" />
                Itens a Reabastecer e Recálculo de Custo Médio
              </span>
              <button
                type="button"
                onClick={handleAddItem}
                className="text-xs text-emerald-400 hover:underline flex items-center gap-1 font-semibold"
              >
                <PlusCircle className="w-3.5 h-3.5" /> Adicionar Outro Item
              </button>
            </div>

            <div className="space-y-2.5">
              {itensCompra.map((item, idx) => {
                const prod = produtos.find(p => p.id === item.produto_id);
                const estoqueAntigo = prod ? prod.estoque_atual : 0;
                const custoAntigo = prod ? prod.preco_custo : 0;
                const novoDivisor = estoqueAntigo + item.quantidade;
                const novoCustoCalculado = novoDivisor > 0
                  ? ((estoqueAntigo * custoAntigo) + (item.quantidade * item.custo_unitario)) / novoDivisor
                  : item.custo_unitario;

                return (
                  <div key={idx} className="bg-slate-900/80 border border-slate-700/80 p-3 rounded-xl grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                    <div className="md:col-span-4">
                      <label className="text-[10px] text-slate-400 block mb-0.5">Produto:</label>
                      <select
                        value={item.produto_id}
                        onChange={(e) => handleUpdateItem(idx, 'produto_id', e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                      >
                        {produtos.map(p => (
                          <option key={p.id} value={p.id}>
                            {p.descricao} (Atual: {p.estoque_atual} | Mín: {p.estoque_minimo})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label className="text-[10px] text-slate-400 block mb-0.5">Qtd Comprada:</label>
                      <input
                        type="number"
                        min="1"
                        value={item.quantidade}
                        onChange={(e) => handleUpdateItem(idx, 'quantidade', e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white text-center"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="text-[10px] text-slate-400 block mb-0.5">Custo Unitário (R$):</label>
                      <input
                        type="number"
                        step="0.01"
                        value={item.custo_unitario}
                        onChange={(e) => handleUpdateItem(idx, 'custo_unitario', e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white text-right"
                      />
                    </div>

                    {/* Demonstração da Regra ACID: Custo Médio Ponderado */}
                    <div className="md:col-span-3 p-2 rounded-lg bg-emerald-950/40 border border-emerald-500/20 text-emerald-300 text-xs">
                      <span className="text-[10px] font-bold block text-emerald-400">Novo Custo Médio Ponderado:</span>
                      <strong className="text-sm">R$ {novoCustoCalculado.toFixed(2)}</strong>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        (Estoque final: {estoqueAntigo + item.quantidade} un)
                      </span>
                    </div>

                    <div className="md:col-span-1 text-right">
                      {itensCompra.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          className="text-xs text-rose-400 hover:text-rose-300 font-semibold p-1"
                        >
                          Remover
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Condição de Pagamento e Confirmação */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 border-t border-slate-700">
            <div>
              <label className="text-xs text-slate-400 block mb-1">Condição Financeira:</label>
              <input
                type="text"
                value={condicaoPgto}
                onChange={(e) => setCondicaoPgto(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Prazo Vencimento (Dias):</label>
              <input
                type="number"
                value={diasVencimento}
                onChange={(e) => setDiasVencimento(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>

            <div className="flex flex-col justify-end">
              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                CONFIRMAR ENTRADA (R$ {totalCompra.toFixed(2)})
              </button>
            </div>
          </div>
        </form>
      )}

      {/* ABA 3: HISTÓRICO DE COMPRAS */}
      {subAba === 'HISTORICO' && (
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-5 shadow-sm">
          <h2 className="text-base font-bold text-white mb-3">Histórico de Entradas Registradas</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-900/80 text-slate-400 border-b border-slate-700 uppercase font-semibold text-[10px]">
                  <th className="py-2.5 px-4">ID</th>
                  <th className="py-2.5 px-4">Chave NF-e / Pedido</th>
                  <th className="py-2.5 px-4">Fornecedor</th>
                  <th className="py-2.5 px-4">Itens</th>
                  <th className="py-2.5 px-4">Valor Total</th>
                  <th className="py-2.5 px-4">Data Entrada</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {comprasRealizadas.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-6 text-slate-400">
                      Nenhuma entrada de compra realizada ainda.
                    </td>
                  </tr>
                ) : (
                  comprasRealizadas.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-800/40">
                      <td className="py-2.5 px-4 font-mono font-bold text-slate-200">#{c.id}</td>
                      <td className="py-2.5 px-4 font-mono text-[11px] text-slate-300">{c.chave_nfe}</td>
                      <td className="py-2.5 px-4 text-white font-medium">{c.fornecedor_nome || 'Fornecedor'}</td>
                      <td className="py-2.5 px-4 text-slate-300">{c.itens.length} produto(s)</td>
                      <td className="py-2.5 px-4 font-bold text-emerald-400">R$ {c.valor_total.toFixed(2)}</td>
                      <td className="py-2.5 px-4 text-slate-400">
                        {new Date(c.data_emissao).toLocaleDateString('pt-BR')}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
