<template>
  <div class="app-layout">
    <Header />
    <div class="layout-content">
      <Sidebar />
      <main class="main-content">
        <slot></slot>
      </main>
    </div>
    <Navigation />
  </div>
</template>

<script>
import Header from './Header.vue';
import Sidebar from './Sidebar.vue';
import Navigation from './Navigation.vue';

export default {
  name: 'AppLayout',
  components: {
    Header,
    Sidebar,
    Navigation
  }
};
</script>

<style scoped>
.app-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.layout-content {
  display: flex;
  flex: 1;
  padding-bottom: 80px; /* Space for bottom nav on mobile */
}

.main-content {
  flex: 1;
  padding: var(--spacing-md);
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
}

@media (max-width: 1024px) {
  .layout-content {
    padding-bottom: 80px;
  }
}

@media (min-width: 1025px) {
  .layout-content {
    padding-bottom: 0;
  }
}
</style>

