<template>
  <AppLayout>
    <div class="recipe-detail" v-if="recipe">
      <div class="recipe-hero">
        <div class="recipe-hero-image" v-if="primaryPhoto">
          <img :src="primaryPhoto.photo_url" :alt="recipe.name" />
        </div>
        <div v-else class="recipe-hero-placeholder">
          <span class="placeholder-icon">🍳</span>
        </div>
        <div class="recipe-hero-content">
          <h1 class="recipe-title">{{ recipe.name }}</h1>
          <div class="recipe-meta-bar">
            <span v-if="recipe.prep_time_minutes" class="meta-item">
              ⏱️ Prep: {{ formatDuration(recipe.prep_time_minutes) }}
            </span>
            <span v-if="recipe.cook_time_minutes" class="meta-item">
              🔥 Cook: {{ formatDuration(recipe.cook_time_minutes) }}
            </span>
            <span v-if="recipe.servings" class="meta-item">
              👥 Serves: {{ recipe.servings }}
            </span>
          </div>
          <div class="recipe-header-info">
            <span class="recipe-creator">By {{ recipe.creator?.name || 'Unknown' }}</span>
            <span class="recipe-date">{{ formatDate(recipe.updated_at || recipe.created_at) }}</span>
            <div class="recipe-privacy-badge" :class="privacyClass">
              <span class="privacy-icon">{{ privacyIcon }}</span>
              <span class="privacy-text">{{ privacyText }}</span>
            </div>
          </div>
        </div>
      </div>

      <div v-if="recipe.description" class="recipe-description">
        <p>{{ recipe.description }}</p>
      </div>

      <div class="recipe-actions" v-if="isCreator">
        <Button @click="goToEdit" variant="primary">Edit Recipe</Button>
        <Button v-if="isDraft" @click="handlePublish" variant="primary">Publish Recipe</Button>
        <Button @click="handleDelete" variant="danger">Delete Recipe</Button>
      </div>
      <div v-if="isDraft" class="draft-notice">
        <Card class="draft-notice-card">
          <p>📝 This recipe is currently a draft. Edit it to make changes or publish it to make it available to your family.</p>
        </Card>
      </div>

      <div class="recipe-content">
        <div class="recipe-section">
          <h2>Ingredients</h2>
          <IngredientList :ingredients="recipe.ingredients" />
        </div>

        <div class="recipe-section">
          <h2>Instructions</h2>
          <InstructionList :instructions="recipe.instructions" />
        </div>

        <div v-if="recipe.notes" class="recipe-section">
          <h2>Notes & Stories</h2>
          <div class="recipe-notes">
            <p>{{ recipe.notes }}</p>
          </div>
        </div>

        <div v-if="recipe.photos && recipe.photos.length > 1" class="recipe-section">
          <h2>Photos</h2>
          <div class="recipe-photos">
            <img
              v-for="photo in recipe.photos"
              :key="photo.id"
              :src="photo.photo_url"
              :alt="recipe.name"
              class="recipe-photo"
            />
          </div>
        </div>

        <div v-if="recipe.tags && recipe.tags.length > 0" class="recipe-section">
          <h2>Tags</h2>
          <div class="recipe-tags">
            <span v-for="tag in recipe.tags" :key="tag" class="tag">{{ tag }}</span>
          </div>
        </div>

        <div v-if="recipe.categories && recipe.categories.length > 0" class="recipe-section">
          <h2>Categories</h2>
          <div class="recipe-categories">
            <span v-for="category in recipe.categories" :key="category" class="category">{{ category }}</span>
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="loading" class="recipe-loading">
      <LoadingSpinner message="Loading recipe..." centered />
    </div>

    <div v-else-if="error" class="recipe-error">
      <Card>
        <p class="error-message">{{ error }}</p>
        <Button @click="loadRecipe">Try Again</Button>
      </Card>
    </div>
  </AppLayout>
</template>

<script>
import { authStore } from '../store/auth';
import { recipeService } from '../services/recipe';
import { helpers } from '../utils/helpers';
import AppLayout from '../components/layout/AppLayout.vue';
import Button from '../components/common/Button.vue';
import Card from '../components/common/Card.vue';
import LoadingSpinner from '../components/common/LoadingSpinner.vue';
import IngredientList from '../components/recipe/IngredientList.vue';
import InstructionList from '../components/recipe/InstructionList.vue';

export default {
  name: 'RecipeDetail',
  components: {
    AppLayout,
    Button,
    Card,
    LoadingSpinner,
    IngredientList,
    InstructionList
  },
  data() {
    return {
      recipe: null,
      loading: false,
      error: ''
    };
  },
  computed: {
    isCreator() {
      if (!this.recipe || !authStore.user) return false;
      return this.recipe.created_by === authStore.user.id;
    },
    primaryPhoto() {
      if (!this.recipe || !this.recipe.photos) return null;
      return this.recipe.photos.find(p => p.is_primary) || this.recipe.photos[0];
    },
    isPublic() {
      return this.recipe?.is_public || false;
    },
    privacyClass() {
      return this.isPublic ? 'privacy-public' : 'privacy-family';
    },
    privacyIcon() {
      return this.isPublic ? '🌍' : '🔒';
    },
    privacyText() {
      return this.isPublic ? 'Public' : 'Family Only';
    },
    isDraft() {
      return this.recipe?.status === 'draft';
    }
  },
  async mounted() {
    await this.loadRecipe();
  },
  methods: {
    async loadRecipe() {
      this.loading = true;
      this.error = '';

      try {
        let recipe;
        // Check route name to determine if this is a public recipe
        if (this.$route.name === 'PublicRecipe' && this.$route.params.slug) {
          // Public recipe accessed via slug
          recipe = await recipeService.getPublicRecipe(this.$route.params.slug);
        } else if (this.$route.params.id) {
          // Regular recipe accessed via ID
          recipe = await recipeService.getRecipe(this.$route.params.id);
        } else {
          throw new Error('Invalid route parameters');
        }

        this.recipe = recipe;
      } catch (error) {
        this.error = error.message || 'Failed to load recipe';
        if (this.$toast) {
          this.$toast.error(this.error);
        }
      } finally {
        this.loading = false;
      }
    },
    goToEdit() {
      this.$router.push({ name: 'RecipeEdit', params: { id: this.recipe.id } });
    },
    async handlePublish() {
      if (!this.recipe) return;
      
      try {
        await recipeService.updateRecipe(this.recipe.id, {
          status: 'published'
        });
        if (this.$toast) {
          this.$toast.success('Recipe published successfully!');
        }
        // Reload recipe to update status
        await this.loadRecipe();
      } catch (error) {
        this.error = error.message || 'Failed to publish recipe';
        if (this.$toast) {
          this.$toast.error(this.error);
        }
      }
    },
    async handleDelete() {
      if (!confirm('Are you sure you want to delete this recipe? This action cannot be undone.')) {
        return;
      }

      try {
        await recipeService.deleteRecipe(this.recipe.id);
        if (this.$toast) {
          this.$toast.success('Recipe deleted successfully');
        }
        this.$router.push({ name: 'Dashboard' });
      } catch (error) {
        this.error = error.message || 'Failed to delete recipe';
        if (this.$toast) {
          this.$toast.error(this.error);
        }
      }
    },
    formatDuration(minutes) {
      return helpers.formatDuration(minutes);
    },
    formatDate(dateString) {
      return helpers.formatDate(dateString);
    }
  }
};
</script>

<style scoped>
.recipe-detail {
  max-width: 900px;
  margin: 0 auto;
  padding: var(--spacing-md);
}

.recipe-hero {
  margin-bottom: var(--spacing-lg);
}

.recipe-hero-image {
  width: 100%;
  height: 400px;
  overflow: hidden;
  border-radius: var(--radius-lg);
  margin-bottom: var(--spacing-md);
  background-color: var(--color-background);
}

.recipe-hero-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.recipe-hero-placeholder {
  width: 100%;
  height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-background);
  border-radius: var(--radius-lg);
  margin-bottom: var(--spacing-md);
}

.placeholder-icon {
  font-size: 128px;
  opacity: 0.3;
}

.recipe-hero-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.recipe-title {
  font-size: var(--font-size-2xl);
  font-weight: 700;
  color: var(--color-primary);
  margin: 0;
}

.recipe-meta-bar {
  display: flex;
  gap: var(--spacing-md);
  flex-wrap: wrap;
  color: var(--color-text-light);
  font-size: var(--font-size-sm);
}

.meta-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.recipe-header-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  flex-wrap: wrap;
  font-size: var(--font-size-sm);
  color: var(--color-text-light);
}

.recipe-creator {
  font-weight: 500;
}

.recipe-date {
  font-style: italic;
}

.draft-notice {
  margin: var(--spacing-md) 0;
}

.draft-notice-card {
  background-color: rgba(255, 193, 7, 0.1);
  border: 2px solid rgba(255, 193, 7, 0.3);
}

.draft-notice-card p {
  margin: 0;
  color: var(--color-text);
  font-size: var(--font-size-md);
}

.recipe-privacy-badge {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-md);
  font-size: var(--font-size-xs);
  font-weight: 500;
}

.privacy-family {
  background-color: rgba(40, 167, 69, 0.1);
  color: #28a745;
}

.privacy-public {
  background-color: rgba(0, 123, 255, 0.1);
  color: #007bff;
}

.recipe-description {
  margin-bottom: var(--spacing-lg);
  padding: var(--spacing-md);
  background-color: var(--color-background);
  border-radius: var(--radius-md);
}

.recipe-description p {
  font-size: var(--font-size-lg);
  line-height: 1.6;
  color: var(--color-text);
  margin: 0;
}

.recipe-actions {
  display: flex;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
  flex-wrap: wrap;
}

.recipe-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
}

.recipe-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.recipe-section h2 {
  font-size: var(--font-size-xl);
  font-weight: 600;
  color: var(--color-primary);
  margin: 0;
  border-bottom: 2px solid var(--color-border);
  padding-bottom: var(--spacing-sm);
}

.recipe-notes {
  padding: var(--spacing-md);
  background-color: var(--color-background);
  border-radius: var(--radius-md);
  line-height: 1.6;
}

.recipe-notes p {
  margin: 0;
  white-space: pre-wrap;
}

.recipe-photos {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: var(--spacing-md);
}

.recipe-photo {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: transform 0.2s;
}

.recipe-photo:hover {
  transform: scale(1.05);
}

.recipe-tags,
.recipe-categories {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
}

.tag,
.category {
  padding: var(--spacing-xs) var(--spacing-sm);
  background-color: var(--color-secondary);
  color: var(--color-text);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  font-weight: 500;
}

.recipe-loading,
.recipe-error {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  padding: var(--spacing-md);
}

.error-message {
  color: var(--color-error);
  margin-bottom: var(--spacing-md);
  text-align: center;
}

@media (max-width: 768px) {
  .recipe-hero-image,
  .recipe-hero-placeholder {
    height: 250px;
  }

  .recipe-title {
    font-size: var(--font-size-xl);
  }

  .recipe-actions {
    flex-direction: column;
  }

  .recipe-actions .btn {
    width: 100%;
  }
}
</style>

