<template>
  <AppLayout>
    <div class="profile-page">
      <div class="profile-header">
        <h1>Profile</h1>
      </div>

      <div class="profile-content">
        <Card class="profile-info-card">
          <h2>Account Information</h2>
          <div class="profile-info">
            <div class="profile-avatar">
              <span class="avatar-icon">👤</span>
            </div>
            <div class="profile-details">
              <div class="profile-field">
                <label class="field-label">Name</label>
                <p class="field-value">{{ user?.name || 'N/A' }}</p>
              </div>
              <div class="profile-field">
                <label class="field-label">Email</label>
                <p class="field-value">{{ user?.email || 'N/A' }}</p>
              </div>
            </div>
          </div>
        </Card>

        <Card class="families-card">
          <h2>Your Families</h2>
          <div class="families-list">
            <div
              v-for="family in families"
              :key="family.id"
              class="family-item"
              :class="{ 'active': family.id === activeFamily?.id }"
            >
              <div class="family-item-info">
                <h3>{{ family.name }}</h3>
                <p>{{ family.member_count }} members, {{ family.recipe_count }} recipes</p>
                <p class="family-role">Role: {{ family.role === 'admin' ? 'Admin' : 'Member' }}</p>
              </div>
              <Button
                v-if="family.id !== activeFamily?.id"
                @click="switchFamily(family)"
                variant="outline"
                size="small"
              >
                Switch
              </Button>
              <span v-else class="active-badge">Active</span>
            </div>
          </div>
          <div v-if="families.length === 0" class="no-families">
            <p>You're not a member of any families yet.</p>
            <Button @click="goToFamilyManagement" variant="primary">
              Create or Join a Family
            </Button>
          </div>
        </Card>

        <Card class="account-actions-card">
          <h2>Account Actions</h2>
          <div class="account-actions">
            <Button @click="handleLogout" variant="danger">
              Logout
            </Button>
          </div>
        </Card>
      </div>
    </div>
  </AppLayout>
</template>

<script>
import { authStore } from '../store/auth';
import { familyStore } from '../store/family';
import AppLayout from '../components/layout/AppLayout.vue';
import Button from '../components/common/Button.vue';
import Card from '../components/common/Card.vue';

export default {
  name: 'Profile',
  components: {
    AppLayout,
    Button,
    Card
  },
  data() {
    return {
      families: []
    };
  },
  computed: {
    user() {
      return authStore.user;
    },
    activeFamily() {
      return familyStore.activeFamily;
    }
  },
  async mounted() {
    await this.loadFamilies();
  },
  methods: {
    async loadFamilies() {
      try {
        const families = await familyStore.fetchFamilies();
        this.families = families;
      } catch (error) {
        console.error('Failed to load families:', error);
      }
    },
    async switchFamily(family) {
      familyStore.setActiveFamily(family);
      if (this.$toast) {
        this.$toast.success(`Switched to ${family.name}`);
      }
      this.$router.push({ name: 'Dashboard' });
    },
    goToFamilyManagement() {
      this.$router.push({ name: 'FamilyManagement' });
    },
    async handleLogout() {
      if (confirm('Are you sure you want to logout?')) {
        try {
          await authStore.logout();
          this.$router.push({ name: 'Landing' });
        } catch (error) {
          console.error('Logout error:', error);
        }
      }
    }
  }
};
</script>

<style scoped>
.profile-page {
  max-width: 900px;
  margin: 0 auto;
  padding: var(--spacing-md);
}

.profile-header {
  margin-bottom: var(--spacing-lg);
}

.profile-header h1 {
  font-size: var(--font-size-2xl);
  font-weight: 700;
  color: var(--color-primary);
  margin: 0;
}

.profile-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.profile-info-card,
.families-card,
.account-actions-card {
  padding: var(--spacing-lg);
}

.profile-info-card h2,
.families-card h2,
.account-actions-card h2 {
  font-size: var(--font-size-xl);
  font-weight: 600;
  color: var(--color-primary);
  margin: 0 0 var(--spacing-md) 0;
}

.profile-info {
  display: flex;
  gap: var(--spacing-lg);
  align-items: flex-start;
}

.profile-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background-color: var(--color-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.avatar-icon {
  font-size: 48px;
}

.profile-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.profile-field {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.field-label {
  font-size: var(--font-size-sm);
  font-weight: 500;
  color: var(--color-text-light);
}

.field-value {
  font-size: var(--font-size-md);
  color: var(--color-text);
  margin: 0;
}

.families-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.family-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md);
  background-color: var(--color-background);
  border-radius: var(--radius-md);
  border: 2px solid var(--color-border);
  transition: all 0.2s;
}

.family-item.active {
  border-color: var(--color-primary);
  background-color: rgba(139, 69, 19, 0.05);
}

.family-item-info h3 {
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--color-primary);
  margin: 0 0 var(--spacing-xs) 0;
}

.family-item-info p {
  font-size: var(--font-size-sm);
  color: var(--color-text-light);
  margin: 0 0 var(--spacing-xs) 0;
}

.family-role {
  font-weight: 500;
  color: var(--color-text);
}

.active-badge {
  padding: var(--spacing-xs) var(--spacing-sm);
  background-color: var(--color-primary);
  color: white;
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  font-weight: 500;
}

.no-families {
  text-align: center;
  padding: var(--spacing-lg);
  color: var(--color-text-light);
}

.no-families p {
  margin-bottom: var(--spacing-md);
}

.account-actions {
  display: flex;
  gap: var(--spacing-md);
  flex-wrap: wrap;
}

@media (max-width: 768px) {
  .profile-info {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .family-item {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-sm);
  }

  .account-actions {
    flex-direction: column;
  }

  .account-actions .btn {
    width: 100%;
  }
}
</style>

