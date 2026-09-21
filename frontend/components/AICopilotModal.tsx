import React, { useState } from 'react';
import { consultarCopilot } from '../services/geminiService';
import { Sparkles, Send, Bot, User, Loader2, X } from 'lucide-react';

interface AICopilotModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AICopilotModal: React.FC<AICopilotModalProps> = ({ isOpen, onClose }) => {
  const [pergunta, setPergunta] = useState('');
  const [historico, setHistorico] = useState<{ autor: 'user' | 'ia'; texto: string }[]>([
    {
      autor: 'ia',
      texto: 'Olá! Sou seu Copilot de Gestão Empresarial. Analisei seu fluxo de caixa, títulos a vencer e estoque atual. Em que posso te apoiar hoje? (Ex: "Qual nosso saldo de liquidez e o que repor no estoque?")'
    }
  ]);
  const [carregando, setCarregando] = useState(false);

  if (!isOpen) return null;

  const handleEnviar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pergunta.trim() || carregando) return;

    const userText = pergunta.trim();
    setPergunta('');
    setHistorico(prev => [...prev, { autor: 'user', texto: userText }]);
    setCarregando(true);

    const resposta = await consultarCopilot(userText);
    setHistorico(prev => [...prev, { autor: 'ia', texto: resposta }]);
    setCarregando(false);
  };

  const perguntasSugeridas = [
    'Qual a nossa situação financeira e títulos a pagar?',
    'Quais produtos estão em nível crítico de estoque?',
    'Como podemos melhorar a margem de lucro com base na DRE?'
  ];

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl h-[600px] flex flex-col shadow-2xl overflow-hidden">
        {/* Cabeçalho */}
        <div className="bg-gradient-to-r from-indigo-900/60 to-slate-900 p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-500 flex items-center justify-center text-white shadow-md">
              <Sparkles className="w-4 h-4 text-amber-300" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                Copilot Financeiro & Operacional
                <span className="text-[10px] font-normal px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Gemini 2.5
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">Inteligência contextual baseada nos dados do seu ERP</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mensagens */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3">
          {historico.map((msg, idx) => (
            <div
              key={idx}
              className={`flex items-start gap-2.5 ${msg.autor === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.autor === 'ia' && (
                <div className="w-7 h-7 rounded-lg bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                  msg.autor === 'user'
                    ? 'bg-emerald-600 text-white rounded-tr-none'
                    : 'bg-slate-800/90 text-slate-200 border border-slate-700/80 rounded-tl-none whitespace-pre-wrap'
                }`}
              >
                {msg.texto}
              </div>

              {msg.autor === 'user' && (
                <div className="w-7 h-7 rounded-lg bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {carregando && (
            <div className="flex items-center gap-2 text-indigo-300 text-xs py-2 px-3 bg-indigo-950/40 rounded-xl w-fit border border-indigo-500/20">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Analisando indicadores do ERP...</span>
            </div>
          )}
        </div>

        {/* Perguntas Rápidas */}
        <div className="px-4 py-2 border-t border-slate-800 flex gap-1.5 overflow-x-auto text-[11px]">
          {perguntasSugeridas.map((item, i) => (
            <button
              key={i}
              onClick={() => setPergunta(item)}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 shrink-0 transition-colors border border-slate-700"
            >
              {item}
            </button>
          ))}
        </div>

        {/* Input */}
        <form onSubmit={handleEnviar} className="p-3 bg-slate-900 border-t border-slate-800 flex gap-2">
          <input
            type="text"
            placeholder="Pergunte ao Copilot sobre estoque, compras ou finanças..."
            value={pergunta}
            onChange={(e) => setPergunta(e.target.value)}
            className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
          />
          <button
            type="submit"
            disabled={!pergunta.trim() || carregando}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-indigo-600/20 transition-all"
          >
            <Send className="w-3.5 h-3.5" />
            Enviar
          </button>
        </form>
      </div>
    </div>
  );
};
