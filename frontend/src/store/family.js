import { familyService } from '../services/family';

// Simple reactive state object for Options API
const state = {
  activeFamily: null,
  families: []
};

// Initialize from localStorage
const activeFamilyStr = localStorage.getItem('activeFamily');
if (activeFamilyStr) {
  state.activeFamily = JSON.parse(activeFamilyStr);
}

export const familyStore = {
  // State
  get activeFamily() {
    return state.activeFamily;
  },
  get families() {
    return state.families;
  },

  // Methods
  setActiveFamily(family) {
    state.activeFamily = family;
    if (family) {
      localStorage.setItem('activeFamily', JSON.stringify(family));
    } else {
      localStorage.removeItem('activeFamily');
    }
  },

  setFamilies(families) {
    state.families = families;
  },

  async fetchFamilies() {
    try {
      const families = await familyService.getFamilies();
      state.families = families;
      
      // If no active family and we have families, set first one as active
      if (!state.activeFamily && families.length > 0) {
        this.setActiveFamily(families[0]);
      }
      
      return families;
    } catch (error) {
      throw error;
    }
  },

  async createFamily(familyData) {
    try {
      const family = await familyService.createFamily(familyData);
      state.families.push(family);
      this.setActiveFamily(family);
      return family;
    } catch (error) {
      throw error;
    }
  },

  async joinFamily(inviteCode) {
    try {
      const data = await familyService.joinFamily(inviteCode);
      // Refresh families list
      await this.fetchFamilies();
      // Set joined family as active
      const joinedFamily = state.families.find(f => f.id === data.family.id);
      if (joinedFamily) {
        this.setActiveFamily(joinedFamily);
      }
      return data;
    } catch (error) {
      throw error;
    }
  }
};
