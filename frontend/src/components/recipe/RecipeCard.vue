<template>
  <Card class="recipe-card" :hover="true" @click="goToRecipe">
    <div class="recipe-image">
      <img
        v-if="recipe.primary_photo_url"
        :src="recipe.primary_photo_url"
        :alt="recipe.name"
        class="recipe-photo"
      />
      <div v-else class="recipe-photo-placeholder">
        <span class="placeholder-icon">🍳</span>
      </div>
      <div class="recipe-privacy-badge" :class="privacyClass">
        <span class="privacy-icon">{{ privacyIcon }}</span>
        <span class="privacy-text">{{ privacyText }}</span>
      </div>
    </div>
    <div class="recipe-content">
      <h3 class="recipe-name">{{ recipe.name }}</h3>
      <p v-if="recipe.description" class="recipe-description">
        {{ truncate(recipe.description, 100) }}
      </p>
      <div class="recipe-meta">
        <span class="recipe-creator">By {{ recipe.creator_name || 'Unknown' }}</span>
        <span class="recipe-date">{{ formatDate(recipe.updated_at || recipe.created_at) }}</span>
      </div>
    </div>
  </Card>
</template>

<script>
import Card from '../common/Card.vue';
import { helpers } from '../../utils/helpers';

export default {
  name: 'RecipeCard',
  components: {
    Card
  },
  props: {
    recipe: {
      type: Object,
      required: true
    }
  },
  computed: {
    isPublic() {
      return this.recipe.is_public || false;
    },
    privacyClass() {
      return this.isPublic ? 'privacy-public' : 'privacy-family';
    },
    privacyIcon() {
      return this.isPublic ? '🌍' : '🔒';
    },
    privacyText() {
      return this.isPublic ? 'Public' : 'Family Only';
    }
  },
  methods: {
    goToRecipe() {
      this.$router.push({ name: 'RecipeDetail', params: { id: this.recipe.id } });
    },
    truncate(text, maxLength) {
      return helpers.truncate(text, maxLength);
    },
    formatDate(dateString) {
      return helpers.formatDate(dateString);
    }
  }
};
</script>

<style scoped>
.recipe-card {
  cursor: pointer;
  padding: 0;
  overflow: hidden;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.recipe-image {
  position: relative;
  width: 100%;
  height: 200px;
  overflow: hidden;
  background-color: var(--color-background);
}

.recipe-photo {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.recipe-photo-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-background);
}

.placeholder-icon {
  font-size: 64px;
  opacity: 0.3;
}

.recipe-privacy-badge {
  position: absolute;
  top: var(--spacing-sm);
  right: var(--spacing-sm);
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-md);
  font-size: var(--font-size-xs);
  font-weight: 500;
  backdrop-filter: blur(4px);
}

.privacy-family {
  background-color: rgba(40, 167, 69, 0.9);
  color: white;
}

.privacy-public {
  background-color: rgba(0, 123, 255, 0.9);
  color: white;
}

.privacy-icon {
  font-size: var(--font-size-sm);
}

.privacy-text {
  font-size: var(--font-size-xs);
}

.recipe-content {
  padding: var(--spacing-md);
  flex: 1;
  display: flex;
  flex-direction: column;
}

.recipe-name {
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--color-primary);
  margin: 0 0 var(--spacing-sm) 0;
  line-height: 1.3;
}

.recipe-description {
  color: var(--color-text-light);
  font-size: var(--font-size-sm);
  margin: 0 0 var(--spacing-md) 0;
  line-height: 1.5;
  flex: 1;
}

.recipe-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: var(--font-size-xs);
  color: var(--color-text-light);
  margin-top: auto;
}

.recipe-creator {
  font-weight: 500;
}

.recipe-date {
  font-style: italic;
}
</style>

