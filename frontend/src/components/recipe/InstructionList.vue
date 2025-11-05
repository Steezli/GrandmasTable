<template>
  <div class="instruction-list">
    <div
      v-for="(instruction, index) in instructions"
      :key="instruction.step_number || index"
      class="instruction-item"
    >
      <div class="instruction-number">{{ instruction.step_number || index + 1 }}</div>
      <div class="instruction-text">{{ instruction.instruction }}</div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'InstructionList',
  props: {
    instructions: {
      type: Array,
      required: true,
      default: () => []
    }
  }
};
</script>

<style scoped>
.instruction-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.instruction-item {
  display: flex;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  background-color: var(--color-surface);
  border-radius: var(--radius-md);
  border-left: 4px solid var(--color-primary);
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

.instruction-text {
  flex: 1;
  color: var(--color-text);
  line-height: 1.6;
  padding-top: 4px;
}
</style>

