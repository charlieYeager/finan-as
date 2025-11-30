import React, { useEffect, useState } from 'react';
import { getMarketRecommendations } from '../services/geminiService';
import { SectorRecommendation } from '../types';
import { TrendingUp, TrendingDown, Minus, ArrowRight, Layers, Briefcase, Zap, ShoppingBag, Cpu, Globe, MapPin } from 'lucide-react';

interface MarketOverviewProps {
  onAnalyze: (ticker: string) => void;
}

const MarketOverview: React.FC<MarketOverviewProps> = ({ onAnalyze }) => {
  const [sectors, setSectors] = useState<SectorRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [region, setRegion] = useState<'BR' | 'US'>('BR');

  useEffect(() => {
    const fetchRecs = async () => {
      setLoading(true);
      // Clean previous state to show loading clearly
      setSectors([]);
      const recs = await getMarketRecommendations(region);
      setSectors(recs);
      setLoading(false);
    };
    fetchRecs();
  }, [region]);

  const getSectorIcon = (name: string) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('tec') || lowerName.includes('growth')) return <Cpu className="w-6 h-6 text-purple-400" />;
    if (lowerName.includes('fin') || lowerName.includes('banc')) return <Briefcase className="w-6 h-6 text-emerald-400" />;
    if (lowerName.includes('energ') || lowerName.includes('commod')) return <Zap className="w-6 h-6 text-yellow-400" />;
    if (lowerName.includes('varej') || lowerName.includes('consum')) return <ShoppingBag className="w-6 h-6 text-pink-400" />;
    return <Layers className="w-6 h-6 text-blue-400" />;
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      
      {/* Header and Region Toggle */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h2 className="text-3xl font-bold text-white flex items-center gap-3">
            <Globe className="text-blue-500 w-8 h-8" />
            Melhores do Mercado
          </h2>
          <p className="text-slate-400 mt-2">
            Oportunidades de destaque no {region === 'BR' ? 'Brasil' : 'Mundo'}, organizadas por setor.
          </p>
        </div>

        <div className="bg-slate-800 p-1.5 rounded-xl flex items-center border border-slate-700">
          <button
            onClick={() => setRegion('BR')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
              region === 'BR'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-white hover:bg-slate-700'
            }`}
          >
            <span>🇧🇷</span> Brasil (B3)
          </button>
          <button
            onClick={() => setRegion('US')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
              region === 'US'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-white hover:bg-slate-700'
            }`}
          >
            <span>🇺🇸</span> EUA (Global)
          </button>
        </div>
      </div>
      
      {/* Loading Skeleton */}
      {loading && (
        <div className="space-y-12 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-4">
              <div className="h-8 w-48 bg-slate-800 rounded-lg"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="h-64 bg-slate-800 rounded-2xl border border-slate-700"></div>
                 <div className="h-64 bg-slate-800 rounded-2xl border border-slate-700"></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Content */}
      {!loading && sectors.map((sector) => (
        <div key={sector.sectorName} className="space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
            {getSectorIcon(sector.sectorName)}
            <h3 className="text-xl font-bold text-slate-200 uppercase tracking-wide">
              {sector.sectorName}
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sector.stocks.map((rec) => (
              <div 
                key={rec.symbol} 
                className="group bg-slate-800 hover:bg-slate-750 border border-slate-700 hover:border-blue-500/50 transition-all duration-300 rounded-2xl p-6 flex flex-col justify-between shadow-lg"
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-2xl font-bold text-white group-hover:text-blue-400 transition-colors">
                        {rec.symbol}
                      </h3>
                      <p className="text-slate-400 text-sm font-medium line-clamp-1">{rec.name}</p>
                    </div>
                    <div className="text-right">
                      <span className="block text-lg font-bold text-white whitespace-nowrap">{rec.price}</span>
                      <span className={`flex items-center justify-end text-xs font-bold gap-1 mt-1 ${
                        rec.trend === 'up' ? 'text-emerald-400' : rec.trend === 'down' ? 'text-red-400' : 'text-slate-400'
                      }`}>
                        {rec.trend === 'up' && <TrendingUp className="w-3 h-3" />}
                        {rec.trend === 'down' && <TrendingDown className="w-3 h-3" />}
                        {rec.trend === 'neutral' && <Minus className="w-3 h-3" />}
                        {rec.trend === 'up' ? 'ALTA' : rec.trend === 'down' ? 'BAIXA' : 'NEUTRO'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="bg-slate-900/50 p-4 rounded-xl mb-6 border border-slate-700/30">
                    <p className="text-slate-300 text-sm leading-relaxed line-clamp-3">
                      "{rec.reason}"
                    </p>
                  </div>
                </div>
                
                <button 
                  onClick={() => onAnalyze(rec.symbol)}
                  className="w-full py-3 bg-slate-700 hover:bg-blue-600 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2 group-hover:translate-y-[-2px] shadow-lg shadow-black/20"
                >
                  Ver Análise Completa <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}

      {sectors.length === 0 && !loading && (
        <div className="text-center py-20 bg-slate-800/50 rounded-3xl border border-slate-700 border-dashed">
          <p className="text-slate-500 text-lg">Nenhuma recomendação encontrada no momento.</p>
        </div>
      )}
    </div>
  );
};

export default MarketOverview;