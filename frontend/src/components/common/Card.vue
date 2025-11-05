<template>
  <div :class="cardClass">
    <slot></slot>
  </div>
</template>

<script>
export default {
  name: 'Card',
  props: {
    hover: {
      type: Boolean,
      default: false
    },
    padding: {
      type: String,
      default: 'medium',
      validator: (value) => ['none', 'small', 'medium', 'large'].includes(value)
    }
  },
  computed: {
    cardClass() {
      return [
        'card',
        `card-padding-${this.padding}`,
        {
          'card-hover': this.hover
        }
      ];
    }
  }
};
</script>

<style scoped>
.card {
  background-color: var(--color-surface);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  transition: box-shadow 0.2s;
}

.card-padding-none {
  padding: 0;
}

.card-padding-small {
  padding: var(--spacing-sm);
}

.card-padding-medium {
  padding: var(--spacing-md);
}

.card-padding-large {
  padding: var(--spacing-lg);
}

.card-hover:hover {
  box-shadow: var(--shadow-md);
  cursor: pointer;
}
</style>

