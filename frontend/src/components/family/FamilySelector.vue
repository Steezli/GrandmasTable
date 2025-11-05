<template>
  <div class="family-selector">
    <select
      v-if="families.length > 0"
      :value="activeFamilyId"
      @change="handleFamilyChange"
      class="family-select"
    >
      <option v-for="family in families" :key="family.id" :value="family.id">
        {{ family.name }}
      </option>
    </select>
    <div v-else class="family-select-empty">
      <span>No families</span>
    </div>
  </div>
</template>

<script>
import { familyStore } from '../../store/family';

export default {
  name: 'FamilySelector',
  computed: {
    families() {
      return familyStore.families;
    },
    activeFamily() {
      return familyStore.activeFamily;
    },
    activeFamilyId() {
      return this.activeFamily?.id || '';
    }
  },
  methods: {
    handleFamilyChange(event) {
      const familyId = parseInt(event.target.value);
      const family = this.families.find(f => f.id === familyId);
      if (family) {
        familyStore.setActiveFamily(family);
        // Refresh current route if on dashboard
        if (this.$route.name === 'Dashboard') {
          this.$router.go(0);
        }
      }
    }
  },
  async mounted() {
    if (this.families.length === 0) {
      try {
        await familyStore.fetchFamilies();
      } catch (error) {
        console.error('Failed to fetch families:', error);
      }
    }
  }
};
</script>

<style scoped>
.family-selector {
  display: flex;
  align-items: center;
}

.family-select {
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

.family-select:focus {
  outline: none;
  border-color: var(--color-primary);
}

.family-select-empty {
  padding: var(--spacing-xs) var(--spacing-sm);
  color: var(--color-text-light);
  font-size: var(--font-size-sm);
  font-style: italic;
}

@media (max-width: 768px) {
  .family-selector {
    display: none;
  }
}
</style>

