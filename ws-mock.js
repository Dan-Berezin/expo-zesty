// ws-mock.js
const { WebSocketServer } = require('ws');
const PORT = 8081;
const wss = new WebSocketServer({ port: PORT });
// 20 tickers
const TICKERS = [
'AAPL','NVDA','TSLA','AMZN','MSFT','GOOGL','META','AMD','IBM','ORCL',
'SNAP','SHOP','UBER','COIN','ABNB','DIS','NFLX','INTC','BA','JNJ'
];
// precios base
const basePrices = Object.fromEntries(
TICKERS.map(t => [t, +(50 + Math.random()*950).toFixed(2)])
);
const livePrices = { ...basePrices };
// histórico diario de 2 meses
function generateHistory(days = 60) {
const history = {};
const today = new Date();
TICKERS.forEach(ticker => {
const arr = [];
let prevClose = basePrices[ticker];
for (let i = days - 1; i >= 0; i--) {
const d = new Date(today);
d.setDate(today.getDate() - i);
const change = (Math.random() - 0.5) * 0.04; // ±4%

const close = Math.max(1, +(prevClose * (1 + change)).toFixed(2));
const open = prevClose;
const high = +(Math.max(open, close) * (1 + Math.random() * 0.01)).toFixed(2);
const low = +(Math.min(open, close) * (1 - Math.random() * 0.01)).toFixed(2);
arr.push({ date: d.toISOString().slice(0,10), open, high, low, close });
prevClose = close;
}
history[ticker] = arr;
});
return history;
}
const HISTORY = generateHistory(60);
// ticks en vivo
setInterval(() => {
TICKERS.forEach(t => {
const deltaPct = (Math.random() - 0.5) * 0.01;
const next = Math.max(1, +(livePrices[t] * (1 + deltaPct)).toFixed(2));
livePrices[t] = next;
const msg = JSON.stringify({ type:'tick', ticker:t, price:next, ts:Date.now() });
wss.clients.forEach(c => c.readyState === 1 && c.send(msg));
});
}, 1200);
wss.on('connection', (ws) => {
ws.send(JSON.stringify({ type:'history', range:'last_60_days', data:HISTORY }));
});
console.log(`WS mock running on ws://localhost:${PORT}`);