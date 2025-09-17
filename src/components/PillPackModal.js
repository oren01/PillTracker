import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Modal,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import DatePicker from 'react-native-date-picker';

const PillPackModal = ({visible, pill, onClose, onAdd}) => {
  const [formData, setFormData] = useState({
    packSize: '',
    expiryDate: null,
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!formData.packSize || parseInt(formData.packSize) <= 0) {
      newErrors.packSize = 'Pack size must be greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      const packData = {
        pillId: pill.id,
        packSize: parseInt(formData.packSize),
        remainingPills: parseInt(formData.packSize),
        startDate: new Date().toISOString(),
        expiryDate: formData.expiryDate?.toISOString() || null,
        isActive: true,
      };

      onAdd(packData);
      setFormData({
        packSize: '',
        expiryDate: null,
      });
      setErrors({});
    }
  };

  const formatDate = (date) => {
    if (!date) return 'No expiry date';
    return date.toLocaleDateString();
  };

  if (!pill) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <MaterialIcons name="close" size={24} color="#666" />
          </TouchableOpacity>
          <Text style={styles.title}>Start New Pack</Text>
          <TouchableOpacity onPress={handleSubmit} style={styles.saveButton}>
            <Text style={styles.saveButtonText}>Start Pack</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <View style={styles.pillInfo}>
            <View style={[styles.pillIcon, {backgroundColor: pill.color}]}>
              <MaterialIcons name="medication" size={24} color="#fff" />
            </View>
            <View style={styles.pillDetails}>
              <Text style={styles.pillName}>{pill.name}</Text>
              <Text style={styles.pillDosage}>{pill.dosage}</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Pack Information</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Pack Size *</Text>
              <TextInput
                style={[styles.input, errors.packSize && styles.inputError]}
                value={formData.packSize}
                onChangeText={text => setFormData(prev => ({...prev, packSize: text}))}
                placeholder="e.g., 30"
                keyboardType="numeric"
                placeholderTextColor="#999"
              />
              {errors.packSize && <Text style={styles.errorText}>{errors.packSize}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Expiry Date (Optional)</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowDatePicker(true)}>
                <MaterialIcons name="event" size={20} color="#666" />
                <Text style={styles.dateButtonText}>
                  {formatDate(formData.expiryDate)}
                </Text>
                <MaterialIcons name="keyboard-arrow-right" size={20} color="#666" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.infoSection}>
            <Text style={styles.infoTitle}>Important Notes</Text>
            <Text style={styles.infoText}>
              • This will start a new pack with {formData.packSize || '0'} pills
            </Text>
            <Text style={styles.infoText}>
              • The pack will be marked as active and ready to use
            </Text>
            <Text style={styles.infoText}>
              • You can track remaining pills as you take them
            </Text>
            <Text style={styles.infoText}>
              • Set an expiry date to get reminders before expiration
            </Text>
          </View>
        </View>

        <DatePicker
          modal
          open={showDatePicker}
          date={formData.expiryDate || new Date()}
          mode="date"
          minimumDate={new Date()}
          onConfirm={(date) => {
            setFormData(prev => ({...prev, expiryDate: date}));
            setShowDatePicker(false);
          }}
          onCancel={() => {
            setShowDatePicker(false);
          }}
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  closeButton: {
    padding: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  saveButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: '#2196F3',
    borderRadius: 6,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 15,
  },
  pillInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
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
  section: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  inputError: {
    borderColor: '#f44336',
  },
  errorText: {
    color: '#f44336',
    fontSize: 12,
    marginTop: 5,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#fff',
  },
  dateButtonText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 10,
    flex: 1,
  },
  infoSection: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
    lineHeight: 20,
  },
});

export default PillPackModal;
