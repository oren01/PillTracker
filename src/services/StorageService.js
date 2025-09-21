import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  PILLS: 'pills',
  PILL_INTAKES: 'pillIntakes',
  DAILY_SCHEDULES: 'dailySchedules',
  PILL_PACKS: 'pillPacks',
};

class StorageService {
  // Generic storage methods
  async setItem(key, value) {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem(key, jsonValue);
    } catch (error) {
      console.error('Error saving data:', error);
      throw error;
    }
  }

  async getItem(key) {
    try {
      const jsonValue = await AsyncStorage.getItem(key);
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (error) {
      console.error('Error reading data:', error);
      throw error;
    }
  }

  async removeItem(key) {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing data:', error);
      throw error;
    }
  }

  // Pills management
  async savePills(pills) {
    await this.setItem(STORAGE_KEYS.PILLS, pills);
  }

  async getPills() {
    const pills = await this.getItem(STORAGE_KEYS.PILLS);
    return pills || [];
  }

  async addPill(pill) {
    const pills = await this.getPills();
    const newPill = {
      ...pill,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    pills.push(newPill);
    await this.savePills(pills);
    return newPill;
  }

  async updatePill(pillId, updates) {
    const pills = await this.getPills();
    const index = pills.findIndex(p => p.id === pillId);
    if (index !== -1) {
      pills[index] = {
        ...pills[index],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      await this.savePills(pills);
      return pills[index];
    }
    throw new Error('Pill not found');
  }

  async deletePill(pillId) {
    const pills = await this.getPills();
    const filteredPills = pills.filter(p => p.id !== pillId);
    await this.savePills(filteredPills);
    
    // Also remove associated intakes
    await this.deletePillIntakes(pillId);
  }


  // Pill intakes management
  async savePillIntakes(intakes) {
    await this.setItem(STORAGE_KEYS.PILL_INTAKES, intakes);
  }

  async getPillIntakes() {
    const intakes = await this.getItem(STORAGE_KEYS.PILL_INTAKES);
    return intakes || [];
  }

  async addPillIntake(intake) {
    const intakes = await this.getPillIntakes();
    const newIntake = {
      ...intake,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    intakes.push(newIntake);
    await this.savePillIntakes(intakes);
    return newIntake;
  }

  async updatePillCurrentPackAmount(pillId, newAmount) {
    const pills = await this.getPills();
    const index = pills.findIndex(p => p.id === pillId);
    if (index !== -1) {
      pills[index] = {
        ...pills[index],
        currentPackAmount: newAmount,
        updatedAt: new Date().toISOString(),
      };
      await this.savePills(pills);
      return pills[index];
    }
    throw new Error('Pill not found');
  }

  async deletePillIntakes(pillId) {
    const intakes = await this.getPillIntakes();
    const filteredIntakes = intakes.filter(i => i.pillId !== pillId);
    await this.savePillIntakes(filteredIntakes);
  }

  // Pill packs management
  async savePillPacks(packs) {
    await this.setItem(STORAGE_KEYS.PILL_PACKS, packs);
  }

  async getPillPacks() {
    const packs = await this.getItem(STORAGE_KEYS.PILL_PACKS);
    return packs || [];
  }

  async addPillPack(pack) {
    const packs = await this.getPillPacks();
    const newPack = {
      ...pack,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    packs.push(newPack);
    await this.savePillPacks(packs);
    return newPack;
  }

  async updatePillPack(packId, updates) {
    const packs = await this.getPillPacks();
    const index = packs.findIndex(p => p.id === packId);
    if (index !== -1) {
      packs[index] = {
        ...packs[index],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      await this.savePillPacks(packs);
      return packs[index];
    }
    throw new Error('Pill pack not found');
  }

  async deletePillPack(packId) {
    const packs = await this.getPillPacks();
    const filteredPacks = packs.filter(p => p.id !== packId);
    await this.savePillPacks(filteredPacks);
  }

  async getActivePillPack(pillId) {
    const packs = await this.getPillPacks();
    return packs.find(pack => pack.pillId === pillId && pack.isActive) || null;
  }

  // Daily schedules management
  async saveDailySchedules(schedules) {
    await this.setItem(STORAGE_KEYS.DAILY_SCHEDULES, schedules);
  }

  async getDailySchedules() {
    const schedules = await this.getItem(STORAGE_KEYS.DAILY_SCHEDULES);
    return schedules || [];
  }

  async getDailySchedule(date) {
    const schedules = await this.getDailySchedules();
    return schedules.find(s => s.date === date) || null;
  }

  async saveDailySchedule(schedule) {
    const schedules = await this.getDailySchedules();
    const index = schedules.findIndex(s => s.date === schedule.date);
    if (index !== -1) {
      schedules[index] = schedule;
    } else {
      schedules.push(schedule);
    }
    await this.saveDailySchedules(schedules);
  }

  // Utility methods
  async clearAllData() {
    await Promise.all([
      this.removeItem(STORAGE_KEYS.PILLS),
      this.removeItem(STORAGE_KEYS.PILL_INTAKES),
      this.removeItem(STORAGE_KEYS.DAILY_SCHEDULES),
      this.removeItem(STORAGE_KEYS.PILL_PACKS),
    ]);
  }

  async exportData() {
    const data = {
      pills: await this.getPills(),
      pillIntakes: await this.getPillIntakes(),
      dailySchedules: await this.getDailySchedules(),
      pillPacks: await this.getPillPacks(),
      exportDate: new Date().toISOString(),
    };
    return data;
  }

  async importData(data) {
    if (data.pills) await this.savePills(data.pills);
    if (data.pillIntakes) await this.savePillIntakes(data.pillIntakes);
    if (data.dailySchedules) await this.saveDailySchedules(data.dailySchedules);
    if (data.pillPacks) await this.savePillPacks(data.pillPacks);
  }
}

export default new StorageService();
