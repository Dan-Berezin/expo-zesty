import { useWebSocket } from '@/hooks/use-websocket';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useRef, useState } from 'react';
import { Dimensions, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';

// Get screen dimensions
const { width: screenWidth } = Dimensions.get('window');
const chartWidth = screenWidth - 40; // Account for container padding (20*2) + chart container padding (16*2)

type TimeRange = '1D' | '1W' | '1M' | '2M';

interface TabOption {
  key: TimeRange;
  label: string;
  days: number;
}

const TIME_RANGES: TabOption[] = [
  { key: '1D', label: '1D', days: 1 },
  { key: '1W', label: '1W', days: 7 },
  { key: '1M', label: '1M', days: 30 },
  { key: '2M', label: '2M', days: 60 },
];

export default function ClickerDetailScreen() {
  const { ticker } = useLocalSearchParams<{ ticker: string }>();
  const router = useRouter();
  const { stockPrices, historyData, connectionStatus } = useWebSocket();
  
  // Tab state and ref
  const [selectedRange, setSelectedRange] = useState<TimeRange>('1M');
  const selectedRangeRef = useRef<TimeRange>('1M');

  // Update ref when state changes
  React.useEffect(() => {
    selectedRangeRef.current = selectedRange;
  }, [selectedRange]);

  // Get current stock price for the ticker
  const currentStock = stockPrices.find(stock => stock.ticker === ticker);
  
  // Prepare chart data based on selected time range
  const chartData = useMemo(() => {
    if (!historyData || !ticker || !historyData[ticker]) {
      return [];
    }

    const fullData = historyData[ticker];
    const selectedDays = TIME_RANGES.find(range => range.key === selectedRange)?.days || 30;
    
    const filteredData = fullData.slice(-selectedDays);

    // Calculate spacing based on data length and chart width
    const dataLength = filteredData.length;
    const availableWidth = chartWidth - 40;
    const optimalSpacing = Math.max(1, Math.floor(availableWidth / dataLength));

    // Fixed label frequencies to ensure labels are always shown
    let labelFrequency = 1;
    switch (selectedRange) {
      case '1D':
        labelFrequency = Math.max(1, Math.floor(dataLength / 4)); // Show ~4 labels
        break;
      case '1W':
        labelFrequency = 1; // Show all days
        break;
      case '1M':
        labelFrequency = 5; // Show every 2nd to 5th day
        break;
      case '2M':
        labelFrequency = 5; // Show every 2nd to 7th day
        break;
    }

    return filteredData.map((entry, index) => ({
      value: entry.close,
      label: index % labelFrequency === 0 ? entry.date.slice(5) : '',
      labelTextStyle: { fontSize: 10, color: '#666' },
      spacing: optimalSpacing,
    }));
  }, [historyData, ticker, selectedRange]);

  // Calculate price change for the selected period
  const priceChange = useMemo(() => {
    if (!chartData || chartData.length < 2) return null;
    
    const firstPrice = chartData[0].value;
    const lastPrice = chartData[chartData.length - 1].value;
    const change = lastPrice - firstPrice;
    const changePercent = ((change / firstPrice) * 100).toFixed(2);
    
    return {
      absolute: change.toFixed(2),
      percent: changePercent,
      isPositive: change >= 0
    };
  }, [chartData]);

  const handleTabPress = (range: TimeRange) => {
    setSelectedRange(range);
  };

  const renderTabs = () => (
    <View style={styles.tabContainer}>
      {TIME_RANGES.map((tab) => (
        <TouchableOpacity
          key={tab.key}
          style={[
            styles.tab,
            selectedRange === tab.key && styles.activeTab
          ]}
          onPress={() => handleTabPress(tab.key)}
          activeOpacity={0.7}
        >
          <Text style={[
            styles.tabText,
            selectedRange === tab.key && styles.activeTabText
          ]}>
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <View style={[styles.statusIndicator, { 
          backgroundColor: connectionStatus === 'connected' ? '#4CAF50' : 
                          connectionStatus === 'connecting' ? '#FF9800' : '#F44336' 
        }]}>
          <Text style={styles.statusText}>{connectionStatus}</Text>
        </View>
      </View>
      
      <ScrollView style={styles.content}>
        <View style={styles.titleSection}>
          <Text style={styles.title}>{ticker}</Text>
        </View>

        {renderTabs()}

        {chartData.length > 0 ? (
          <View style={styles.chartContainer}>
            <Text style={styles.chartTitle}>
              Price History ({TIME_RANGES.find(r => r.key === selectedRange)?.label})
            </Text>
            <LineChart
              data={chartData}
              width={chartWidth}
              height={250}
              color={priceChange?.isPositive ? "rgb(0, 151, 78)" : "rgb(137, 39, 39)"}
              thickness={2}
              startFillColor={priceChange?.isPositive ? "rgb(0, 151, 78, 0.5)" : "rgb(137, 39, 39, 0.5)"}
              startOpacity={0.5}
              endOpacity={0}
              initialSpacing={0}
              spacing={chartData.length > 0 ? (chartData[0]?.spacing ?? 10) : 10}
              noOfSections={4}
              areaChart
              yAxisTextStyle={{ fontSize: 12, color: '#666' }}
              xAxisTextStyle={{ fontSize: 10, color: '#666' }}
              hideDataPoints={selectedRange != '1W'}
              dataPointsColor="#007AFF"
              dataPointsRadius={3}
              hideRules
              showVerticalLines={false}
              xAxisColor="lightgray"
              yAxisColor="lightgray"
              curved
              adjustToWidth={true}
            />
          </View>
        ) : (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>
              {connectionStatus === 'connected' ? 'Loading chart data...' : 'Connecting to data source...'}
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: 'white',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
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
  content: {
    flex: 1,
    padding: 20,
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  priceSection: {
    alignItems: 'center',
  },
  currentPrice: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  priceChange: {
    fontSize: 16,
    fontWeight: '500',
  },
  // Tab styles
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 4,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTab: {
    backgroundColor: '#007AFF',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  activeTabText: {
    color: 'white',
  },
  chartContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  loadingContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});
