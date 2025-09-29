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

  interface IntradayDataPoint {
    timestamp: number;
    price: number;
    date: string; 
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
    const [intradayData, setIntradayData] = useState<{[ticker: string]: IntradayDataPoint[]}>({});
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
            const initialIntradayData: {[ticker: string]: IntradayDataPoint[]} = {};
            Object.entries(message.data as HistoryData['data']).forEach(([ticker, history]) => {
              const latestData = history[history.length - 1];
              const now = Date.now();
              initialIntradayData[ticker] = [{
                timestamp: now,
                price: latestData.close,
                date: new Date(now).toLocaleTimeString('en-US', { 
                  hour12: false, 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })
              }];
            });
            setIntradayData(initialIntradayData);
          } else if (message.type === 'tick') {
            const tickData = message as TickData;
            
            // Update current prices
            setStockPrices(prev => 
              prev.map(stock => 
                stock.ticker === tickData.ticker 
                  ? { ...stock, price: tickData.price, lastUpdate: tickData.ts }
                  : stock
              )
            );

            // Accumulate tick data for intraday charts
            setIntradayData(prev => {
              const currentData = prev[tickData.ticker] || [];
              const newDataPoint: IntradayDataPoint = {
                timestamp: tickData.ts,
                price: tickData.price,
                date: new Date(tickData.ts).toLocaleTimeString('en-US', { 
                  hour12: false, 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })
              };

              // Keep only the last 500 data points to prevent memory issues
              const updatedData = [...currentData, newDataPoint];
              if (updatedData.length > 500) {
                updatedData.shift(); // Remove the oldest data point
              }

              return {
                ...prev,
                [tickData.ticker]: updatedData
              };
            });
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
  
    return { stockPrices, historyData, intradayData, connectionStatus };
  }
  