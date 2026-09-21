import {
  Pessoa,
  Produto,
  EstoqueMovimentacao,
  Venda,
  ContaBancaria,
  LancamentoFinanceiro,
  CompraEntrada,
  SugestaoCompra,
  GravidadeReposicao,
  DadosBoleto
} from '../types';

const STORAGE_KEYS = {
  PESSOAS: 'erp_pessoas_v1',
  PRODUTOS: 'erp_produtos_v1',
  MOVIMENTACOES: 'erp_movimentacoes_v1',
  VENDAS: 'erp_vendas_v1',
  CONTAS: 'erp_contas_v1',
  TITULOS: 'erp_titulos_v1',
  COMPRAS: 'erp_compras_v1',
};

const initialPessoas: Pessoa[] = [
  {
    id: 1,
    tipo: 'PJ',
    papel: 'FORNECEDOR',
    nome_razao: 'Distribuidora Global Bebidas e Alimentos S/A',
    nome_fantasia: 'Global Foods',
    cpf_cnpj: '12.345.678/0001-90',
    email: 'contato@globalfoods.com.br',
    telefone: '(11) 3456-7890',
    endereco: 'Av. Industrial, 1200 - São Paulo, SP',
    limite_credito: 50000,
    created_at: '2025-01-10T08:00:00Z',
  },
  {
    id: 2,
    tipo: 'PF',
    papel: 'CLIENTE',
    nome_razao: 'Marcos Vinicius de Oliveira',
    cpf_cnpj: '234.567.890-12',
    email: 'marcos.vinicius@email.com',
    telefone: '(11) 98765-4321',
    endereco: 'Rua das Palmeiras, 45 - Apto 32 - São Paulo, SP',
    limite_credito: 3500,
    created_at: '2025-02-01T10:30:00Z',
  },
  {
    id: 3,
    tipo: 'PJ',
    papel: 'CLIENTE',
    nome_razao: 'TechSolutions Informática Ltda',
    nome_fantasia: 'Tech Sol',
    cpf_cnpj: '45.678.901/0001-23',
    email: 'compras@techsol.com.br',
    telefone: '(11) 4002-8922',
    endereco: 'Rua do Comércio, 880 - Campinas, SP',
    limite_credito: 15000,
    created_at: '2025-02-15T14:10:00Z',
  },
  {
    id: 4,
    tipo: 'PJ',
    papel: 'FORNECEDOR',
    nome_razao: 'Papéis & Suprimentos Industriais Ltda',
    cpf_cnpj: '78.910.111/0001-44',
    email: 'vendas@papeissuprimentos.com.br',
    telefone: '(19) 3211-9988',
    endereco: 'Distrito Industrial 4 - Indaiatuba, SP',
    limite_credito: 30000,
    created_at: '2025-01-20T09:00:00Z',
  }
];

const initialProdutos: Produto[] = [
  {
    id: 1,
    codigo_barras: '7891000100101',
    descricao: 'Café Especial Torrado em Grãos 500g',
    ncm: '09012100',
    preco_custo: 18.50,
    preco_venda: 32.90,
    estoque_atual: 42.0,
    estoque_minimo: 15.0,
    ativo: true,
    categoria: 'Alimentos',
    fornecedor_padrao_id: 1
  },
  {
    id: 2,
    codigo_barras: '7891000200202',
    descricao: 'Azeite de Oliva Extravirgem 500ml',
    ncm: '15091000',
    preco_custo: 24.00,
    preco_venda: 41.50,
    estoque_atual: 12.0,
    estoque_minimo: 20.0,
    ativo: true,
    categoria: 'Alimentos',
    fornecedor_padrao_id: 1
  },
  {
    id: 3,
    codigo_barras: '7891000300303',
    descricao: 'Mouse Sem Fio Ergonômico Pro 2.4Ghz',
    ncm: '84716053',
    preco_custo: 45.00,
    preco_venda: 89.90,
    estoque_atual: 30.0,
    estoque_minimo: 8.0,
    ativo: true,
    categoria: 'Eletrônicos',
    fornecedor_padrao_id: 4
  },
  {
    id: 4,
    codigo_barras: '7891000400404',
    descricao: 'Teclado Mecânico Compacto ABNT2',
    ncm: '84716052',
    preco_custo: 130.00,
    preco_venda: 249.90,
    estoque_atual: 5.0,
    estoque_minimo: 10.0,
    ativo: true,
    categoria: 'Eletrônicos',
    fornecedor_padrao_id: 4
  },
  {
    id: 5,
    codigo_barras: '7891000500505',
    descricao: 'Resma de Papel Sulfite A4 75g 500 folhas',
    ncm: '48025610',
    preco_custo: 19.80,
    preco_venda: 29.90,
    estoque_atual: 65.0,
    estoque_minimo: 25.0,
    ativo: true,
    categoria: 'Papelaria',
    fornecedor_padrao_id: 4
  }
];

const initialContas: ContaBancaria[] = [
  {
    id: 1,
    descricao: 'Caixa Físico PDV Balcão',
    tipo: 'CAIXA_FISICO',
    saldo_inicial: 500.00,
    saldo_atual: 1845.50
  },
  {
    id: 2,
    descricao: 'Banco Itaú Empresas (C/C 45890-1)',
    tipo: 'BANCO',
    saldo_inicial: 12500.00,
    saldo_atual: 24350.00,
    codigo_banco: '341',
    agencia: '4589',
    conta_corrente: '45890-1',
    carteira: '109'
  },
  {
    id: 3,
    descricao: 'Banco Inter Empresas / Cobrança',
    tipo: 'BANCO',
    saldo_inicial: 3000.00,
    saldo_atual: 8900.20,
    codigo_banco: '077',
    agencia: '0001',
    conta_corrente: '128834-0',
    carteira: '112'
  }
];

export function gerarDadosBoleto(
  tituloId: number,
  valor: number,
  dataVencimento: string,
  sacado: Pessoa,
  conta: ContaBancaria,
  documentoRef?: string
): DadosBoleto {
  const codBanco = conta.codigo_banco || '341';
  const agencia = (conta.agencia || '4589').padStart(4, '0');
  const carteira = conta.carteira || '109';
  const nossoNumSeq = String(tituloId).slice(-7).padStart(8, '0');
  const nossoNumeroFormatado = `${carteira}/${nossoNumSeq}-8`;
  const valorFormatado = Math.round(valor * 100).toString().padStart(10, '0');

  const p1 = `${codBanco}9${agencia.slice(0, 4)}8`.padEnd(9, '1');
  const p2 = `${carteira}${nossoNumSeq.slice(0, 6)}`.padEnd(10, '2');
  const p3 = `${nossoNumSeq.slice(6)}${conta.id}009988`.padEnd(10, '3');
  const dvGeral = '7';
  const fatorVenc = '9845';
  const blocoValor = valorFormatado;

  const linhaDigitavel = `${p1.slice(0, 5)}.${p1.slice(5)}4  ${p2.slice(0, 5)}.${p2.slice(5)}6  ${p3.slice(0, 5)}.${p3.slice(5)}2  ${dvGeral}  ${fatorVenc}${blocoValor}`;
  const codigoBarrasNum = `${codBanco}9${dvGeral}${fatorVenc}${blocoValor}${p1}${p2.slice(0, 5)}${p3.slice(0, 4)}`;

  return {
    linha_digitavel: linhaDigitavel,
    codigo_barras: codigoBarrasNum,
    nosso_numero: nossoNumeroFormatado,
    banco_nome: conta.descricao.includes('Inter') ? 'Banco Inter S.A.' : 'Banco Itaú Unibanco S.A.',
    banco_codigo: `${codBanco}-7`,
    agencia_codigo_cedente: `${agencia} / ${conta.conta_corrente || '45890-1'}`,
    carteira: carteira,
    especie_doc: 'DM',
    aceite: 'N',
    data_processamento: new Date().toLocaleDateString('pt-BR'),
    instrucoes: [
      'SR. CAIXA: NÃO RECEBER APÓS O VENCIMENTO SEM AS COMINAÇÕES LEGAIS.',
      'APÓS O VENCIMENTO COBRAR MULTA DE 2,00% E JUROS DE MORA DE 1,00% AO MÊS.',
      'REFERENTE A FATURAMENTO MERCANTIL - ERP GESTOR PRO.',
      'NÃO PROTESTAR AUTOMATICAMENTE SEM PRÉVIA ANÁLISE.'
    ],
    sacado_nome: sacado.nome_razao,
    sacado_cpf_cnpj: sacado.cpf_cnpj,
    sacado_endereco: sacado.endereco || 'Endereço Comercial Cadastrado - SP',
    cedente_nome: 'ERP GESTOR PRO COMERCIO E SERVICOS LTDA',
    cedente_cnpj: '12.345.678/0001-90',
    valor: valor,
    data_vencimento: dataVencimento,
    numero_documento: documentoRef || `DOC-${tituloId}`
  };
}

const initialTitulos: LancamentoFinanceiro[] = [
  {
    id: 1,
    conta_id: 2,
    conta_nome: 'Banco Itaú Empresas (C/C 45890-1)',
    pessoa_id: 1,
    pessoa_nome: 'Distribuidora Global Bebidas e Alimentos S/A',
    tipo: 'DESPESA',
    origem_tipo: 'COMPRA',
    origem_id: 101,
    descricao: 'Compra NF-e 4591 - Café & Azeite',
    valor_nominal: 1850.00,
    valor_pago: 1850.00,
    data_vencimento: '2025-02-10',
    data_pagamento: '2025-02-10',
    status: 'PAGO'
  },
  {
    id: 2,
    conta_id: 2,
    conta_nome: 'Banco Itaú Empresas (C/C 45890-1)',
    pessoa_id: 4,
    pessoa_nome: 'Papéis & Suprimentos Industriais Ltda',
    tipo: 'DESPESA',
    origem_tipo: 'COMPRA',
    origem_id: 102,
    descricao: 'Compra NF-e 5821 - Papelaria & Insumos',
    valor_nominal: 990.00,
    valor_pago: 0.00,
    data_vencimento: '2025-03-25',
    status: 'PENDENTE'
  },
  {
    id: 3,
    conta_id: 3,
    conta_nome: 'Banco Inter Empresas / Cobrança',
    pessoa_id: 3,
    pessoa_nome: 'TechSolutions Informática Ltda',
    tipo: 'RECEITA',
    origem_tipo: 'VENDA',
    origem_id: 201,
    descricao: 'Faturamento Pedido #201 (Periféricos)',
    valor_nominal: 3200.00,
    valor_pago: 3200.00,
    data_vencimento: '2025-02-28',
    data_pagamento: '2025-02-28',
    status: 'PAGO'
  },
  {
    id: 4,
    conta_id: 2,
    conta_nome: 'Banco Itaú Empresas (C/C 45890-1)',
    pessoa_id: 2,
    pessoa_nome: 'Marcos Vinicius de Oliveira',
    tipo: 'RECEITA',
    origem_tipo: 'VENDA',
    origem_id: 202,
    descricao: 'Boleto Faturado Pedido #202 - Parcela 1/1',
    valor_nominal: 499.80,
    valor_pago: 0.00,
    data_vencimento: '2025-03-20',
    status: 'PENDENTE',
    boleto_dados: gerarDadosBoleto(
      4,
      499.80,
      '2025-03-20',
      initialPessoas[1],
      initialContas[1],
      'PED-202'
    )
  }
];

const initialVendas: Venda[] = [
  {
    id: 201,
    cliente_id: 3,
    cliente_nome: 'TechSolutions Informática Ltda',
    tipo_origem: 'BALCAO',
    status: 'CONCLUIDA',
    itens: [
      { id: 1, venda_id: 201, produto_id: 3, descricao: 'Mouse Sem Fio Ergonômico Pro 2.4Ghz', quantidade: 20, preco_unitario: 85.00, subtotal: 1700.00 },
      { id: 2, venda_id: 201, produto_id: 4, descricao: 'Teclado Mecânico Compacto ABNT2', quantidade: 6, preco_unitario: 250.00, subtotal: 1500.00 }
    ],
    valor_total: 3200.00,
    desconto: 0,
    forma_pgto: 'PIX',
    valor_pago: 3200.00,
    data_venda: '2025-02-28T11:45:00Z',
    numero_nfce: 'NFCe-000045'
  },
  {
    id: 202,
    cliente_id: 2,
    cliente_nome: 'Marcos Vinicius de Oliveira',
    tipo_origem: 'BALCAO',
    status: 'CONCLUIDA',
    itens: [
      { id: 3, venda_id: 202, produto_id: 4, descricao: 'Teclado Mecânico Compacto ABNT2', quantidade: 2, preco_unitario: 249.90, subtotal: 499.80 }
    ],
    valor_total: 499.80,
    desconto: 0,
    forma_pgto: 'BOLETO_FATURADO',
    valor_pago: 0,
    data_venda: '2025-03-01T14:20:00Z',
    numero_nfce: 'NFe-592810',
    condicao_faturamento: 'Boleto 30 Dias'
  }
];

const initialMovimentacoes: EstoqueMovimentacao[] = [
  {
    id: 1,
    produto_id: 1,
    produto_nome: 'Café Especial Torrado em Grãos 500g',
    tipo: 'ENTRADA',
    quantidade: 50,
    saldo_anterior: 0,
    saldo_posterior: 50,
    origem_tipo: 'COMPRA',
    origem_id: 101,
    data_movimentacao: '2025-02-05T09:00:00Z',
    observacao: 'Carga inicial via NF-e 4591'
  },
  {
    id: 2,
    produto_id: 3,
    produto_nome: 'Mouse Sem Fio Ergonômico Pro 2.4Ghz',
    tipo: 'SAIDA',
    quantidade: 20,
    saldo_anterior: 50,
    saldo_posterior: 30,
    origem_tipo: 'VENDA',
    origem_id: 201,
    data_movimentacao: '2025-02-28T11:45:00Z',
    observacao: 'Saída por venda faturada #201'
  }
];

function load<T>(key: string, defaultVal: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultVal;
  } catch (e) {
    console.error(`Erro ao carregar chave ${key}:`, e);
    return defaultVal;
  }
}

function save<T>(key: string, val: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (e) {
    console.error(`Erro ao salvar chave ${key}:`, e);
  }
}

export const storageService = {
  getPessoas(): Pessoa[] {
    return load<Pessoa[]>(STORAGE_KEYS.PESSOAS, initialPessoas);
  },
  savePessoas(data: Pessoa[]): void {
    save(STORAGE_KEYS.PESSOAS, data);
  },

  getProdutos(): Produto[] {
    return load<Produto[]>(STORAGE_KEYS.PRODUTOS, initialProdutos);
  },
  saveProdutos(data: Produto[]): void {
    save(STORAGE_KEYS.PRODUTOS, data);
  },

  getMovimentacoes(): EstoqueMovimentacao[] {
    return load<EstoqueMovimentacao[]>(STORAGE_KEYS.MOVIMENTACOES, initialMovimentacoes);
  },
  saveMovimentacoes(data: EstoqueMovimentacao[]): void {
    save(STORAGE_KEYS.MOVIMENTACOES, data);
  },

  getVendas(): Venda[] {
    return load<Venda[]>(STORAGE_KEYS.VENDAS, initialVendas);
  },
  saveVendas(data: Venda[]): void {
    save(STORAGE_KEYS.VENDAS, data);
  },

  getContas(): ContaBancaria[] {
    return load<ContaBancaria[]>(STORAGE_KEYS.CONTAS, initialContas);
  },
  saveContas(data: ContaBancaria[]): void {
    save(STORAGE_KEYS.CONTAS, data);
  },

  getTitulos(): LancamentoFinanceiro[] {
    return load<LancamentoFinanceiro[]>(STORAGE_KEYS.TITULOS, initialTitulos);
  },
  saveTitulos(data: LancamentoFinanceiro[]): void {
    save(STORAGE_KEYS.TITULOS, data);
  },

  getCompras(): CompraEntrada[] {
    return load<CompraEntrada[]>(STORAGE_KEYS.COMPRAS, []);
  },
  saveCompras(data: CompraEntrada[]): void {
    save(STORAGE_KEYS.COMPRAS, data);
  },

  // EXPORTAR BACKUP COMPLETO DO BANCO DE DADOS
  exportarBackupCompleto(): string {
    const dump = {
      versao: '2.5',
      data_backup: new Date().toISOString(),
      pessoas: this.getPessoas(),
      produtos: this.getProdutos(),
      movimentacoes: this.getMovimentacoes(),
      vendas: this.getVendas(),
      contas: this.getContas(),
      titulos: this.getTitulos(),
      compras: this.getCompras()
    };
    return JSON.stringify(dump, null, 2);
  },

  // RESTAURAR BACKUP COMPLETO
  importarBackupCompleto(jsonStr: string): { success: boolean; error?: string } {
    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed.produtos) this.saveProdutos(parsed.produtos);
      if (parsed.pessoas) this.savePessoas(parsed.pessoas);
      if (parsed.movimentacoes) this.saveMovimentacoes(parsed.movimentacoes);
      if (parsed.vendas) this.saveVendas(parsed.vendas);
      if (parsed.contas) this.saveContas(parsed.contas);
      if (parsed.titulos) this.saveTitulos(parsed.titulos);
      if (parsed.compras) this.saveCompras(parsed.compras);
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message || 'Arquivo de backup inválido' };
    }
  },

  // RESETAR DADOS PARA O ESTADO DE FÁBRICA
  resetarFabrica(): void {
    localStorage.removeItem(STORAGE_KEYS.PESSOAS);
    localStorage.removeItem(STORAGE_KEYS.PRODUTOS);
    localStorage.removeItem(STORAGE_KEYS.MOVIMENTACOES);
    localStorage.removeItem(STORAGE_KEYS.VENDAS);
    localStorage.removeItem(STORAGE_KEYS.CONTAS);
    localStorage.removeItem(STORAGE_KEYS.TITULOS);
    localStorage.removeItem(STORAGE_KEYS.COMPRAS);
  },

  obterSugestoesCompra(): SugestaoCompra[] {
    const produtos = this.getProdutos();
    const pessoas = this.getPessoas();
    const fornecedores = pessoas.filter(p => p.papel === 'FORNECEDOR' || p.papel === 'AMBOS');
    const defaultFornecedor = fornecedores[0];

    const sugestoes: SugestaoCompra[] = [];

    for (const prod of produtos) {
      if (!prod.ativo) continue;

      if (prod.estoque_atual <= prod.estoque_minimo) {
        const deficit = Math.max(0, prod.estoque_minimo - prod.estoque_atual);
        const loteSeguranca = prod.estoque_minimo > 0 ? prod.estoque_minimo : 10;
        const quantidadeSugerida = Math.ceil(
          prod.estoque_atual <= 0
            ? prod.estoque_minimo * 2.5 || 20
            : deficit + loteSeguranca
        );

        let gravidade: GravidadeReposicao = 'PREVENTIVA';
        if (prod.estoque_atual <= 0) {
          gravidade = 'CRITICA';
        } else if (prod.estoque_atual < prod.estoque_minimo) {
          gravidade = 'ALERTA';
        } else {
          gravidade = 'PREVENTIVA';
        }

        const fornecedor = fornecedores.find(f => f.id === prod.fornecedor_padrao_id) || defaultFornecedor;

        sugestoes.push({
          produto_id: prod.id,
          codigo_barras: prod.codigo_barras,
          descricao: prod.descricao,
          categoria: prod.categoria,
          estoque_atual: prod.estoque_atual,
          estoque_minimo: prod.estoque_minimo,
          deficit,
          quantidade_sugerida: quantidadeSugerida,
          custo_unitario_estimado: prod.preco_custo,
          custo_total_previsto: parseFloat((quantidadeSugerida * prod.preco_custo).toFixed(2)),
          gravidade,
          fornecedor_sugerido_id: fornecedor?.id,
          fornecedor_nome: fornecedor?.nome_razao || 'Fornecedor Padrão'
        });
      }
    }

    const pesoGravidade: Record<GravidadeReposicao, number> = {
      CRITICA: 3,
      ALERTA: 2,
      PREVENTIVA: 1
    };

    return sugestoes.sort((a, b) => pesoGravidade[b.gravidade] - pesoGravidade[a.gravidade]);
  },

  finalizarVendaPDV(vendaData: {
    cliente_id: number;
    itens: { produto_id: number; quantidade: number; preco_unitario: number }[];
    desconto: number;
    forma_pgto: string;
    valor_pago: number;
    troco: number;
    tipo_origem: 'PDV' | 'BALCAO';
  }): { success: boolean; venda?: Venda; error?: string } {
    try {
      const produtos = this.getProdutos();
      const movimentacoes = this.getMovimentacoes();
      const contas = this.getContas();
      const titulos = this.getTitulos();
      const vendas = this.getVendas();
      const pessoas = this.getPessoas();

      for (const item of vendaData.itens) {
        const prod = produtos.find(p => p.id === item.produto_id);
        if (!prod) throw new Error(`Produto ID #${item.produto_id} não encontrado.`);
        if (prod.estoque_atual < item.quantidade) {
          throw new Error(`Estoque insuficiente para "${prod.descricao}". Disponível: ${prod.estoque_atual}`);
        }
      }

      const subtotalTotal = vendaData.itens.reduce((acc, i) => acc + (i.quantidade * i.preco_unitario), 0);
      const valorLiquido = Math.max(0, subtotalTotal - vendaData.desconto);
      const newVendaId = Date.now();
      const cliente = pessoas.find(p => p.id === vendaData.cliente_id);

      const novaVenda: Venda = {
        id: newVendaId,
        cliente_id: vendaData.cliente_id,
        cliente_nome: cliente?.nome_razao || 'Consumidor Final',
        tipo_origem: vendaData.tipo_origem,
        status: 'CONCLUIDA',
        desconto: vendaData.desconto,
        valor_total: valorLiquido,
        forma_pgto: vendaData.forma_pgto,
        troco: vendaData.troco,
        valor_pago: vendaData.valor_pago,
        data_venda: new Date().toISOString(),
        numero_nfce: `NFCe-${Math.floor(100000 + Math.random() * 900000)}`,
        itens: vendaData.itens.map((it, idx) => {
          const prod = produtos.find(p => p.id === it.produto_id)!;
          return {
            id: newVendaId + idx,
            venda_id: newVendaId,
            produto_id: it.produto_id,
            descricao: prod.descricao,
            quantidade: it.quantidade,
            preco_unitario: it.preco_unitario,
            subtotal: it.quantidade * it.preco_unitario
          };
        })
      };

      for (const item of vendaData.itens) {
        const prod = produtos.find(p => p.id === item.produto_id)!;
        const saldoAnterior = prod.estoque_atual;
        prod.estoque_atual -= item.quantidade;
        
        movimentacoes.unshift({
          id: Date.now() + Math.floor(Math.random() * 1000),
          produto_id: prod.id,
          produto_nome: prod.descricao,
          tipo: 'SAIDA',
          quantidade: item.quantidade,
          saldo_anterior: saldoAnterior,
          saldo_posterior: prod.estoque_atual,
          origem_tipo: 'PDV',
          origem_id: newVendaId,
          data_movimentacao: new Date().toISOString(),
          observacao: `Venda PDV #${newVendaId} (${vendaData.forma_pgto})`
        });
      }

      const contaPDV = contas.find(c => c.tipo === 'CAIXA_FISICO') || contas[0];
      if (contaPDV) {
        contaPDV.saldo_atual += valorLiquido;
      }

      titulos.unshift({
        id: Date.now() + 10,
        conta_id: contaPDV.id,
        conta_nome: contaPDV.descricao,
        pessoa_id: vendaData.cliente_id,
        pessoa_nome: cliente?.nome_razao || 'Consumidor Final',
        tipo: 'RECEITA',
        origem_tipo: 'PDV',
        origem_id: newVendaId,
        descricao: `Recebimento PDV #${newVendaId} - ${vendaData.forma_pgto}`,
        valor_nominal: valorLiquido,
        valor_pago: valorLiquido,
        data_vencimento: new Date().toISOString().split('T')[0],
        data_pagamento: new Date().toISOString().split('T')[0],
        status: 'PAGO'
      });

      vendas.unshift(novaVenda);
      this.saveProdutos(produtos);
      this.saveMovimentacoes(movimentacoes);
      this.saveContas(contas);
      this.saveTitulos(titulos);
      this.saveVendas(vendas);

      return { success: true, venda: novaVenda };
    } catch (err: any) {
      console.error('Falha na transação PDV:', err);
      return { success: false, error: err.message || 'Erro inesperado na venda' };
    }
  },

  processarEntradaCompras(compra: {
    chave_nfe: string;
    fornecedor_id: number;
    itens: { produto_id: number; quantidade: number; custo_unitario: number }[];
    condicao_pgto: string;
    dias_vencimento: number;
  }): { success: boolean; error?: string } {
    try {
      const produtos = this.getProdutos();
      const movimentacoes = this.getMovimentacoes();
      const titulos = this.getTitulos();
      const contas = this.getContas();
      const pessoas = this.getPessoas();
      const compras = this.getCompras();

      const fornecedor = pessoas.find(p => p.id === compra.fornecedor_id);
      const compraId = Date.now();
      let totalCompra = 0;

      const itensGravados: any[] = [];

      for (const item of compra.itens) {
        const prod = produtos.find(p => p.id === item.produto_id);
        if (!prod) throw new Error(`Produto #${item.produto_id} não localizado.`);

        const subtotal = item.quantidade * item.custo_unitario;
        totalCompra += subtotal;

        const estoqueAntigo = prod.estoque_atual > 0 ? prod.estoque_atual : 0;
        const custoAntigo = prod.preco_custo;
        const qtdComprada = item.quantidade;
        const custoCompra = item.custo_unitario;

        const divisor = estoqueAntigo + qtdComprada;
        const novoCustoMedio = divisor > 0
          ? ((estoqueAntigo * custoAntigo) + (qtdComprada * custoCompra)) / divisor
          : custoCompra;

        const saldoAnterior = prod.estoque_atual;
        prod.estoque_atual += qtdComprada;
        prod.preco_custo = parseFloat(novoCustoMedio.toFixed(2));

        itensGravados.push({
          produto_id: prod.id,
          descricao: prod.descricao,
          quantidade: item.quantidade,
          custo_unitario: item.custo_unitario,
          subtotal
        });

        movimentacoes.unshift({
          id: Date.now() + Math.floor(Math.random() * 1000),
          produto_id: prod.id,
          produto_nome: prod.descricao,
          tipo: 'ENTRADA',
          quantidade: item.quantidade,
          saldo_anterior: saldoAnterior,
          saldo_posterior: prod.estoque_atual,
          origem_tipo: 'COMPRA',
          origem_id: compraId,
          data_movimentacao: new Date().toISOString(),
          observacao: `Entrada: ${compra.chave_nfe} | Novo C.Médio: R$ ${prod.preco_custo.toFixed(2)}`
        });
      }

      const contaPrincipal = contas.find(c => c.tipo === 'BANCO') || contas[0];
      const dataVenc = new Date();
      dataVenc.setDate(dataVenc.getDate() + (compra.dias_vencimento || 30));

      titulos.unshift({
        id: Date.now() + 20,
        conta_id: contaPrincipal.id,
        conta_nome: contaPrincipal.descricao,
        pessoa_id: compra.fornecedor_id,
        pessoa_nome: fornecedor?.nome_razao || 'Fornecedor',
        tipo: 'DESPESA',
        origem_tipo: 'COMPRA',
        origem_id: compraId,
        descricao: `Pedido Compra ${compra.chave_nfe.slice(0, 18)} - ${fornecedor?.nome_razao || 'Fornecedor'}`,
        valor_nominal: totalCompra,
        valor_pago: 0,
        data_vencimento: dataVenc.toISOString().split('T')[0],
        status: 'PENDENTE'
      });

      compras.unshift({
        id: compraId,
        chave_nfe: compra.chave_nfe,
        fornecedor_id: compra.fornecedor_id,
        fornecedor_nome: fornecedor?.nome_razao,
        data_emissao: new Date().toISOString(),
        itens: itensGravados,
        valor_total: totalCompra,
        condicao_pgto: compra.condicao_pgto
      });

      this.saveProdutos(produtos);
      this.saveMovimentacoes(movimentacoes);
      this.saveTitulos(titulos);
      this.saveCompras(compras);

      return { success: true };
    } catch (err: any) {
      console.error('Falha na entrada de compras:', err);
      return { success: false, error: err.message || 'Erro ao processar compra' };
    }
  },

  cancelarVenda(vendaId: number): { success: boolean; error?: string } {
    try {
      const vendas = this.getVendas();
      const produtos = this.getProdutos();
      const movimentacoes = this.getMovimentacoes();
      const titulos = this.getTitulos();
      const contas = this.getContas();

      const venda = vendas.find(v => v.id === vendaId);
      if (!venda) throw new Error('Venda não encontrada');
      if (venda.status === 'CANCELADA') throw new Error('Esta venda já foi cancelada previamente.');

      for (const item of venda.itens) {
        const prod = produtos.find(p => p.id === item.produto_id);
        if (prod) {
          const saldoAnterior = prod.estoque_atual;
          prod.estoque_atual += item.quantidade;

          movimentacoes.unshift({
            id: Date.now() + Math.floor(Math.random() * 1000),
            produto_id: prod.id,
            produto_nome: prod.descricao,
            tipo: 'ENTRADA',
            quantidade: item.quantidade,
            saldo_anterior: saldoAnterior,
            saldo_posterior: prod.estoque_atual,
            origem_tipo: 'ESTORNO',
            origem_id: venda.id,
            data_movimentacao: new Date().toISOString(),
            observacao: `Estorno de Venda cancelada #${venda.id}`
          });
        }
      }

      const titulosRelacionados = titulos.filter(t => t.origem_id === venda.id);
      for (const t of titulosRelacionados) {
        if (t.status === 'PAGO') {
          const c = contas.find(conta => conta.id === t.conta_id);
          if (c) {
            c.saldo_atual -= t.valor_pago;
          }
        }
        t.status = 'CANCELADO';
      }

      venda.status = 'CANCELADA';

      this.saveVendas(vendas);
      this.saveProdutos(produtos);
      this.saveMovimentacoes(movimentacoes);
      this.saveTitulos(titulos);
      this.saveContas(contas);

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  faturarPedidoComBoleto(params: {
    vendaId: number;
    formaPgto: string;
    contaId: number;
    parcelas: number;
    intervaloDias: number;
    primeiroVencimento?: string;
  }): { success: boolean; error?: string; titulosGerados?: LancamentoFinanceiro[] } {
    try {
      const vendas = this.getVendas();
      const produtos = this.getProdutos();
      const movimentacoes = this.getMovimentacoes();
      const titulos = this.getTitulos();
      const contas = this.getContas();
      const pessoas = this.getPessoas();

      const venda = vendas.find(v => v.id === params.vendaId);
      if (!venda) throw new Error('Pedido não encontrado');
      if (venda.status === 'CONCLUIDA') throw new Error('Pedido já faturado.');

      const cliente = pessoas.find(p => p.id === venda.cliente_id) || {
        id: venda.cliente_id,
        tipo: 'PJ',
        papel: 'CLIENTE',
        nome_razao: venda.cliente_nome || 'Cliente Cadastrado',
        cpf_cnpj: '00.000.000/0001-91',
        email: 'financeiro@cliente.com.br',
        telefone: '(11) 9999-8888',
        endereco: 'Av. Brasil, 500 - Sala 12',
        limite_credito: 20000,
        created_at: new Date().toISOString()
      };

      for (const item of venda.itens) {
        const prod = produtos.find(p => p.id === item.produto_id);
        if (!prod || prod.estoque_atual < item.quantidade) {
          throw new Error(`Estoque insuficiente para o item: ${item.descricao}`);
        }
      }

      for (const item of venda.itens) {
        const prod = produtos.find(p => p.id === item.produto_id)!;
        const saldoAnterior = prod.estoque_atual;
        prod.estoque_atual -= item.quantidade;

        movimentacoes.unshift({
          id: Date.now() + Math.floor(Math.random() * 1000),
          produto_id: prod.id,
          produto_nome: prod.descricao,
          tipo: 'SAIDA',
          quantidade: item.quantidade,
          saldo_anterior: saldoAnterior,
          saldo_posterior: prod.estoque_atual,
          origem_tipo: 'VENDA',
          origem_id: venda.id,
          data_movimentacao: new Date().toISOString(),
          observacao: `Faturamento Boleto Pedido #${venda.id}`
        });
      }

      const contaBoleto = contas.find(c => c.id === params.contaId) || contas.find(c => c.tipo === 'BANCO') || contas[0];
      const parcelasQtd = Math.max(1, params.parcelas || 1);
      const valorPorParcela = parseFloat((venda.valor_total / parcelasQtd).toFixed(2));
      const titulosNovos: LancamentoFinanceiro[] = [];

      const baseDate = params.primeiroVencimento 
        ? new Date(params.primeiroVencimento + 'T12:00:00Z')
        : new Date();
      if (!params.primeiroVencimento) {
        baseDate.setDate(baseDate.getDate() + (params.intervaloDias || 30));
      }

      for (let i = 0; i < parcelasQtd; i++) {
        const dataVencParcela = new Date(baseDate);
        if (i > 0) {
          dataVencParcela.setDate(dataVencParcela.getDate() + (i * (params.intervaloDias || 30)));
        }
        const dataVencStr = dataVencParcela.toISOString().split('T')[0];
        const tituloId = Date.now() + (i * 10) + Math.floor(Math.random() * 9);

        const boleto = gerarDadosBoleto(
          tituloId,
          valorPorParcela,
          dataVencStr,
          cliente,
          contaBoleto,
          `PED-${venda.id}/${i + 1}`
        );

        const novoTitulo: LancamentoFinanceiro = {
          id: tituloId,
          conta_id: contaBoleto.id,
          conta_nome: contaBoleto.descricao,
          pessoa_id: venda.cliente_id,
          pessoa_nome: venda.cliente_nome,
          tipo: 'RECEITA',
          origem_tipo: 'VENDA',
          origem_id: venda.id,
          descricao: `Boleto Bancário Faturado Pedido #${venda.id} (Parcela ${i + 1}/${parcelasQtd})`,
          valor_nominal: valorPorParcela,
          valor_pago: 0.00,
          data_vencimento: dataVencStr,
          status: 'PENDENTE',
          boleto_dados: boleto
        };

        titulosNovos.push(novoTitulo);
        titulos.unshift(novoTitulo);
      }

      venda.status = 'CONCLUIDA';
      venda.forma_pgto = 'BOLETO_FATURADO';
      venda.valor_pago = 0;
      venda.condicao_faturamento = parcelasQtd > 1 
        ? `Boleto Bancário ${parcelasQtd}x (${params.intervaloDias}d)`
        : `Boleto Bancário 30 Dias`;
      venda.numero_nfce = `NFe-${Math.floor(100000 + Math.random() * 900000)}`;

      this.saveVendas(vendas);
      this.saveProdutos(produtos);
      this.saveMovimentacoes(movimentacoes);
      this.saveTitulos(titulos);
      this.saveContas(contas);

      return { success: true, titulosGerados: titulosNovos };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  assegurarBoletoParaTitulo(tituloId: number): DadosBoleto | null {
    const titulos = this.getTitulos();
    const contas = this.getContas();
    const pessoas = this.getPessoas();

    const t = titulos.find(item => item.id === tituloId);
    if (!t || t.tipo !== 'RECEITA') return null;

    if (t.boleto_dados) {
      return t.boleto_dados;
    }

    const conta = contas.find(c => c.id === t.conta_id) || contas.find(c => c.tipo === 'BANCO') || contas[0];
    const cliente = pessoas.find(p => p.id === t.pessoa_id) || {
      id: t.pessoa_id,
      tipo: 'PJ',
      papel: 'CLIENTE',
      nome_razao: t.pessoa_nome || 'Cliente Cadastrado',
      cpf_cnpj: '00.000.000/0001-91',
      email: 'financeiro@cliente.com.br',
      telefone: '(11) 98888-7777',
      endereco: 'Rua do Sacado, 100 - Centro',
      limite_credito: 10000,
      created_at: new Date().toISOString()
    };

    const boleto = gerarDadosBoleto(
      t.id,
      t.valor_nominal - t.valor_pago,
      t.data_vencimento,
      cliente,
      conta,
      `TIT-${t.id}`
    );

    t.boleto_dados = boleto;
    this.saveTitulos(titulos);
    return boleto;
  },

  faturarPedido(vendaId: number, formaPgto: string, contaId: number): { success: boolean; error?: string } {
    return this.faturarPedidoComBoleto({
      vendaId,
      formaPgto,
      contaId,
      parcelas: 1,
      intervaloDias: 30
    });
  },

  baixarTitulo(tituloId: number, valorRecebidoOuPago: number, contaId: number): { success: boolean; error?: string } {
    try {
      const titulos = this.getTitulos();
      const contas = this.getContas();

      const titulo = titulos.find(t => t.id === tituloId);
      if (!titulo) throw new Error('Título não encontrado.');
      if (titulo.status === 'PAGO' || titulo.status === 'CANCELADO') {
        throw new Error('Título não pode ser baixado com o status atual.');
      }

      const conta = contas.find(c => c.id === contaId) || contas[0];
      const novoTotalPago = titulo.valor_pago + valorRecebidoOuPago;

      if (titulo.tipo === 'RECEITA') {
        conta.saldo_atual += valorRecebidoOuPago;
      } else {
        conta.saldo_atual -= valorRecebidoOuPago;
      }

      titulo.valor_pago = novoTotalPago;
      titulo.data_pagamento = new Date().toISOString().split('T')[0];
      titulo.conta_id = conta.id;
      titulo.conta_nome = conta.descricao;

      if (novoTotalPago >= titulo.valor_nominal) {
        titulo.status = 'PAGO';
      } else {
        titulo.status = 'PARCIAL';
      }

      this.saveTitulos(titulos);
      this.saveContas(contas);

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }
};
