import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import {TimeOfDay} from '../types';

const PillCard = ({pill, onTakePill, currentTimeOfDay}) => {
  const [showTimeModal, setShowTimeModal] = useState(false);

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
      [TimeOfDay.MORNING]: 'sunny',
      [TimeOfDay.AFTERNOON]: 'sunny',
      [TimeOfDay.EVENING]: 'partly-sunny',
      [TimeOfDay.NIGHT]: 'moon',
    };
    return icons[timeOfDay] || 'time';
  };

  const isTakenForTime = (timeOfDay) => {
    return pill.todayIntakes.some(intake => intake.timeOfDay === timeOfDay);
  };

  const handleTakePill = (timeOfDay) => {
    if (pill.currentPackAmount <= 0) {
      Alert.alert('No pills available', 'Please reset your pack');
      return;
    }

    if (isTakenForTime(timeOfDay)) {
      Alert.alert('Already taken', 'This pill has already been taken for this time period');
      return;
    }

    onTakePill(timeOfDay);
    setShowTimeModal(false);
  };

  const getStockStatus = () => {
    if (pill.currentPackAmount === 0) return {status: 'empty', color: '#f44336'};
    if (pill.currentPackAmount <= 5) return {status: 'low', color: '#ff9800'};
    if (pill.currentPackAmount <= 10) return {status: 'medium', color: '#ffc107'};
    return {status: 'good', color: '#4caf50'};
  };

  const stockStatus = getStockStatus();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.pillInfo}>
          <View style={[styles.pillIcon, {backgroundColor: pill.color}]}>
            <Ionicons name="medical" size={24} color="#fff" />
          </View>
          <View style={styles.pillDetails}>
            <Text style={styles.pillName}>{pill.name}</Text>
            <Text style={styles.pillDosage}>{pill.dosage}</Text>
          </View>
        </View>
        <View style={styles.stockInfo}>
          <Text style={styles.stockText}>{pill.currentPackAmount} left</Text>
          <Text style={styles.packSizeText}>Pack: {pill.defaultPackSize}</Text>
          <View style={[styles.stockIndicator, {backgroundColor: stockStatus.color}]} />
        </View>
      </View>

      <View style={styles.timesContainer}>
        {pill.timesOfDay.map(timeOfDay => (
          <TouchableOpacity
            key={timeOfDay}
            style={[
              styles.timeButton,
              isTakenForTime(timeOfDay) && styles.timeButtonTaken,
              timeOfDay === currentTimeOfDay && styles.timeButtonCurrent,
            ]}
            onPress={() => handleTakePill(timeOfDay)}
            disabled={isTakenForTime(timeOfDay) || pill.currentPackAmount <= 0}>
            <Ionicons
              name={getTimeOfDayIcon(timeOfDay)}
              size={20}
              color={isTakenForTime(timeOfDay) ? '#4caf50' : '#666'}
            />
            <Text
              style={[
                styles.timeButtonText,
                isTakenForTime(timeOfDay) && styles.timeButtonTextTaken,
              ]}>
              {getTimeOfDayLabel(timeOfDay)}
            </Text>
            {isTakenForTime(timeOfDay) && (
              <Ionicons name="checkmark-circle" size={16} color="#4caf50" />
            )}
          </TouchableOpacity>
        ))}
      </View>

      {pill.instructions && (
        <Text style={styles.instructions}>{pill.instructions}</Text>
      )}

      <Modal
        visible={showTimeModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowTimeModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Time</Text>
            <Text style={styles.modalSubtitle}>When did you take this pill?</Text>
            
            {pill.timesOfDay.map(timeOfDay => (
              <TouchableOpacity
                key={timeOfDay}
                style={styles.modalTimeButton}
                onPress={() => handleTakePill(timeOfDay)}>
                <Ionicons
                  name={getTimeOfDayIcon(timeOfDay)}
                  size={24}
                  color="#2196F3"
                />
                <Text style={styles.modalTimeButtonText}>
                  {getTimeOfDayLabel(timeOfDay)}
                </Text>
              </TouchableOpacity>
            ))}
            
            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={() => setShowTimeModal(false)}>
              <Text style={styles.modalCancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  pillInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  pillIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
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
  stockInfo: {
    alignItems: 'flex-end',
  },
  stockText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  packSizeText: {
    fontSize: 10,
    color: '#999',
    marginBottom: 4,
  },
  stockIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  timesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  timeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  timeButtonTaken: {
    backgroundColor: '#e8f5e8',
    borderColor: '#4caf50',
  },
  timeButtonCurrent: {
    backgroundColor: '#e3f2fd',
    borderColor: '#2196F3',
  },
  timeButtonText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 6,
  },
  timeButtonTextTaken: {
    color: '#4caf50',
    fontWeight: 'bold',
  },
  instructions: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    width: '80%',
    maxWidth: 300,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 5,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalTimeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
    marginBottom: 10,
  },
  modalTimeButtonText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
  modalCancelButton: {
    padding: 15,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    marginTop: 10,
  },
  modalCancelButtonText: {
    fontSize: 16,
    color: '#666',
  },
});

export default PillCard;
