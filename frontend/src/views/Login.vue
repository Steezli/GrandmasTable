<template>
  <div class="login-page">
    <div class="login-container">
      <Card class="login-card">
        <h1 class="login-title">Sign In</h1>
        <p class="login-subtitle">Welcome back to Grandma's Table</p>
        
        <form @submit.prevent="handleLogin" class="login-form">
          <Input
            v-model="email"
            label="Email"
            type="email"
            placeholder="Enter your email"
            required
            :error="errors.email"
            @blur="validateEmail"
          />
          
          <Input
            v-model="password"
            label="Password"
            type="password"
            placeholder="Enter your password"
            required
            :error="errors.password"
          />
          
          <div v-if="error" class="error-message">
            {{ error }}
          </div>
          
          <Button
            type="submit"
            :loading="loading"
            class="login-button"
          >
            Sign In
          </Button>
        </form>
        
        <div class="login-footer">
          <p>
            Don't have an account?
            <router-link to="/register" class="link">Sign up</router-link>
          </p>
        </div>
      </Card>
    </div>
  </div>
</template>

<script>
import { authStore } from '../store/auth';
import { validation } from '../utils/validation';
import Button from '../components/common/Button.vue';
import Input from '../components/common/Input.vue';
import Card from '../components/common/Card.vue';

export default {
  name: 'Login',
  components: {
    Button,
    Input,
    Card
  },
  data() {
    return {
      email: '',
      password: '',
      loading: false,
      error: '',
      errors: {
        email: '',
        password: ''
      }
    };
  },
  methods: {
    validateEmail() {
      if (!this.email) {
        this.errors.email = 'Email is required';
      } else if (!validation.email(this.email)) {
        this.errors.email = 'Please enter a valid email address';
      } else {
        this.errors.email = '';
      }
    },
    async handleLogin() {
      // Reset errors
      this.error = '';
      this.errors = { email: '', password: '' };
      
      // Validate
      this.validateEmail();
      
      if (!this.password) {
        this.errors.password = 'Password is required';
        return;
      }
      
      if (this.errors.email) {
        return;
      }
      
      this.loading = true;
      
      try {
        await authStore.login({
          email: this.email,
          password: this.password
        });
        
        // Redirect to dashboard or previous route
        const redirect = this.$route.query.redirect || '/dashboard';
        this.$router.push(redirect);
        
        if (this.$toast) {
          this.$toast.success('Welcome back!');
        }
      } catch (error) {
        this.error = error.message || 'Invalid email or password';
        if (this.$toast) {
          this.$toast.error(this.error);
        }
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-md);
  background: linear-gradient(135deg, var(--color-background) 0%, var(--color-surface) 100%);
}

.login-container {
  width: 100%;
  max-width: 400px;
}

.login-card {
  padding: var(--spacing-xl);
}

.login-title {
  font-size: var(--font-size-2xl);
  font-weight: 700;
  color: var(--color-primary);
  margin-bottom: var(--spacing-xs);
  text-align: center;
}

.login-subtitle {
  color: var(--color-text-light);
  text-align: center;
  margin-bottom: var(--spacing-lg);
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.login-button {
  width: 100%;
  margin-top: var(--spacing-sm);
}

.error-message {
  padding: var(--spacing-sm);
  background-color: #fee;
  border: 1px solid var(--color-error);
  border-radius: var(--radius-md);
  color: var(--color-error);
  font-size: var(--font-size-sm);
  text-align: center;
}

.login-footer {
  margin-top: var(--spacing-lg);
  text-align: center;
  color: var(--color-text-light);
  font-size: var(--font-size-sm);
}

.link {
  color: var(--color-primary);
  text-decoration: none;
  font-weight: 500;
}

.link:hover {
  text-decoration: underline;
}
</style>

