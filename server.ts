import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";

const db = new Database("momentumbug.db");

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS stocks (
    id TEXT PRIMARY KEY,
    name TEXT,
    code TEXT,
    market TEXT,
    price INTEGER,
    change INTEGER,
    change_percent REAL,
    volume INTEGER,
    foreign_net INTEGER,
    inst_net INTEGER,
    indiv_net INTEGER,
    momentum_score INTEGER,
    per REAL
  );

  CREATE TABLE IF NOT EXISTS news (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    stock_id TEXT,
    title TEXT,
    source TEXT,
    date TEXT,
    content TEXT
  );

  CREATE TABLE IF NOT EXISTS favorites (
    stock_id TEXT PRIMARY KEY
  );
`);

// Seed Data
const seedStocks = [
  ['samsung', '삼성전자', '005930', 'KOSPI', 172900, -15300, -8.13, 8943000, -3720000, 1530000, 2190000, 72, 26.34],
  ['skhynix', 'SK하이닉스', '000660', 'KOSPI', 178500, -20400, -10.17, 4251000, -5210000, -830000, 6040000, 65, 15.2],
  ['kakao', '카카오', '035720', 'KOSPI', 38250, -2600, -6.34, 1823000, -1240000, 420000, 820000, 45, 42.1],
  ['naver', 'NAVER', '035420', 'KOSPI', 162000, -3000, -1.80, 1240000, -890000, 280000, 610000, 55, 30.5],
  ['hanmi', '한미반도체', '042700', 'KOSDAQ', 94700, 2200, 2.34, 832000, 340000, 120000, -460000, 88, 55.2]
];

const insertStock = db.prepare('INSERT OR REPLACE INTO stocks VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
seedStocks.forEach(stock => insertStock.run(...stock));

const seedNews = [
  ['samsung', '[성공예감] 폭락, 폭풍, 도 폭락... 전쟁과 증시의 관계, 역사는 이렇게...', 'KBS', '2026.03.09 15:21'],
  ['samsung', 'AI 인재 뺏기 현대차도 뛰어들었다...삼성·SK와 3파전', 'SBS Biz', '2026.03.09 15:21'],
  ['samsung', '다가온 정기 주총 시즌, 기업들 \'정관 재정비\' 러시', '종합미디어 시대', '2026.03.09 15:20'],
  ['samsung', '검찰, \'삼성전자 특허 기밀유출\' 전 직원 등 추가 기소', '경향신문', '2026.03.09 15:19'],
  ['samsung', '주한미군 전역 장병, 美진출 韓기업 현지 채용 지원 플랫폼 출범', '아시아경제', '2026.03.09 15:19']
];

const insertNews = db.prepare('INSERT INTO news (stock_id, title, source, date) VALUES (?, ?, ?, ?)');
seedNews.forEach(news => insertNews.run(...news));

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/stocks", (req, res) => {
    const stocks = db.prepare('SELECT * FROM stocks').all();
    res.json(stocks);
  });

  app.get("/api/stocks/:id", (req, res) => {
    const stock = db.prepare('SELECT * FROM stocks WHERE id = ?').get(req.params.id);
    const news = db.prepare('SELECT * FROM news WHERE stock_id = ? ORDER BY date DESC').all(req.params.id);
    res.json({ ...stock, news });
  });

  app.get("/api/favorites", (req, res) => {
    const favorites = db.prepare('SELECT s.* FROM stocks s JOIN favorites f ON s.id = f.stock_id').all();
    res.json(favorites);
  });

  app.post("/api/favorites", (req, res) => {
    const { stock_id } = req.body;
    db.prepare('INSERT OR IGNORE INTO favorites (stock_id) VALUES (?)').run(stock_id);
    res.json({ status: "ok" });
  });

  app.delete("/api/favorites/:id", (req, res) => {
    db.prepare('DELETE FROM favorites WHERE stock_id = ?').run(req.params.id);
    res.json({ status: "ok" });
  });

  app.get("/api/market-indices", (req, res) => {
    res.json([
      { name: "USD/KRW", value: "1,452.30", change: -2.10, percent: -0.14 },
      { name: "KOSPI", value: "2,503.06", change: -35.24, percent: -1.39 },
      { name: "NASDAQ", value: "17,468", change: -213.11, percent: -1.21 },
      { name: "S&P500", value: "5,614.56", change: -72.46, percent: -1.27 },
    ]);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(process.cwd(), "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(process.cwd(), "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
