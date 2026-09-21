import React, { useState, useEffect } from 'react';
import { ViewTab, Produto, Pessoa, EstoqueMovimentacao, Venda, ContaBancaria, LancamentoFinanceiro, CompraEntrada, DadosBoleto } from './types';
import { storageService } from './services/storageService';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { PDV } from './components/PDV';
import { Vendas } from './components/Vendas';
import { Compras } from './components/Compras';
import { Estoque } from './components/Estoque';
import { Financeiro } from './components/Financeiro';
import { RelatoriosDRE } from './components/RelatoriosDRE';
import { Cadastros } from './components/Cadastros';
import { AICopilotModal } from './components/AICopilotModal';
import { CupomModal } from './components/CupomModal';
import { BoletoBancarioModal } from './components/BoletoBancarioModal';
import { InstallExportModal } from './components/InstallExportModal';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<ViewTab>('dashboard');
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [cupomVenda, setCupomVenda] = useState<Venda | null>(null);
  const [boletoAtivo, setBoletoAtivo] = useState<DadosBoleto | null>(null);
  const [isOnline, setIsOnline] = useState(true);

  // Estados Globais do ERP
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [pessoas, setPessoas] = useState<Pessoa[]>([]);
  const [movimentacoes, setMovimentacoes] = useState<EstoqueMovimentacao[]>([]);
  const [vendas, setVendas] = useState<Venda[]>([]);
  const [contas, setContas] = useState<ContaBancaria[]>([]);
  const [titulos, setTitulos] = useState<LancamentoFinanceiro[]>([]);
  const [compras, setCompras] = useState<CompraEntrada[]>([]);

  // Carregar dados locais
  const refreshAllData = () => {
    setProdutos(storageService.getProdutos());
    setPessoas(storageService.getPessoas());
    setMovimentacoes(storageService.getMovimentacoes());
    setVendas(storageService.getVendas());
    setContas(storageService.getContas());
    setTitulos(storageService.getTitulos());
    setCompras(storageService.getCompras());
  };

  useEffect(() => {
    refreshAllData();

    // Monitorar conectividade
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Atalhos de teclado (F1 = PDV, F2 = Copilot)
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F1') {
        e.preventDefault();
        setCurrentTab('pdv');
      } else if (e.key === 'F2') {
        e.preventDefault();
        setIsCopilotOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const produtosAbaixoMinimo = produtos.filter(p => p.estoque_atual <= p.estoque_minimo && p.ativo);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Navbar */}
      <Navbar
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        onOpenCopilot={() => setIsCopilotOpen(true)}
        onOpenInstallModal={() => setIsInstallModalOpen(true)}
        isOnline={isOnline}
      />

      <div className="flex-1 flex flex-col md:flex-row max-w-7xl w-full mx-auto">
        {/* Barra Lateral de Navegação com Alerta de Reposição e Atalho de Instalação */}
        <Sidebar
          currentTab={currentTab}
          onTabChange={setCurrentTab}
          onOpenInstallModal={() => setIsInstallModalOpen(true)}
          stockAlertCount={produtosAbaixoMinimo.length}
        />

        {/* Conteúdo Central Principal */}
        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          {currentTab === 'dashboard' && (
            <Dashboard
              produtos={produtos}
              vendas={vendas}
              titulos={titulos}
              contas={contas}
              onNavigate={setCurrentTab}
            />
          )}

          {currentTab === 'pdv' && (
            <PDV
              produtos={produtos}
              pessoas={pessoas}
              onVendaConcluida={refreshAllData}
              onEmitirCupom={(v) => setCupomVenda(v)}
            />
          )}

          {currentTab === 'vendas' && (
            <Vendas
              vendas={vendas}
              produtos={produtos}
              pessoas={pessoas}
              contas={contas}
              onRefresh={refreshAllData}
              onEmitirCupom={(v) => setCupomVenda(v)}
              onEmitirBoleto={(b) => setBoletoAtivo(b)}
            />
          )}

          {currentTab === 'compras' && (
            <Compras
              produtos={produtos}
              pessoas={pessoas}
              onRefresh={refreshAllData}
              onNavigateTab={setCurrentTab}
            />
          )}

          {currentTab === 'estoque' && (
            <Estoque
              produtos={produtos}
              movimentacoes={movimentacoes}
              onRefresh={refreshAllData}
              onNavigateTab={setCurrentTab}
            />
          )}

          {currentTab === 'financeiro' && (
            <Financeiro
              titulos={titulos}
              contas={contas}
              pessoas={pessoas}
              onRefresh={refreshAllData}
              onEmitirBoleto={(b) => setBoletoAtivo(b)}
            />
          )}

          {currentTab === 'dre' && (
            <RelatoriosDRE
              vendas={vendas}
              titulos={titulos}
              compras={compras}
            />
          )}

          {currentTab === 'cadastros' && (
            <Cadastros
              produtos={produtos}
              pessoas={pessoas}
              onRefresh={refreshAllData}
            />
          )}

          {currentTab === 'ai-copilot' && (
            <div className="space-y-4">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center max-w-xl mx-auto mt-10">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 text-indigo-400 mx-auto flex items-center justify-center mb-3">
                  <span className="text-2xl font-bold">✨</span>
                </div>
                <h2 className="text-xl font-bold text-white mb-2">Copilot Analítico de Negócios</h2>
                <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                  O Copilot conecta-se em tempo real ao banco de dados do seu ERP, analisando compras, giro de estoque, contas a pagar e sugestões de reabastecimento.
                </p>
                <button
                  onClick={() => setIsCopilotOpen(true)}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-indigo-600/30"
                >
                  Abrir Janela de Diálogo com a IA
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Modal AI Copilot */}
      <AICopilotModal
        isOpen={isCopilotOpen}
        onClose={() => setIsCopilotOpen(false)}
      />

      {/* Modal Impressão de Cupom Térmico NFC-e */}
      <CupomModal
        venda={cupomVenda}
        onClose={() => setCupomVenda(null)}
      />

      {/* Modal de Boleto Bancário Faturado (FEBRABAN) */}
      <BoletoBancarioModal
        boleto={boletoAtivo}
        onClose={() => setBoletoAtivo(null)}
      />

      {/* Modal de Instalação, Baixar App e Backup de Dados */}
      <InstallExportModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
        onDataRestored={refreshAllData}
      />
    </div>
  );
};

export default App;
