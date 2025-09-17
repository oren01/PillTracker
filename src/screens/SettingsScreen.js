import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Share,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import StorageService from '../services/StorageService';

const SettingsScreen = () => {
  const [stats, setStats] = useState({
    totalPills: 0,
    totalPacks: 0,
    totalIntakes: 0,
    activePacks: 0,
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const pills = await StorageService.getPills();
      const packs = await StorageService.getPillPacks();
      const intakes = await StorageService.getPillIntakes();
      
      const activePacks = packs.filter(pack => pack.isActive);
      
      setStats({
        totalPills: pills.length,
        totalPacks: packs.length,
        totalIntakes: intakes.length,
        activePacks: activePacks.length,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleExportData = async () => {
    try {
      const data = await StorageService.exportData();
      const jsonString = JSON.stringify(data, null, 2);
      
      await Share.share({
        message: jsonString,
        title: 'Pill Tracker Data Export',
      });
      
      Alert.alert('Success', 'Data exported successfully');
    } catch (error) {
      console.error('Error exporting data:', error);
      Alert.alert('Error', 'Failed to export data');
    }
  };

  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'This will permanently delete all your pills, packs, and intake history. This action cannot be undone.',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            try {
              await StorageService.clearAllData();
              await loadStats();
              Alert.alert('Success', 'All data has been cleared');
            } catch (error) {
              console.error('Error clearing data:', error);
              Alert.alert('Error', 'Failed to clear data');
            }
          },
        },
      ]
    );
  };

  const handleAbout = () => {
    Alert.alert(
      'About Pill Tracker',
      'Pill Tracker v1.0.0\n\nA simple and effective way to track your daily medication intake and manage pill packs.\n\nFeatures:\n• Track daily pill intake\n• Manage pill configurations\n• Monitor remaining pills in packs\n• View intake history\n• Export/import data\n\nDeveloped with React Native',
      [{text: 'OK'}]
    );
  };

  const renderStatItem = (icon, label, value, color = '#2196F3') => (
    <View style={styles.statItem}>
      <View style={[styles.statIcon, {backgroundColor: color}]}>
        <MaterialIcons name={icon} size={24} color="#fff" />
      </View>
      <View style={styles.statContent}>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
      </View>
    </View>
  );

  const renderSettingItem = (icon, title, subtitle, onPress, color = '#666') => (
    <TouchableOpacity style={styles.settingItem} onPress={onPress}>
      <View style={styles.settingLeft}>
        <MaterialIcons name={icon} size={24} color={color} />
        <View style={styles.settingContent}>
          <Text style={styles.settingTitle}>{title}</Text>
          {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      <MaterialIcons name="chevron-right" size={24} color="#ccc" />
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.subtitle}>Manage your pill tracking data</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Statistics</Text>
        <View style={styles.statsContainer}>
          {renderStatItem('medication', 'Total Pills', stats.totalPills)}
          {renderStatItem('inventory', 'Total Packs', stats.totalPacks)}
          {renderStatItem('history', 'Total Intakes', stats.totalIntakes)}
          {renderStatItem('check-circle', 'Active Packs', stats.activePacks, '#4CAF50')}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data Management</Text>
        {renderSettingItem(
          'file-download',
          'Export Data',
          'Export all your data as JSON',
          handleExportData
        )}
        {renderSettingItem(
          'delete-forever',
          'Clear All Data',
          'Permanently delete all data',
          handleClearData,
          '#f44336'
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        {renderSettingItem(
          'info',
          'About Pill Tracker',
          'Version 1.0.0',
          handleAbout
        )}
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Pill Tracker v1.0.0
        </Text>
        <Text style={styles.footerSubtext}>
          Keep track of your medication with ease
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  section: {
    backgroundColor: '#fff',
    margin: 10,
    borderRadius: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    padding: 15,
    paddingBottom: 10,
  },
  statsContainer: {
    padding: 15,
    paddingTop: 0,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingContent: {
    marginLeft: 15,
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  footer: {
    alignItems: 'center',
    padding: 30,
    marginBottom: 20,
  },
  footerText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  footerSubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
    textAlign: 'center',
  },
});

export default SettingsScreen;
