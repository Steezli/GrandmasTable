<template>
  <header class="header">
    <div class="header-content">
      <div class="header-left">
        <router-link to="/dashboard" class="logo">
          <h1>Grandma's Table</h1>
        </router-link>
      </div>
      <div class="header-right">
        <nav v-if="isAuthenticated" class="header-nav">
          <FamilySelector v-if="isAuthenticated" />
        </nav>
        <div v-if="isAuthenticated" class="user-menu">
          <button class="user-menu-button" @click="toggleMenu">
            <span class="user-name">{{ user?.name || 'User' }}</span>
            <span class="menu-icon">▼</span>
          </button>
          <div v-if="showMenu" class="user-menu-dropdown">
            <router-link to="/profile" class="menu-item" @click="closeMenu">Profile</router-link>
            <router-link to="/family" class="menu-item" @click="closeMenu">Family</router-link>
            <button class="menu-item menu-item-button" @click="handleLogout">Logout</button>
          </div>
        </div>
        <div v-else class="auth-links">
          <router-link to="/login" class="btn btn-outline btn-small">Login</router-link>
          <router-link to="/register" class="btn btn-primary btn-small">Sign Up</router-link>
        </div>
      </div>
    </div>
  </header>
</template>

<script>
import { authStore } from '../../store/auth';
import FamilySelector from '../family/FamilySelector.vue';

export default {
  name: 'Header',
  components: {
    FamilySelector
  },
  data() {
    return {
      showMenu: false
    };
  },
  computed: {
    isAuthenticated() {
      return authStore.isAuthenticated;
    },
    user() {
      return authStore.user;
    }
  },
  methods: {
    toggleMenu() {
      this.showMenu = !this.showMenu;
    },
    closeMenu() {
      this.showMenu = false;
    },
    async handleLogout() {
      try {
        await authStore.logout();
        this.$router.push({ name: 'Landing' });
        this.closeMenu();
      } catch (error) {
        console.error('Logout error:', error);
      }
    }
  },
  mounted() {
    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!this.$el.contains(e.target)) {
        this.showMenu = false;
      }
    });
  }
};
</script>

<style scoped>
.header {
  background-color: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  box-shadow: var(--shadow-sm);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--spacing-md) var(--spacing-md);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  flex: 1;
}

.logo {
  text-decoration: none;
  color: var(--color-primary);
}

.logo h1 {
  font-size: var(--font-size-xl);
  font-weight: 600;
  margin: 0;
}

.header-right {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.header-nav {
  display: flex;
  align-items: center;
}

.user-menu {
  position: relative;
}

.user-menu-button {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-xs) var(--spacing-sm);
  background: none;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  cursor: pointer;
  font-family: var(--font-family);
  font-size: var(--font-size-md);
  color: var(--color-text);
}

.user-name {
  font-weight: 500;
}

.menu-icon {
  font-size: var(--font-size-xs);
  transition: transform 0.2s;
}

.user-menu-button:hover .menu-icon {
  transform: rotate(180deg);
}

.user-menu-dropdown {
  position: absolute;
  top: calc(100% + var(--spacing-xs));
  right: 0;
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-md);
  min-width: 150px;
  overflow: hidden;
}

.menu-item {
  display: block;
  padding: var(--spacing-sm) var(--spacing-md);
  text-decoration: none;
  color: var(--color-text);
  transition: background-color 0.2s;
  border: none;
  width: 100%;
  text-align: left;
  font-family: var(--font-family);
  font-size: var(--font-size-md);
  cursor: pointer;
  background: none;
}

.menu-item:hover {
  background-color: var(--color-background);
}

.menu-item-button {
  border-top: 1px solid var(--color-border);
  color: var(--color-error);
}

.auth-links {
  display: flex;
  gap: var(--spacing-sm);
}

@media (max-width: 768px) {
  .header-content {
    padding: var(--spacing-sm) var(--spacing-md);
  }

  .logo h1 {
    font-size: var(--font-size-lg);
  }

  .header-nav {
    display: none;
  }
}
</style>

