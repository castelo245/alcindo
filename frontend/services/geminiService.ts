import { GoogleGenAI } from '@google/genai';
import { storageService } from './storageService';

export async function consultarCopilot(perguntaUsuario: string): Promise<string> {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY, vertexai: true });

    // Coleta dados consolidados da empresa para contexto rico
    const produtos = storageService.getProdutos();
    const vendas = storageService.getVendas();
    const titulos = storageService.getTitulos();
    const contas = storageService.getContas();

    const produtosBaixoEstoque = produtos.filter(p => p.estoque_atual <= p.estoque_minimo);
    const totalReceitas = titulos
      .filter(t => t.tipo === 'RECEITA' && t.status === 'PAGO')
      .reduce((acc, t) => acc + t.valor_pago, 0);
    const totalDespesas = titulos
      .filter(t => t.tipo === 'DESPESA' && t.status === 'PAGO')
      .reduce((acc, t) => acc + t.valor_pago, 0);
    const saldoTotalContas = contas.reduce((acc, c) => acc + c.saldo_atual, 0);
    const contasVencendo = titulos.filter(t => t.status === 'PENDENTE');

    const promptContexto = `
Você é o Copilot de Gestão Financeira e Operacional do ERP Gestor Pro.
Responda de forma direta, analítica e profissional em Português do Brasil com dados práticos e recomendações claras.

DADOS ATUAIS DA EMPRESA:
- Saldo Total em Caixa/Bancos: R$ ${saldoTotalContas.toFixed(2)}
- Receitas Realizadas: R$ ${totalReceitas.toFixed(2)}
- Despesas Realizadas: R$ ${totalDespesas.toFixed(2)}
- Lucro Operacional Inicial Estimado: R$ ${(totalReceitas - totalDespesas).toFixed(2)}
- Contas a Pagar/Receber Pendentes: ${contasVencendo.length} títulos
- Total de Produtos Cadastrados: ${produtos.length}
- Produtos com Estoque Crítico (<= Mínimo): ${produtosBaixoEstoque.map(p => `${p.descricao} (Atual: ${p.estoque_atual}, Min: ${p.estoque_minimo})`).join(', ') || 'Nenhum'}
- Total de Vendas Registradas: ${vendas.length}

PERGUNTA DO USUÁRIO / GESTOR:
"${perguntaUsuario}"

Por favor, analise a situação e dê sua resposta executiva, com dicas de liquidez, compras ou estratégias de vendas.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        role: 'user',
        parts: [{ text: promptContexto }]
      }
    });

    return response.text || 'Não foi possível gerar uma resposta no momento.';
  } catch (error: any) {
    console.error('Erro na chamada Gemini:', error);
    return `Não foi possível consultar a IA no momento. Detalhes: ${error?.message || 'Verifique a conexão ou tente novamente.'}`;
  }
}
