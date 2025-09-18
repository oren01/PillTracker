import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import StorageService from '../services/StorageService';
import {TimeOfDay} from '../types';
import PillCard from '../components/PillCard';

const TodayScreen = () => {
  const [todayPills, setTodayPills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    loadTodayPills();
  }, []);

  const loadTodayPills = async () => {
    try {
      setLoading(true);
      const pills = await StorageService.getPills();
      const packs = await StorageService.getPillPacks();
      const intakes = await StorageService.getPillIntakes();
      
      // Get active packs for each pill
      const pillsWithPacks = pills.map(pill => {
        const activePacks = packs.filter(
          pack => pack.pillId === pill.id && pack.isActive
        );
        const todayIntakes = intakes.filter(
          intake => intake.pillId === pill.id && 
          intake.takenAt.startsWith(today)
        );
        
        return {
          ...pill,
          activePacks,
          todayIntakes,
          totalRemaining: pill.currentPackAmount || activePacks.reduce((sum, pack) => sum + pack.remainingPills, 0),
        };
      });

      setTodayPills(pillsWithPacks);
    } catch (error) {
      console.error('Error loading today pills:', error);
      Alert.alert('Error', 'Failed to load pills');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTodayPills();
    setRefreshing(false);
  };

  const markPillTaken = async (pillId, timeOfDay) => {
    try {
      const pills = await StorageService.getPills();
      const packs = await StorageService.getPillPacks();
      const pill = pills.find(p => p.id === pillId);
      const activePack = packs.find(p => p.pillId === pillId && p.isActive);

      if (!activePack || activePack.remainingPills <= 0) {
        Alert.alert('No pills available', 'Please start a new pack or check your inventory');
        return;
      }

      // Record the intake
      await StorageService.addPillIntake({
        pillId,
        packId: activePack.id,
        takenAt: new Date().toISOString(),
        timeOfDay,
      });

      // Reduce remaining pills
      await StorageService.updatePillPack(activePack.id, {
        remainingPills: activePack.remainingPills - 1,
      });

      // Reload data
      await loadTodayPills();
      
      Alert.alert('Success', 'Pill marked as taken');
    } catch (error) {
      console.error('Error marking pill taken:', error);
      Alert.alert('Error', 'Failed to mark pill as taken');
    }
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

  const getCurrentTimeOfDay = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return TimeOfDay.MORNING;
    if (hour >= 12 && hour < 17) return TimeOfDay.AFTERNOON;
    if (hour >= 17 && hour < 22) return TimeOfDay.EVENING;
    return TimeOfDay.NIGHT;
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }>
      <View style={styles.header}>
        <Text style={styles.title}>Today's Pills</Text>
        <Text style={styles.date}>{new Date().toLocaleDateString()}</Text>
      </View>

      {todayPills.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialIcons name="medication" size={64} color="#ccc" />
          <Text style={styles.emptyText}>No pills configured</Text>
          <Text style={styles.emptySubtext}>
            Add pills in the Pills tab to start tracking
          </Text>
        </View>
      ) : (
        <View style={styles.pillsContainer}>
          {todayPills.map(pill => (
            <PillCard
              key={pill.id}
              pill={pill}
              onTakePill={(timeOfDay) => markPillTaken(pill.id, timeOfDay)}
              currentTimeOfDay={getCurrentTimeOfDay()}
            />
          ))}
        </View>
      )}

      <View style={styles.summaryContainer}>
        <Text style={styles.summaryTitle}>Summary</Text>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Total Pills:</Text>
          <Text style={styles.summaryValue}>{todayPills.length}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Low Stock:</Text>
          <Text style={styles.summaryValue}>
            {todayPills.filter(p => (p.currentPackAmount || p.totalRemaining) <= 5).length}
          </Text>
        </View>
      </View>
    </ScrollView>
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
  header: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  date: {
    fontSize: 16,
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
  pillsContainer: {
    padding: 10,
  },
  summaryContainer: {
    backgroundColor: '#fff',
    margin: 20,
    padding: 20,
    borderRadius: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#666',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2196F3',
  },
});

export default TodayScreen;
