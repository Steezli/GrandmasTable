<template>
  <div class="family-member-list">
    <div
      v-for="member in members"
      :key="member.id"
      class="member-item"
    >
      <div class="member-info">
        <div class="member-avatar">
          <span class="avatar-icon">👤</span>
        </div>
        <div class="member-details">
          <h3 class="member-name">{{ member.name }}</h3>
          <p class="member-email">{{ member.email }}</p>
        </div>
      </div>
      <div class="member-actions">
        <span class="member-role" :class="roleClass(member.role)">
          {{ member.role === 'admin' ? 'Admin' : 'Member' }}
        </span>
        <Button
          v-if="canRemoveMember(member)"
          @click="handleRemoveMember(member)"
          variant="danger"
          size="small"
        >
          Remove
        </Button>
      </div>
    </div>
    <div v-if="members.length === 0" class="no-members">
      <p>No members yet</p>
    </div>
  </div>
</template>

<script>
import { familyService } from '../../services/family';
import Button from '../common/Button.vue';

export default {
  name: 'FamilyMemberList',
  components: {
    Button
  },
  props: {
    members: {
      type: Array,
      required: true,
      default: () => []
    },
    isAdmin: {
      type: Boolean,
      default: false
    },
    currentUserId: {
      type: Number,
      default: null
    },
    familyId: {
      type: Number,
      default: null
    }
  },
  emits: ['member-removed'],
  methods: {
    roleClass(role) {
      return role === 'admin' ? 'role-admin' : 'role-member';
    },
    canRemoveMember(member) {
      // Can remove if:
      // - Current user is admin AND member is not current user
      // - OR current user is removing themselves
      const memberUserId = member.user_id || member.id;
      if (!this.isAdmin && memberUserId !== this.currentUserId) {
        return false;
      }
      // Admins can't remove themselves
      if (this.isAdmin && memberUserId === this.currentUserId && member.role === 'admin') {
        return false;
      }
      return true;
    },
    async handleRemoveMember(member) {
      const memberUserId = member.user_id || member.id;
      const isSelf = memberUserId === this.currentUserId;
      const message = isSelf
        ? 'Are you sure you want to leave this family?'
        : `Are you sure you want to remove ${member.name} from this family?`;

      if (!confirm(message)) {
        return;
      }

      try {
        // Get family ID from prop or parent component
        const familyId = this.familyId || this.$parent.activeFamily?.id;
        const memberUserId = member.user_id || member.id;
        await familyService.removeMember(familyId, memberUserId);
        if (this.$toast) {
          this.$toast.success(isSelf ? 'Left family successfully' : 'Member removed successfully');
        }
        this.$emit('member-removed');
      } catch (error) {
        if (this.$toast) {
          this.$toast.error(error.message || 'Failed to remove member');
        }
      }
    }
  }
};
</script>

<style scoped>
.family-member-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.member-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md);
  background-color: var(--color-background);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  transition: all 0.2s;
}

.member-item:hover {
  border-color: var(--color-primary);
  box-shadow: var(--shadow-sm);
}

.member-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  flex: 1;
}

.member-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-color: var(--color-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.avatar-icon {
  font-size: var(--font-size-xl);
}

.member-details {
  flex: 1;
  min-width: 0;
}

.member-name {
  font-size: var(--font-size-md);
  font-weight: 600;
  color: var(--color-text);
  margin: 0 0 var(--spacing-xs) 0;
}

.member-email {
  font-size: var(--font-size-sm);
  color: var(--color-text-light);
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.member-actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.member-role {
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-md);
  font-size: var(--font-size-xs);
  font-weight: 500;
}

.role-admin {
  background-color: rgba(139, 69, 19, 0.1);
  color: var(--color-primary);
}

.role-member {
  background-color: rgba(0, 0, 0, 0.05);
  color: var(--color-text-light);
}

.no-members {
  padding: var(--spacing-lg);
  text-align: center;
  color: var(--color-text-light);
  font-style: italic;
}

@media (max-width: 768px) {
  .member-item {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-md);
  }

  .member-actions {
    width: 100%;
    justify-content: space-between;
  }
}
</style>

