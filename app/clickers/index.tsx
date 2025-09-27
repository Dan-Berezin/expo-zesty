import React, { useEffect, useState } from 'react';
import { FlatList, SafeAreaView, StyleSheet, Text, View } from 'react-native';

interface TickData {
  type: 'tick';
  ticker: string;
  price: number;
  ts: number;
}

interface HistoryData {
  type: 'history';
  range: string;
  data: {
    [ticker: string]: Array<{
      date: string;
      open: number;
      high: number;
      low: number;
      close: number;
    }>;
  };
}

interface StockPrice {
  ticker: string;
  price: number;
  lastUpdate: number;
}

// Custom hook to manage WebSocket connection
function useStockWebSocket(url: string) {
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
          
          // Initialize stock prices from history data
          const initialPrices: StockPrice[] = Object.entries(message.data).map(([ticker, history]) => {
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

export default function ClickersScreen() {
  const { stockPrices, historyData, connectionStatus } = useStockWebSocket('ws://0.tcp.sa.ngrok.io:15181');

  const renderStockItem = ({ item }: { item: StockPrice }) => (
    <View style={styles.stockItem}>
      <Text style={styles.ticker}>{item.ticker}</Text>
      <Text style={styles.price}>${item.price}</Text>
      <Text style={styles.timestamp}>
        {new Date(item.lastUpdate).toLocaleTimeString()}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Live Stock Prices</Text>
        <View style={[styles.statusIndicator, { 
          backgroundColor: connectionStatus === 'connected' ? '#4CAF50' : 
                          connectionStatus === 'connecting' ? '#FF9800' : '#F44336' 
        }]}>
          <Text style={styles.statusText}>{connectionStatus}</Text>
        </View>
      </View>

      {historyData && (
        <Text style={styles.subtitle}>
          Showing {Object.keys(historyData).length} stocks with {Object.values(historyData)[0]?.length || 0} days of history
        </Text>
      )}

      <FlatList
        data={stockPrices}
        keyExtractor={(item) => item.ticker}
        renderItem={renderStockItem}
        style={styles.list}
        numColumns={2}
        columnWrapperStyle={styles.row}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  statusIndicator: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    textAlign: 'center',
  },
  list: {
    flex: 1,
  },
  row: {
    justifyContent: 'space-between',
  },
  stockItem: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
    flex: 0.48,
  },
  ticker: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  price: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: '600',
    marginBottom: 4,
  },
  timestamp: {
    fontSize: 12,
    color: '#999',
  },
});
