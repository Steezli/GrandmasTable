<template>
  <AppLayout>
    <div class="recipe-form-page">
      <div class="form-header">
        <h1>{{ isEdit ? 'Edit Recipe' : 'Create Recipe' }}</h1>
        <Button @click="goBack" variant="outline">Cancel</Button>
      </div>

      <Card class="recipe-form-card">
        <form @submit.prevent="handleSubmit" class="recipe-form">
          <div class="form-section">
            <Input
              v-model="form.name"
              label="Recipe Name"
              placeholder="Enter recipe name"
              required
              :error="errors.name"
              @blur="validateName"
            />
          </div>

          <div class="form-section">
            <label class="form-label">
              Description
              <span class="required">*</span>
            </label>
            <textarea
              v-model="form.description"
              class="form-textarea"
              placeholder="Enter recipe description"
              rows="3"
              @blur="validateDescription"
            ></textarea>
            <span v-if="errors.description" class="error-message">{{ errors.description }}</span>
          </div>

          <div class="form-row">
            <div class="form-section">
              <Input
                v-model.number="form.prep_time_minutes"
                label="Prep Time (minutes)"
                type="number"
                placeholder="0"
                :error="errors.prep_time_minutes"
              />
            </div>
            <div class="form-section">
              <Input
                v-model.number="form.cook_time_minutes"
                label="Cook Time (minutes)"
                type="number"
                placeholder="0"
                :error="errors.cook_time_minutes"
              />
            </div>
            <div class="form-section">
              <Input
                v-model.number="form.servings"
                label="Servings"
                type="number"
                placeholder="0"
                :error="errors.servings"
              />
            </div>
          </div>

          <div class="form-section">
            <label class="form-label">
              Privacy
            </label>
            <div class="privacy-toggle">
              <label class="privacy-option">
                <input
                  type="radio"
                  v-model="form.is_public"
                  :value="false"
                />
                <span class="privacy-label">
                  <span class="privacy-icon">🔒</span>
                  Family Only
                </span>
              </label>
              <label class="privacy-option">
                <input
                  type="radio"
                  v-model="form.is_public"
                  :value="true"
                />
                <span class="privacy-label">
                  <span class="privacy-icon">🌍</span>
                  Public
                </span>
              </label>
            </div>
            <p v-if="form.is_public" class="privacy-warning">
              ⚠️ This recipe will be visible to anyone with the link.
            </p>
          </div>

          <div class="form-section">
            <IngredientListEditor
              v-model="form.ingredients"
              :error="errors.ingredients"
            />
          </div>

          <div class="form-section">
            <InstructionListEditor
              v-model="form.instructions"
              :error="errors.instructions"
            />
          </div>

          <div class="form-section">
            <label class="form-label">Notes & Stories</label>
            <textarea
              v-model="form.notes"
              class="form-textarea"
              placeholder="Add any notes, stories, or memories about this recipe..."
              rows="5"
            ></textarea>
          </div>

          <div class="form-section">
            <PhotoUpload
              v-model="form.photos"
              :max-size="5"
            />
          </div>

          <div class="form-section">
            <label class="form-label">Tags (comma-separated)</label>
            <Input
              v-model="tagsInput"
              placeholder="e.g., dessert, holiday, vegetarian"
              @blur="updateTags"
            />
            <div v-if="form.tags.length > 0" class="tags-display">
              <span v-for="tag in form.tags" :key="tag" class="tag">
                {{ tag }}
                <button type="button" @click="removeTag(tag)" class="tag-remove">×</button>
              </span>
            </div>
          </div>

          <div class="form-section">
            <label class="form-label">Categories (comma-separated)</label>
            <Input
              v-model="categoriesInput"
              placeholder="e.g., dinner, breakfast, dessert"
              @blur="updateCategories"
            />
            <div v-if="form.categories.length > 0" class="categories-display">
              <span v-for="category in form.categories" :key="category" class="category">
                {{ category }}
                <button type="button" @click="removeCategory(category)" class="category-remove">×</button>
              </span>
            </div>
          </div>

          <div class="form-section">
            <label class="form-label">
              Status
            </label>
            <div class="status-toggle">
              <label class="status-option">
                <input
                  type="radio"
                  v-model="form.status"
                  value="draft"
                />
                <span>Draft</span>
              </label>
              <label class="status-option">
                <input
                  type="radio"
                  v-model="form.status"
                  value="published"
                />
                <span>Published</span>
              </label>
            </div>
          </div>

          <div v-if="generalError" class="form-error">
            {{ generalError }}
          </div>

          <div class="form-actions">
            <Button
              type="submit"
              :loading="loading"
              variant="primary"
              class="submit-button"
            >
              {{ isEdit ? 'Update Recipe' : 'Create Recipe' }}
            </Button>
            <Button
              type="button"
              @click="goBack"
              variant="outline"
            >
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  </AppLayout>
</template>

<script>
import { authStore } from '../store/auth';
import { familyStore } from '../store/family';
import { recipeService } from '../services/recipe';
import AppLayout from '../components/layout/AppLayout.vue';
import Button from '../components/common/Button.vue';
import Input from '../components/common/Input.vue';
import Card from '../components/common/Card.vue';
import IngredientListEditor from '../components/recipe/IngredientListEditor.vue';
import InstructionListEditor from '../components/recipe/InstructionListEditor.vue';
import PhotoUpload from '../components/recipe/PhotoUpload.vue';

export default {
  name: 'RecipeForm',
  components: {
    AppLayout,
    Button,
    Input,
    Card,
    IngredientListEditor,
    InstructionListEditor,
    PhotoUpload
  },
  data() {
    return {
      form: {
        name: '',
        description: '',
        prep_time_minutes: null,
        cook_time_minutes: null,
        servings: null,
        is_public: false,
        notes: '',
        status: 'published',
        ingredients: [],
        instructions: [],
        photos: [],
        tags: [],
        categories: []
      },
      tagsInput: '',
      categoriesInput: '',
      loading: false,
      errors: {},
      generalError: '',
      unsavedChanges: false
    };
  },
  computed: {
    isEdit() {
      return !!this.$route.params.id;
    },
    activeFamily() {
      return familyStore.activeFamily;
    }
  },
  async mounted() {
    if (!this.activeFamily) {
      // Redirect if no active family
      this.$router.push({ name: 'FamilyManagement' });
      return;
    }

    if (this.isEdit) {
      await this.loadRecipe();
    }

    // Track unsaved changes
    window.addEventListener('beforeunload', this.handleBeforeUnload);
  },
  beforeUnmount() {
    window.removeEventListener('beforeunload', this.handleBeforeUnload);
  },
  methods: {
    async loadRecipe() {
      try {
        const recipe = await recipeService.getRecipe(this.$route.params.id);
        
        // Check if user is creator
        if (!authStore.user || String(recipe.created_by) !== String(authStore.user.id)) {
          this.$router.push({ name: 'Dashboard' });
          if (this.$toast) {
            this.$toast.error('You can only edit your own recipes');
          }
          return;
        }

        // Populate form
        this.form.name = recipe.name || '';
        this.form.description = recipe.description || '';
        this.form.prep_time_minutes = recipe.prep_time_minutes || null;
        this.form.cook_time_minutes = recipe.cook_time_minutes || null;
        this.form.servings = recipe.servings || null;
        this.form.is_public = recipe.is_public || false;
        this.form.notes = recipe.notes || '';
        this.form.status = recipe.status || 'published';
        this.form.ingredients = recipe.ingredients || [];
        this.form.instructions = recipe.instructions || [];
        this.form.photos = recipe.photos || [];
        this.form.tags = recipe.tags || [];
        this.form.categories = recipe.categories || [];

        // Set tags and categories input
        this.tagsInput = recipe.tags.join(', ');
        this.categoriesInput = recipe.categories.join(', ');
      } catch (error) {
        this.generalError = error.message || 'Failed to load recipe';
        if (this.$toast) {
          this.$toast.error(this.generalError);
        }
      }
    },
    validateName() {
      if (!this.form.name || this.form.name.trim().length === 0) {
        this.errors.name = 'Recipe name is required';
      } else if (this.form.name.length > 255) {
        this.errors.name = 'Recipe name must be 255 characters or less';
      } else {
        this.errors.name = '';
      }
    },
    validateDescription() {
      // Description is optional
      this.errors.description = '';
    },
    updateTags() {
      const tags = this.tagsInput
        .split(',')
        .map(t => t.trim())
        .filter(t => t.length > 0);
      this.form.tags = tags;
    },
    updateCategories() {
      const categories = this.categoriesInput
        .split(',')
        .map(c => c.trim())
        .filter(c => c.length > 0);
      this.form.categories = categories;
    },
    removeTag(tag) {
      this.form.tags = this.form.tags.filter(t => t !== tag);
      this.tagsInput = this.form.tags.join(', ');
    },
    removeCategory(category) {
      this.form.categories = this.form.categories.filter(c => c !== category);
      this.categoriesInput = this.form.categories.join(', ');
    },
    async handleSubmit() {
      // Reset errors
      this.errors = {};
      this.generalError = '';

      // Validate
      this.validateName();

      if (!this.form.ingredients || this.form.ingredients.length === 0) {
        this.errors.ingredients = 'At least one ingredient is required';
      }

      if (!this.form.instructions || this.form.instructions.length === 0) {
        this.errors.instructions = 'At least one instruction is required';
      }

      if (this.errors.name || this.errors.ingredients || this.errors.instructions) {
        return;
      }

      this.loading = true;

      try {
        const recipeData = {
          name: this.form.name.trim(),
          description: this.form.description.trim() || null,
          prep_time_minutes: this.form.prep_time_minutes || null,
          cook_time_minutes: this.form.cook_time_minutes || null,
          servings: this.form.servings || null,
          is_public: this.form.is_public,
          notes: this.form.notes.trim() || null,
          status: this.form.status,
          ingredients: this.form.ingredients.map((ing, index) => ({
            quantity: ing.quantity || null,
            ingredient: ing.ingredient,
            order: index + 1
          })),
          instructions: this.form.instructions.map((inst, index) => ({
            instruction: inst.instruction || inst,
            step_number: index + 1
          })),
          photos: this.form.photos.map((photo, index) => ({
            photo_url: photo.photo_url,
            is_primary: photo.is_primary || (index === 0),
            order: index + 1
          })),
          tags: this.form.tags,
          categories: this.form.categories
        };

        let response;
        try {
          if (this.isEdit) {
            response = await recipeService.updateRecipe(this.$route.params.id, recipeData);
            if (this.$toast && response) {
              this.$toast.success('Recipe updated successfully!');
            }
          } else {
            response = await recipeService.createRecipe(this.activeFamily.id, recipeData);
            if (this.$toast && response) {
              this.$toast.success('Recipe created successfully!');
            }
          }

          // Only navigate if response is successful
          if (response) {
            this.unsavedChanges = false;
            this.$router.push({ name: 'Dashboard' }).catch(err => {
              // Router navigation error - log but don't show error to user
              console.error('Navigation error:', err);
            });
          }
        } catch (apiError) {
          // Re-throw API errors to outer catch block
          throw apiError;
        }
      } catch (error) {
        // Show error message
        this.generalError = error.message || error.code || 'Failed to save recipe';
        if (this.$toast) {
          this.$toast.error(this.generalError);
        }
      } finally {
        this.loading = false;
      }
    },
    goBack() {
      if (this.unsavedChanges) {
        if (!confirm('You have unsaved changes. Are you sure you want to leave?')) {
          return;
        }
      }
      this.$router.push({ name: 'Dashboard' });
    },
    handleBeforeUnload(e) {
      if (this.unsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    }
  },
  watch: {
    form: {
      deep: true,
      handler() {
        this.unsavedChanges = true;
      }
    }
  }
};
</script>

<style scoped>
.recipe-form-page {
  max-width: 900px;
  margin: 0 auto;
  padding: var(--spacing-md);
}

.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
  flex-wrap: wrap;
  gap: var(--spacing-md);
}

.form-header h1 {
  font-size: var(--font-size-2xl);
  font-weight: 700;
  color: var(--color-primary);
  margin: 0;
}

.recipe-form-card {
  padding: var(--spacing-xl);
}

.recipe-form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.form-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: var(--spacing-md);
}

.form-label {
  font-weight: 500;
  color: var(--color-text);
  font-size: var(--font-size-sm);
}

.form-textarea {
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

.form-textarea:focus {
  outline: none;
  border-color: var(--color-primary);
}

.privacy-toggle,
.status-toggle {
  display: flex;
  gap: var(--spacing-md);
  flex-wrap: wrap;
}

.privacy-option,
.status-option {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  cursor: pointer;
  padding: var(--spacing-sm) var(--spacing-md);
  border: 2px solid var(--color-border);
  border-radius: var(--radius-md);
  transition: all 0.2s;
}

.privacy-option:hover,
.status-option:hover {
  border-color: var(--color-primary);
  background-color: var(--color-background);
}

.privacy-option input[type="radio"],
.status-option input[type="radio"] {
  margin: 0;
  cursor: pointer;
}

.privacy-option input[type="radio"]:checked ~ .privacy-label,
.status-option input[type="radio"]:checked ~ span {
  color: var(--color-primary);
  font-weight: 600;
}

.privacy-option input[type="radio"]:checked {
  border-color: var(--color-primary);
}

.privacy-label {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.privacy-icon {
  font-size: var(--font-size-lg);
}

.privacy-warning {
  color: var(--color-warning);
  font-size: var(--font-size-sm);
  margin-top: var(--spacing-xs);
  font-style: italic;
}

.tags-display,
.categories-display {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-sm);
}

.tag,
.category {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-xs) var(--spacing-sm);
  background-color: var(--color-secondary);
  color: var(--color-text);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  font-weight: 500;
}

.tag-remove,
.category-remove {
  background: none;
  border: none;
  color: inherit;
  cursor: pointer;
  font-size: var(--font-size-lg);
  padding: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color 0.2s;
}

.tag-remove:hover,
.category-remove:hover {
  background-color: rgba(0, 0, 0, 0.1);
}

.form-error {
  padding: var(--spacing-md);
  background-color: #fee;
  border: 1px solid var(--color-error);
  border-radius: var(--radius-md);
  color: var(--color-error);
  text-align: center;
}

.form-actions {
  display: flex;
  gap: var(--spacing-md);
  justify-content: flex-end;
  margin-top: var(--spacing-lg);
  flex-wrap: wrap;
}

.submit-button {
  min-width: 150px;
}

@media (max-width: 768px) {
  .form-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .form-actions {
    flex-direction: column;
  }

  .form-actions .btn {
    width: 100%;
  }
}
</style>

