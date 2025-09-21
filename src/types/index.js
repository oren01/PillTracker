// Data models for the pill tracking app

export const PillType = {
  TABLET: 'tablet',
  CAPSULE: 'capsule',
  LIQUID: 'liquid',
  INJECTION: 'injection',
  OTHER: 'other',
};

export const TimeOfDay = {
  MORNING: 'morning',
  AFTERNOON: 'afternoon',
  EVENING: 'evening',
  NIGHT: 'night',
};

export const Pill = {
  id: '',
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
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export const PillIntake = {
  id: '',
  pillId: '',
  takenAt: new Date().toISOString(),
  timeOfDay: TimeOfDay.MORNING,
  notes: '',
  createdAt: new Date().toISOString(),
};

export const DailySchedule = {
  date: new Date().toISOString().split('T')[0],
  pills: [],
  completed: [],
  missed: [],
};
