<template>
  <div :class="spinnerClass">
    <div class="spinner"></div>
    <span v-if="message" class="spinner-message">{{ message }}</span>
  </div>
</template>

<script>
export default {
  name: 'LoadingSpinner',
  props: {
    size: {
      type: String,
      default: 'medium',
      validator: (value) => ['small', 'medium', 'large'].includes(value)
    },
    message: {
      type: String,
      default: ''
    },
    centered: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    spinnerClass() {
      return [
        'spinner-wrapper',
        `spinner-${this.size}`,
        {
          'spinner-centered': this.centered
        }
      ];
    }
  }
};
</script>

<style scoped>
.spinner-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-md);
}

.spinner-centered {
  justify-content: center;
  min-height: 200px;
}

.spinner {
  border: 3px solid var(--color-border);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.spinner-small {
  width: 24px;
  height: 24px;
  border-width: 2px;
}

.spinner-medium {
  width: 40px;
  height: 40px;
}

.spinner-large {
  width: 64px;
  height: 64px;
  border-width: 4px;
}

.spinner-message {
  color: var(--color-text-light);
  font-size: var(--font-size-sm);
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>

