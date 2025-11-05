<template>
  <transition name="toast">
    <div v-if="visible" :class="toastClass" @click="$emit('close')">
      <span class="toast-icon">{{ icon }}</span>
      <span class="toast-message">{{ message }}</span>
      <button class="toast-close" @click.stop="$emit('close')">×</button>
    </div>
  </transition>
</template>

<script>
export default {
  name: 'Toast',
  props: {
    message: {
      type: String,
      required: true
    },
    variant: {
      type: String,
      default: 'info',
      validator: (value) => ['success', 'error', 'info', 'warning'].includes(value)
    },
    visible: {
      type: Boolean,
      default: true
    },
    autoClose: {
      type: Boolean,
      default: true
    },
    duration: {
      type: Number,
      default: 3000
    }
  },
  emits: ['close'],
  mounted() {
    if (this.autoClose) {
      setTimeout(() => {
        this.$emit('close');
      }, this.duration);
    }
  },
  computed: {
    toastClass() {
      return ['toast', `toast-${this.variant}`];
    },
    icon() {
      const icons = {
        success: '✓',
        error: '✕',
        info: 'ℹ',
        warning: '⚠'
      };
      return icons[this.variant] || icons.info;
    }
  }
};
</script>

<style scoped>
.toast {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  min-width: 300px;
  max-width: 500px;
  cursor: pointer;
}

.toast-success {
  background-color: var(--color-success);
  color: white;
}

.toast-error {
  background-color: var(--color-error);
  color: white;
}

.toast-info {
  background-color: var(--color-primary);
  color: white;
}

.toast-warning {
  background-color: var(--color-warning);
  color: var(--color-text);
}

.toast-icon {
  font-size: var(--font-size-lg);
  font-weight: bold;
}

.toast-message {
  flex: 1;
}

.toast-close {
  background: none;
  border: none;
  color: inherit;
  font-size: var(--font-size-xl);
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s;
}

.toast-enter-from {
  opacity: 0;
  transform: translateY(-20px);
}

.toast-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}
</style>

