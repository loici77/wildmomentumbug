import React, { useState, useEffect } from 'react';
import { Layout, Search, TrendingUp, TrendingDown, Star, Bell, Menu, X, ChevronRight, Bug } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn, formatCurrency, formatNet } from './lib/utils';
import { Stock, MarketIndex, NewsItem } from './types';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, Cell, PieChart, Pie, Sector
} from 'recharts';
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Components
const Header = ({ activeTab, setActiveTab }: { activeTab: string, setActiveTab: (t: string) => void }) => (
  <header className="border-b border-border-dark bg-bg-dark/80 backdrop-blur-md sticky top-0 z-50">
    <div className="max-w-[1600px] mx-auto px-6 h-16 flex items-center justify-between">
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-2">
          <Bug className="w-8 h-8 text-brand" />
          <span className="text-xl font-bold tracking-tighter text-brand">MOMENTUMBUG</span>
        </div>
        <nav className="flex items-center gap-1">
          {['대시보드', '스캐너', '종목 디테일'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-6 py-2 rounded-md text-sm font-medium transition-all",
                activeTab === tab ? "bg-brand text-black" : "text-gray-400 hover:text-white hover:bg-white/5"
              )}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>
      <div className="flex items-center gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input 
            type="text" 
            placeholder="종목명 검색" 
            className="bg-white/5 border border-border-dark rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-brand/50 w-64"
          />
        </div>
        <button className="p-2 text-gray-400 hover:text-white"><Bell className="w-5 h-5" /></button>
        <div className="w-8 h-8 rounded-full bg-brand/20 border border-brand/50 flex items-center justify-center text-xs font-bold text-brand">MK</div>
      </div>
    </div>
  </header>
);

const MarketTicker = ({ indices }: { indices: MarketIndex[] }) => (
  <div className="border-b border-border-dark bg-bg-dark/50">
    <div className="max-w-[1600px] mx-auto px-6 h-12 flex items-center gap-12 overflow-x-auto no-scrollbar">
      {indices.map((idx) => (
        <div key={idx.name} className="flex items-center gap-3 whitespace-nowrap">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{idx.name}</span>
          <span className="text-sm font-mono font-medium">{idx.value}</span>
          <div className={cn("flex items-center gap-1 text-xs", idx.change >= 0 ? "text-red-500" : "text-blue-500")}>
            {idx.change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            <span>{Math.abs(idx.change).toFixed(2)}</span>
          </div>
        </div>
      ))}
      <div className="ml-auto flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">LIVE</span>
      </div>
    </div>
  </div>
);

// Pages
const Dashboard = ({ stocks, news }: { stocks: Stock[], news: NewsItem[] }) => {
  const top5 = stocks.slice(0, 5).sort((a, b) => b.momentum_score - a.momentum_score);
  const [selectedStock, setSelectedStock] = useState(stocks[0]);

  return (
    <div className="grid grid-cols-12 gap-6 p-6 max-w-[1600px] mx-auto">
      {/* Left Column */}
      <div className="col-span-12 lg:col-span-7 space-y-6">
        <section className="bg-card-dark border border-border-dark rounded-xl p-6">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <span className="text-xl">🔥</span>
              <h2 className="text-lg font-bold">실적모멘텀 뉴스 TOP 5</h2>
            </div>
            <div className="flex gap-1 bg-white/5 p-1 rounded-lg">
              {['당일', '1주일', '1개월', '3개월', '6개월', '1년'].map(t => (
                <button key={t} className={cn("px-3 py-1 text-xs rounded-md", t === '1년' ? "bg-brand text-black" : "text-gray-400")}>{t}</button>
              ))}
            </div>
          </div>
          
          <div className="space-y-6">
            {top5.map((stock, i) => (
              <div key={stock.id} className="group cursor-pointer" onClick={() => setSelectedStock(stock)}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-4">
                    <span className="text-gray-500 font-mono italic">{i + 1}</span>
                    <span className="font-bold">{stock.name}</span>
                  </div>
                  <div className="text-right">
                    <span className={cn("text-sm font-bold", stock.change_percent >= 0 ? "text-red-500" : "text-blue-500")}>
                      {stock.change_percent}%
                    </span>
                    <div className="text-[10px] text-gray-500">68건</div>
                  </div>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${stock.momentum_score}%` }}
                    className="h-full bg-red-500/80 group-hover:bg-red-500 transition-colors"
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-card-dark border border-border-dark rounded-xl overflow-hidden">
          <div className="bg-brand/10 border-b border-brand/20 p-4 flex justify-between items-center">
            <h3 className="text-brand font-bold">{selectedStock?.name} 실적모멘텀 뉴스</h3>
            <span className="text-xs text-brand/60 font-mono">7건</span>
          </div>
          <div className="p-2 space-y-1">
            {news.filter(n => n.stock_id === selectedStock?.id).map((item) => (
              <div key={item.id} className="p-4 hover:bg-white/5 rounded-lg transition-colors cursor-pointer group">
                <h4 className="font-medium mb-1 group-hover:text-brand transition-colors">{item.title}</h4>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>{item.source}</span>
                  <span>•</span>
                  <span>{item.date}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Right Column */}
      <div className="col-span-12 lg:col-span-5 space-y-6">
        <section className="bg-card-dark border border-border-dark rounded-xl p-6">
          <h2 className="text-lg font-bold mb-6">추천 주</h2>
          <div className="space-y-4">
            {stocks.slice(0, 3).map((stock, i) => (
              <div key={stock.id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5 hover:border-brand/30 transition-all">
                <div className="flex items-center gap-4">
                  <span className="text-brand font-bold font-mono italic">{i + 1}</span>
                  <div>
                    <div className="font-bold">{stock.name}</div>
                    <div className="text-[10px] text-gray-500 font-mono uppercase tracking-widest">{stock.code}</div>
                  </div>
                </div>
                <span className={cn("text-sm font-bold", stock.change_percent >= 0 ? "text-red-500" : "text-blue-500")}>
                  {stock.change_percent >= 0 ? '+' : ''}{stock.change_percent}%
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-card-dark border border-border-dark rounded-xl overflow-hidden">
          <div className="bg-brand p-4 flex justify-between items-center">
            <h3 className="text-black font-bold text-sm">기사 대시보드 — 최다 모멘텀 언급종목</h3>
            <div className="flex gap-1 bg-black/10 p-1 rounded-lg">
              {['당일', '1주일', '한달', '3달', '6달', '1년'].map(t => (
                <button key={t} className={cn("px-2 py-0.5 text-[10px] rounded-md", t === '당일' ? "bg-white text-black" : "text-black/60")}>{t}</button>
              ))}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border-dark text-gray-500">
                  <th className="px-4 py-3 font-medium">종목</th>
                  <th className="px-4 py-3 font-medium">현재가</th>
                  <th className="px-4 py-3 font-medium">전일비</th>
                  <th className="px-4 py-3 font-medium">거래량</th>
                  <th className="px-4 py-3 font-medium text-red-400">외국인</th>
                  <th className="px-4 py-3 font-medium text-green-400">기관</th>
                  <th className="px-4 py-3 font-medium text-emerald-400">개인</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-dark">
                {stocks.map((stock) => (
                  <tr key={stock.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-bold">{stock.name}</span>
                        <span className="text-[8px] px-1 border border-green-500/50 text-green-500 rounded">{stock.market}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono">{formatCurrency(stock.price)}</td>
                    <td className={cn("px-4 py-3 font-mono", stock.change >= 0 ? "text-red-500" : "text-blue-500")}>
                      <div className="flex items-center gap-1">
                        {stock.change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {formatCurrency(Math.abs(stock.change))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-400 font-mono">{Math.round(stock.volume / 10000)}만</td>
                    <td className={cn("px-4 py-3 font-mono", stock.foreign_net >= 0 ? "text-green-400" : "text-red-400")}>{formatNet(stock.foreign_net)}</td>
                    <td className={cn("px-4 py-3 font-mono", stock.inst_net >= 0 ? "text-green-400" : "text-red-400")}>{formatNet(stock.inst_net)}</td>
                    <td className={cn("px-4 py-3 font-mono", stock.indiv_net >= 0 ? "text-green-400" : "text-red-400")}>{formatNet(stock.indiv_net)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
};

const Scanner = ({ stocks }: { stocks: Stock[] }) => {
  const [aiComment, setAiComment] = useState("");
  const [loading, setLoading] = useState(false);

  const keywords = [
    { name: '실적 개선', value: 45 },
    { name: '이익 성장', value: 62 },
    { name: '영업이익 증가', value: 78 },
    { name: '매출 증가', value: 60 },
    { name: '수익성 개선', value: 42 },
    { name: '마진 개선', value: 32 },
    { name: '영업이익률 상승', value: 55 },
    { name: '실적 회복', value: 28 },
    { name: '이익 확대', value: 48 },
    { name: '매출 성장', value: 72 },
  ];

  useEffect(() => {
    const generateComment = async () => {
      setLoading(true);
      try {
        const response = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: "삼성전자의 최근 실적 모멘텀과 수급 상황을 바탕으로 짧은 투자 코멘트를 작성해줘. 한국어로.",
        });
        setAiComment(response.text);
      } catch (e) {
        setAiComment("삼성전자는 최근 실적 모멘텀 관련 뉴스가 68건으로 최다 언급되었습니다. 외국인 순매도가 지속되고 있으나, 기관과 개인의 순매수가 증가하는 추세입니다. 단기 변동성이 높아 주의가 필요하며, 중장기적으로는 반도체 업황 회복 기대감이 긍정적으로 작용할 수 있습니다.");
      }
      setLoading(false);
    };
    generateComment();
  }, []);

  return (
    <div className="grid grid-cols-12 gap-6 p-6 max-w-[1600px] mx-auto">
      <div className="col-span-12 lg:col-span-6 space-y-6">
        <div className="bg-white/5 border border-border-dark rounded-xl p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input 
              type="text" 
              placeholder="종목명 검색" 
              className="w-full bg-transparent border-none py-2 pl-10 pr-4 text-sm focus:outline-none"
            />
          </div>
        </div>

        <div className="flex gap-4">
          <div className="flex-1 bg-card-dark border border-border-dark rounded-xl p-6 text-center">
            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">TOTAL</div>
            <div className="text-3xl font-bold text-cyan-400">98</div>
          </div>
          <div className="flex-1 bg-card-dark border border-border-dark rounded-xl p-6 text-center">
            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">ANALYSIS</div>
            <div className="text-3xl font-bold text-brand">98</div>
          </div>
        </div>

        <section className="bg-card-dark border border-border-dark rounded-xl p-6">
          <h2 className="text-sm font-bold text-gray-400 mb-6 uppercase tracking-widest">실적모멘텀 키워드 빈도</h2>
          <div className="space-y-4">
            {keywords.map((kw) => (
              <div key={kw.name}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium">{kw.name}</span>
                  <span className="text-gray-500">{kw.value}</span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${kw.value}%` }}
                    className="h-full bg-cyan-500"
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="col-span-12 lg:col-span-6 space-y-6">
        <section className="bg-card-dark border border-border-dark rounded-xl p-12 flex flex-col items-center justify-center min-h-[400px]">
          <div className="relative w-64 h-64">
             <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[{ value: 72 }, { value: 28 }]}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={100}
                  startAngle={90}
                  endAngle={450}
                  paddingAngle={0}
                  dataKey="value"
                >
                  <Cell fill="#00E5FF" />
                  <Cell fill="#1A1B1E" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-6xl font-bold text-cyan-400">72</span>
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-2">MOMENTUM</span>
            </div>
          </div>
        </section>

        <section className="bg-cyan-900/20 border border-cyan-500/30 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-lg">🤖</span>
            <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-widest">AI AGENT COMMENT</h3>
          </div>
          <p className="text-sm leading-relaxed text-gray-300">
            {loading ? "분석 중..." : aiComment}
          </p>
        </section>
      </div>
    </div>
  );
};

const StockDetail = ({ stock }: { stock: Stock }) => {
  const chartData = Array.from({ length: 20 }, (_, i) => ({
    name: i,
    price: stock.price - 10000 + Math.random() * 20000,
  }));

  return (
    <div className="grid grid-cols-12 gap-6 p-6 max-w-[1600px] mx-auto">
      <div className="col-span-12 lg:col-span-6 space-y-6">
        <section className="bg-card-dark border border-border-dark rounded-xl p-8">
          <div className="flex items-start justify-between mb-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Star className="w-5 h-5 text-brand fill-brand" />
                <h1 className="text-3xl font-bold">{stock.name}</h1>
                <span className="text-gray-500 font-mono">{stock.code}</span>
                <span className="text-[10px] px-1.5 py-0.5 border border-green-500/50 text-green-500 rounded uppercase font-bold">{stock.market}</span>
              </div>
              <div className="flex items-baseline gap-4">
                <span className="text-5xl font-bold font-mono tracking-tighter">{formatCurrency(stock.price)}</span>
                <div className={cn("flex items-center gap-1 text-xl font-bold", stock.change >= 0 ? "text-red-500" : "text-blue-500")}>
                  {stock.change >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                  {formatCurrency(Math.abs(stock.change))} ({stock.change_percent}%)
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-5 gap-4 mb-12">
            {[
              { label: '애널목표가', value: '238,660', color: 'bg-red-500' },
              { label: '최고목표가', value: '300,000', color: 'bg-gray-500' },
              { label: '현재가', value: formatCurrency(stock.price), color: 'bg-cyan-400' },
              { label: '달성률', value: '72.4%', color: 'bg-pink-500' },
              { label: 'PER', value: '26.34배', color: 'bg-green-500' },
            ].map((item) => (
              <div key={item.label} className="space-y-3">
                <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest text-center">{item.label}</div>
                <div className="text-sm font-bold text-center font-mono">{item.value}</div>
                <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                  <div className={cn("h-full w-2/3", item.color)} />
                </div>
              </div>
            ))}
          </div>

          <div className="h-64 w-full">
            <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4">시세 차트</h3>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <defs>
                  <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ff4d4d" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ff4d4d" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Line type="monotone" dataKey="price" stroke="#ff4d4d" strokeWidth={2} dot={false} />
                <Tooltip contentStyle={{ backgroundColor: '#151619', border: '1px solid #2A2B2E' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      <div className="col-span-12 lg:col-span-6 space-y-6">
        <section className="bg-card-dark border border-border-dark rounded-xl overflow-hidden">
          <div className="bg-brand/10 p-4 border-b border-brand/20">
            <h3 className="text-brand font-bold text-xs uppercase tracking-widest">투자자별 매매동향</h3>
          </div>
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-gray-500 border-b border-border-dark">
                <th className="px-4 py-3 font-medium">날짜</th>
                <th className="px-4 py-3 font-medium">종가</th>
                <th className="px-4 py-3 font-medium">전일비</th>
                <th className="px-4 py-3 font-medium">거래량</th>
                <th className="px-4 py-3 font-medium text-red-400">외국인</th>
                <th className="px-4 py-3 font-medium text-green-400">기관</th>
                <th className="px-4 py-3 font-medium text-emerald-400">개인</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-dark font-mono">
              {[...Array(10)].map((_, i) => (
                <tr key={i} className="hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3 text-gray-500">03.0{6-i > 0 ? 6-i : 1}</td>
                  <td className="px-4 py-3">{formatCurrency(stock.price - i * 1000)}</td>
                  <td className="px-4 py-3 text-green-400">↑ 3,400</td>
                  <td className="px-4 py-3 text-gray-400">2952만</td>
                  <td className="px-4 py-3 text-red-400">-621만</td>
                  <td className="px-4 py-3 text-red-400">-301만</td>
                  <td className="px-4 py-3 text-green-400">+923만</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="bg-card-dark border border-border-dark rounded-xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <Star className="w-4 h-4 text-brand fill-brand" />
            <h3 className="text-sm font-bold uppercase tracking-widest">즐겨찾기</h3>
          </div>
          <div className="space-y-2">
            {['삼성전자', 'SK하이닉스', 'SK텔레콤', '와이지엔터테인먼트', '한미반도체'].map((name) => (
              <div key={name} className="flex items-center justify-between p-3 hover:bg-white/5 rounded-lg group cursor-pointer">
                <div className="flex items-center gap-4">
                  <Star className="w-4 h-4 text-brand fill-brand" />
                  <span className="font-medium">{name}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-[10px] text-gray-500 font-mono">005930</span>
                  <span className="text-xs font-bold text-red-500">-8.13%</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default function App() {
  const [activeTab, setActiveTab] = useState('대시보드');
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [indices, setIndices] = useState<MarketIndex[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const [stocksRes, indicesRes, newsRes] = await Promise.all([
        fetch('/api/stocks').then(r => r.json()),
        fetch('/api/market-indices').then(r => r.json()),
        fetch('/api/stocks/samsung').then(r => r.json())
      ]);
      setStocks(stocksRes);
      setIndices(indicesRes);
      setNews(newsRes.news);
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />
      <MarketTicker indices={indices} />
      
      <main className="flex-1 overflow-y-auto custom-scrollbar">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === '대시보드' && <Dashboard stocks={stocks} news={news} />}
            {activeTab === '스캐너' && <Scanner stocks={stocks} />}
            {activeTab === '종목 디테일' && <StockDetail stock={stocks[0] || {} as Stock} />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
