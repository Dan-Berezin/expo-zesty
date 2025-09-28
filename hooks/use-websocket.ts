import { Config } from '@/constants/config';
import { useEffect, useState } from 'react';

interface TickData {
    type: 'tick';
    ticker: string;
    price: number;
    ts: number;
  }
  

  interface HistoricalPriceEntry {
    date: string;
    open: number;
    high: number;
    low: number;
    close: number;
  }
  
  interface HistoryData {
    type: 'history';
    range: string;
    data: {
      [ticker: string]: HistoricalPriceEntry[];
    };
  }
  
  export interface StockPrice {
    ticker: string;
    price: number;
    lastUpdate: number;
  }
  
export function useWebSocket() {
    const url = Config.webSocket.stockDataUrl;
    const [stockPrices, setStockPrices] = useState<StockPrice[]>([]);
    const [historyData, setHistoryData] = useState<HistoryData['data'] | null>(null);
    const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected');
  
    useEffect(() => {
      const ws = new WebSocket(url);
      setConnectionStatus('connecting');
  
      ws.onopen = () => {
        console.log('WebSocket connected');
        setConnectionStatus('connected');
      };
  
      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          
          if (message.type === 'history') {
            console.log('Received history data for', Object.keys(message.data).length, 'tickers');
            setHistoryData(message.data);
            
            const initialPrices: StockPrice[] = Object.entries(message.data as HistoryData['data']).map(([ticker, history]) => {
              const latestData = history[history.length - 1];
              return {
                ticker,
                price: latestData.close,
                lastUpdate: Date.now(),
              };
            });
            setStockPrices(initialPrices);
          } else if (message.type === 'tick') {
            const tickData = message as TickData;
            setStockPrices(prev => 
              prev.map(stock => 
                stock.ticker === tickData.ticker 
                  ? { ...stock, price: tickData.price, lastUpdate: tickData.ts }
                  : stock
              )
            );
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };
  
      ws.onclose = () => {
        console.log('WebSocket disconnected');
        setConnectionStatus('disconnected');
      };
  
      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setConnectionStatus('disconnected');
      };
  
      return () => {
        ws.close();
      };
    }, [url]);
  
    return { stockPrices, historyData, connectionStatus };
  }
  