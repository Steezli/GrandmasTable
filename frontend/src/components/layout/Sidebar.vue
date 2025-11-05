<template>
  <aside class="sidebar" v-if="isAuthenticated">
    <nav class="sidebar-nav">
      <FamilySelector />
      <router-link to="/dashboard" class="nav-item" active-class="nav-item-active">
        <span class="nav-icon">📖</span>
        <span class="nav-text">Recipes</span>
      </router-link>
      <router-link to="/family" class="nav-item" active-class="nav-item-active">
        <span class="nav-icon">👨‍👩‍👧‍👦</span>
        <span class="nav-text">Family</span>
      </router-link>
      <router-link to="/profile" class="nav-item" active-class="nav-item-active">
        <span class="nav-icon">👤</span>
        <span class="nav-text">Profile</span>
      </router-link>
    </nav>
  </aside>
</template>

<script>
import { authStore } from '../../store/auth';
import FamilySelector from '../family/FamilySelector.vue';

export default {
  name: 'Sidebar',
  components: {
    FamilySelector
  },
  computed: {
    isAuthenticated() {
      return authStore.isAuthenticated;
    }
  }
};
</script>

<style scoped>
.sidebar {
  width: 250px;
  background-color: var(--color-surface);
  border-right: 1px solid var(--color-border);
  padding: var(--spacing-md);
  min-height: calc(100vh - 80px);
  position: sticky;
  top: 80px;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.nav-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-md);
  text-decoration: none;
  color: var(--color-text);
  transition: all 0.2s;
  font-weight: 500;
}

.nav-item:hover {
  background-color: var(--color-background);
  color: var(--color-primary);
}

.nav-item-active {
  background-color: var(--color-primary);
  color: white;
}

.nav-item-active:hover {
  background-color: var(--color-primary-dark);
  color: white;
}

.nav-icon {
  font-size: var(--font-size-lg);
}

.nav-text {
  font-size: var(--font-size-md);
}

@media (max-width: 1024px) {
  .sidebar {
    display: none;
  }
}
</style>

