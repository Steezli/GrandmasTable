<template>
  <div class="toast-container">
    <Toast
      v-for="toast in toasts"
      :key="toast.id"
      :message="toast.message"
      :variant="toast.variant"
      @close="removeToast(toast.id)"
    />
  </div>
</template>

<script>
import { getCurrentInstance } from 'vue';
import Toast from './Toast.vue';

export default {
  name: 'ToastContainer',
  components: {
    Toast
  },
  data() {
    return {
      toasts: []
    };
  },
  methods: {
    addToast(message, variant = 'info') {
      const id = Date.now();
      this.toasts.push({ id, message, variant });
      return id;
    },
    removeToast(id) {
      const index = this.toasts.findIndex(t => t.id === id);
      if (index > -1) {
        this.toasts.splice(index, 1);
      }
    },
    success(message) {
      return this.addToast(message, 'success');
    },
    error(message) {
      return this.addToast(message, 'error');
    },
    info(message) {
      return this.addToast(message, 'info');
    },
    warning(message) {
      return this.addToast(message, 'warning');
    }
  },
  mounted() {
    // Make toast methods available globally via Vue's global properties
    // This is set up in App.vue, but we also ensure it's available here
    const instance = getCurrentInstance();
    if (instance && instance.appContext) {
      instance.appContext.config.globalProperties.$toast = {
        success: this.success.bind(this),
        error: this.error.bind(this),
        info: this.info.bind(this),
        warning: this.warning.bind(this)
      };
    }
  }
};
</script>

<style scoped>
.toast-container {
  position: fixed;
  top: var(--spacing-md);
  right: var(--spacing-md);
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  pointer-events: none;
}

.toast-container > * {
  pointer-events: auto;
}
</style>

