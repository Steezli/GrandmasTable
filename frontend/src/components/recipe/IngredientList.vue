<template>
  <div class="ingredient-list">
    <div
      v-for="(ingredient, index) in ingredients"
      :key="index"
      class="ingredient-item"
    >
      <span class="ingredient-quantity" v-if="ingredient.quantity">
        {{ ingredient.quantity }}
      </span>
      <span class="ingredient-name">{{ ingredient.ingredient }}</span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'IngredientList',
  props: {
    ingredients: {
      type: Array,
      required: true,
      default: () => []
    }
  }
};
</script>

<style scoped>
.ingredient-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  padding: var(--spacing-md);
  background-color: var(--color-surface);
  border-radius: var(--radius-md);
}

.ingredient-item {
  display: flex;
  align-items: baseline;
  gap: var(--spacing-sm);
  padding: var(--spacing-xs) 0;
  border-bottom: 1px solid var(--color-border);
}

.ingredient-item:last-child {
  border-bottom: none;
}

.ingredient-quantity {
  font-weight: 600;
  color: var(--color-primary);
  min-width: 80px;
}

.ingredient-name {
  flex: 1;
  color: var(--color-text);
}
</style>

