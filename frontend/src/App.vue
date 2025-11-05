<template>
  <div id="app">
    <router-view />
    <ToastContainer ref="toastContainer" />
  </div>
</template>

<script>
import { getCurrentInstance } from 'vue';
import ToastContainer from './components/common/ToastContainer.vue';

export default {
  name: 'App',
  components: {
    ToastContainer
  },
  provide() {
    // Provide toast methods to all child components
    return {
      getToast: () => this.$refs.toastContainer
    };
  },
  mounted() {
    // Make toast methods available globally via $toast for backward compatibility
    this.$nextTick(() => {
      if (this.$refs.toastContainer) {
        // Make toast available on the app instance
        this.$toast = this.$refs.toastContainer;
        // Also make it available on Vue's global properties
        const instance = getCurrentInstance();
        if (instance && instance.appContext) {
          instance.appContext.config.globalProperties.$toast = this.$refs.toastContainer;
        }
      }
    });
  }
};
</script>

<style>
#app {
  min-height: 100vh;
}
</style>

