import React, { useState, useRef } from 'react';
import { storageService } from '../services/storageService';
import { 
  Download, 
  Upload, 
  Laptop, 
  Smartphone, 
  HardDrive, 
  CheckCircle, 
  Terminal, 
  ShieldCheck, 
  Copy, 
  Check, 
  X, 
  FileJson,
  FolderArchive,
  RefreshCw
} from 'lucide-react';

interface InstallExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataRestored?: () => void;
}

export const InstallExportModal: React.FC<InstallExportModalProps> = ({ 
  isOpen, 
  onClose,
  onDataRestored 
}) => {
  const [abaAtiva, setAbaAtiva] = useState<'APP_DIRETO' | 'BACKUP' | 'DESKTOP_DEV'>('APP_DIRETO');
  const [mensagemSucesso, setMensagemSucesso] = useState<string | null>(null);
  const [mensagemErro, setMensagemErro] = useState<string | null>(null);
  const [copiadoComando, setCopiadoComando] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // 1. Exportar Backup em JSON
  const handleBaixarBackup = () => {
    const dataStr = storageService.exportarBackupCompleto();
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const dataHora = new Date().toISOString().slice(0, 10);
    link.href = url;
    link.download = `erp_gestor_pro_backup_${dataHora}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setMensagemSucesso('Backup completo baixado com sucesso! Guarde este arquivo em segurança.');
    setTimeout(() => setMensagemSucesso(null), 4500);
  };

  // 2. Restaurar Backup a partir de arquivo
  const handleSelecionarArquivo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const conteudo = event.target?.result as string;
      const res = storageService.importarBackupCompleto(conteudo);
      if (res.success) {
        setMensagemSucesso('Dados do ERP restaurados com sucesso a partir do backup!');
        if (onDataRestored) onDataRestored();
      } else {
        setMensagemErro(`Falha ao restaurar: ${res.error}`);
      }
      setTimeout(() => {
        setMensagemSucesso(null);
        setMensagemErro(null);
      }, 4500);
    };
    reader.readAsText(file);
  };

  const handleCopiarComandos = () => {
    const comandos = `git clone <repositorio> erp-gestor\ncd erp-gestor\nnpm install\nnpm run dev`;
    navigator.clipboard.writeText(comandos);
    setCopiadoComando(true);
    setTimeout(() => setCopiadoComando(false), 2500);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 z-50 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-2xl my-6 shadow-2xl relative font-sans text-xs overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Topo do Modal */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-5 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-sky-500/20 text-sky-400 border border-sky-500/30">
              <Laptop className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                Como Baixar e Usar no Seu Dia a Dia
                <span className="text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                  Pronto para Uso
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Escolha a melhor maneira de utilizar o ERP na sua empresa diariamente.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feedback visual */}
        {mensagemSucesso && (
          <div className="m-4 mb-0 p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{mensagemSucesso}</span>
          </div>
        )}

        {mensagemErro && (
          <div className="m-4 mb-0 p-3 bg-rose-500/20 border border-rose-500/40 rounded-xl text-rose-300 text-xs flex items-center gap-2">
            <X className="w-4 h-4 shrink-0" />
            <span>{mensagemErro}</span>
          </div>
        )}

        {/* Abas */}
        <div className="px-5 pt-4 border-b border-slate-800 flex gap-2 shrink-0">
          <button
            onClick={() => setAbaAtiva('APP_DIRETO')}
            className={`pb-2.5 px-3 font-semibold text-xs transition-all border-b-2 flex items-center gap-1.5 ${
              abaAtiva === 'APP_DIRETO'
                ? 'border-sky-400 text-sky-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Laptop className="w-4 h-4" />
            1. Instalar no Desktop / Celular (Sem Código)
          </button>

          <button
            onClick={() => setAbaAtiva('BACKUP')}
            className={`pb-2.5 px-3 font-semibold text-xs transition-all border-b-2 flex items-center gap-1.5 ${
              abaAtiva === 'BACKUP'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <HardDrive className="w-4 h-4" />
            2. Backup Diário dos Seus Dados
          </button>

          <button
            onClick={() => setAbaAtiva('DESKTOP_DEV')}
            className={`pb-2.5 px-3 font-semibold text-xs transition-all border-b-2 flex items-center gap-1.5 ${
              abaAtiva === 'DESKTOP_DEV'
                ? 'border-indigo-400 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-4 h-4" />
            3. Executar Localmente / Criar .EXE
          </button>
        </div>

        {/* Conteúdo das Abas */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          
          {/* ABA 1: INSTALAR COMO PWA NO COMPUTADOR / CELULAR */}
          {abaAtiva === 'APP_DIRETO' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-sky-950/30 border border-sky-500/30 text-sky-200 leading-relaxed">
                <h3 className="font-bold text-sm text-white mb-1 flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-sky-400" />
                  Instalação Imediata como Aplicativo Nativo
                </h3>
                <p className="text-xs text-slate-300">
                  O <strong>ERP Gestor Pro</strong> é um Web App <em>Offline-First</em>. Você pode instalá-lo no Windows, Mac, Linux ou Celular para abrir direto da sua Área de Trabalho como se fosse um programa convencional:
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/80 space-y-2">
                  <div className="flex items-center gap-2 text-white font-bold text-xs">
                    <Laptop className="w-4 h-4 text-emerald-400" />
                    <span>No Computador (Chrome ou Edge):</span>
                  </div>
                  <ol className="list-decimal pl-4 space-y-1 text-slate-300 text-[11px] leading-relaxed">
                    <li>Clique no ícone de <strong>Instalar</strong> na barra de endereços do navegador (ou vá em <em>Menu ⋮ &gt; Instalar ERP Gestor Pro</em>).</li>
                    <li>Um atalho será criado na sua <strong>Área de Trabalho</strong> e Menu Iniciar.</li>
                    <li>O app abrirá em janela própria, com suporte a teclado rápido (F1 para PDV).</li>
                  </ol>
                </div>

                <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/80 space-y-2">
                  <div className="flex items-center gap-2 text-white font-bold text-xs">
                    <Smartphone className="w-4 h-4 text-emerald-400" />
                    <span>No Celular ou Tablet:</span>
                  </div>
                  <ol className="list-decimal pl-4 space-y-1 text-slate-300 text-[11px] leading-relaxed">
                    <li>Abra o link do sistema no Safari (iPhone) ou Chrome (Android).</li>
                    <li>Toque em <em>Compartilhar / Menu</em> e selecione <strong>&quot;Adicionar à Tela de Início&quot;</strong>.</li>
                    <li>O ícone ficará junto com seus outros aplicativos para uso no balcão da loja.</li>
                  </ol>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-slate-400 flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div className="text-[11px] leading-relaxed">
                  <strong className="text-slate-200">Seus dados ficam salvos com segurança neste dispositivo:</strong> Toda venda efetuada no PDV, produtos cadastrados, histórico do Kardex e boletos são mantidos na memória permanente local (LocalStorage / IndexedDB).
                </div>
              </div>
            </div>
          )}

          {/* ABA 2: BACKUP DIÁRIO DE DADOS */}
          {abaAtiva === 'BACKUP' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 text-emerald-200 leading-relaxed">
                <h3 className="font-bold text-sm text-white mb-1 flex items-center gap-1.5">
                  <HardDrive className="w-4 h-4 text-emerald-400" />
                  Segurança e Migração de Dados
                </h3>
                <p className="text-xs text-slate-300">
                  Faça o download do arquivo de backup diariamente para não perder cadastros, movimentações e histórico financeiro. Você pode levar esse arquivo para qualquer outro computador.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Exportar */}
                <div className="p-4 rounded-2xl bg-slate-800/70 border border-slate-700 flex flex-col justify-between">
                  <div>
                    <h4 className="font-bold text-xs text-white flex items-center gap-2">
                      <Download className="w-4 h-4 text-emerald-400" />
                      Exportar Banco de Dados (JSON)
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-1 mb-3 leading-relaxed">
                      Gera uma cópia instantânea de todos os produtos, clientes, fornecedores, estoque, lançamentos a pagar/receber e vendas.
                    </p>
                  </div>
                  <button
                    onClick={handleBaixarBackup}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition-all"
                  >
                    <Download className="w-4 h-4" />
                    Baixar Backup Agora
                  </button>
                </div>

                {/* Importar */}
                <div className="p-4 rounded-2xl bg-slate-800/70 border border-slate-700 flex flex-col justify-between">
                  <div>
                    <h4 className="font-bold text-xs text-white flex items-center gap-2">
                      <Upload className="w-4 h-4 text-sky-400" />
                      Restaurar Backup Existente
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-1 mb-3 leading-relaxed">
                      Carregue um arquivo de backup anterior para restaurar todos os seus dados em um novo computador ou filial.
                    </p>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json"
                    onChange={handleSelecionarArquivo}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold rounded-xl text-xs flex items-center justify-center gap-2 border border-slate-600 transition-all"
                  >
                    <FileJson className="w-4 h-4 text-sky-400" />
                    Carregar Arquivo .JSON
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ABA 3: EXECUÇÃO LOCAL (NODE/VITE/ELECTRON) */}
          {abaAtiva === 'DESKTOP_DEV' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/30 text-indigo-200 leading-relaxed">
                <h3 className="font-bold text-sm text-white mb-1 flex items-center gap-1.5">
                  <Terminal className="w-4 h-4 text-indigo-400" />
                  Rodar como Servidor Local ou Compilar em .EXE
                </h3>
                <p className="text-xs text-slate-300">
                  Caso deseje hospedar no servidor da sua própria empresa ou criar um executável Windows (.exe) com <strong>Electron</strong>:
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 font-mono text-[11px]">
                <div className="flex items-center justify-between text-slate-400 pb-1 border-b border-slate-800">
                  <span>Passo a Passo de Inicialização Local:</span>
                  <button
                    onClick={handleCopiarComandos}
                    className="text-xs text-sky-400 hover:text-sky-300 flex items-center gap-1 font-sans"
                  >
                    {copiadoComando ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiadoComando ? 'Copiado!' : 'Copiar'}
                  </button>
                </div>
                <div className="text-emerald-400 space-y-1">
                  <p># 1. Instale o Node.js no seu computador (nodejs.org)</p>
                  <p># 2. Crie uma pasta e instale as dependências:</p>
                  <p className="text-white">npm install react react-dom lucide-react recharts @google/genai</p>
                  <p className="text-white">npm install -D vite tailwindcss</p>
                  <p># 3. Inicie o sistema no seu navegador local:</p>
                  <p className="text-amber-300">npm run dev</p>
                  <p># 4. Para gerar o executável (.exe) desktop com Electron:</p>
                  <p className="text-white">npx electron-builder build</p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-800/50 border border-slate-700/80 text-[11px] text-slate-300 space-y-1">
                <strong className="text-white block">Dica para o dia a dia na sua empresa:</strong>
                <p>
                  Você não precisa ser programador para usar agora: basta manter esta aba aberta no navegador ou adicioná-la aos favoritos/instalar como app na sua Área de Trabalho (Aba 1).
                </p>
              </div>
            </div>
          )}

        </div>

        {/* Rodapé */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-slate-500">
            ERP Gestor Pro • Pronto para operação comercial
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition-all"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
};
