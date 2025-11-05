<template>
  <div id="app">
    <router-view />
    <ToastContainer ref="toastContainer" />
  </div>
</template>

<script>
import ToastContainer from './components/common/ToastContainer.vue';

export default {
  name: 'App',
  components: {
    ToastContainer
  },
  mounted() {
    // Make toast methods available via $toast
    this.$nextTick(() => {
      if (this.$refs.toastContainer) {
        this.$toast = this.$refs.toastContainer;
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

