import React, { useState } from 'react';
import { Produto, Pessoa } from '../types';
// Corrigido caminho de importação para ../services/storageService
import { storageService } from '../services/storageService';
import { 
  UsersRound, 
  Package, 
  Plus, 
  CheckCircle2, 
  Trash2, 
  Edit, 
  Search 
} from 'lucide-react';

interface CadastrosProps {
  produtos: Produto[];
  pessoas: Pessoa[];
  onRefresh: () => void;
}

export const Cadastros: React.FC<CadastrosProps> = ({ produtos, pessoas, onRefresh }) => {
  const [subAba, setSubAba] = useState<'PRODUTOS' | 'PESSOAS'>('PRODUTOS');
  const [busca, setBusca] = useState('');
  const [modalProduto, setModalProduto] = useState(false);
  const [modalPessoa, setModalPessoa] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Estados Formulário Produto
  const [formProduto, setFormProduto] = useState({
    codigo_barras: '7898000' + Math.floor(100000 + Math.random() * 900000),
    descricao: '',
    ncm: '84713012',
    preco_custo: 20.00,
    preco_venda: 45.00,
    estoque_atual: 25,
    estoque_minimo: 10,
    categoria: 'Geral'
  });

  // Estados Formulário Pessoa
  const [formPessoa, setFormPessoa] = useState({
    tipo: 'PJ' as 'PF' | 'PJ',
    papel: 'CLIENTE' as 'CLIENTE' | 'FORNECEDOR' | 'AMBOS',
    nome_razao: '',
    nome_fantasia: '',
    cpf_cnpj: '',
    email: '',
    telefone: '',
    limite_credito: 5000
  });

  const handleSalvarProduto = (e: React.FormEvent) => {
    e.preventDefault();
    const lista = storageService.getProdutos();
    const novoProduto: Produto = {
      id: Date.now(),
      codigo_barras: formProduto.codigo_barras,
      descricao: formProduto.descricao,
      ncm: formProduto.ncm,
      preco_custo: Number(formProduto.preco_custo),
      preco_venda: Number(formProduto.preco_venda),
      estoque_atual: Number(formProduto.estoque_atual),
      estoque_minimo: Number(formProduto.estoque_minimo),
      categoria: formProduto.categoria,
      ativo: true
    };
    lista.unshift(novoProduto);
    storageService.saveProdutos(lista);
    setModalProduto(false);
    onRefresh();
    setFeedback('Produto cadastrado com sucesso!');
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleSalvarPessoa = (e: React.FormEvent) => {
    e.preventDefault();
    const lista = storageService.getPessoas();
    const novaPessoa: Pessoa = {
      id: Date.now(),
      tipo: formPessoa.tipo,
      papel: formPessoa.papel,
      nome_razao: formPessoa.nome_razao,
      nome_fantasia: formPessoa.nome_fantasia,
      cpf_cnpj: formPessoa.cpf_cnpj,
      email: formPessoa.email,
      telefone: formPessoa.telefone,
      limite_credito: Number(formPessoa.limite_credito),
      created_at: new Date().toISOString()
    };
    lista.unshift(novaPessoa);
    storageService.savePessoas(lista);
    setModalPessoa(false);
    onRefresh();
    setFeedback('Pessoa (Parceiro) cadastrada com sucesso!');
    setTimeout(() => setFeedback(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Cadastros Base da Empresa</h1>
          <p className="text-sm text-slate-400">Catálogo de Produtos e Diretório Unificado de Clientes e Fornecedores.</p>
        </div>

        <div className="flex items-center gap-2">
          {subAba === 'PRODUTOS' ? (
            <button
              onClick={() => setModalProduto(true)}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-semibold shadow-md shadow-emerald-500/20"
            >
              <Plus className="w-4 h-4" />
              Novo Produto
            </button>
          ) : (
            <button
              onClick={() => setModalPessoa(true)}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-semibold shadow-md shadow-emerald-500/20"
            >
              <Plus className="w-4 h-4" />
              Nova Pessoa / Parceiro
            </button>
          )}
        </div>
      </div>

      {feedback && (
        <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          {feedback}
        </div>
      )}

      {/* Navegação entre Sub-abas */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex gap-2">
          <button
            onClick={() => setSubAba('PRODUTOS')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              subAba === 'PRODUTOS'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Package className="w-4 h-4" />
            Produtos ({produtos.length})
          </button>

          <button
            onClick={() => setSubAba('PESSOAS')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              subAba === 'PESSOAS'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <UsersRound className="w-4 h-4" />
            Pessoas / Clientes & Fornecedores ({pessoas.length})
          </button>
        </div>

        <div className="relative w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Buscar..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white"
          />
        </div>
      </div>

      {/* Conteúdo Aba Produtos */}
      {subAba === 'PRODUTOS' && (
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-900/80 text-slate-400 border-b border-slate-700 uppercase font-semibold text-[10px]">
                  <th className="py-3 px-4">Cód. Barras</th>
                  <th className="py-3 px-4">Descrição</th>
                  <th className="py-3 px-4">NCM</th>
                  <th className="py-3 px-4">Custo</th>
                  <th className="py-3 px-4">Venda</th>
                  <th className="py-3 px-4">Margem</th>
                  <th className="py-3 px-4">Estoque</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {produtos
                  .filter(p => p.descricao.toLowerCase().includes(busca.toLowerCase()) || p.codigo_barras.includes(busca))
                  .map((p) => {
                    const margem = p.preco_custo > 0 ? ((p.preco_venda - p.preco_custo) / p.preco_custo) * 100 : 0;
                    return (
                      <tr key={p.id} className="hover:bg-slate-800/40">
                        <td className="py-3 px-4 font-mono font-medium text-slate-300">{p.codigo_barras}</td>
                        <td className="py-3 px-4 font-semibold text-white">{p.descricao}</td>
                        <td className="py-3 px-4 font-mono text-slate-400">{p.ncm}</td>
                        <td className="py-3 px-4 text-slate-300 font-mono">R$ {p.preco_custo.toFixed(2)}</td>
                        <td className="py-3 px-4 font-bold text-emerald-400 font-mono">R$ {p.preco_venda.toFixed(2)}</td>
                        <td className="py-3 px-4 text-sky-400 font-medium">{margem.toFixed(1)}%</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                            p.estoque_atual <= p.estoque_minimo ? 'bg-rose-500/20 text-rose-300' : 'text-slate-200'
                          }`}>
                            {p.estoque_atual} un
                          </span>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Conteúdo Aba Pessoas */}
      {subAba === 'PESSOAS' && (
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-900/80 text-slate-400 border-b border-slate-700 uppercase font-semibold text-[10px]">
                  <th className="py-3 px-4">Tipo</th>
                  <th className="py-3 px-4">Papel</th>
                  <th className="py-3 px-4">Nome / Razão Social</th>
                  <th className="py-3 px-4">CPF / CNPJ</th>
                  <th className="py-3 px-4">Telefone</th>
                  <th className="py-3 px-4">E-mail</th>
                  <th className="py-3 px-4">Limite Crédito</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {pessoas
                  .filter(p => p.nome_razao.toLowerCase().includes(busca.toLowerCase()) || p.cpf_cnpj.includes(busca))
                  .map((p) => (
                    <tr key={p.id} className="hover:bg-slate-800/40">
                      <td className="py-3 px-4">
                        <span className="px-1.5 py-0.5 rounded bg-slate-700 text-[10px] font-bold text-slate-300">
                          {p.tipo}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          p.papel === 'CLIENTE'
                            ? 'bg-sky-500/20 text-sky-400'
                            : p.papel === 'FORNECEDOR'
                            ? 'bg-amber-500/20 text-amber-300'
                            : 'bg-emerald-500/20 text-emerald-300'
                        }`}>
                          {p.papel}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-semibold text-white">{p.nome_razao}</td>
                      <td className="py-3 px-4 font-mono text-slate-300">{p.cpf_cnpj}</td>
                      <td className="py-3 px-4 text-slate-300">{p.telefone}</td>
                      <td className="py-3 px-4 text-slate-400">{p.email}</td>
                      <td className="py-3 px-4 font-mono text-emerald-400 font-bold">
                        R$ {p.limite_credito.toFixed(2)}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Cadastro de Produto */}
      {modalProduto && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-3">Cadastrar Novo Produto</h3>
            <form onSubmit={handleSalvarProduto} className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Descrição Comercial:</label>
                <input
                  type="text"
                  value={formProduto.descricao}
                  onChange={(e) => setFormProduto({ ...formProduto, descricao: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Código de Barras:</label>
                  <input
                    type="text"
                    value={formProduto.codigo_barras}
                    onChange={(e) => setFormProduto({ ...formProduto, codigo_barras: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">NCM Fiscal:</label>
                  <input
                    type="text"
                    value={formProduto.ncm}
                    onChange={(e) => setFormProduto({ ...formProduto, ncm: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Preço de Custo (R$):</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formProduto.preco_custo}
                    onChange={(e) => setFormProduto({ ...formProduto, preco_custo: Number(e.target.value) })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Preço de Venda (R$):</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formProduto.preco_venda}
                    onChange={(e) => setFormProduto({ ...formProduto, preco_venda: Number(e.target.value) })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Estoque Inicial:</label>
                  <input
                    type="number"
                    value={formProduto.estoque_atual}
                    onChange={(e) => setFormProduto({ ...formProduto, estoque_atual: Number(e.target.value) })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Estoque Mínimo (Alerta):</label>
                  <input
                    type="number"
                    value={formProduto.estoque_minimo}
                    onChange={(e) => setFormProduto({ ...formProduto, estoque_minimo: Number(e.target.value) })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalProduto(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold"
                >
                  Cadastrar Produto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Cadastro de Pessoa */}
      {modalPessoa && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-3">Cadastrar Parceiro (Cliente / Fornecedor)</h3>
            <form onSubmit={handleSalvarPessoa} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Tipo Pessoa:</label>
                  <select
                    value={formPessoa.tipo}
                    onChange={(e) => setFormPessoa({ ...formPessoa, tipo: e.target.value as any })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    <option value="PJ">Pessoa Jurídica (CNPJ)</option>
                    <option value="PF">Pessoa Física (CPF)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Papel na Empresa:</label>
                  <select
                    value={formPessoa.papel}
                    onChange={(e) => setFormPessoa({ ...formPessoa, papel: e.target.value as any })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    <option value="CLIENTE">Cliente</option>
                    <option value="FORNECEDOR">Fornecedor</option>
                    <option value="AMBOS">Ambos</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Nome / Razão Social:</label>
                <input
                  type="text"
                  value={formPessoa.nome_razao}
                  onChange={(e) => setFormPessoa({ ...formPessoa, nome_razao: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">CPF / CNPJ:</label>
                  <input
                    type="text"
                    value={formPessoa.cpf_cnpj}
                    onChange={(e) => setFormPessoa({ ...formPessoa, cpf_cnpj: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Telefone:</label>
                  <input
                    type="text"
                    value={formPessoa.telefone}
                    onChange={(e) => setFormPessoa({ ...formPessoa, telefone: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">E-mail Comercial:</label>
                  <input
                    type="email"
                    value={formPessoa.email}
                    onChange={(e) => setFormPessoa({ ...formPessoa, email: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Limite de Crédito (R$):</label>
                  <input
                    type="number"
                    value={formPessoa.limite_credito}
                    onChange={(e) => setFormPessoa({ ...formPessoa, limite_credito: Number(e.target.value) })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalPessoa(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold"
                >
                  Salvar Parceiro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
