<template>
  <div class="input-wrapper">
    <label v-if="label" :for="id" class="input-label">
      {{ label }}
      <span v-if="required" class="required">*</span>
    </label>
    <input
      :id="id"
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :required="required"
      :disabled="disabled"
      :class="inputClass"
      @input="$emit('update:modelValue', $event.target.value)"
      @blur="$emit('blur', $event)"
      @focus="$emit('focus', $event)"
    />
    <span v-if="error" class="error-message">{{ error }}</span>
    <span v-if="hint && !error" class="hint">{{ hint }}</span>
  </div>
</template>

<script>
export default {
  name: 'Input',
  props: {
    modelValue: {
      type: [String, Number],
      default: ''
    },
    label: {
      type: String,
      default: ''
    },
    type: {
      type: String,
      default: 'text'
    },
    placeholder: {
      type: String,
      default: ''
    },
    required: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    },
    error: {
      type: String,
      default: ''
    },
    hint: {
      type: String,
      default: ''
    },
    id: {
      type: String,
      default: () => `input-${Math.random().toString(36).substr(2, 9)}`
    }
  },
  emits: ['update:modelValue', 'blur', 'focus'],
  computed: {
    inputClass() {
      return {
        'input-error': this.error,
        'input-disabled': this.disabled
      };
    }
  }
};
</script>

<style scoped>
.input-wrapper {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.input-label {
  font-weight: 500;
  color: var(--color-text);
  font-size: var(--font-size-sm);
}

.required {
  color: var(--color-error);
}

input {
  width: 100%;
  padding: var(--spacing-sm) var(--spacing-md);
  border: 2px solid var(--color-border);
  border-radius: var(--radius-md);
  font-family: var(--font-family);
  font-size: var(--font-size-md);
  color: var(--color-text);
  background-color: var(--color-surface);
  transition: border-color 0.2s;
}

input:focus {
  outline: none;
  border-color: var(--color-primary);
}

.input-error {
  border-color: var(--color-error);
}

.input-disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
}

.error-message {
  color: var(--color-error);
  font-size: var(--font-size-sm);
}

.hint {
  color: var(--color-text-light);
  font-size: var(--font-size-sm);
}
</style>

