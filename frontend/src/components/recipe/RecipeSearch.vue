<template>
  <Card class="recipe-search">
    <div class="search-container">
      <div class="search-input-wrapper">
        <Input
          v-model="searchValue"
          placeholder="Search recipes..."
          @input="handleSearchInput"
          @blur="handleSearch"
        />
      </div>
      <div class="search-filters">
        <select v-model="categoryValue" @change="handleFilterChange" class="filter-select">
          <option value="">All Categories</option>
          <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
        </select>
        <select v-model="tagValue" @change="handleFilterChange" class="filter-select">
          <option value="">All Tags</option>
          <option v-for="tag in tags" :key="tag" :value="tag">{{ tag }}</option>
        </select>
        <Button v-if="hasActiveFilters" @click="clearFilters" variant="outline" size="small">
          Clear Filters
        </Button>
      </div>
    </div>
  </Card>
</template>

<script>
import Card from '../common/Card.vue';
import Input from '../common/Input.vue';
import Button from '../common/Button.vue';

export default {
  name: 'RecipeSearch',
  components: {
    Card,
    Input,
    Button
  },
  props: {
    search: {
      type: String,
      default: ''
    },
    category: {
      type: String,
      default: ''
    },
    tag: {
      type: String,
      default: ''
    },
    categories: {
      type: Array,
      default: () => []
    },
    tags: {
      type: Array,
      default: () => []
    }
  },
  emits: ['update:search', 'update:category', 'update:tag', 'search'],
  data() {
    return {
      searchValue: this.search || '',
      categoryValue: this.category || '',
      tagValue: this.tag || '',
      searchTimeout: null
    };
  },
  computed: {
    hasActiveFilters() {
      return this.searchValue || this.categoryValue || this.tagValue;
    }
  },
  watch: {
    search(newValue) {
      this.searchValue = newValue || '';
    },
    category(newValue) {
      this.categoryValue = newValue || '';
    },
    tag(newValue) {
      this.tagValue = newValue || '';
    }
  },
  methods: {
    handleSearchInput() {
      this.$emit('update:search', this.searchValue);
      
      // Debounce search
      clearTimeout(this.searchTimeout);
      this.searchTimeout = setTimeout(() => {
        this.handleSearch();
      }, 300);
    },
    handleFilterChange() {
      this.$emit('update:category', this.categoryValue);
      this.$emit('update:tag', this.tagValue);
      this.handleSearch();
    },
    handleSearch() {
      clearTimeout(this.searchTimeout);
      this.$emit('search');
    },
    clearFilters() {
      this.searchValue = '';
      this.categoryValue = '';
      this.tagValue = '';
      this.$emit('update:search', '');
      this.$emit('update:category', '');
      this.$emit('update:tag', '');
      this.handleSearch();
    }
  }
};
</script>

<style scoped>
.recipe-search {
  padding: var(--spacing-md);
}

.search-container {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.search-input-wrapper {
  flex: 1;
}

.search-filters {
  display: flex;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
  align-items: center;
}

.filter-select {
  padding: var(--spacing-xs) var(--spacing-sm);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-family: var(--font-family);
  font-size: var(--font-size-sm);
  color: var(--color-text);
  background-color: var(--color-surface);
  cursor: pointer;
  min-width: 150px;
}

.filter-select:focus {
  outline: none;
  border-color: var(--color-primary);
}

@media (max-width: 768px) {
  .search-filters {
    flex-direction: column;
  }

  .filter-select {
    width: 100%;
  }
}
</script>

