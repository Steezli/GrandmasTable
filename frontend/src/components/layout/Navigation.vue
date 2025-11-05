<template>
  <nav class="bottom-nav" v-if="isAuthenticated">
    <router-link to="/dashboard" class="nav-item" active-class="nav-item-active">
      <span class="nav-icon">📖</span>
      <span class="nav-text">Recipes</span>
    </router-link>
    <router-link to="/recipes/new" class="nav-item-add">
      <span class="nav-icon-add">➕</span>
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
</template>

<script>
import { authStore } from '../../store/auth';

export default {
  name: 'Navigation',
  computed: {
    isAuthenticated() {
      return authStore.isAuthenticated;
    }
  }
};
</script>

<style scoped>
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: var(--color-surface);
  border-top: 1px solid var(--color-border);
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: var(--spacing-xs) 0;
  z-index: 100;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-xs);
  text-decoration: none;
  color: var(--color-text-light);
  transition: color 0.2s;
  flex: 1;
  max-width: 100px;
}

.nav-item:hover {
  color: var(--color-primary);
}

.nav-item-active {
  color: var(--color-primary);
}

.nav-icon {
  font-size: var(--font-size-xl);
}

.nav-text {
  font-size: var(--font-size-xs);
  font-weight: 500;
}

.nav-item-add {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  background-color: var(--color-primary);
  color: white;
  border-radius: 50%;
  text-decoration: none;
  box-shadow: var(--shadow-md);
  margin-bottom: var(--spacing-md);
  transition: transform 0.2s;
}

.nav-item-add:hover {
  transform: scale(1.1);
}

.nav-icon-add {
  font-size: var(--font-size-2xl);
}

@media (min-width: 1025px) {
  .bottom-nav {
    display: none;
  }
}
</style>

