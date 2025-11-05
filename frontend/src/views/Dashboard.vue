<template>
  <AppLayout>
    <div class="dashboard">
      <div class="dashboard-header">
        <h1 v-if="activeFamily" class="dashboard-title">
          Welcome to {{ activeFamily.name }}'s Recipes
        </h1>
        <h1 v-else class="dashboard-title">Welcome to Grandma's Table</h1>
        <Button
          v-if="activeFamily"
          @click="goToCreateRecipe"
          class="add-recipe-button"
        >
          ➕ Add Recipe
        </Button>
      </div>

      <div v-if="!activeFamily" class="no-family-message">
        <Card class="no-family-card">
          <h2>No Family Selected</h2>
          <p>Create or join a family to start sharing recipes!</p>
          <div class="no-family-actions">
            <Button @click="goToFamilyManagement">Manage Families</Button>
          </div>
        </Card>
      </div>

      <div v-else class="dashboard-content">
        <RecipeSearch
          v-model:search="filters.search"
          v-model:category="filters.category"
          v-model:tag="filters.tag"
          @search="handleSearch"
        />

        <div v-if="loading" class="recipes-loading">
          <LoadingSpinner message="Loading recipes..." centered />
        </div>

        <div v-else-if="error" class="recipes-error">
          <Card>
            <p class="error-message">{{ error }}</p>
            <Button @click="loadRecipes">Try Again</Button>
          </Card>
        </div>

        <div v-else-if="recipes.length === 0" class="recipes-empty">
          <Card class="empty-card">
            <div class="empty-content">
              <div class="empty-icon">📝</div>
              <h2>No recipes yet</h2>
              <p>Get started by adding your first recipe!</p>
              <Button @click="goToCreateRecipe">Add Recipe</Button>
            </div>
          </Card>
        </div>

        <div v-else class="recipes-container">
          <RecipeGrid :recipes="recipes" />
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script>
import { familyStore } from '../store/family';
import { recipeService } from '../services/recipe';
import AppLayout from '../components/layout/AppLayout.vue';
import Button from '../components/common/Button.vue';
import Card from '../components/common/Card.vue';
import LoadingSpinner from '../components/common/LoadingSpinner.vue';
import RecipeSearch from '../components/recipe/RecipeSearch.vue';
import RecipeGrid from '../components/recipe/RecipeGrid.vue';

export default {
  name: 'Dashboard',
  components: {
    AppLayout,
    Button,
    Card,
    LoadingSpinner,
    RecipeSearch,
    RecipeGrid
  },
  data() {
    return {
      recipes: [],
      loading: false,
      error: '',
      filters: {
        search: '',
        category: null,
        tag: null,
        creator_id: null
      },
      page: 1,
      limit: 20
    };
  },
  computed: {
    activeFamily() {
      return familyStore.activeFamily;
    }
  },
  async mounted() {
    // Ensure we have families loaded
    if (familyStore.families.length === 0) {
      try {
        await familyStore.fetchFamilies();
      } catch (error) {
        console.error('Failed to fetch families:', error);
      }
    }

    // If we have an active family, load recipes
    if (this.activeFamily) {
      await this.loadRecipes();
    }
  },
  watch: {
    activeFamily: {
      handler(newFamily) {
        if (newFamily) {
          this.loadRecipes();
        } else {
          this.recipes = [];
        }
      },
      immediate: false
    }
  },
  methods: {
    async loadRecipes() {
      if (!this.activeFamily) {
        return;
      }

      this.loading = true;
      this.error = '';

      try {
        const recipes = await recipeService.getRecipes(this.activeFamily.id, {
          ...this.filters,
          page: this.page,
          limit: this.limit
        });
        this.recipes = recipes;
      } catch (error) {
        this.error = error.message || 'Failed to load recipes';
        if (this.$toast) {
          this.$toast.error(this.error);
        }
      } finally {
        this.loading = false;
      }
    },
    handleSearch() {
      this.page = 1; // Reset to first page on new search
      this.loadRecipes();
    },
    goToCreateRecipe() {
      this.$router.push({ name: 'RecipeForm' });
    },
    goToFamilyManagement() {
      this.$router.push({ name: 'FamilyManagement' });
    }
  }
};
</script>

<style scoped>
.dashboard {
  padding: var(--spacing-md);
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
  flex-wrap: wrap;
  gap: var(--spacing-md);
}

.dashboard-title {
  font-size: var(--font-size-2xl);
  font-weight: 700;
  color: var(--color-primary);
  margin: 0;
}

.add-recipe-button {
  font-size: var(--font-size-md);
}

.no-family-message {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

.no-family-card {
  max-width: 500px;
  text-align: center;
  padding: var(--spacing-xl);
}

.no-family-card h2 {
  color: var(--color-primary);
  margin-bottom: var(--spacing-md);
}

.no-family-card p {
  color: var(--color-text-light);
  margin-bottom: var(--spacing-lg);
}

.no-family-actions {
  display: flex;
  justify-content: center;
  gap: var(--spacing-md);
}

.dashboard-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.recipes-loading,
.recipes-error,
.recipes-empty {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
}

.error-message {
  color: var(--color-error);
  margin-bottom: var(--spacing-md);
  text-align: center;
}

.empty-card {
  max-width: 400px;
  padding: var(--spacing-xl);
}

.empty-content {
  text-align: center;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: var(--spacing-md);
}

.empty-content h2 {
  color: var(--color-primary);
  margin-bottom: var(--spacing-sm);
}

.empty-content p {
  color: var(--color-text-light);
  margin-bottom: var(--spacing-lg);
}

.recipes-container {
  width: 100%;
}

@media (max-width: 768px) {
  .dashboard-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .add-recipe-button {
    width: 100%;
  }
}
</style>

