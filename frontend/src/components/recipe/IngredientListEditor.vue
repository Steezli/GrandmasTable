<template>
  <div class="ingredient-list-editor">
    <label class="form-label">
      Ingredients
      <span class="required">*</span>
    </label>
    <div class="ingredient-items">
      <div
        v-for="(ingredient, index) in ingredients"
        :key="index"
        class="ingredient-item"
      >
        <Input
          v-model="ingredient.quantity"
          placeholder="Quantity (e.g., 1 cup)"
          class="ingredient-quantity-input"
          @blur="updateIngredients"
        />
        <Input
          v-model="ingredient.ingredient"
          placeholder="Ingredient name"
          required
          class="ingredient-name-input"
          @blur="updateIngredients"
        />
        <Button
          type="button"
          @click="removeIngredient(index)"
          variant="danger"
          size="small"
          class="ingredient-remove"
        >
          ×
        </Button>
      </div>
    </div>
    <Button
      type="button"
      @click="addIngredient"
      variant="outline"
      size="small"
      class="add-ingredient-button"
    >
      + Add Ingredient
    </Button>
    <span v-if="error" class="error-message">{{ error }}</span>
  </div>
</template>

<script>
import Input from '../common/Input.vue';
import Button from '../common/Button.vue';

export default {
  name: 'IngredientListEditor',
  components: {
    Input,
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
      ingredients: [],
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
        this.ingredients = newValue.length > 0
          ? [...newValue]
          : [{ quantity: '', ingredient: '' }];
      },
      immediate: true,
      deep: true
    }
  },
  methods: {
    addIngredient() {
      this.isInternalEdit = true;
      this.ingredients.push({ quantity: '', ingredient: '' });
      this.isInternalEdit = false;
      // Don't emit update when adding empty ingredient - let user fill it first
    },
    removeIngredient(index) {
      this.isInternalEdit = true;
      this.ingredients.splice(index, 1);
      if (this.ingredients.length === 0) {
        this.ingredients = [{ quantity: '', ingredient: '' }];
      }
      this.isInternalEdit = false;
      this.updateIngredients();
    },
    updateIngredients() {
      // Keep ingredients that have either quantity or ingredient name filled
      // Only filter out completely empty ingredients
      const validIngredients = this.ingredients.filter(
        ing => (ing.quantity && ing.quantity.trim().length > 0) || 
               (ing.ingredient && ing.ingredient.trim().length > 0)
      );
      this.$emit('update:modelValue', validIngredients);
    }
  }
};
</script>

<style scoped>
.ingredient-list-editor {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.ingredient-items {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  padding: var(--spacing-md);
  background-color: var(--color-background);
  border-radius: var(--radius-md);
}

.ingredient-item {
  display: grid;
  grid-template-columns: 150px 1fr auto;
  gap: var(--spacing-sm);
  align-items: start;
}

.ingredient-quantity-input {
  flex: 0 0 150px;
}

.ingredient-name-input {
  flex: 1;
}

.ingredient-remove {
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-xl);
}

.add-ingredient-button {
  align-self: flex-start;
}

@media (max-width: 768px) {
  .ingredient-item {
    grid-template-columns: 1fr auto;
  }

  .ingredient-quantity-input {
    grid-column: 1 / -1;
  }
}
</style>

