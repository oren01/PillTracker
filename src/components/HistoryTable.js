import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const { width: screenWidth } = Dimensions.get('window');

const HistoryTable = ({ pills, intakes, packs, selectedPeriod }) => {
  // Calculate date range based on selected period
  const getDateRange = () => {
    const now = new Date();
    const dates = [];
    
    let daysBack;
    switch (selectedPeriod) {
      case 'week':
        daysBack = 7;
        break;
      case 'month':
        daysBack = 30;
        break;
      case 'year':
        daysBack = 365;
        break;
      default:
        daysBack = 7;
    }
    
    for (let i = daysBack - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      dates.push(date.toISOString().split('T')[0]);
    }
    
    return dates;
  };

  // Get intakes for a specific pill and date
  const getIntakesForPillAndDate = (pillId, date) => {
    return intakes.filter(intake => 
      intake.pillId === pillId && 
      intake.takenAt.startsWith(date)
    );
  };

  // Get remaining pills for a pill on a specific date
  const getRemainingPillsForDate = (pillId, date) => {
    const pill = pills.find(p => p.id === pillId);
    if (!pill) return 0;
    
    // For today's date, use the current pack amount directly
    const today = new Date().toISOString().split('T')[0];
    if (date === today) {
      return pill.currentPackAmount || 0;
    }
    
    // For past dates, calculate based on intakes
    const activePack = packs.find(pack => 
      pack.pillId === pillId && 
      pack.isActive &&
      new Date(pack.startDate) <= new Date(date)
    );
    
    if (!activePack) return 0;
    
    // Calculate remaining pills by subtracting intakes taken after the pack start date
    const intakesAfterStart = intakes.filter(intake => 
      intake.pillId === pillId && 
      intake.packId === activePack.id &&
      new Date(intake.takenAt) >= new Date(activePack.startDate) &&
      new Date(intake.takenAt) <= new Date(date)
    );
    
    return Math.max(0, activePack.packSize - intakesAfterStart.length);
  };

  // Determine cell color based on intake status
  const getCellColor = (pillId, date) => {
    const pill = pills.find(p => p.id === pillId);
    if (!pill) return '#f0f0f0';
    
    const dayIntakes = getIntakesForPillAndDate(pillId, date);
    const expectedTimes = pill.timesOfDay.length;
    const takenTimes = dayIntakes.length;
    
    if (takenTimes === 0) return '#ffebee'; // Red - no doses taken
    if (takenTimes === expectedTimes) return '#e8f5e8'; // Green - all doses taken
    return '#fff3e0'; // Yellow - partial doses taken
  };

  // Format date for display
  const formatDateDisplay = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const dates = getDateRange();
  const cellWidth = Math.max(80, screenWidth / (pills.length + 1));

  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.table}>
          {/* Header row */}
          <View style={styles.headerRow}>
            <View style={[styles.headerCell, styles.dateColumn, { width: cellWidth }]}>
              <Text style={styles.headerText}>Date</Text>
            </View>
            {pills.map(pill => (
              <View key={pill.id} style={[styles.headerCell, { width: cellWidth }]}>
                <View style={[styles.pillIcon, { backgroundColor: pill.color }]}>
                  <MaterialIcons name="medication" size={16} color="#fff" />
                </View>
                <Text style={styles.pillNameText} numberOfLines={2}>
                  {pill.name}
                </Text>
              </View>
            ))}
          </View>

          {/* Data rows */}
          <ScrollView showsVerticalScrollIndicator={false}>
            {dates.map(date => (
              <View key={date} style={styles.dataRow}>
                <View style={[styles.dateCell, { width: cellWidth }]}>
                  <Text style={styles.dateText}>{formatDateDisplay(date)}</Text>
                </View>
                {pills.map(pill => {
                  const dayIntakes = getIntakesForPillAndDate(pill.id, date);
                  const remainingPills = getRemainingPillsForDate(pill.id, date);
                  const cellColor = getCellColor(pill.id, date);
                  
                  return (
                    <View 
                      key={`${date}-${pill.id}`} 
                      style={[
                        styles.dataCell, 
                        { 
                          width: cellWidth, 
                          backgroundColor: cellColor 
                        }
                      ]}
                    >
                      <View style={styles.cellContent}>
                        <Text style={styles.intakeCount}>
                          {dayIntakes.length}/{pill.timesOfDay.length}
                        </Text>
                        <Text style={styles.remainingText}>
                          {remainingPills} left
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            ))}
          </ScrollView>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  table: {
    backgroundColor: '#fff',
    margin: 10,
    borderRadius: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerRow: {
    flexDirection: 'row',
    borderBottomWidth: 2,
    borderBottomColor: '#e0e0e0',
  },
  headerCell: {
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: '#e0e0e0',
  },
  dateColumn: {
    backgroundColor: '#f8f9fa',
  },
  headerText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  pillIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  pillNameText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  dataRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  dateCell: {
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f9fa',
    borderRightWidth: 1,
    borderRightColor: '#e0e0e0',
  },
  dateText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
  },
  dataCell: {
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: '#e0e0e0',
    minHeight: 60,
  },
  cellContent: {
    alignItems: 'center',
  },
  intakeCount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  remainingText: {
    fontSize: 10,
    color: '#666',
  },
});

export default HistoryTable;
