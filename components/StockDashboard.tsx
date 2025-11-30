import React from 'react';
import { StockData, ValuationType } from '../types';
import { Check, X, DollarSign, Activity, PieChart, TrendingUp, Scale, Clock, TrendingDown, Newspaper, ArrowRight } from 'lucide-react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip } from 'recharts';

interface StockDashboardProps {
  data: StockData;
}

const StockDashboard: React.FC<StockDashboardProps> = ({ data }) => {
  const isCheap = data.valuation === ValuationType.UNDERVALUED;
  const isExpensive = data.valuation === ValuationType.OVERVALUED;
  
  // Dynamic styling for Valuation Verdict
  const verdictColor = isCheap 
    ? 'text-emerald-400' 
    : isExpensive 
      ? 'text-red-400' 
      : 'text-blue-400';

  const verdictBg = isCheap 
    ? 'bg-emerald-900/30 border-emerald-500/50' 
    : isExpensive 
      ? 'bg-red-900/30 border-red-500/50' 
      : 'bg-blue-900/30 border-blue-500/50';

  const verdictTitle = isCheap 
    ? 'Oportunidade de Compra' 
    : isExpensive 
      ? 'Cuidado: Preço Elevado' 
      : 'Preço Justo';

  const verdictIcon = isCheap ? TrendingUp : isExpensive ? Scale : Activity;
  const VerdictIconComp = verdictIcon;

  // Helper to format metric strings "Metric: Value" -> <b>Metric:</b> Value
  const renderMetricItem = (text: string, isGood: boolean) => {
    const parts = text.split(':');
    if (parts.length > 1) {
      return (
        <span>
          <span className="font-bold text-slate-100">{parts[0]}:</span>
          <span className="text-slate-300">{parts.slice(1).join(':')}</span>
        </span>
      );
    }
    return <span className="text-slate-200">{text}</span>;
  };

  return (
    <div className="w-full animate-fade-in space-y-8 pb-12">
      
      {/* 1. Header Information */}
      <div className="bg-slate-800 border border-slate-700 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
            <DollarSign className="w-64 h-64 text-white" />
        </div>
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="bg-slate-700 text-slate-300 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                {data.sector}
              </span>
              <span className="flex items-center gap-1 text-slate-500 text-xs">
                <Clock className="w-3 h-3" /> Atualizado: {data.lastUpdated}
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-2">
              {data.symbol}
            </h1>
            <h2 className="text-xl text-slate-400 font-medium">{data.companyName}</h2>
          </div>

          <div className="text-left md:text-right bg-slate-900/50 p-6 rounded-2xl border border-slate-700/50 backdrop-blur-sm">
            <p className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-1">Preço Atual</p>
            <div className="text-4xl font-bold text-white flex items-center gap-2">
              {data.currentPrice}
            </div>
            <p className="text-xs text-slate-500 mt-2 max-w-[200px]">
              Dados obtidos em tempo real via Google Search
            </p>
          </div>
        </div>

        <p className="relative z-10 mt-8 text-slate-300 leading-relaxed max-w-3xl text-lg">
          {data.description}
        </p>
      </div>

      {/* 2. Key Stats Strip */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-slate-800 border border-slate-700 p-4 rounded-2xl">
            <p className="text-slate-400 text-xs font-bold uppercase mb-1">Valor de Mercado</p>
            <p className="text-white font-mono font-semibold truncate">{data.keyStats.marketCap}</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 p-4 rounded-2xl">
            <p className="text-slate-400 text-xs font-bold uppercase mb-1">P/L (P/E)</p>
            <p className="text-white font-mono font-semibold">{data.keyStats.peRatio}</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 p-4 rounded-2xl">
            <p className="text-slate-400 text-xs font-bold uppercase mb-1">Dividend Yield</p>
            <p className="text-emerald-400 font-mono font-semibold">{data.keyStats.dividendYield}</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 p-4 rounded-2xl">
            <p className="text-slate-400 text-xs font-bold uppercase mb-1">Mín. 52 Sem</p>
            <p className="text-red-400 font-mono font-semibold">{data.keyStats.week52Low}</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 p-4 rounded-2xl">
            <p className="text-slate-400 text-xs font-bold uppercase mb-1">Máx. 52 Sem</p>
            <p className="text-emerald-400 font-mono font-semibold">{data.keyStats.week52High}</p>
        </div>
      </div>

      {/* 3. Pros (V) and Cons (X) - Updated to show Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Pros - Dados Bons */}
        <div className="bg-slate-800/50 border border-emerald-900/30 rounded-3xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-emerald-500/20 p-2 rounded-lg">
              <Check className="w-6 h-6 text-emerald-400" />
            </div>
            <h3 className="text-xl font-bold text-emerald-100">Indicadores Positivos (V)</h3>
          </div>
          <ul className="space-y-4">
            {data.pros.map((pro, idx) => (
              <li key={idx} className="flex items-start gap-3 p-3 rounded-xl hover:bg-emerald-900/10 transition-colors">
                <div className="mt-1 min-w-[24px] h-6 flex items-center justify-center bg-emerald-500 rounded-full text-slate-900 shadow-lg shadow-emerald-500/20">
                  <Check className="w-4 h-4 stroke-[3]" />
                </div>
                <div className="text-sm">
                  {renderMetricItem(pro, true)}
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Cons - Dados Ruins */}
        <div className="bg-slate-800/50 border border-red-900/30 rounded-3xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-red-500/20 p-2 rounded-lg">
              <X className="w-6 h-6 text-red-400" />
            </div>
            <h3 className="text-xl font-bold text-red-100">Indicadores Negativos (X)</h3>
          </div>
          <ul className="space-y-4">
            {data.cons.map((con, idx) => (
              <li key={idx} className="flex items-start gap-3 p-3 rounded-xl hover:bg-red-900/10 transition-colors">
                 <div className="mt-1 min-w-[24px] h-6 flex items-center justify-center bg-red-500 rounded-full text-white shadow-lg shadow-red-500/20">
                  <X className="w-4 h-4 stroke-[3]" />
                </div>
                <div className="text-sm">
                  {renderMetricItem(con, false)}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* 4. Metrics Visual */}
      <div className="bg-slate-800 border border-slate-700 rounded-3xl p-8">
        <div className="flex items-center gap-3 mb-8">
          <PieChart className="w-6 h-6 text-blue-400" />
          <h3 className="text-2xl font-bold text-white">Análise de Fundamentos (Score)</h3>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-12 items-center">
          <div className="w-full lg:w-1/2 h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data.metrics}>
                <PolarGrid stroke="#334155" />
                <PolarAngleAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar
                  name="Saúde Financeira"
                  dataKey="score"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  fill="#3b82f6"
                  fillOpacity={0.4}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f1f5f9' }}
                  itemStyle={{ color: '#60a5fa' }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className="w-full lg:w-1/2 grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.metrics.map((metric, idx) => (
              <div key={idx} className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50 flex justify-between items-center">
                <span className="text-slate-400 text-sm font-medium">{metric.name}</span>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-bold ${metric.score > 70 ? 'text-emerald-400' : metric.score < 40 ? 'text-red-400' : 'text-yellow-400'}`}>
                    {metric.score}/100
                  </span>
                </div>
              </div>
            ))}
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-4 rounded-xl border border-slate-700 col-span-1 md:col-span-2 mt-2">
              <p className="text-slate-400 text-xs uppercase font-bold tracking-wider mb-2">Score Geral de Saúde Financeira</p>
              <div className="flex items-end gap-2">
                <span className="text-4xl font-bold text-white">{data.financialHealthScore}</span>
                <span className="text-slate-500 mb-1">/ 100</span>
              </div>
              <div className="w-full bg-slate-700 h-2 rounded-full mt-3 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-1000 ease-out"
                  style={{ width: `${data.financialHealthScore}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Recent News */}
      <div className="bg-slate-800/30 border border-slate-700 rounded-3xl p-8">
        <div className="flex items-center gap-3 mb-6">
          <Newspaper className="w-6 h-6 text-indigo-400" />
          <h3 className="text-2xl font-bold text-white">Notícias Recentes</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {data.news.map((item, idx) => (
            <div key={idx} className="bg-slate-800 p-5 rounded-2xl border border-slate-700 hover:border-slate-600 transition-colors flex flex-col justify-between h-full">
              <div>
                <span className="text-xs text-indigo-400 font-bold uppercase tracking-wider mb-2 block">{item.source}</span>
                <h4 className="text-white font-medium leading-snug mb-3 line-clamp-3">
                  {item.title}
                </h4>
              </div>
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-700/50">
                <span className="text-xs text-slate-500">{item.date}</span>
                {item.url && (
                   <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1">
                     Ler <ArrowRight className="w-3 h-3" />
                   </a>
                )}
              </div>
            </div>
          ))}
          {data.news.length === 0 && (
            <p className="text-slate-500 col-span-3 text-center">Nenhuma notícia relevante recente encontrada.</p>
          )}
        </div>
      </div>

      {/* 6. FINAL VERDICT */}
      <div className={`rounded-3xl p-1 border-2 ${verdictBg} shadow-2xl animate-pulse-slow`}>
        <div className="bg-slate-900/80 backdrop-blur-xl rounded-[22px] p-8 md:p-12 text-center">
          <p className="text-slate-400 font-medium uppercase tracking-[0.2em] mb-4">Veredito da Análise</p>
          
          <div className="flex flex-col items-center justify-center gap-6">
            <div className={`p-6 rounded-full bg-slate-800 border-4 ${isCheap ? 'border-emerald-500' : isExpensive ? 'border-red-500' : 'border-blue-500'}`}>
              <VerdictIconComp className={`w-16 h-16 ${verdictColor}`} />
            </div>
            
            <div>
              <h2 className={`text-5xl md:text-6xl font-black mb-2 ${verdictColor} tracking-tight`}>
                {data.valuation.toUpperCase()}
              </h2>
              <p className="text-2xl font-light text-slate-300">
                {verdictTitle}
              </p>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-slate-700/50 max-w-2xl mx-auto">
             <p className="text-slate-400 text-sm">
               Este veredito é baseado na relação entre o preço atual ({data.currentPrice}) e os fundamentos da empresa ({data.keyStats.peRatio} P/L).
               {isCheap && " A ação parece estar descontada em relação ao seu potencial histórico e de setor."}
               {isExpensive && " Os múltiplos atuais sugerem que o mercado já precificou um crescimento agressivo."}
               {data.valuation === ValuationType.FAIR && " O preço atual reflete adequadamente os resultados e riscos."}
             </p>
          </div>
        </div>
      </div>

    </div>
  );
};

export default StockDashboard;