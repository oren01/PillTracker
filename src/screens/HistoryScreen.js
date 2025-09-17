import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import StorageService from '../services/StorageService';
import {TimeOfDay} from '../types';

const HistoryScreen = () => {
  const [intakes, setIntakes] = useState([]);
  const [pills, setPills] = useState([]);
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
      
      // Filter intakes based on selected period
      const filteredIntakes = filterIntakesByPeriod(intakesData, selectedPeriod);
      
      // Sort by date (newest first)
      const sortedIntakes = filteredIntakes.sort((a, b) => 
        new Date(b.takenAt) - new Date(a.takenAt)
      );

      setIntakes(sortedIntakes);
      setPills(pillsData);
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

  const getPillById = (pillId) => {
    return pills.find(pill => pill.id === pillId);
  };

  const getTimeOfDayLabel = (timeOfDay) => {
    const labels = {
      [TimeOfDay.MORNING]: 'Morning',
      [TimeOfDay.AFTERNOON]: 'Afternoon',
      [TimeOfDay.EVENING]: 'Evening',
      [TimeOfDay.NIGHT]: 'Night',
    };
    return labels[timeOfDay] || timeOfDay;
  };

  const getTimeOfDayIcon = (timeOfDay) => {
    const icons = {
      [TimeOfDay.MORNING]: 'wb-sunny',
      [TimeOfDay.AFTERNOON]: 'wb-sunny',
      [TimeOfDay.EVENING]: 'wb-twilight',
      [TimeOfDay.NIGHT]: 'nights-stay',
    };
    return icons[timeOfDay] || 'schedule';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
  };

  const getPeriodStats = () => {
    const totalIntakes = intakes.length;
    const uniquePills = new Set(intakes.map(intake => intake.pillId)).size;
    const todayIntakes = intakes.filter(intake => 
      new Date(intake.takenAt).toDateString() === new Date().toDateString()
    ).length;

    return {totalIntakes, uniquePills, todayIntakes};
  };

  const renderIntakeItem = ({item: intake}) => {
    const pill = getPillById(intake.pillId);
    if (!pill) return null;

    return (
      <View style={styles.intakeItem}>
        <View style={styles.intakeHeader}>
          <View style={styles.pillInfo}>
            <View style={[styles.pillIcon, {backgroundColor: pill.color}]}>
              <MaterialIcons name="medication" size={20} color="#fff" />
            </View>
            <View style={styles.pillDetails}>
              <Text style={styles.pillName}>{pill.name}</Text>
              <Text style={styles.pillDosage}>{pill.dosage}</Text>
            </View>
          </View>
          <View style={styles.timeInfo}>
            <Text style={styles.timeText}>{formatTime(intake.takenAt)}</Text>
          </View>
        </View>
        
        <View style={styles.intakeFooter}>
          <View style={styles.timeOfDayContainer}>
            <MaterialIcons
              name={getTimeOfDayIcon(intake.timeOfDay)}
              size={16}
              color="#666"
            />
            <Text style={styles.timeOfDayText}>
              {getTimeOfDayLabel(intake.timeOfDay)}
            </Text>
          </View>
          <Text style={styles.dateText}>{formatDate(intake.takenAt)}</Text>
        </View>
        
        {intake.notes && (
          <Text style={styles.notes}>{intake.notes}</Text>
        )}
      </View>
    );
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

      <FlatList
        data={intakes}
        keyExtractor={item => item.id}
        renderItem={renderIntakeItem}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialIcons name="history" size={64} color="#ccc" />
            <Text style={styles.emptyText}>No intake history</Text>
            <Text style={styles.emptySubtext}>
              Start taking pills to see your history here
            </Text>
          </View>
        }
        contentContainerStyle={intakes.length === 0 ? styles.emptyListContainer : styles.listContainer}
      />
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
  listContainer: {
    padding: 10,
  },
  emptyListContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  intakeItem: {
    backgroundColor: '#fff',
    margin: 10,
    padding: 15,
    borderRadius: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  intakeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  pillInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  pillIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  pillDetails: {
    flex: 1,
  },
  pillName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  pillDosage: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  timeInfo: {
    alignItems: 'flex-end',
  },
  timeText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  intakeFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  timeOfDayContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeOfDayText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 5,
  },
  dateText: {
    fontSize: 12,
    color: '#999',
  },
  notes: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
});

export default HistoryScreen;
