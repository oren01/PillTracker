import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
  Alert,
} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import {PillType, TimeOfDay} from '../types';

const AddPillModal = ({visible, onClose, onAdd, pill = null, isEdit = false}) => {
  const [formData, setFormData] = useState({
    name: '',
    dosage: '',
    type: PillType.TABLET,
    timesPerDay: 1,
    timesOfDay: [TimeOfDay.MORNING],
    instructions: '',
    color: '#2196F3',
    shape: 'round',
    defaultPackSize: 30,
    currentPackAmount: 30,
  });

  const [errors, setErrors] = useState({});

  // Initialize form data when pill prop changes (for editing)
  useEffect(() => {
    if (isEdit && pill) {
      setFormData({
        name: pill.name || '',
        dosage: pill.dosage || '',
        type: pill.type || PillType.TABLET,
        timesPerDay: pill.timesPerDay || 1,
        timesOfDay: pill.timesOfDay || [TimeOfDay.MORNING],
        instructions: pill.instructions || '',
        color: pill.color || '#2196F3',
        shape: pill.shape || 'round',
        defaultPackSize: pill.defaultPackSize || 30,
        currentPackAmount: pill.currentPackAmount || 30,
      });
    } else {
      // Reset form data for adding new pill
      setFormData({
        name: '',
        dosage: '',
        type: PillType.TABLET,
        timesPerDay: 1,
        timesOfDay: [TimeOfDay.MORNING],
        instructions: '',
        color: '#2196F3',
        shape: 'round',
        defaultPackSize: 30,
        currentPackAmount: 30,
      });
    }
    setErrors({});
  }, [isEdit, pill]);

  const colors = [
    '#2196F3', '#4CAF50', '#FF9800', '#F44336', '#9C27B0',
    '#00BCD4', '#8BC34A', '#FF5722', '#E91E63', '#3F51B5',
  ];

  const shapes = ['round', 'oval', 'square', 'triangle', 'diamond'];

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Pill name is required';
    }

    if (!formData.dosage.trim()) {
      newErrors.dosage = 'Dosage is required';
    }

    if (formData.timesPerDay < 1 || formData.timesPerDay > 4) {
      newErrors.timesPerDay = 'Times per day must be between 1 and 4';
    }

    if (formData.timesOfDay.length === 0) {
      newErrors.timesOfDay = 'At least one time of day is required';
    }

    if (formData.defaultPackSize < 1) {
      newErrors.defaultPackSize = 'Default pack size must be at least 1';
    }

    if (formData.currentPackAmount < 0) {
      newErrors.currentPackAmount = 'Current pack amount cannot be negative';
    }

    if (formData.currentPackAmount > formData.defaultPackSize) {
      newErrors.currentPackAmount = 'Current pack amount cannot exceed default pack size';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      if (isEdit && pill) {
        onAdd(pill.id, formData);
      } else {
        onAdd(formData);
      }
    }
  };

  const handleTimesPerDayChange = (value) => {
    const num = parseInt(value) || 1;
    setFormData(prev => ({
      ...prev,
      timesPerDay: num,
      timesOfDay: prev.timesOfDay.slice(0, num),
    }));
  };

  const toggleTimeOfDay = (timeOfDay) => {
    setFormData(prev => {
      const times = prev.timesOfDay.includes(timeOfDay)
        ? prev.timesOfDay.filter(t => t !== timeOfDay)
        : [...prev.timesOfDay, timeOfDay];
      
      return {
        ...prev,
        timesOfDay: times,
      };
    });
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
      [TimeOfDay.MORNING]: 'sunny',
      [TimeOfDay.AFTERNOON]: 'sunny',
      [TimeOfDay.EVENING]: 'partly-sunny',
      [TimeOfDay.NIGHT]: 'moon',
    };
    return icons[timeOfDay] || 'time';
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#666" />
          </TouchableOpacity>
          <Text style={styles.title}>{isEdit ? 'Edit Pill' : 'Add New Pill'}</Text>
          <TouchableOpacity onPress={handleSubmit} style={styles.saveButton}>
            <Text style={styles.saveButtonText}>{isEdit ? 'Update' : 'Save'}</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Basic Information</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Pill Name *</Text>
              <TextInput
                style={[styles.input, errors.name && styles.inputError]}
                value={formData.name}
                onChangeText={text => setFormData(prev => ({...prev, name: text}))}
                placeholder="e.g., Aspirin, Vitamin D"
                placeholderTextColor="#999"
              />
              {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Dosage *</Text>
              <TextInput
                style={[styles.input, errors.dosage && styles.inputError]}
                value={formData.dosage}
                onChangeText={text => setFormData(prev => ({...prev, dosage: text}))}
                placeholder="e.g., 100mg, 1 tablet"
                placeholderTextColor="#999"
              />
              {errors.dosage && <Text style={styles.errorText}>{errors.dosage}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Type</Text>
              <View style={styles.typeContainer}>
                {Object.values(PillType).map(type => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.typeButton,
                      formData.type === type && styles.typeButtonSelected,
                    ]}
                    onPress={() => setFormData(prev => ({...prev, type}))}>
                    <Text
                      style={[
                        styles.typeButtonText,
                        formData.type === type && styles.typeButtonTextSelected,
                      ]}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Schedule</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Times per Day *</Text>
              <TextInput
                style={[styles.input, errors.timesPerDay && styles.inputError]}
                value={formData.timesPerDay.toString()}
                onChangeText={handleTimesPerDayChange}
                keyboardType="numeric"
                placeholder="1-4"
                placeholderTextColor="#999"
              />
              {errors.timesPerDay && <Text style={styles.errorText}>{errors.timesPerDay}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Times of Day *</Text>
              <View style={styles.timesContainer}>
                {Object.values(TimeOfDay).map(timeOfDay => (
                  <TouchableOpacity
                    key={timeOfDay}
                    style={[
                      styles.timeButton,
                      formData.timesOfDay.includes(timeOfDay) && styles.timeButtonSelected,
                    ]}
                    onPress={() => toggleTimeOfDay(timeOfDay)}>
                    <Ionicons
                      name={getTimeOfDayIcon(timeOfDay)}
                      size={20}
                      color={formData.timesOfDay.includes(timeOfDay) ? '#fff' : '#666'}
                    />
                    <Text
                      style={[
                        styles.timeButtonText,
                        formData.timesOfDay.includes(timeOfDay) && styles.timeButtonTextSelected,
                      ]}>
                      {getTimeOfDayLabel(timeOfDay)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {errors.timesOfDay && <Text style={styles.errorText}>{errors.timesOfDay}</Text>}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Pack Information</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Default Pack Size *</Text>
              <TextInput
                style={[styles.input, errors.defaultPackSize && styles.inputError]}
                value={formData.defaultPackSize.toString()}
                onChangeText={text => setFormData(prev => ({...prev, defaultPackSize: parseInt(text) || 0}))}
                keyboardType="numeric"
                placeholder="e.g., 30"
                placeholderTextColor="#999"
              />
              {errors.defaultPackSize && <Text style={styles.errorText}>{errors.defaultPackSize}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Current Pack Amount *</Text>
              <TextInput
                style={[styles.input, errors.currentPackAmount && styles.inputError]}
                value={formData.currentPackAmount.toString()}
                onChangeText={text => setFormData(prev => ({...prev, currentPackAmount: parseInt(text) || 0}))}
                keyboardType="numeric"
                placeholder="e.g., 30"
                placeholderTextColor="#999"
              />
              {errors.currentPackAmount && <Text style={styles.errorText}>{errors.currentPackAmount}</Text>}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Appearance</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Color</Text>
              <View style={styles.colorsContainer}>
                {colors.map(color => (
                  <TouchableOpacity
                    key={color}
                    style={[
                      styles.colorButton,
                      {backgroundColor: color},
                      formData.color === color && styles.colorButtonSelected,
                    ]}
                    onPress={() => setFormData(prev => ({...prev, color}))}
                  />
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Shape</Text>
              <View style={styles.shapesContainer}>
                {shapes.map(shape => (
                  <TouchableOpacity
                    key={shape}
                    style={[
                      styles.shapeButton,
                      formData.shape === shape && styles.shapeButtonSelected,
                    ]}
                    onPress={() => setFormData(prev => ({...prev, shape}))}>
                    <Text
                      style={[
                        styles.shapeButtonText,
                        formData.shape === shape && styles.shapeButtonTextSelected,
                      ]}>
                      {shape.charAt(0).toUpperCase() + shape.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Additional Information</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Instructions</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.instructions}
                onChangeText={text => setFormData(prev => ({...prev, instructions: text}))}
                placeholder="e.g., Take with food, Avoid alcohol"
                placeholderTextColor="#999"
                multiline
                numberOfLines={3}
              />
            </View>
          </View>
        </ScrollView>
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
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  errorText: {
    color: '#f44336',
    fontSize: 12,
    marginTop: 5,
  },
  typeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  typeButtonSelected: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  typeButtonText: {
    fontSize: 12,
    color: '#666',
  },
  typeButtonTextSelected: {
    color: '#fff',
    fontWeight: 'bold',
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
  timeButtonSelected: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  timeButtonText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 6,
  },
  timeButtonTextSelected: {
    color: '#fff',
    fontWeight: 'bold',
  },
  colorsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  colorButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  colorButtonSelected: {
    borderColor: '#333',
    borderWidth: 3,
  },
  shapesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  shapeButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  shapeButtonSelected: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  shapeButtonText: {
    fontSize: 12,
    color: '#666',
  },
  shapeButtonTextSelected: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default AddPillModal;
