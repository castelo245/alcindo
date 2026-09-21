export type TipoPessoa = 'PF' | 'PJ';
export type PapelPessoa = 'CLIENTE' | 'FORNECEDOR' | 'AMBOS';

export interface Pessoa {
  id: number;
  tipo: TipoPessoa;
  papel: PapelPessoa;
  nome_razao: string;
  nome_fantasia?: string;
  cpf_cnpj: string;
  ie_rg?: string;
  email: string;
  telefone: string;
  endereco?: string;
  limite_credito: number;
  created_at: string;
}

export interface Produto {
  id: number;
  codigo_barras: string;
  descricao: string;
  ncm: string;
  preco_custo: number;
  preco_venda: number;
  estoque_atual: number;
  estoque_minimo: number;
  ativo: boolean;
  categoria?: string;
  fornecedor_padrao_id?: number;
}

export type TipoMovimentacao = 'ENTRADA' | 'SAIDA' | 'AJUSTE';
export type OrigemMovimentacao = 'VENDA' | 'COMPRA' | 'BALANCO' | 'PDV' | 'ESTORNO';

export interface EstoqueMovimentacao {
  id: number;
  produto_id: number;
  produto_nome?: string;
  tipo: TipoMovimentacao;
  quantidade: number;
  saldo_anterior: number;
  saldo_posterior: number;
  origem_tipo: OrigemMovimentacao;
  origem_id?: number;
  data_movimentacao: string;
  observacao?: string;
}

export type OrigemVenda = 'PDV' | 'BALCAO' | 'ECOMMERCE';
export type StatusVenda = 'ORCAMENTO' | 'APROVADO' | 'CONCLUIDA' | 'CANCELADA';

export interface VendaItem {
  id: number;
  venda_id?: number;
  produto_id: number;
  descricao: string;
  quantidade: number;
  preco_unitario: number;
  subtotal: number;
}

export interface Venda {
  id: number;
  cliente_id: number;
  cliente_nome?: string;
  tipo_origem: OrigemVenda;
  status: StatusVenda;
  itens: VendaItem[];
  valor_total: number;
  desconto: number;
  forma_pgto?: string;
  troco?: number;
  valor_pago?: number;
  data_venda: string;
  numero_nfce?: string;
  condicao_faturamento?: string;
}

export interface ContaBancaria {
  id: number;
  descricao: string;
  tipo: 'CAIXA_FISICO' | 'BANCO';
  saldo_inicial: number;
  saldo_atual: number;
  codigo_banco?: string;
  agencia?: string;
  conta_corrente?: string;
  carteira?: string;
}

export type TipoTitulo = 'RECEITA' | 'DESPESA';
export type StatusTitulo = 'PENDENTE' | 'PAGO' | 'PARCIAL' | 'CANCELADO';

export interface DadosBoleto {
  linha_digitavel: string;
  codigo_barras: string;
  nosso_numero: string;
  banco_nome: string;
  banco_codigo: string;
  agencia_codigo_cedente: string;
  carteira: string;
  especie_doc: string;
  aceite: string;
  data_processamento: string;
  instrucoes: string[];
  sacado_nome: string;
  sacado_cpf_cnpj: string;
  sacado_endereco?: string;
  cedente_nome: string;
  cedente_cnpj: string;
  valor: number;
  data_vencimento: string;
  numero_documento: string;
}

export interface LancamentoFinanceiro {
  id: number;
  conta_id: number;
  conta_nome?: string;
  pessoa_id: number;
  pessoa_nome?: string;
  tipo: TipoTitulo;
  origem_tipo: 'VENDA' | 'COMPRA' | 'AVULSO' | 'PDV';
  origem_id?: number;
  descricao: string;
  valor_nominal: number;
  valor_pago: number;
  data_vencimento: string;
  data_pagamento?: string;
  status: StatusTitulo;
  boleto_dados?: DadosBoleto;
}

export interface CompraItem {
  produto_id: number;
  descricao: string;
  quantidade: number;
  custo_unitario: number;
  subtotal: number;
}

export interface CompraEntrada {
  id: number;
  chave_nfe: string;
  fornecedor_id: number;
  fornecedor_nome?: string;
  data_emissao: string;
  itens: CompraItem[];
  valor_total: number;
  condicao_pgto: string;
}

export type GravidadeReposicao = 'CRITICA' | 'ALERTA' | 'PREVENTIVA';

export interface SugestaoCompra {
  produto_id: number;
  codigo_barras: string;
  descricao: string;
  categoria?: string;
  estoque_atual: number;
  estoque_minimo: number;
  deficit: number;
  quantidade_sugerida: number;
  custo_unitario_estimado: number;
  custo_total_previsto: number;
  gravidade: GravidadeReposicao;
  fornecedor_sugerido_id?: number;
  fornecedor_nome?: string;
}

export type ViewTab = 
  | 'dashboard'
  | 'pdv'
  | 'vendas'
  | 'compras'
  | 'estoque'
  | 'financeiro'
  | 'dre'
  | 'cadastros'
  | 'ai-copilot';
