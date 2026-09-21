import React, { useState } from 'react';
import { DadosBoleto } from '../types';
import { Printer, X, Copy, Check, FileText, Building2, ShieldCheck, Download } from 'lucide-react';

interface BoletoBancarioModalProps {
  boleto: DadosBoleto | null;
  onClose: () => void;
}

export const BoletoBancarioModal: React.FC<BoletoBancarioModalProps> = ({ boleto, onClose }) => {
  const [copiado, setCopiado] = useState(false);

  if (!boleto) return null;

  const handleCopiarLinha = () => {
    navigator.clipboard.writeText(boleto.linha_digitavel.replace(/\s+/g, ' '));
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2500);
  };

  const handleImprimir = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 z-50 overflow-y-auto">
      <div className="bg-white text-slate-900 rounded-2xl w-full max-w-3xl my-6 shadow-2xl relative font-sans text-xs border border-slate-300 overflow-hidden">
        
        {/* Barra Superior de Ações (Não impressa) */}
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-sm tracking-tight text-white flex items-center gap-2">
                Boleto Bancário Faturado (FEBRABAN)
                <span className="text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                  Registrado
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">
                {boleto.banco_nome} • Vencimento: {new Date(boleto.data_vencimento).toLocaleDateString('pt-BR')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopiarLinha}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-all"
            >
              {copiado ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copiado ? 'Linha Copiada!' : 'Copiar Código'}
            </button>

            <button
              onClick={handleImprimir}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-600/30 transition-all"
            >
              <Printer className="w-3.5 h-3.5" />
              Imprimir Boleto
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Linha Digitável Destacada (Topo) */}
        <div className="bg-amber-50 border-b border-amber-200 p-3 px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2 print:hidden">
          <div>
            <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">Linha Digitável para Pagamento Online:</span>
            <code className="text-xs font-mono font-bold text-slate-900 select-all tracking-wide">
              {boleto.linha_digitavel}
            </code>
          </div>
          <button
            onClick={handleCopiarLinha}
            className="text-[11px] font-bold text-amber-900 hover:underline flex items-center gap-1 shrink-0 self-start sm:self-auto"
          >
            <Copy className="w-3 h-3" /> Copiar Código de Barras
          </button>
        </div>

        {/* ÁREA IMPRIMÍVEL DO BOLETO (PADRÃO BANCÁRIO BRASILEIRO) */}
        <div className="p-6 space-y-6 bg-white text-slate-950 font-sans print:p-0 print:space-y-4">
          
          {/* PARTE 1: RECIBO DO SACADO */}
          <div className="border-b-2 border-dashed border-slate-400 pb-5">
            <div className="flex items-center justify-between pb-2 mb-3 border-b-2 border-slate-900">
              <div className="flex items-center gap-3">
                <div className="font-black text-xl tracking-tighter uppercase text-slate-900">
                  {boleto.banco_nome.includes('Inter') ? 'BANCO INTER' : 'BANCO ITAÚ'}
                </div>
                <div className="h-6 w-px bg-slate-400"></div>
                <div className="font-extrabold text-lg tracking-wider text-slate-900 font-mono">
                  {boleto.banco_codigo}
                </div>
              </div>
              <div className="text-right">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block">Recibo do Pagador</span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] border border-slate-300 p-2.5 rounded-lg bg-slate-50">
              <div>
                <span className="text-slate-500 block">Beneficiário / Cedente:</span>
                <strong className="text-slate-900 font-semibold">{boleto.cedente_nome}</strong>
              </div>
              <div>
                <span className="text-slate-500 block">CNPJ Beneficiário:</span>
                <strong className="text-slate-900 font-mono">{boleto.cedente_cnpj}</strong>
              </div>
              <div>
                <span className="text-slate-500 block">Vencimento:</span>
                <strong className="text-slate-900 font-bold text-xs">
                  {new Date(boleto.data_vencimento).toLocaleDateString('pt-BR')}
                </strong>
              </div>
              <div>
                <span className="text-slate-500 block">Valor do Documento:</span>
                <strong className="text-emerald-700 font-extrabold text-xs font-mono">
                  R$ {boleto.valor.toFixed(2)}
                </strong>
              </div>
            </div>

            <div className="mt-2 text-[10px] text-slate-600 flex justify-between">
              <span>Pagador: <strong className="text-slate-800">{boleto.sacado_nome}</strong> ({boleto.sacado_cpf_cnpj})</span>
              <span>Nosso Número: <strong className="font-mono text-slate-800">{boleto.nosso_numero}</strong></span>
            </div>
          </div>

          {/* PARTE 2: FICHA DE COMPENSAÇÃO (CORPO PRINCIPAL DO BOLETO) */}
          <div className="space-y-0 text-[11px]">
            {/* Cabeçalho do Banco e Linha Digitável */}
            <div className="flex items-end justify-between border-b-2 border-slate-950 pb-1 mb-1">
              <div className="flex items-end gap-3">
                <div className="font-black text-xl tracking-tighter uppercase text-slate-900">
                  {boleto.banco_nome.includes('Inter') ? 'BANCO INTER' : 'ITAÚ'}
                </div>
                <div className="h-6 w-0.5 bg-slate-900"></div>
                <div className="font-extrabold text-xl tracking-wider text-slate-900 font-mono">
                  {boleto.banco_codigo}
                </div>
                <div className="h-6 w-0.5 bg-slate-900"></div>
              </div>
              <div className="font-mono font-bold text-xs sm:text-sm tracking-tight text-slate-900">
                {boleto.linha_digitavel}
              </div>
            </div>

            {/* Grid de Campos do Boleto FEBRABAN */}
            <div className="border-t border-l border-slate-950 grid grid-cols-12 text-[10px]">
              
              {/* Linha 1 */}
              <div className="col-span-8 border-r border-b border-slate-950 p-1.5">
                <span className="text-slate-500 block text-[9px]">Local de Pagamento</span>
                <span className="font-semibold text-slate-900">PAGÁVEL EM QUALQUER BANCO OU CORRESPONDENTE BANCÁRIO ATÉ O VENCIMENTO</span>
              </div>
              <div className="col-span-4 border-r border-b border-slate-950 p-1.5 bg-slate-50">
                <span className="text-slate-500 block text-[9px] uppercase font-bold">Vencimento</span>
                <span className="font-extrabold text-slate-900 text-xs sm:text-sm font-mono block text-right">
                  {new Date(boleto.data_vencimento).toLocaleDateString('pt-BR')}
                </span>
              </div>

              {/* Linha 2 */}
              <div className="col-span-8 border-r border-b border-slate-950 p-1.5">
                <span className="text-slate-500 block text-[9px]">Nome do Beneficiário / Razão Social / CNPJ</span>
                <span className="font-bold text-slate-900">{boleto.cedente_nome}</span>
                <span className="text-slate-600 block text-[9px]">CNPJ: {boleto.cedente_cnpj}</span>
              </div>
              <div className="col-span-4 border-r border-b border-slate-950 p-1.5">
                <span className="text-slate-500 block text-[9px]">Agência / Código Beneficiário</span>
                <span className="font-mono font-bold text-slate-900 block text-right">{boleto.agencia_codigo_cedente}</span>
              </div>

              {/* Linha 3 */}
              <div className="col-span-3 border-r border-b border-slate-950 p-1.5">
                <span className="text-slate-500 block text-[9px]">Data do Documento</span>
                <span className="font-mono font-medium">{boleto.data_processamento}</span>
              </div>
              <div className="col-span-3 border-r border-b border-slate-950 p-1.5">
                <span className="text-slate-500 block text-[9px]">Número do Documento</span>
                <span className="font-mono font-bold text-slate-900">{boleto.numero_documento}</span>
              </div>
              <div className="col-span-1 border-r border-b border-slate-950 p-1.5 text-center">
                <span className="text-slate-500 block text-[9px]">Espécie</span>
                <span className="font-bold">{boleto.especie_doc}</span>
              </div>
              <div className="col-span-1 border-r border-b border-slate-950 p-1.5 text-center">
                <span className="text-slate-500 block text-[9px]">Aceite</span>
                <span className="font-bold">{boleto.aceite}</span>
              </div>
              <div className="col-span-4 border-r border-b border-slate-950 p-1.5">
                <span className="text-slate-500 block text-[9px]">Nosso Número</span>
                <span className="font-mono font-bold text-slate-900 block text-right">{boleto.nosso_numero}</span>
              </div>

              {/* Linha 4 */}
              <div className="col-span-3 border-r border-b border-slate-950 p-1.5">
                <span className="text-slate-500 block text-[9px]">Uso do Banco</span>
                <span className="font-mono text-slate-600">-</span>
              </div>
              <div className="col-span-2 border-r border-b border-slate-950 p-1.5">
                <span className="text-slate-500 block text-[9px]">Carteira</span>
                <span className="font-mono font-bold text-slate-900">{boleto.carteira}</span>
              </div>
              <div className="col-span-1 border-r border-b border-slate-950 p-1.5 text-center">
                <span className="text-slate-500 block text-[9px]">Espécie</span>
                <span className="font-bold">R$</span>
              </div>
              <div className="col-span-2 border-r border-b border-slate-950 p-1.5 text-center">
                <span className="text-slate-500 block text-[9px]">Quantidade</span>
                <span className="text-slate-600">-</span>
              </div>
              <div className="col-span-4 border-r border-b border-slate-950 p-1.5 bg-slate-50">
                <span className="text-slate-500 block text-[9px] uppercase font-bold">(=) Valor do Documento</span>
                <span className="font-extrabold text-slate-900 text-xs sm:text-base font-mono block text-right">
                  R$ {boleto.valor.toFixed(2)}
                </span>
              </div>

              {/* Linha 5: Instruções e Deduções */}
              <div className="col-span-8 border-r border-b border-slate-950 p-2 min-h-24">
                <span className="text-slate-500 block text-[9px] uppercase font-bold mb-1">
                  Instruções de Responsabilidade do Beneficiário:
                </span>
                <div className="space-y-0.5 text-[9px] font-mono text-slate-800 leading-tight">
                  {boleto.instrucoes.map((inst, i) => (
                    <p key={i}>• {inst}</p>
                  ))}
                </div>
              </div>
              <div className="col-span-4 border-r border-b border-slate-950">
                <div className="border-b border-slate-950 p-1">
                  <span className="text-slate-500 block text-[8px]">(-) Descontos / Abatimentos</span>
                  <span className="font-mono text-right block text-slate-400">0,00</span>
                </div>
                <div className="border-b border-slate-950 p-1">
                  <span className="text-slate-500 block text-[8px]">(+) Juros / Multa</span>
                  <span className="font-mono text-right block text-slate-400">0,00</span>
                </div>
                <div className="p-1 bg-slate-50">
                  <span className="text-slate-500 block text-[8px]">(=) Valor Cobrado</span>
                  <span className="font-mono text-right block font-bold text-slate-900">R$ {boleto.valor.toFixed(2)}</span>
                </div>
              </div>

              {/* Linha 6: Dados do Pagador (Sacado) */}
              <div className="col-span-12 border-r border-b border-slate-950 p-2">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-slate-500 block text-[9px] uppercase font-bold">Pagador:</span>
                    <span className="font-bold text-slate-900 text-[11px] block">{boleto.sacado_nome}</span>
                    <span className="text-slate-700 block text-[10px]">CPF / CNPJ: <strong className="font-mono">{boleto.sacado_cpf_cnpj}</strong></span>
                    <span className="text-slate-600 block text-[9px]">{boleto.sacado_endereco}</span>
                  </div>
                  <div className="text-right text-[9px] text-slate-500">
                    <span>Sacador / Avalista: ERP Gestor Pro</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Código de Barras Gráfico Estilizado (FEBRABAN) */}
            <div className="pt-4 flex flex-col items-start gap-1">
              <div className="w-full flex items-center justify-between">
                <span className="text-[9px] font-mono text-slate-500">Autenticação Mecânica - Ficha de Compensação</span>
                <span className="text-[9px] font-mono text-slate-400">{boleto.codigo_barras}</span>
              </div>

              {/* Visualização de barras em padrão alternado */}
              <div className="w-full max-w-lg h-14 bg-white flex items-stretch gap-[2px] py-1 overflow-hidden select-none">
                {Array.from({ length: 78 }).map((_, idx) => {
                  const isBlack = (idx % 3 === 0 || idx % 5 === 0 || idx % 7 === 0);
                  const isThick = (idx % 4 === 0);
                  return (
                    <div
                      key={idx}
                      className={`${isBlack ? 'bg-slate-950' : 'bg-transparent'} ${isThick ? 'w-[4px]' : 'w-[1.5px]'} h-full shrink-0`}
                    />
                  );
                })}
              </div>
            </div>

          </div>
        </div>

        {/* Rodapé do Modal */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Documento faturado com validade jurídica e registro bancário CIP.</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold text-xs transition-all"
            >
              Fechar
            </button>
            <button
              onClick={handleImprimir}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/30 transition-all"
            >
              <Printer className="w-4 h-4" />
              Imprimir Ficha de Compensação
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
