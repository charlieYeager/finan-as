import { GoogleGenAI } from "@google/genai";
import { StockData, ValuationType, SectorRecommendation } from "../types";

// Cache in-memory para evitar chamadas repetidas e acelerar a troca de abas
const marketCache: Record<string, SectorRecommendation[]> = {};

// Helper to get today's date for context
const getToday = () => new Date().toISOString().split('T')[0];

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Função robusta para extrair JSON de respostas "sujas" (com markdown ou texto extra)
const extractAndParseJson = (text: string): any => {
  if (!text) throw new Error("Resposta vazia da IA");
  
  // 1. Tenta remover blocos de código markdown
  let cleaned = text.replace(/```json/g, '').replace(/```/g, '');

  // 2. Tenta encontrar o objeto JSON {} ou array []
  const firstOpen = cleaned.indexOf('{');
  const lastClose = cleaned.lastIndexOf('}');
  
  if (firstOpen !== -1 && lastClose !== -1 && lastClose > firstOpen) {
    cleaned = cleaned.substring(firstOpen, lastClose + 1);
  }
  
  try {
    return JSON.parse(cleaned);
  } catch (e) {
    console.error("Falha ao fazer parse do JSON extraído:", cleaned);
    throw new Error("Formato de JSON inválido retornado pela IA");
  }
};

// Wrapper para tentar a operação novamente em caso de falha (Retry com Backoff)
async function withRetry<T>(operation: () => Promise<T>, retries = 2, delay = 1000): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (retries <= 0) throw error;
    console.warn(`Tentativa falhou. Retentando em ${delay}ms... Restam ${retries} tentativas.`);
    await new Promise(resolve => setTimeout(resolve, delay));
    return withRetry(operation, retries - 1, delay * 2);
  }
}

export const analyzeStock = async (query: string): Promise<StockData | null> => {
  // Envolvemos toda a lógica de chamada e parse no retry
  return withRetry(async () => {
    const prompt = `
      Você é um analista financeiro sênior fundamentalista (Benjamin Graham/Warren Buffett style). A data de hoje é ${getToday()}.
      
      TAREFA: Analise a empresa ou ticker: "${query}".
      
      IMPORTANTE:
      1. Use a ferramenta 'googleSearch' para encontrar o preço EXATO da ação AGORA (tempo real) e dados públicos ATUAIS.
      2. Verifique se a empresa existe e é listada na bolsa. Se não for, retorne {"exists": false}.
      3. Busque NOTÍCIAS RECENTES (últimas 24h-48h).
      4. Busque dados financeiros públicos fundamentais (Key Stats).
      
      CRITÉRIO CRÍTICO PARA PRÓS E CONTRAS (V e X):
      - NÃO use frases genéricas como "Boa gestão".
      - Use INDICADORES FINANCEIROS REAIS.
      - Exemplo PRÓS: "P/L: 5.4 (Baixo)", "ROE: 25% (Alto)".
      - Exemplo CONTRAS: "Dív. Líq/EBITDA: 4x (Alta)", "Margem Líq: 2% (Baixa)".
      
      FORMATO DE RESPOSTA (JSON PURO OBRIGATÓRIO):
      {
        "exists": boolean,
        "symbol": "string",
        "companyName": "string",
        "currentPrice": "string", 
        "currency": "string",
        "sector": "string",
        "description": "Breve resumo da empresa",
        "keyStats": {
          "marketCap": "string",
          "peRatio": "string",
          "dividendYield": "string",
          "week52High": "string",
          "week52Low": "string"
        },
        "news": [
          {
            "title": "Manchete",
            "source": "Fonte",
            "date": "Data",
            "url": "link"
          }
        ],
        "pros": ["Indicador: Valor (Contexto)"],
        "cons": ["Indicador: Valor (Contexto)"],
        "valuation": "Barato" | "Justo" | "Caro" | "Desconhecido",
        "financialHealthScore": number, // 0-100
        "metrics": [
          { "name": "Crescimento", "value": "string", "score": number },
          { "name": "Rentabilidade", "value": "string", "score": number },
          { "name": "Dívida", "value": "string", "score": number },
          { "name": "Valuation", "value": "string", "score": number },
          { "name": "Momentum", "value": "string", "score": number }
        ]
      }
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const data = extractAndParseJson(response.text || "");

    if (!data.exists) return null;

    let valuationEnum = ValuationType.UNKNOWN;
    if (data.valuation === 'Barato') valuationEnum = ValuationType.UNDERVALUED;
    if (data.valuation === 'Justo') valuationEnum = ValuationType.FAIR;
    if (data.valuation === 'Caro') valuationEnum = ValuationType.OVERVALUED;

    return {
      ...data,
      valuation: valuationEnum,
      lastUpdated: new Date().toLocaleTimeString(),
    };
  });
};

export const getMarketRecommendations = async (region: 'BR' | 'US'): Promise<SectorRecommendation[]> => {
  // Retorna do cache se existir
  if (marketCache[region]) {
    return marketCache[region];
  }

  try {
    return await withRetry(async () => {
      const regionContext = region === 'BR' 
        ? "o mercado brasileiro (B3). Foque APENAS em ações listadas no Brasil (ex: tickers com final 3, 4, 11)." 
        : "o mercado americano (NYSE/NASDAQ). Foque APENAS em ações dos EUA.";
      
      const currencyContext = region === 'BR' ? "R$" : "US$";

      const prompt = `
        Atue como um estrategista de investimentos sênior. Data: ${getToday()}.
        
        TAREFA: Liste as melhores oportunidades para ${regionContext}, organizadas por SETOR.
        
        SETORES:
        1. Tecnologia / Growth
        2. Finanças / Bancos
        3. Energia / Commodities
        4. Varejo / Consumo
        
        REGRAS:
        - Use Google Search para validar destaques de HOJE.
        - 2 a 3 ações por setor.
        - Preço atualizado (${currencyContext}).
        
        FORMATO JSON OBRIGATÓRIO:
        {
          "sectors": [
            {
              "sectorName": "Nome do Setor",
              "stocks": [
                {
                  "symbol": "TICKER",
                  "name": "Nome",
                  "price": "Preço",
                  "reason": "Motivo curto (1 frase)",
                  "trend": "up" | "down" | "neutral"
                }
              ]
            }
          ]
        }
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
        },
      });

      const data = extractAndParseJson(response.text || "");
      const result = data.sectors || [];
      
      // Salva no cache se tiver resultados
      if (result.length > 0) {
        marketCache[region] = result;
      }
      
      return result;
    });
  } catch (error) {
    console.error("Erro fatal ao buscar recomendações de mercado:", error);
    return []; // Falha silenciosa para não quebrar a UI, apenas mostra vazio
  }
};