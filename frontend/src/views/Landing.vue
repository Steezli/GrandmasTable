<template>
  <div class="landing">
    <div class="landing-hero">
      <h1 class="hero-title">Grandma's Table</h1>
      <p class="hero-subtitle">Share your family recipes. Keep them private, or share with the world.</p>
      <div class="hero-actions">
        <router-link to="/register" class="btn btn-primary btn-large">Get Started</router-link>
        <router-link to="/login" class="btn btn-outline btn-large">Sign In</router-link>
      </div>
    </div>
    <div class="landing-features">
      <div class="feature">
        <div class="feature-icon">👨‍👩‍👧‍👦</div>
        <h3>Family Sharing</h3>
        <p>Share recipes with your family members in private groups.</p>
      </div>
      <div class="feature">
        <div class="feature-icon">🔒</div>
        <h3>Private & Secure</h3>
        <p>Keep your family recipes private, or share them publicly when ready.</p>
      </div>
      <div class="feature">
        <div class="feature-icon">📸</div>
        <h3>Rich Recipes</h3>
        <p>Add photos, stories, and memories to your recipes.</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Landing'
};
</script>

<style scoped>
.landing {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-xl);
  background: linear-gradient(135deg, var(--color-background) 0%, var(--color-surface) 100%);
}

.landing-hero {
  text-align: center;
  max-width: 600px;
  margin-bottom: var(--spacing-xl);
}

.hero-title {
  font-size: var(--font-size-2xl);
  font-weight: 700;
  color: var(--color-primary);
  margin-bottom: var(--spacing-md);
}

.hero-subtitle {
  font-size: var(--font-size-lg);
  color: var(--color-text-light);
  margin-bottom: var(--spacing-lg);
  line-height: 1.6;
}

.hero-actions {
  display: flex;
  gap: var(--spacing-md);
  justify-content: center;
  flex-wrap: wrap;
}

.landing-features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--spacing-lg);
  max-width: 1000px;
  width: 100%;
  margin-top: var(--spacing-xl);
}

.feature {
  text-align: center;
  padding: var(--spacing-lg);
  background-color: var(--color-surface);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
}

.feature-icon {
  font-size: 48px;
  margin-bottom: var(--spacing-md);
}

.feature h3 {
  font-size: var(--font-size-lg);
  color: var(--color-primary);
  margin-bottom: var(--spacing-sm);
}

.feature p {
  color: var(--color-text-light);
  line-height: 1.6;
}

@media (max-width: 768px) {
  .hero-title {
    font-size: var(--font-size-xl);
  }

  .hero-subtitle {
    font-size: var(--font-size-md);
  }

  .hero-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .hero-actions .btn {
    width: 100%;
  }
}
</style>

