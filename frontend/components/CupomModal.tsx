import React from 'react';
import { Venda } from '../types';
import { Printer, X, CheckCircle, QrCode } from 'lucide-react';

interface CupomModalProps {
  venda: Venda | null;
  onClose: () => void;
}

export const CupomModal: React.FC<CupomModalProps> = ({ venda, onClose }) => {
  if (!venda) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white text-slate-900 rounded-2xl w-full max-w-sm p-6 shadow-2xl relative font-mono text-xs">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-full text-slate-500 hover:text-black hover:bg-slate-100"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Cabeçalho do Cupom */}
        <div className="text-center pb-3 border-b-2 border-dashed border-slate-300">
          <h2 className="font-extrabold text-sm tracking-tight text-slate-900 uppercase">
            ERP GESTOR PRO COMERCIO LTDA
          </h2>
          <p className="text-[10px] text-slate-600">CNPJ: 12.345.678/0001-90 | IE: 112.334.455</p>
          <p className="text-[10px] text-slate-600">Av. Paulista, 1000 - Bela Vista - SP</p>
          <div className="mt-1 py-0.5 px-2 bg-slate-100 rounded text-[10px] font-bold inline-block">
            DANFE NFC-e - Documento Auxiliar
          </div>
        </div>

        {/* Dados da Venda */}
        <div className="py-2.5 border-b border-dashed border-slate-300 text-[10px] space-y-0.5">
          <div className="flex justify-between">
            <span>Venda No: #{venda.id}</span>
            <span>{venda.numero_nfce || 'NFCe-ONLINE'}</span>
          </div>
          <div className="flex justify-between">
            <span>Emissão:</span>
            <span>{new Date(venda.data_venda).toLocaleString('pt-BR')}</span>
          </div>
          <div className="flex justify-between">
            <span>Cliente:</span>
            <span className="font-bold">{venda.cliente_nome || 'Consumidor Final'}</span>
          </div>
        </div>

        {/* Itens */}
        <div className="py-2.5 border-b-2 border-dashed border-slate-300 space-y-1.5">
          <div className="flex justify-between font-bold text-[10px] uppercase text-slate-700">
            <span>Item / Qtd x Unit</span>
            <span>Total</span>
          </div>

          {venda.itens.map((it, idx) => (
            <div key={idx} className="text-[11px]">
              <div className="font-medium truncate">{it.descricao}</div>
              <div className="flex justify-between text-[10px] text-slate-600">
                <span>{it.quantidade} un x R$ {it.preco_unitario.toFixed(2)}</span>
                <span className="font-bold text-slate-900">R$ {it.subtotal.toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Totais */}
        <div className="py-2.5 border-b-2 border-dashed border-slate-300 space-y-1 text-xs">
          <div className="flex justify-between font-extrabold text-sm text-slate-900">
            <span>TOTAL A PAGAR:</span>
            <span>R$ {venda.valor_total.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-[11px] text-slate-700">
            <span>Forma Pagamento:</span>
            <span className="font-semibold">{venda.forma_pgto || 'DINHEIRO'}</span>
          </div>
          {venda.desconto > 0 && (
            <div className="flex justify-between text-[11px] text-rose-600">
              <span>Desconto:</span>
              <span>- R$ {venda.desconto.toFixed(2)}</span>
            </div>
          )}
          {venda.troco !== undefined && venda.troco > 0 && (
            <div className="flex justify-between text-[11px] font-bold text-slate-900">
              <span>Troco:</span>
              <span>R$ {venda.troco.toFixed(2)}</span>
            </div>
          )}
        </div>

        {/* Simulação QR Code SEFAZ */}
        <div className="py-3 text-center flex flex-col items-center">
          <div className="w-20 h-20 bg-slate-100 border border-slate-300 rounded-lg flex items-center justify-center mb-1">
            <QrCode className="w-14 h-14 text-slate-800" />
          </div>
          <span className="text-[9px] text-slate-500">
            Consulte pela Chave de Acesso no portal da SEFAZ
          </span>
          <span className="text-[8px] font-mono text-slate-400 mt-0.5">
            3525 0212 3456 7800 0190 6500 1000 0045 9110
          </span>
        </div>

        <button
          onClick={() => window.print()}
          className="w-full mt-2 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all"
        >
          <Printer className="w-4 h-4" />
          Imprimir Cupom Térmico
        </button>
      </div>
    </div>
  );
};
