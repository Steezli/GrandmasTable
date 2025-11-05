<template>
  <button
    :type="type"
    :class="buttonClass"
    :disabled="disabled || loading"
    @click="$emit('click', $event)"
  >
    <span v-if="loading" class="spinner"></span>
    <slot></slot>
  </button>
</template>

<script>
export default {
  name: 'Button',
  props: {
    variant: {
      type: String,
      default: 'primary',
      validator: (value) => ['primary', 'secondary', 'danger', 'outline'].includes(value)
    },
    size: {
      type: String,
      default: 'medium',
      validator: (value) => ['small', 'medium', 'large'].includes(value)
    },
    disabled: {
      type: Boolean,
      default: false
    },
    loading: {
      type: Boolean,
      default: false
    },
    type: {
      type: String,
      default: 'button'
    }
  },
  emits: ['click'],
  computed: {
    buttonClass() {
      return [
        'btn',
        `btn-${this.variant}`,
        `btn-${this.size}`,
        {
          'btn-disabled': this.disabled || this.loading,
          'btn-loading': this.loading
        }
      ];
    }
  }
};
</script>

<style scoped>
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  border: none;
  border-radius: var(--radius-md);
  font-family: var(--font-family);
  font-size: var(--font-size-md);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  text-decoration: none;
}

.btn:focus {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.btn-primary {
  background-color: var(--color-primary);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: var(--color-primary-dark);
}

.btn-secondary {
  background-color: var(--color-secondary);
  color: var(--color-text);
}

.btn-secondary:hover:not(:disabled) {
  background-color: var(--color-accent);
}

.btn-danger {
  background-color: var(--color-error);
  color: white;
}

.btn-danger:hover:not(:disabled) {
  background-color: #C82333;
}

.btn-outline {
  background-color: transparent;
  color: var(--color-primary);
  border: 2px solid var(--color-primary);
}

.btn-outline:hover:not(:disabled) {
  background-color: var(--color-primary);
  color: white;
}

.btn-small {
  padding: var(--spacing-xs) var(--spacing-sm);
  font-size: var(--font-size-sm);
}

.btn-large {
  padding: var(--spacing-md) var(--spacing-lg);
  font-size: var(--font-size-lg);
}

.btn-disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid currentColor;
  border-right-color: transparent;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>

