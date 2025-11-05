<template>
  <AppLayout>
    <div class="family-management">
      <div class="management-header">
        <h1>Family Management</h1>
      </div>

      <div v-if="loading" class="loading-state">
        <LoadingSpinner message="Loading family..." centered />
      </div>

      <div v-else-if="error" class="error-state">
        <Card>
          <p class="error-message">{{ error }}</p>
          <Button @click="loadFamily">Try Again</Button>
        </Card>
      </div>

      <div v-else-if="activeFamily" class="family-content">
        <Card class="family-info-card">
          <div class="family-info-header">
            <h2>{{ activeFamily.name }}</h2>
            <Button
              v-if="isAdmin"
              @click="toggleEditName"
              variant="outline"
              size="small"
            >
              {{ editingName ? 'Cancel' : 'Edit Name' }}
            </Button>
          </div>

          <div v-if="editingName" class="family-name-edit">
            <Input
              v-model="familyNameInput"
              label="Family Name"
              placeholder="Enter family name"
              required
              :error="nameError"
            />
            <div class="edit-actions">
              <Button @click="saveFamilyName" :loading="savingName" variant="primary" size="small">
                Save
              </Button>
              <Button @click="toggleEditName" variant="outline" size="small">Cancel</Button>
            </div>
          </div>

          <div class="family-stats">
            <div class="stat">
              <span class="stat-label">Members:</span>
              <span class="stat-value">{{ memberCount }}</span>
            </div>
            <div class="stat">
              <span class="stat-label">Recipes:</span>
              <span class="stat-value">{{ recipeCount }}</span>
            </div>
          </div>
        </Card>

        <Card class="members-card">
          <div class="members-header">
            <h2>Family Members</h2>
            <Button
              v-if="isAdmin"
              @click="showInviteForm = !showInviteForm"
              variant="primary"
              size="small"
            >
              {{ showInviteForm ? 'Cancel' : 'Invite Member' }}
            </Button>
          </div>

          <InviteForm
            v-if="showInviteForm && isAdmin"
            :family-id="activeFamily.id"
            @invite-sent="handleInviteSent"
          />

          <FamilyMemberList
            :members="members"
            :is-admin="isAdmin"
            :current-user-id="currentUserId"
            :family-id="activeFamily.id"
            @member-removed="handleMemberRemoved"
          />
        </Card>

        <Card class="join-family-card">
          <h2>Join Another Family</h2>
          <p>Enter an invite code to join another family</p>
          <div class="join-form">
            <Input
              v-model="inviteCode"
              placeholder="Enter invite code"
              class="invite-code-input"
            />
            <Button @click="handleJoinFamily" :loading="joiningFamily" variant="primary">
              Join Family
            </Button>
          </div>
        </Card>

        <Card class="families-list-card">
          <h2>Your Families</h2>
          <div class="families-list">
            <div
              v-for="family in families"
              :key="family.id"
              class="family-item"
              :class="{ 'active': family.id === activeFamily.id }"
            >
              <div class="family-item-info">
                <h3>{{ family.name }}</h3>
                <p>{{ family.member_count }} members, {{ family.recipe_count }} recipes</p>
              </div>
              <Button
                v-if="family.id !== activeFamily.id"
                @click="switchFamily(family)"
                variant="outline"
                size="small"
              >
                Switch
              </Button>
              <span v-else class="active-badge">Active</span>
            </div>
          </div>
        </Card>
      </div>

      <div v-else class="no-family">
        <Card class="no-family-card">
          <h2>No Family Selected</h2>
          <p>Create or join a family to get started!</p>
          <div class="no-family-actions">
            <Button @click="showCreateForm = !showCreateForm" variant="primary">
              {{ showCreateForm ? 'Cancel' : 'Create Family' }}
            </Button>
          </div>
          <div v-if="showCreateForm" class="create-family-form">
            <Input
              v-model="newFamilyName"
              label="Family Name"
              placeholder="Enter family name"
              required
              :error="createError"
            />
            <Button @click="handleCreateFamily" :loading="creatingFamily" variant="primary">
              Create Family
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
import { familyService } from '../services/family';
import AppLayout from '../components/layout/AppLayout.vue';
import Button from '../components/common/Button.vue';
import Input from '../components/common/Input.vue';
import Card from '../components/common/Card.vue';
import LoadingSpinner from '../components/common/LoadingSpinner.vue';
import InviteForm from '../components/family/InviteForm.vue';
import FamilyMemberList from '../components/family/FamilyMemberList.vue';

export default {
  name: 'FamilyManagement',
  components: {
    AppLayout,
    Button,
    Input,
    Card,
    LoadingSpinner,
    InviteForm,
    FamilyMemberList
  },
  data() {
    return {
      activeFamily: null,
      members: [],
      families: [],
      loading: false,
      error: '',
      editingName: false,
      familyNameInput: '',
      nameError: '',
      savingName: false,
      showInviteForm: false,
      inviteCode: '',
      joiningFamily: false,
      showCreateForm: false,
      newFamilyName: '',
      createError: '',
      creatingFamily: false
    };
  },
  computed: {
    currentUserId() {
      return authStore.user?.id;
    },
    isAdmin() {
      if (!this.activeFamily || !this.members) return false;
      const currentMember = this.members.find(m => m.user_id === this.currentUserId);
      return currentMember?.role === 'admin';
    },
    memberCount() {
      return this.members?.length || 0;
    },
    recipeCount() {
      return this.activeFamily?.recipe_count || 0;
    }
  },
  async mounted() {
    await this.loadFamilies();
    if (familyStore.activeFamily) {
      await this.loadFamily();
    }
  },
  methods: {
    async loadFamilies() {
      try {
        const families = await familyStore.fetchFamilies();
        this.families = families;
        if (families.length > 0 && !familyStore.activeFamily) {
          familyStore.setActiveFamily(families[0]);
        }
        if (familyStore.activeFamily) {
          this.activeFamily = familyStore.activeFamily;
        }
      } catch (error) {
        this.error = error.message || 'Failed to load families';
      }
    },
    async loadFamily() {
      if (!this.activeFamily) {
        this.activeFamily = familyStore.activeFamily;
      }
      if (!this.activeFamily) return;

      this.loading = true;
      this.error = '';

      try {
        const family = await familyService.getFamily(this.activeFamily.id);
        this.activeFamily = family;
        this.members = family.members || [];
      } catch (error) {
        this.error = error.message || 'Failed to load family';
        if (this.$toast) {
          this.$toast.error(this.error);
        }
      } finally {
        this.loading = false;
      }
    },
    toggleEditName() {
      this.editingName = !this.editingName;
      if (this.editingName) {
        this.familyNameInput = this.activeFamily.name;
        this.nameError = '';
      }
    },
    async saveFamilyName() {
      if (!this.familyNameInput || this.familyNameInput.trim().length === 0) {
        this.nameError = 'Family name is required';
        return;
      }

      if (this.familyNameInput.length > 255) {
        this.nameError = 'Family name must be 255 characters or less';
        return;
      }

      this.savingName = true;
      this.nameError = '';

      try {
        const updated = await familyService.updateFamily(this.activeFamily.id, {
          name: this.familyNameInput.trim()
        });
        this.activeFamily.name = updated.name;
        this.editingName = false;
        if (this.$toast) {
          this.$toast.success('Family name updated');
        }
      } catch (error) {
        this.nameError = error.message || 'Failed to update family name';
        if (this.$toast) {
          this.$toast.error(this.nameError);
        }
      } finally {
        this.savingName = false;
      }
    },
    async handleJoinFamily() {
      if (!this.inviteCode || this.inviteCode.trim().length === 0) {
        if (this.$toast) {
          this.$toast.error('Please enter an invite code');
        }
        return;
      }

      this.joiningFamily = true;

      try {
        await familyStore.joinFamily(this.inviteCode.trim());
        this.inviteCode = '';
        await this.loadFamilies();
        if (this.$toast) {
          this.$toast.success('Joined family successfully!');
        }
      } catch (error) {
        const errorMsg = error.message || 'Failed to join family';
        if (this.$toast) {
          this.$toast.error(errorMsg);
        }
      } finally {
        this.joiningFamily = false;
      }
    },
    async handleCreateFamily() {
      if (!this.newFamilyName || this.newFamilyName.trim().length === 0) {
        this.createError = 'Family name is required';
        return;
      }

      if (this.newFamilyName.length > 255) {
        this.createError = 'Family name must be 255 characters or less';
        return;
      }

      this.creatingFamily = true;
      this.createError = '';

      try {
        await familyStore.createFamily({ name: this.newFamilyName.trim() });
        this.newFamilyName = '';
        this.showCreateForm = false;
        await this.loadFamilies();
        if (this.$toast) {
          this.$toast.success('Family created successfully!');
        }
      } catch (error) {
        this.createError = error.message || 'Failed to create family';
        if (this.$toast) {
          this.$toast.error(this.createError);
        }
      } finally {
        this.creatingFamily = false;
      }
    },
    async switchFamily(family) {
      familyStore.setActiveFamily(family);
      this.activeFamily = family;
      await this.loadFamily();
      if (this.$toast) {
        this.$toast.success(`Switched to ${family.name}`);
      }
    },
    handleInviteSent() {
      this.showInviteForm = false;
    },
    async handleMemberRemoved() {
      await this.loadFamily();
    }
  }
};
</script>

<style scoped>
.family-management {
  max-width: 1000px;
  margin: 0 auto;
  padding: var(--spacing-md);
}

.management-header {
  margin-bottom: var(--spacing-lg);
}

.management-header h1 {
  font-size: var(--font-size-2xl);
  font-weight: 700;
  color: var(--color-primary);
  margin: 0;
}

.loading-state,
.error-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

.error-message {
  color: var(--color-error);
  margin-bottom: var(--spacing-md);
  text-align: center;
}

.family-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.family-info-card {
  padding: var(--spacing-lg);
}

.family-info-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
  flex-wrap: wrap;
  gap: var(--spacing-md);
}

.family-info-header h2 {
  font-size: var(--font-size-xl);
  font-weight: 600;
  color: var(--color-primary);
  margin: 0;
}

.family-name-edit {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  margin-top: var(--spacing-md);
}

.edit-actions {
  display: flex;
  gap: var(--spacing-sm);
}

.family-stats {
  display: flex;
  gap: var(--spacing-lg);
  margin-top: var(--spacing-md);
}

.stat {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.stat-label {
  font-size: var(--font-size-sm);
  color: var(--color-text-light);
}

.stat-value {
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--color-primary);
}

.members-card {
  padding: var(--spacing-lg);
}

.members-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
  flex-wrap: wrap;
  gap: var(--spacing-md);
}

.members-header h2 {
  font-size: var(--font-size-xl);
  font-weight: 600;
  color: var(--color-primary);
  margin: 0;
}

.join-family-card,
.families-list-card {
  padding: var(--spacing-lg);
}

.join-family-card h2,
.families-list-card h2 {
  font-size: var(--font-size-xl);
  font-weight: 600;
  color: var(--color-primary);
  margin: 0 0 var(--spacing-sm) 0;
}

.join-family-card p {
  color: var(--color-text-light);
  margin-bottom: var(--spacing-md);
}

.join-form {
  display: flex;
  gap: var(--spacing-md);
  flex-wrap: wrap;
}

.invite-code-input {
  flex: 1;
  min-width: 200px;
}

.families-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  margin-top: var(--spacing-md);
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
  margin: 0;
}

.active-badge {
  padding: var(--spacing-xs) var(--spacing-sm);
  background-color: var(--color-primary);
  color: white;
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  font-weight: 500;
}

.no-family {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

.no-family-card {
  max-width: 500px;
  padding: var(--spacing-xl);
  text-align: center;
}

.no-family-card h2 {
  color: var(--color-primary);
  margin-bottom: var(--spacing-md);
}

.no-family-card p {
  color: var(--color-text-light);
  margin-bottom: var(--spacing-lg);
}

.no-family-actions {
  display: flex;
  justify-content: center;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
}

.create-family-form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  margin-top: var(--spacing-md);
  padding-top: var(--spacing-md);
  border-top: 1px solid var(--color-border);
}

@media (max-width: 768px) {
  .family-info-header,
  .members-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .join-form {
    flex-direction: column;
  }

  .invite-code-input {
    width: 100%;
  }

  .family-item {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-sm);
  }
}
</style>

