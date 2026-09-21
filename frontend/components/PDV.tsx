import React, { useState, useRef, useEffect } from 'react';
import { Produto, Pessoa, Venda } from '../types';
// Corrigido caminho de importação para ../services/storageService
import { storageService } from '../services/storageService';
import { 
  Barcode, 
  Search, 
  Trash2, 
  CreditCard, 
  Banknote, 
  QrCode, 
  Printer, 
  Plus, 
  Minus, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';

interface PDVProps {
  produtos: Produto[];
  pessoas: Pessoa[];
  onVendaConcluida: () => void;
  onEmitirCupom: (venda: Venda) => void;
}

interface CartItem {
  produto: Produto;
  quantidade: number;
  preco_unitario: number;
}

export const PDV: React.FC<PDVProps> = ({ 
  produtos, 
  pessoas, 
  onVendaConcluida,
  onEmitirCupom 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [carrinho, setCarrinho] = useState<CartItem[]>([]);
  const [clienteId, setClienteId] = useState<number>(pessoas.find(p => p.papel === 'CLIENTE')?.id || 1);
  const [desconto, setDesconto] = useState<number>(0);
  const [formaPgto, setFormaPgto] = useState<string>('DINHEIRO');
  const [valorRecebido, setValorRecebido] = useState<number>(0);
  const [mensagemSucesso, setMensagemSucesso] = useState<string | null>(null);
  const [mensagemErro, setMensagemErro] = useState<string | null>(null);

  const barcodeInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    barcodeInputRef.current?.focus();
  }, []);

  const clientesDisponiveis = pessoas.filter(p => p.papel === 'CLIENTE' || p.papel === 'AMBOS');

  // Adicionar produto pelo código de barras ou busca
  const handleAddProduto = (prod: Produto) => {
    if (prod.estoque_atual <= 0) {
      setMensagemErro(`Produto sem estoque disponível (${prod.descricao})`);
      setTimeout(() => setMensagemErro(null), 3500);
      return;
    }

    setCarrinho((prev) => {
      const existing = prev.find(item => item.produto.id === prod.id);
      if (existing) {
        if (existing.quantidade + 1 > prod.estoque_atual) {
          setMensagemErro(`Quantidade excede o estoque atual (${prod.estoque_atual} un)`);
          setTimeout(() => setMensagemErro(null), 3500);
          return prev;
        }
        return prev.map(item => 
          item.produto.id === prod.id 
            ? { ...item, quantidade: item.quantidade + 1 }
            : item
        );
      } else {
        return [...prev, { produto: prod, quantidade: 1, preco_unitario: prod.preco_venda }];
      }
    });
    setSearchTerm('');
    barcodeInputRef.current?.focus();
  };

  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    const query = searchTerm.trim().toLowerCase();
    const found = produtos.find(p => 
      p.codigo_barras.toLowerCase() === query || 
      p.descricao.toLowerCase().includes(query)
    );

    if (found) {
      handleAddProduto(found);
    } else {
      setMensagemErro(`Nenhum produto localizado para "${searchTerm}"`);
      setTimeout(() => setMensagemErro(null), 3000);
    }
  };

  const updateQuantidade = (produtoId: number, delta: number) => {
    setCarrinho((prev) => {
      return prev.map(item => {
        if (item.produto.id === produtoId) {
          const novaQtd = item.quantidade + delta;
          if (novaQtd <= 0) return null;
          if (novaQtd > item.produto.estoque_atual) {
            setMensagemErro(`Estoque insuficiente (${item.produto.estoque_atual} disponíveis)`);
            setTimeout(() => setMensagemErro(null), 3000);
            return item;
          }
          return { ...item, quantidade: novaQtd };
        }
        return item;
      }).filter(Boolean) as CartItem[];
    });
  };

  const removerItem = (produtoId: number) => {
    setCarrinho(prev => prev.filter(i => i.produto.id !== produtoId));
  };

  const totalBruto = carrinho.reduce((acc, item) => acc + (item.quantidade * item.preco_unitario), 0);
  const totalLiquido = Math.max(0, totalBruto - (desconto || 0));
  const trocoCalculado = formaPgto === 'DINHEIRO' && valorRecebido > totalLiquido 
    ? valorRecebido - totalLiquido 
    : 0;

  // Finalizar a venda atômica no PDV
  const handleFinalizarVenda = () => {
    if (carrinho.length === 0) {
      setMensagemErro('Adicione pelo menos um item ao carrinho.');
      setTimeout(() => setMensagemErro(null), 3000);
      return;
    }

    if (formaPgto === 'DINHEIRO' && valorRecebido > 0 && valorRecebido < totalLiquido) {
      setMensagemErro('Valor recebido em dinheiro é menor que o total da venda.');
      setTimeout(() => setMensagemErro(null), 3000);
      return;
    }

    const payload = {
      cliente_id: clienteId,
      itens: carrinho.map(c => ({
        produto_id: c.produto.id,
        quantidade: c.quantidade,
        preco_unitario: c.preco_unitario
      })),
      desconto: Number(desconto) || 0,
      forma_pgto: formaPgto,
      valor_pago: formaPgto === 'DINHEIRO' && valorRecebido > 0 ? valorRecebido : totalLiquido,
      troco: trocoCalculado,
      tipo_origem: 'PDV' as const
    };

    const result = storageService.finalizarVendaPDV(payload);

    if (result.success && result.venda) {
      setMensagemSucesso(`Venda #${result.venda.id} finalizada com sucesso! Estoque e Caixa baixados.`);
      onVendaConcluida();
      onEmitirCupom(result.venda);

      // Limpar formulário PDV
      setCarrinho([]);
      setDesconto(0);
      setValorRecebido(0);
      setTimeout(() => setMensagemSucesso(null), 4000);
    } else {
      setMensagemErro(result.error || 'Falha ao processar venda no PDV.');
      setTimeout(() => setMensagemErro(null), 4000);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-140px)]">
      {/* Coluna Esquerda: Leitor e Lista de Produtos Rápidos (7 cols) */}
      <div className="lg:col-span-7 flex flex-col gap-4">
        {/* Barra de Código de Barras e Busca */}
        <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-4 shadow-sm">
          <form onSubmit={handleBarcodeSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <Barcode className="w-5 h-5 text-emerald-400 absolute left-3.5 top-3.5" />
              <input
                ref={barcodeInputRef}
                type="text"
                placeholder="Bipe o código de barras ou digite a descrição do produto..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 font-mono text-sm"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-sm transition-all flex items-center gap-2"
            >
              <Search className="w-4 h-4" />
              Adicionar
            </button>
          </form>

          {mensagemErro && (
            <div className="mt-3 p-3 bg-rose-500/20 border border-rose-500/40 rounded-xl text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {mensagemErro}
            </div>
          )}

          {mensagemSucesso && (
            <div className="mt-3 p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              {mensagemSucesso}
            </div>
          )}
        </div>

        {/* Grade de Produtos Rápidos de Vitrine */}
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-4 flex-1 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Produtos Mais Vendidos</span>
            <span className="text-xs text-slate-400">Clique para adicionar direto</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 overflow-y-auto pr-1">
            {produtos.map((p) => (
              <button
                key={p.id}
                onClick={() => handleAddProduto(p)}
                className="bg-slate-900/70 hover:bg-slate-900 border border-slate-700/70 hover:border-emerald-500/50 p-3 rounded-xl text-left transition-all group flex flex-col justify-between"
              >
                <div>
                  <span className="text-[10px] font-mono text-slate-400 block">{p.codigo_barras}</span>
                  <h4 className="text-xs font-semibold text-slate-200 group-hover:text-emerald-300 line-clamp-2 mt-0.5">
                    {p.descricao}
                  </h4>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-sm font-bold text-emerald-400">
                    R$ {p.preco_venda.toFixed(2)}
                  </span>
                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                    p.estoque_atual <= p.estoque_minimo ? 'bg-rose-500/20 text-rose-300' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {p.estoque_atual} un
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Coluna Direita: Carrinho do PDV e Fechamento (5 cols) */}
      <div className="lg:col-span-5 bg-slate-800/80 border border-slate-700 rounded-2xl p-5 flex flex-col justify-between shadow-lg">
        {/* Topo do Carrinho */}
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-slate-700">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Itens da Venda Atual
              </h2>
              <span className="text-xs text-slate-400">{carrinho.length} produtos adicionados</span>
            </div>
            {carrinho.length > 0 && (
              <button
                onClick={() => setCarrinho([])}
                className="text-xs text-rose-400 hover:text-rose-300 font-medium"
              >
                Limpar Tudo
              </button>
            )}
          </div>

          {/* Selecionar Cliente */}
          <div className="mt-3">
            <label className="text-xs font-medium text-slate-300 block mb-1">Cliente Vinculado:</label>
            <select
              value={clienteId}
              onChange={(e) => setClienteId(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
            >
              {clientesDisponiveis.map(c => (
                <option key={c.id} value={c.id}>
                  {c.nome_razao} ({c.cpf_cnpj})
                </option>
              ))}
            </select>
          </div>

          {/* Lista de Itens no Carrinho */}
          <div className="mt-3 max-h-52 overflow-y-auto pr-1 space-y-2">
            {carrinho.length === 0 ? (
              <div className="text-center py-10 text-slate-400 text-xs">
                Nenhum item adicionado. Bipe um produto ao lado.
              </div>
            ) : (
              carrinho.map((item) => (
                <div key={item.produto.id} className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-700/80 flex items-center justify-between gap-2">
                  <div className="flex-1 truncate">
                    <p className="text-xs font-semibold text-slate-200 truncate">{item.produto.descricao}</p>
                    <p className="text-[11px] text-slate-400">
                      {item.quantidade} x R$ {item.preco_unitario.toFixed(2)} = <strong className="text-emerald-400">R$ {(item.quantidade * item.preco_unitario).toFixed(2)}</strong>
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => updateQuantidade(item.produto.id, -1)}
                      className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-xs font-bold text-white w-5 text-center">{item.quantidade}</span>
                    <button
                      onClick={() => updateQuantidade(item.produto.id, 1)}
                      className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => removerItem(item.produto.id)}
                      className="p-1 rounded bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 ml-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Rodapé: Totais e Pagamento */}
        <div className="mt-4 pt-4 border-t border-slate-700 space-y-3">
          {/* Formas de Pagamento */}
          <div>
            <label className="text-xs font-medium text-slate-300 block mb-1">Forma de Pagamento:</label>
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { id: 'DINHEIRO', label: 'Dinheiro', icon: Banknote },
                { id: 'PIX', label: 'PIX Instant', icon: QrCode },
                { id: 'CARTAO_DEBITO', label: 'Débito', icon: CreditCard },
                { id: 'CARTAO_CREDITO', label: 'Crédito', icon: CreditCard }
              ].map(f => {
                const Icon = f.icon;
                const isSelected = formaPgto === f.id;
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setFormaPgto(f.id)}
                    className={`py-2 px-1 rounded-xl text-[11px] font-semibold flex flex-col items-center gap-1 transition-all ${
                      isSelected
                        ? 'bg-emerald-500 text-slate-950 font-bold shadow'
                        : 'bg-slate-900 hover:bg-slate-700 text-slate-300 border border-slate-700'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{f.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Desconto e Troco */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] text-slate-400 block">Desconto (R$):</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={desconto || ''}
                onChange={(e) => setDesconto(parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
              />
            </div>

            {formaPgto === 'DINHEIRO' ? (
              <div>
                <label className="text-[11px] text-slate-400 block">Valor Recebido (R$):</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={valorRecebido || ''}
                  onChange={(e) => setValorRecebido(parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                />
              </div>
            ) : (
              <div>
                <label className="text-[11px] text-slate-400 block">Identificador Fiscal:</label>
                <span className="text-xs text-emerald-400 font-mono block py-1.5">NFC-e Autorizada</span>
              </div>
            )}
          </div>

          {/* Valores Totais */}
          <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-700/80 space-y-1">
            <div className="flex justify-between text-xs text-slate-400">
              <span>Subtotal Itens:</span>
              <span>R$ {totalBruto.toFixed(2)}</span>
            </div>
            {desconto > 0 && (
              <div className="flex justify-between text-xs text-rose-400">
                <span>Desconto Aplicado:</span>
                <span>- R$ {desconto.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-extrabold text-white pt-1 border-t border-slate-800">
              <span>TOTAL A PAGAR:</span>
              <span className="text-emerald-400 text-lg">R$ {totalLiquido.toFixed(2)}</span>
            </div>
            {trocoCalculado > 0 && (
              <div className="flex justify-between text-xs font-bold text-amber-300 pt-1">
                <span>TROCO:</span>
                <span>R$ {trocoCalculado.toFixed(2)}</span>
              </div>
            )}
          </div>

          {/* Botão de Finalização Atômica */}
          <button
            onClick={handleFinalizarVenda}
            disabled={carrinho.length === 0}
            className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-xl text-sm shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-5 h-5" />
            FINALIZAR VENDA & EMITIR NFC-E
          </button>
        </div>
      </div>
    </div>
  );
};
