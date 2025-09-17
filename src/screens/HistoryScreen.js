import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import StorageService from '../services/StorageService';
import {TimeOfDay} from '../types';
import HistoryTable from '../components/HistoryTable';

const HistoryScreen = () => {
  const [intakes, setIntakes] = useState([]);
  const [pills, setPills] = useState([]);
  const [packs, setPacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('week');

  useEffect(() => {
    loadHistory();
  }, [selectedPeriod]);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const intakesData = await StorageService.getPillIntakes();
      const pillsData = await StorageService.getPills();
      const packsData = await StorageService.getPillPacks();
      
      // Filter intakes based on selected period
      const filteredIntakes = filterIntakesByPeriod(intakesData, selectedPeriod);

      setIntakes(filteredIntakes);
      setPills(pillsData);
      setPacks(packsData);
    } catch (error) {
      console.error('Error loading history:', error);
      Alert.alert('Error', 'Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  const filterIntakesByPeriod = (intakes, period) => {
    const now = new Date();
    const cutoffDate = new Date();

    switch (period){
      case 'week':
        cutoffDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        cutoffDate.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        cutoffDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        return intakes;
    }

    return intakes.filter(intake => new Date(intake.takenAt) >= cutoffDate);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadHistory();
    setRefreshing(false);
  };


  const getPeriodStats = () => {
    const totalIntakes = intakes.length;
    const uniquePills = new Set(intakes.map(intake => intake.pillId)).size;
    const todayIntakes = intakes.filter(intake => 
      new Date(intake.takenAt).toDateString() === new Date().toDateString()
    ).length;

    return {totalIntakes, uniquePills, todayIntakes};
  };


  const renderPeriodSelector = () => (
    <View style={styles.periodSelector}>
      {['week', 'month', 'year'].map(period => (
        <TouchableOpacity
          key={period}
          style={[
            styles.periodButton,
            selectedPeriod === period && styles.periodButtonSelected,
          ]}
          onPress={() => setSelectedPeriod(period)}>
          <Text
            style={[
              styles.periodButtonText,
              selectedPeriod === period && styles.periodButtonTextSelected,
            ]}>
            {period.charAt(0).toUpperCase() + period.slice(1)}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const stats = getPeriodStats();

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {renderPeriodSelector()}
      
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.totalIntakes}</Text>
          <Text style={styles.statLabel}>Total Intakes</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.uniquePills}</Text>
          <Text style={styles.statLabel}>Different Pills</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.todayIntakes}</Text>
          <Text style={styles.statLabel}>Today</Text>
        </View>
      </View>

      {pills.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialIcons name="medication" size={64} color="#ccc" />
          <Text style={styles.emptyText}>No pills added</Text>
          <Text style={styles.emptySubtext}>
            Add pills to see your history table here
          </Text>
        </View>
      ) : (
        <HistoryTable 
          pills={pills}
          intakes={intakes}
          packs={packs}
          selectedPeriod={selectedPeriod}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    fontSize: 18,
    color: '#666',
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    margin: 10,
    borderRadius: 10,
    padding: 5,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  periodButtonSelected: {
    backgroundColor: '#2196F3',
  },
  periodButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: 'bold',
  },
  periodButtonTextSelected: {
    color: '#fff',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    margin: 10,
    borderRadius: 10,
    padding: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 10,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 5,
  },
});

export default HistoryScreen;
