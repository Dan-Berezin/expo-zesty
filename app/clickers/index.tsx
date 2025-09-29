import { StockPrice, useWebSocket } from '@/hooks/use-websocket';
import { useRouter } from 'expo-router';
import React from 'react';
import { FlatList, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';


export default function ClickersScreen() {
  const { stockPrices } = useWebSocket();
  const router = useRouter();

  const handleStockPress = (ticker: string) => {
    router.push(`/clickers/${ticker}`);
  };

  const renderStockItem = ({ item }: { item: StockPrice }) => (
    <TouchableOpacity 
      style={styles.stockItem}
      onPress={() => handleStockPress(item.ticker)}
      activeOpacity={0.7}
    >
      <Text style={styles.ticker}>{item.ticker}</Text>
      <Text style={styles.price}>${item.price}</Text>
      <Text style={styles.timestamp}>
        {new Date(item.lastUpdate).toLocaleTimeString()}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Precios en vivo</Text>
      </View>

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
    marginTop: 16,
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
    color: '#030303',
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
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
    flex: 0.45,
  },
  ticker: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#030303',
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
    color: '#090909',
  },
});
