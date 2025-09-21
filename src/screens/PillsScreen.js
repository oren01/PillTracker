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
import { useFocusEffect } from '@react-navigation/native';
import StorageService from '../services/StorageService';
import AddPillModal from '../components/AddPillModal';

const PillsScreen = () => {
  const [pills, setPills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPill, setSelectedPill] = useState(null);

  useEffect(() => {
    loadPills();
  }, []);

  // Refresh pills data when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadPills();
    }, [])
  );

  const loadPills = async () => {
    try {
      setLoading(true);
      const pillsData = await StorageService.getPills();
      setPills(pillsData);
    } catch (error) {
      console.error('Error loading pills:', error);
      Alert.alert('Error', 'Failed to load pills');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPills();
    setRefreshing(false);
  };

  const handleAddPill = async (pillData) => {
    try {
      await StorageService.addPill(pillData);
      await loadPills();
      setShowAddModal(false);
      Alert.alert('Success', 'Pill added successfully');
    } catch (error) {
      console.error('Error adding pill:', error);
      Alert.alert('Error', 'Failed to add pill');
    }
  };

  const handleUpdatePill = async (pillId, updates) => {
    try {
      await StorageService.updatePill(pillId, updates);
      await loadPills();
      setShowEditModal(false);
      setSelectedPill(null);
      Alert.alert('Success', 'Pill updated successfully');
    } catch (error) {
      console.error('Error updating pill:', error);
      Alert.alert('Error', 'Failed to update pill');
    }
  };

  const handleDeletePill = (pill) => {
    Alert.alert(
      'Delete Pill',
      `Are you sure you want to delete "${pill.name}"? This will also delete all associated intake records.`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await StorageService.deletePill(pill.id);
              await loadPills();
              Alert.alert('Success', 'Pill deleted successfully');
            } catch (error) {
              console.error('Error deleting pill:', error);
              Alert.alert('Error', 'Failed to delete pill');
            }
          },
        },
      ]
    );
  };

  const handleEditPill = (pill) => {
    setSelectedPill(pill);
    setShowEditModal(true);
  };

  const handleResetPack = async (pill) => {
    try {
      await StorageService.updatePillCurrentPackAmount(pill.id, pill.defaultPackSize);
      await loadPills();
    } catch (error) {
      console.error('Error resetting pack:', error);
      Alert.alert('Error', 'Failed to reset pack');
    }
  };

  const getStockStatus = (currentPackAmount) => {
    if (currentPackAmount === 0) return {status: 'Empty', color: '#f44336'};
    if (currentPackAmount <= 5) return {status: 'Low', color: '#ff9800'};
    if (currentPackAmount <= 10) return {status: 'Medium', color: '#ffc107'};
    return {status: 'Good', color: '#4caf50'};
  };

  const renderPillItem = ({item: pill}) => {
    const stockStatus = getStockStatus(pill.currentPackAmount);
    
    return (
      <View style={styles.pillItem}>
        <View style={styles.pillHeader}>
          <View style={styles.pillInfo}>
            <View style={[styles.pillIcon, {backgroundColor: pill.color}]}>
              <MaterialIcons name="medication" size={24} color="#fff" />
            </View>
            <View style={styles.pillDetails}>
              <Text style={styles.pillName}>{pill.name}</Text>
              <Text style={styles.pillDosage}>{pill.dosage}</Text>
              <Text style={styles.pillTimes}>
                {pill.timesPerDay} time{pill.timesPerDay > 1 ? 's' : ''} per day
              </Text>
            </View>
          </View>
          <View style={styles.pillActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleEditPill(pill)}>
              <MaterialIcons name="edit" size={20} color="#FF9800" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleResetPack(pill)}>
              <MaterialIcons name="refresh" size={20} color="#2196F3" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleDeletePill(pill)}>
              <MaterialIcons name="delete" size={20} color="#f44336" />
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.pillFooter}>
          <View style={styles.stockInfo}>
            <Text style={styles.stockLabel}>Stock:</Text>
            <Text style={[styles.stockValue, {color: stockStatus.color}]}>
              {pill.currentPackAmount} pills ({stockStatus.status})
            </Text>
          </View>
          <View style={styles.packInfo}>
            <Text style={styles.packLabel}>
              Pack size: {pill.defaultPackSize}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={pills}
        keyExtractor={item => item.id}
        renderItem={renderPillItem}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialIcons name="medication" size={64} color="#ccc" />
            <Text style={styles.emptyText}>No pills configured</Text>
            <Text style={styles.emptySubtext}>
              Tap the + button to add your first pill
            </Text>
          </View>
        }
        contentContainerStyle={pills.length === 0 ? styles.emptyListContainer : styles.listContainer}
      />
      
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setShowAddModal(true)}>
        <MaterialIcons name="add" size={24} color="#fff" />
      </TouchableOpacity>

      <AddPillModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddPill}
      />

      <AddPillModal
        visible={showEditModal}
        pill={selectedPill}
        onClose={() => {
          setShowEditModal(false);
          setSelectedPill(null);
        }}
        onAdd={handleUpdatePill}
        isEdit={true}
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
  pillItem: {
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
  pillHeader: {
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
  pillTimes: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  pillActions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: '#f0f0f0',
  },
  pillFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  stockInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stockLabel: {
    fontSize: 12,
    color: '#666',
    marginRight: 5,
  },
  stockValue: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  packInfo: {
    alignItems: 'flex-end',
  },
  packLabel: {
    fontSize: 12,
    color: '#666',
  },
  addButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
});

export default PillsScreen;
