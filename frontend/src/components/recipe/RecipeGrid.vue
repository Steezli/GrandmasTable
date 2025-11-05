<template>
  <div class="recipe-grid">
    <RecipeCard
      v-for="recipe in recipes"
      :key="recipe.id"
      :recipe="recipe"
    />
  </div>
</template>

<script>
import RecipeCard from './RecipeCard.vue';

export default {
  name: 'RecipeGrid',
  components: {
    RecipeCard
  },
  props: {
    recipes: {
      type: Array,
      required: true,
      default: () => []
    }
  }
};
</script>

<style scoped>
.recipe-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--spacing-lg);
  width: 100%;
}

@media (max-width: 768px) {
  .recipe-grid {
    grid-template-columns: 1fr;
    gap: var(--spacing-md);
  }
}

@media (min-width: 769px) and (max-width: 1024px) {
  .recipe-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  }
}
</style>

