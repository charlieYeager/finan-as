import React, { useState } from 'react';
import { Search, BarChart3, PieChart, AlertCircle } from 'lucide-react';
import { analyzeStock } from './services/geminiService';
import StockDashboard from './components/StockDashboard';
import MarketOverview from './components/MarketOverview';
import { StockData, ViewState } from './types';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ViewState>('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [stockData, setStockData] = useState<StockData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setActiveTab('search');
    setIsLoading(true);
    setError(null);
    setStockData(null);

    try {
      const data = await analyzeStock(searchQuery);
      if (data) {
        setStockData(data);
      } else {
        setError(`A empresa "${searchQuery}" não foi encontrada ou não possui dados de capital aberto disponíveis.`);
      }
    } catch (err) {
      setError("Ocorreu um erro ao conectar com a IA. Tente novamente mais tarde.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAnalyze = (ticker: string) => {
    setSearchQuery(ticker);
    setActiveTab('search');
    // We need to trigger the search effect, but since handleSearch needs an event or explicit call
    // Let's reuse the logic but we can't pass event.
    // Setting state is async, so we use a small timeout or a dedicated effect if this scales.
    // For simplicity, we just call the logic directly.
    
    setIsLoading(true);
    setError(null);
    setStockData(null);
    
    analyzeStock(ticker).then((data) => {
      if (data) setStockData(data);
      else setError(`Erro ao carregar ${ticker}.`);
    }).catch(() => {
       setError("Erro de conexão.");
    }).finally(() => {
      setIsLoading(false);
    });
  };

  return (
    <div className="min-h-screen bg-slate-900 pb-12">
      {/* Navigation Bar */}
      <nav className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="bg-gradient-to-tr from-blue-500 to-purple-500 p-2 rounded-lg">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                InvestAI Pro
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => setActiveTab('search')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'search' 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                Análise Individual
              </button>
              <button 
                onClick={() => setActiveTab('market')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'market' 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                Melhores do Mercado
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* Search Header - Only show on Search Tab */}
        {activeTab === 'search' && (
          <div className="mb-10 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
              Descubra o valor real <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
                dos seus investimentos
              </span>
            </h1>
            <p className="text-slate-400 max-w-2xl mx-auto mb-8">
              Digite o nome ou ticker da empresa para receber uma análise completa alimentada por IA, 
              com dados de valuation, prós e contras em tempo real.
            </p>
            
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-6 w-6 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Ex: PETR4, Apple, Itaú..."
                className="block w-full pl-12 pr-4 py-4 bg-slate-800 border border-slate-700 rounded-2xl text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all shadow-xl"
              />
              <button 
                type="submit"
                disabled={isLoading}
                className="absolute right-2 top-2 bottom-2 bg-blue-600 hover:bg-blue-500 text-white px-6 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Analisando...' : 'Analisar'}
              </button>
            </form>
          </div>
        )}

        {/* Content Render */}
        <div className="min-h-[400px]">
          {isLoading && activeTab === 'search' ? (
             <div className="flex flex-col items-center justify-center py-20 space-y-4">
               <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
               <p className="text-slate-400 animate-pulse">Consultando dados de mercado e processando IA...</p>
             </div>
          ) : error && activeTab === 'search' ? (
            <div className="max-w-2xl mx-auto bg-red-500/10 border border-red-500/20 rounded-2xl p-6 flex flex-col items-center text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Ops! Algo deu errado.</h3>
              <p className="text-slate-300">{error}</p>
            </div>
          ) : activeTab === 'search' && stockData ? (
            <StockDashboard data={stockData} />
          ) : activeTab === 'market' ? (
            <MarketOverview onAnalyze={handleQuickAnalyze} />
          ) : activeTab === 'search' && !stockData ? (
            /* Empty State for Search */
            <div className="flex flex-col items-center justify-center text-center py-10 opacity-50">
               <PieChart className="w-24 h-24 text-slate-700 mb-4" />
               <p className="text-slate-500">Aguardando pesquisa...</p>
            </div>
          ) : null}
        </div>

      </main>
    </div>
  );
};

export default App;
