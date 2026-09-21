import React, { useState } from 'react';
import { Venda, Produto, Pessoa, ContaBancaria, DadosBoleto } from '../types';
// Corrigido caminho de importação para ../services/storageService
import { storageService } from '../services/storageService';
import { 
  Receipt, 
  Plus, 
  CheckCircle, 
  XCircle, 
  FileText, 
  AlertCircle, 
  Filter,
  Barcode,
  Calendar,
  Building,
  ArrowRight,
  Layers
} from 'lucide-react';

interface VendasProps {
  vendas: Venda[];
  produtos: Produto[];
  pessoas: Pessoa[];
  contas: ContaBancaria[];
  onRefresh: () => void;
  onEmitirCupom: (venda: Venda) => void;
  onEmitirBoleto: (boleto: DadosBoleto) => void;
}

export const Vendas: React.FC<VendasProps> = ({ 
  vendas, 
  produtos, 
  pessoas, 
  contas,
  onRefresh,
  onEmitirCupom,
  onEmitirBoleto
}) => {
  const [modalNovoPedido, setModalNovoPedido] = useState(false);
  const [modalFaturamentoBoleto, setModalFaturamentoBoleto] = useState<Venda | null>(null);
  const [filtroStatus, setFiltroStatus] = useState<string>('TODOS');
  
  // Parâmetros de Faturamento em Boleto
  const contasBancarias = contas.filter(c => c.tipo === 'BANCO');
  const [contaBoletoId, setContaBoletoId] = useState<number>(contasBancarias[0]?.id || contas[0]?.id || 1);
  const [parcelasBoleto, setParcelasBoleto] = useState<number>(1);
  const [intervaloDias, setIntervaloDias] = useState<number>(30);
  const [dataPrimeiroVenc, setDataPrimeiroVenc] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split('T')[0];
  });

  const [clienteId, setClienteId] = useState<number>(pessoas[1]?.id || 1);
  const [itensPedido, setItensPedido] = useState<{ produto_id: number; quantidade: number; preco: number }[]>([
    { produto_id: produtos[0]?.id || 1, quantidade: 1, preco: produtos[0]?.preco_venda || 0 }
  ]);
  const [mensagem, setMensagem] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  const clientes = pessoas.filter(p => p.papel === 'CLIENTE' || p.papel === 'AMBOS');

  const vendasFiltradas = vendas.filter(v => {
    if (filtroStatus === 'TODOS') return true;
    return v.status === filtroStatus;
  });

  const handleAddItem = () => {
    setItensPedido(prev => [
      ...prev, 
      { produto_id: produtos[0]?.id || 1, quantidade: 1, preco: produtos[0]?.preco_venda || 0 }
    ]);
  };

  const handleUpdateItem = (index: number, field: string, val: any) => {
    setItensPedido(prev => prev.map((item, i) => {
      if (i === index) {
        if (field === 'produto_id') {
          const p = produtos.find(prod => prod.id === Number(val));
          return { ...item, produto_id: Number(val), preco: p ? p.preco_venda : item.preco };
        }
        return { ...item, [field]: val };
      }
      return item;
    }));
  };

  const handleSalvarOrcamento = (e: React.FormEvent) => {
    e.preventDefault();
    const cliente = pessoas.find(p => p.id === clienteId);
    const subtotal = itensPedido.reduce((acc, i) => acc + (i.quantidade * i.preco), 0);

    const novoOrcamento: Venda = {
      id: Date.now(),
      cliente_id: clienteId,
      cliente_nome: cliente?.nome_razao || 'Cliente',
      tipo_origem: 'BALCAO',
      status: 'ORCAMENTO',
      itens: itensPedido.map((it, idx) => {
        const prod = produtos.find(p => p.id === it.produto_id)!;
        return {
          id: Date.now() + idx,
          produto_id: it.produto_id,
          descricao: prod.descricao,
          quantidade: it.quantidade,
          preco_unitario: it.preco,
          subtotal: it.quantidade * it.preco
        };
      }),
      valor_total: subtotal,
      desconto: 0,
      data_venda: new Date().toISOString()
    };

    const todas = storageService.getVendas();
    todas.unshift(novoOrcamento);
    storageService.saveVendas(todas);

    setModalNovoPedido(false);
    onRefresh();
    setMensagem('Orçamento salvo com sucesso!');
    setTimeout(() => setMensagem(null), 3500);
  };

  // Executar Faturamento em Boleto Bancário
  const handleConfirmarFaturamentoBoleto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalFaturamentoBoleto) return;

    const res = storageService.faturarPedidoComBoleto({
      vendaId: modalFaturamentoBoleto.id,
      formaPgto: 'BOLETO_FATURADO',
      contaId: contaBoletoId,
      parcelas: Number(parcelasBoleto) || 1,
      intervaloDias: Number(intervaloDias) || 30,
      primeiroVencimento: dataPrimeiroVenc
    });

    if (res.success && res.titulosGerados && res.titulosGerados.length > 0) {
      setMensagem(`Pedido #${modalFaturamentoBoleto.id} faturado com sucesso! ${res.titulosGerados.length} boleto(s) bancário(s) gerado(s).`);
      setModalFaturamentoBoleto(null);
      onRefresh();

      // Abrir o primeiro boleto gerado para visualização/impressão imediata
      const primeiroBoleto = res.titulosGerados[0].boleto_dados;
      if (primeiroBoleto) {
        onEmitirBoleto(primeiroBoleto);
      }
    } else {
      setErro(res.error || 'Erro ao faturar em boleto');
    }

    setTimeout(() => {
      setMensagem(null);
      setErro(null);
    }, 4500);
  };

  // Visualizar boleto de uma venda já faturada em boleto
  const handleVisualizarBoletoVenda = (venda: Venda) => {
    const titulos = storageService.getTitulos();
    const tituloRelacionado = titulos.find(t => t.origem_id === venda.id && t.tipo === 'RECEITA');
    if (tituloRelacionado) {
      const boleto = storageService.assegurarBoletoParaTitulo(tituloRelacionado.id);
      if (boleto) {
        onEmitirBoleto(boleto);
        return;
      }
    }
    setErro('Nenhum boleto bancário localizado para esta venda.');
    setTimeout(() => setErro(null), 3000);
  };

  const handleCancelar = (vendaId: number) => {
    if (confirm(`Deseja realmente cancelar a venda #${vendaId}? O estoque será estornado e os boletos cancelados.`)) {
      const result = storageService.cancelarVenda(vendaId);
      if (result.success) {
        setMensagem(`Venda #${vendaId} cancelada, estoque estornado e boletos cancelados.`);
        onRefresh();
      } else {
        setMensagem(`Erro no cancelamento: ${result.error}`);
      }
      setTimeout(() => setMensagem(null), 4000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Vendas, Pedidos & Faturamento</h1>
          <p className="text-sm text-slate-400">Emissão de orçamentos, faturamento em Boleto Bancário e controle fiscal.</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setModalNovoPedido(true)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-semibold shadow-md shadow-emerald-500/20"
          >
            <Plus className="w-4 h-4" />
            Novo Pedido / Orçamento
          </button>
        </div>
      </div>

      {mensagem && (
        <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          {mensagem}
        </div>
      )}

      {erro && (
        <div className="p-3 bg-rose-500/20 border border-rose-500/40 rounded-xl text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          {erro}
        </div>
      )}

      {/* Filtros */}
      <div className="flex items-center gap-2 bg-slate-800/60 p-2 rounded-xl border border-slate-700/60 w-fit">
        <Filter className="w-4 h-4 text-slate-400 ml-2" />
        <span className="text-xs text-slate-400 font-medium">Status:</span>
        {['TODOS', 'ORCAMENTO', 'CONCLUIDA', 'CANCELADA'].map((st) => (
          <button
            key={st}
            onClick={() => setFiltroStatus(st)}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              filtroStatus === st 
                ? 'bg-emerald-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      {/* Tabela de Vendas */}
      <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-900/80 text-slate-400 border-b border-slate-700 uppercase font-semibold text-[10px]">
                <th className="py-3 px-4">Pedido #</th>
                <th className="py-3 px-4">Cliente</th>
                <th className="py-3 px-4">Origem / Condição</th>
                <th className="py-3 px-4">Itens</th>
                <th className="py-3 px-4">Total</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {vendasFiltradas.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-400">
                    Nenhum pedido encontrado para o filtro selecionado.
                  </td>
                </tr>
              ) : (
                vendasFiltradas.map((venda) => (
                  <tr key={venda.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-200">
                      #{venda.id}
                      {venda.numero_nfce && (
                        <span className="block text-[10px] text-emerald-400 font-sans">
                          {venda.numero_nfce}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-medium text-white">{venda.cliente_nome || 'Consumidor'}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-700 text-slate-300 block w-fit">
                        {venda.tipo_origem}
                      </span>
                      {venda.condicao_faturamento && (
                        <span className="text-[10px] text-amber-300 font-medium block mt-0.5">
                          {venda.condicao_faturamento}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      {venda.itens.length} produto(s)
                    </td>
                    <td className="py-3 px-4 font-bold text-emerald-400 font-mono">
                      R$ {venda.valor_total.toFixed(2)}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        venda.status === 'CONCLUIDA'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : venda.status === 'ORCAMENTO'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      }`}>
                        {venda.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                      {/* Botão de Boleto Bancário se já faturado em boleto */}
                      {venda.status === 'CONCLUIDA' && venda.forma_pgto === 'BOLETO_FATURADO' && (
                        <button
                          onClick={() => handleVisualizarBoletoVenda(venda)}
                          title="Imprimir Boleto Bancário"
                          className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-bold text-[11px] inline-flex items-center gap-1"
                        >
                          <Barcode className="w-3.5 h-3.5" />
                          Boleto
                        </button>
                      )}

                      <button
                        onClick={() => onEmitirCupom(venda)}
                        title="Imprimir Cupom / Proposta"
                        className="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200"
                      >
                        <FileText className="w-3.5 h-3.5" />
                      </button>

                      {venda.status === 'ORCAMENTO' && (
                        <button
                          onClick={() => setModalFaturamentoBoleto(venda)}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-[11px] inline-flex items-center gap-1 shadow-sm"
                        >
                          <Barcode className="w-3.5 h-3.5" />
                          Faturar Boleto
                        </button>
                      )}

                      {venda.status === 'CONCLUIDA' && (
                        <button
                          onClick={() => handleCancelar(venda.id)}
                          title="Estornar / Cancelar Venda"
                          className="p-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300"
                        >
                          <XCircle className="w-3.5 h-3.5" />
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

      {/* MODAL FATURAR EM BOLETO BANCÁRIO */}
      {modalFaturamentoBoleto && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
                  <Barcode className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Faturar Pedido em Boleto Bancário</h3>
                  <p className="text-xs text-slate-400">Pedido #{modalFaturamentoBoleto.id} • {modalFaturamentoBoleto.cliente_nome}</p>
                </div>
              </div>
              <button
                onClick={() => setModalFaturamentoBoleto(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmarFaturamentoBoleto} className="space-y-4 mt-4">
              {/* Resumo do Valor */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Total do Pedido:</span>
                  <span className="text-lg font-extrabold text-emerald-400 font-mono">
                    R$ {modalFaturamentoBoleto.valor_total.toFixed(2)}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Valor por Boleto:</span>
                  <span className="text-sm font-bold text-white font-mono">
                    R$ {(modalFaturamentoBoleto.valor_total / (parcelasBoleto || 1)).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Conta Bancária / Carteira de Cobrança */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Conta Bancária Emissora do Boleto:
                </label>
                <select
                  value={contaBoletoId}
                  onChange={(e) => setContaBoletoId(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                >
                  {contasBancarias.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.descricao} (Banco {c.codigo_banco || '341'} - Carteira {c.carteira || '109'})
                    </option>
                  ))}
                </select>
              </div>

              {/* Parcelamento e Prazos */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Parcelas:</label>
                  <select
                    value={parcelasBoleto}
                    onChange={(e) => setParcelasBoleto(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    <option value={1}>1x (À Vista no Boleto)</option>
                    <option value={2}>2x (Parcelado)</option>
                    <option value={3}>3x (Parcelado)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Intervalo Entre Parcelas:</label>
                  <select
                    value={intervaloDias}
                    onChange={(e) => setIntervaloDias(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    <option value={15}>A cada 15 Dias</option>
                    <option value={30}>A cada 30 Dias (Padrão)</option>
                    <option value={60}>A cada 60 Dias</option>
                  </select>
                </div>
              </div>

              {/* Data do Primeiro Vencimento */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Data do Primeiro Vencimento:</label>
                <input
                  type="date"
                  value={dataPrimeiroVenc}
                  onChange={(e) => setDataPrimeiroVenc(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono"
                  required
                />
              </div>

              <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-2">
                <Barcode className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  Ao confirmar, os boletos bancários com Linha Digitável oficial FEBRABAN serão gerados no Financeiro e a tela de impressão será aberta automaticamente.
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalFaturamentoBoleto(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/30 flex items-center gap-1.5"
                >
                  <Barcode className="w-4 h-4" />
                  Emitir Boletos e Faturar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Novo Pedido / Orçamento */}
      {modalNovoPedido && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-white mb-3">Novo Orçamento Comercial</h3>
            <form onSubmit={handleSalvarOrcamento} className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Cliente Solicitante:</label>
                <select
                  value={clienteId}
                  onChange={(e) => setClienteId(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                >
                  {clientes.map(c => (
                    <option key={c.id} value={c.id}>{c.nome_razao} ({c.cpf_cnpj})</option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-slate-300">Itens da Proposta:</label>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="text-xs text-emerald-400 hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Adicionar Produto
                  </button>
                </div>

                <div className="space-y-2">
                  {itensPedido.map((item, idx) => (
                    <div key={idx} className="flex gap-2 items-center bg-slate-800/60 p-2 rounded-xl">
                      <select
                        value={item.produto_id}
                        onChange={(e) => handleUpdateItem(idx, 'produto_id', e.target.value)}
                        className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white"
                      >
                        {produtos.map(p => (
                          <option key={p.id} value={p.id}>{p.descricao} (Estoque: {p.estoque_atual})</option>
                        ))}
                      </select>
                      <input
                        type="number"
                        min="1"
                        value={item.quantidade}
                        onChange={(e) => handleUpdateItem(idx, 'quantidade', Number(e.target.value))}
                        className="w-16 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white text-center"
                      />
                      <input
                        type="number"
                        step="0.01"
                        value={item.preco}
                        onChange={(e) => handleUpdateItem(idx, 'preco', Number(e.target.value))}
                        className="w-24 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white text-right"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalNovoPedido(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold"
                >
                  Salvar Orçamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
