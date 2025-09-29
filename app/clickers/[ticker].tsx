import { useWebSocket } from '@/hooks/use-websocket';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useRef, useState } from 'react';
import { Dimensions, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';


const { width: screenWidth } = Dimensions.get('window');
const chartWidth = screenWidth - 40;

type TimeRange = '1D' | '1W' | '1M' | '2M';

interface TabOption {
  key: TimeRange;
  label: string;
  days: number;
}

const TIME_RANGES: TabOption[] = [
  { key: '1D', label: 'Hoy', days: 1 },
  { key: '1W', label: '1 Sem', days: 7 },
  { key: '1M', label: '1 Mes', days: 30 },
  { key: '2M', label: '2 Meses', days: 60 },
];

export default function ClickerDetailScreen() {
  const { ticker } = useLocalSearchParams<{ ticker: string }>();
  const router = useRouter();
  const { historyData, intradayData } = useWebSocket();
  
  const [selectedRange, setSelectedRange] = useState<TimeRange>('1M');
  const selectedRangeRef = useRef<TimeRange>('1M');

  React.useEffect(() => {
    selectedRangeRef.current = selectedRange;
  }, [selectedRange]);
  
  const chartData = useMemo(() => {
    if (selectedRange === '1D' && intradayData && ticker && intradayData[ticker]) {
      const todayData = intradayData[ticker];
      if (todayData.length > 0) {
        const dataLength = todayData.length;
        const optimalSpacing = Math.max(1, Math.floor(chartWidth / dataLength));
        
        return todayData.map((entry, index) => ({
          value: entry.price,
          label: index % Math.max(1, Math.floor(dataLength / 6)) === 0 ? entry.date : '',
          labelTextStyle: { fontSize: 10, color: '#666' },
          spacing: optimalSpacing,
        }));
      }
    }
    
    if (!historyData || !ticker || !historyData[ticker]) {
      return [];
    }

    const fullData = historyData[ticker];
    const selectedDays = TIME_RANGES.find(range => range.key === selectedRange)?.days || 30;
    
    const filteredData = fullData.slice(-selectedDays);
    const dataLength = filteredData.length;
    const optimalSpacing = Math.max(1, Math.floor(chartWidth / dataLength));

    return filteredData.map((entry, index) => ({
      value: entry.close,
      label: index % 1 === 0 ? entry.date.slice(5) : '',
      labelTextStyle: { fontSize: 10, color: '#666' },
      spacing: optimalSpacing,
    }));
  }, [historyData, intradayData, ticker, selectedRange]);

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
          <Text style={styles.backButtonText}>← Atrás</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.content}>
        <View style={styles.titleSection}>
          <Text style={styles.title}>{ticker}</Text>
          {priceChange && (
            <View style={styles.varianceSection}>
              <Text style={[
                styles.varianceText,
                { color: priceChange.isPositive ? '#4CAF50' : '#F44336' }
              ]}>
                {priceChange.isPositive ? '+' : ''}${priceChange.absolute}
              </Text>
              <Text style={[
                styles.varianceText,
                { color: priceChange.isPositive ? '#4CAF50' : '#F44336' }
              ]}>
                ({priceChange.isPositive ? '+' : ''}{priceChange.percent}%)
              </Text>
            </View>
          )}
        </View>

        {renderTabs()}

        {chartData.length > 0 ? (
          <View style={styles.chartContainer}>
            <Text style={styles.chartTitle}>
              Valores ({TIME_RANGES.find(r => r.key === selectedRange)?.label})
            </Text>
            <LineChart
              data={chartData}
              width={chartWidth -52}
              height={250}
              xAxisLength={chartWidth - 50}
              color={priceChange?.isPositive ? '#4CAF50' : '#F44336'}
              thickness={2}
              startFillColor={priceChange?.isPositive ? '#4CAF50' : '#F44336'}
              startOpacity={0.5}
              endFillColor={priceChange?.isPositive ? '#4CAF50' : '#F44336'}
              endOpacity={0}
              initialSpacing={0}
              spacing={chartData.length > 0 ? (chartData[0]?.spacing ?? 10) : 10}
              noOfSections={4}
              areaChart
              yAxisTextStyle={{ fontSize: 12, color: '#666' }}
              hideDataPoints={true}
              dataPointsColor="#007AFF"
              dataPointsRadius={3}
              hideRules
              showVerticalLines={false}
              xAxisColor="lightgray"
              yAxisColor="lightgray"
              adjustToWidth={true}
              stripHeight={250}
              stripColor={'rgba(0, 122, 255, 0.2)'}
              stripOpacity={0.5}
              pointerConfig={{
                showPointerStrip: true,
                pointerStripHeight: 250,
                pointerStripColor: '#C5C5C5',
                pointerStripWidth: 2,
                strokeDashArray: [6, 3],
                pointerColor: '#C5C5C5',
                radius: 6,
                pointerLabelWidth: 100,
                pointerLabelHeight: 90,
                pointerLabelComponent: (items) => {
                  return (
                    <View
                      style={{
                        height: 90,
                        width: 100,
                        justifyContent: 'center',
                        marginTop: 60,
                        marginLeft: -50,
                      }}>
                      <View
                        style={{
                          paddingHorizontal: 14,
                          paddingVertical: 8,
                          borderRadius: 16,
                          backgroundColor: '#E9E9E9',
                          justifyContent: 'center',
                          alignItems: 'center',
                          shadowColor: '#000',
                          shadowOffset: {
                            width: 0,
                            height: 2,
                          },
                          shadowOpacity: 0.25,
                          shadowRadius: 3.84,
                          elevation: 5,
                        }}>
                        <Text
                          style={{
                            color: 'black',
                            fontSize: 12,
                            marginBottom: 4,
                            textAlign: 'center',
                          }}>
                          {items[0]?.date || items[0]?.label}
                        </Text>
                        <Text
                          style={{
                            fontWeight: 'bold',
                            textAlign: 'center',
                            color: '#333',
                            fontSize: 14,
                          }}>
                          ${items[0]?.value?.toFixed(2)}
                        </Text>
                      </View>
                    </View>
                  );
                },
              }}
            />
          </View>
        ) : (
          <View style={styles.loadingContainer}>
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
    marginTop: 16,
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
    color: '#C5C5C5',
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
  varianceSection: {
    alignItems: 'center',
    marginTop: 8,
  },
  varianceText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
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
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 4,
    marginBottom: 20,
    shadowColor: '#000',
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
    backgroundColor: '#C5C5C5',
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
    shadowOpacity: 0.1,
    shadowRadius: 4,
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
