export const validation = {
  email(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  password(password) {
    return password && password.length >= 8;
  },

  required(value) {
    return value !== null && value !== undefined && value !== '';
  },

  minLength(value, min) {
    return value && value.length >= min;
  },

  maxLength(value, max) {
    return value && value.length <= max;
  },

  min(value, min) {
    return value !== null && value !== undefined && Number(value) >= min;
  },

  max(value, max) {
    return value !== null && value !== undefined && Number(value) <= max;
  }
};

