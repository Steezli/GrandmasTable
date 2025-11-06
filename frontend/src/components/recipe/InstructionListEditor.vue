<template>
  <div class="instruction-list-editor">
    <label class="form-label">
      Instructions
      <span class="required">*</span>
    </label>
    <div class="instruction-items">
      <div
        v-for="(instruction, index) in instructions"
        :key="index"
        class="instruction-item"
      >
        <div class="instruction-number">{{ index + 1 }}</div>
        <textarea
          v-model="instruction.instruction"
          class="instruction-textarea"
          placeholder="Enter instruction step"
          rows="2"
          @blur="updateInstructions"
        ></textarea>
        <Button
          type="button"
          @click="removeInstruction(index)"
          variant="danger"
          size="small"
          class="instruction-remove"
        >
          ×
        </Button>
      </div>
    </div>
    <Button
      type="button"
      @click="addInstruction"
      variant="outline"
      size="small"
      class="add-instruction-button"
    >
      + Add Step
    </Button>
    <span v-if="error" class="error-message">{{ error }}</span>
  </div>
</template>

<script>
import Button from '../common/Button.vue';

export default {
  name: 'InstructionListEditor',
  components: {
    Button
  },
  props: {
    modelValue: {
      type: Array,
      required: true,
      default: () => []
    },
    error: {
      type: String,
      default: ''
    }
  },
  emits: ['update:modelValue'],
  data() {
    return {
      instructions: [],
      isInternalEdit: false
    };
  },
  watch: {
    modelValue: {
      handler(newValue) {
        // Don't reset if we're in the middle of an internal edit
        if (this.isInternalEdit) {
          return;
        }
        this.instructions = newValue.length > 0
          ? newValue.map(inst => ({
              instruction: typeof inst === 'string' ? inst : inst.instruction || ''
            }))
          : [{ instruction: '' }];
      },
      immediate: true,
      deep: true
    }
  },
  methods: {
    addInstruction() {
      this.isInternalEdit = true;
      this.instructions.push({ instruction: '' });
      this.isInternalEdit = false;
      // Don't emit update when adding empty instruction - let user fill it first
    },
    removeInstruction(index) {
      this.isInternalEdit = true;
      this.instructions.splice(index, 1);
      if (this.instructions.length === 0) {
        this.instructions = [{ instruction: '' }];
      }
      this.isInternalEdit = false;
      this.updateInstructions();
    },
    updateInstructions() {
      // Filter out empty instructions
      const validInstructions = this.instructions.filter(
        inst => inst.instruction && inst.instruction.trim().length > 0
      );
      this.$emit('update:modelValue', validInstructions);
    }
  }
};
</script>

<style scoped>
.instruction-list-editor {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.instruction-items {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  background-color: var(--color-background);
  border-radius: var(--radius-md);
}

.instruction-item {
  display: grid;
  grid-template-columns: 40px 1fr auto;
  gap: var(--spacing-md);
  align-items: start;
}

.instruction-number {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-primary);
  color: white;
  border-radius: 50%;
  font-weight: 600;
  font-size: var(--font-size-md);
}

.instruction-textarea {
  width: 100%;
  padding: var(--spacing-sm) var(--spacing-md);
  border: 2px solid var(--color-border);
  border-radius: var(--radius-md);
  font-family: var(--font-family);
  font-size: var(--font-size-md);
  color: var(--color-text);
  background-color: var(--color-surface);
  resize: vertical;
  transition: border-color 0.2s;
}

.instruction-textarea:focus {
  outline: none;
  border-color: var(--color-primary);
}

.instruction-remove {
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-xl);
}

.add-instruction-button {
  align-self: flex-start;
}

@media (max-width: 768px) {
  .instruction-item {
    grid-template-columns: 1fr auto;
  }

  .instruction-number {
    grid-column: 1 / -1;
    width: auto;
    justify-self: flex-start;
  }
}
</style>

