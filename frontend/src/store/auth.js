import { authService } from '../services/auth';

// Simple reactive state object for Options API
const state = {
  user: null,
  token: null,
  isAuthenticated: false
};

// Initialize from localStorage
const token = localStorage.getItem('token');
const userStr = localStorage.getItem('user');

if (token && userStr) {
  state.token = token;
  state.user = JSON.parse(userStr);
  state.isAuthenticated = true;
}

export const authStore = {
  // State
  get user() {
    return state.user;
  },
  get token() {
    return state.token;
  },
  get isAuthenticated() {
    return state.isAuthenticated;
  },

  // Methods
  setAuth(user, tokenValue) {
    state.user = user;
    state.token = tokenValue;
    state.isAuthenticated = true;
    localStorage.setItem('token', tokenValue);
    localStorage.setItem('user', JSON.stringify(user));
  },

  clearAuth() {
    state.user = null;
    state.token = null;
    state.isAuthenticated = false;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  async login(credentials) {
    try {
      const data = await authService.login(credentials);
      this.setAuth(data.user, data.token);
      return data;
    } catch (error) {
      throw error;
    }
  },

  async register(userData) {
    try {
      const data = await authService.register(userData);
      this.setAuth(data.user, data.token);
      return data;
    } catch (error) {
      throw error;
    }
  },

  async logout() {
    try {
      await authService.logout();
    } finally {
      this.clearAuth();
    }
  },

  async fetchCurrentUser() {
    try {
      const data = await authService.getCurrentUser();
      state.user = data.user;
      if (state.token) {
        localStorage.setItem('user', JSON.stringify(data.user));
      }
      return data.user;
    } catch (error) {
      this.clearAuth();
      throw error;
    }
  }
};
