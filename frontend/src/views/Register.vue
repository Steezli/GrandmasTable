<template>
  <div class="register-page">
    <div class="register-container">
      <Card class="register-card">
        <h1 class="register-title">Sign Up</h1>
        <p class="register-subtitle">Create your account to get started</p>
        
        <form @submit.prevent="handleRegister" class="register-form">
          <Input
            v-model="name"
            label="Name"
            type="text"
            placeholder="Enter your name"
            required
            :error="errors.name"
            @blur="validateName"
          />
          
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
            placeholder="Enter your password (min 8 characters)"
            required
            :error="errors.password"
            @blur="validatePassword"
          />
          
          <Input
            v-model="confirmPassword"
            label="Confirm Password"
            type="password"
            placeholder="Confirm your password"
            required
            :error="errors.confirmPassword"
            @blur="validateConfirmPassword"
          />
          
          <div v-if="error" class="error-message">
            {{ error }}
          </div>
          
          <Button
            type="submit"
            :loading="loading"
            class="register-button"
          >
            Create Account
          </Button>
        </form>
        
        <div class="register-footer">
          <p>
            Already have an account?
            <router-link to="/login" class="link">Sign in</router-link>
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
  name: 'Register',
  components: {
    Button,
    Input,
    Card
  },
  data() {
    return {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      loading: false,
      error: '',
      errors: {
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
      }
    };
  },
  methods: {
    validateName() {
      if (!this.name) {
        this.errors.name = 'Name is required';
      } else if (this.name.length < 1 || this.name.length > 255) {
        this.errors.name = 'Name must be between 1 and 255 characters';
      } else {
        this.errors.name = '';
      }
    },
    validateEmail() {
      if (!this.email) {
        this.errors.email = 'Email is required';
      } else if (!validation.email(this.email)) {
        this.errors.email = 'Please enter a valid email address';
      } else {
        this.errors.email = '';
      }
    },
    validatePassword() {
      if (!this.password) {
        this.errors.password = 'Password is required';
      } else if (!validation.password(this.password)) {
        this.errors.password = 'Password must be at least 8 characters';
      } else {
        this.errors.password = '';
      }
      
      // Re-validate confirm password if it's been set
      if (this.confirmPassword) {
        this.validateConfirmPassword();
      }
    },
    validateConfirmPassword() {
      if (!this.confirmPassword) {
        this.errors.confirmPassword = 'Please confirm your password';
      } else if (this.password !== this.confirmPassword) {
        this.errors.confirmPassword = 'Passwords do not match';
      } else {
        this.errors.confirmPassword = '';
      }
    },
    async handleRegister() {
      // Reset errors
      this.error = '';
      this.errors = {
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
      };
      
      // Validate all fields
      this.validateName();
      this.validateEmail();
      this.validatePassword();
      this.validateConfirmPassword();
      
      // Check if there are any errors
      if (Object.values(this.errors).some(err => err)) {
        return;
      }
      
      this.loading = true;
      
      try {
        await authStore.register({
          name: this.name,
          email: this.email,
          password: this.password
        });
        
        // Redirect to dashboard
        this.$router.push('/dashboard');
        
        if (this.$toast) {
          this.$toast.success('Account created successfully!');
        }
      } catch (error) {
        this.error = error.message || 'Failed to create account';
        if (error.code === 'CONFLICT') {
          this.errors.email = 'This email is already registered';
        }
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
.register-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-md);
  background: linear-gradient(135deg, var(--color-background) 0%, var(--color-surface) 100%);
}

.register-container {
  width: 100%;
  max-width: 400px;
}

.register-card {
  padding: var(--spacing-xl);
}

.register-title {
  font-size: var(--font-size-2xl);
  font-weight: 700;
  color: var(--color-primary);
  margin-bottom: var(--spacing-xs);
  text-align: center;
}

.register-subtitle {
  color: var(--color-text-light);
  text-align: center;
  margin-bottom: var(--spacing-lg);
}

.register-form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.register-button {
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

.register-footer {
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

