<template>
  <div class="invite-form">
    <div class="invite-tabs">
      <button
        :class="['tab', { active: activeTab === 'email' }]"
        @click="activeTab = 'email'"
      >
        Email Invite
      </button>
      <button
        :class="['tab', { active: activeTab === 'code' }]"
        @click="activeTab = 'code'"
      >
        Invite Code
      </button>
    </div>

    <div v-if="activeTab === 'email'" class="email-invite">
      <Input
        v-model="email"
        label="Email Address"
        type="email"
        placeholder="Enter email address"
        required
        :error="emailError"
      />
      <Button @click="handleEmailInvite" :loading="sendingEmail" variant="primary">
        Send Invite
      </Button>
    </div>

    <div v-if="activeTab === 'code'" class="code-invite">
      <Button @click="generateInviteLink" :loading="generatingLink" variant="primary">
        Generate Invite Link
      </Button>
      <div v-if="inviteLink" class="invite-link-display">
        <p class="invite-label">Invite Link:</p>
        <div class="invite-link-container">
          <input :value="inviteLink" readonly class="invite-link-input" />
          <Button @click="copyLink" variant="outline" size="small">
            {{ copied ? 'Copied!' : 'Copy' }}
          </Button>
        </div>
        <p class="invite-code-label">Or share this invite code:</p>
        <div class="invite-code-container">
          <input :value="inviteCode" readonly class="invite-code-input" />
          <Button @click="copyCode" variant="outline" size="small">
            {{ copiedCode ? 'Copied!' : 'Copy' }}
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { familyService } from '../../services/family';
import Input from '../common/Input.vue';
import Button from '../common/Button.vue';

export default {
  name: 'InviteForm',
  components: {
    Input,
    Button
  },
  props: {
    familyId: {
      type: Number,
      required: true
    }
  },
  emits: ['invite-sent'],
  data() {
    return {
      activeTab: 'code',
      email: '',
      emailError: '',
      sendingEmail: false,
      generatingLink: false,
      inviteLink: '',
      inviteCode: '',
      copied: false,
      copiedCode: false
    };
  },
  methods: {
    async handleEmailInvite() {
      if (!this.email || this.email.trim().length === 0) {
        this.emailError = 'Email is required';
        return;
      }

      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(this.email)) {
        this.emailError = 'Please enter a valid email address';
        return;
      }

      this.sendingEmail = true;
      this.emailError = '';

      try {
        await familyService.inviteMember(this.familyId, this.email.trim());
        this.email = '';
        if (this.$toast) {
          this.$toast.success('Invite sent successfully!');
        }
        this.$emit('invite-sent');
      } catch (error) {
        this.emailError = error.message || 'Failed to send invite';
        if (this.$toast) {
          this.$toast.error(this.emailError);
        }
      } finally {
        this.sendingEmail = false;
      }
    },
    async generateInviteLink() {
      this.generatingLink = true;

      try {
        const data = await familyService.generateInviteLink(this.familyId);
        this.inviteLink = data.invite_link;
        this.inviteCode = data.invite_code;
      } catch (error) {
        if (this.$toast) {
          this.$toast.error(error.message || 'Failed to generate invite link');
        }
      } finally {
        this.generatingLink = false;
      }
    },
    async copyLink() {
      try {
        await navigator.clipboard.writeText(this.inviteLink);
        this.copied = true;
        if (this.$toast) {
          this.$toast.success('Link copied to clipboard!');
        }
        setTimeout(() => {
          this.copied = false;
        }, 2000);
      } catch (error) {
        // Fallback for older browsers
        const input = document.createElement('input');
        input.value = this.inviteLink;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
        this.copied = true;
        if (this.$toast) {
          this.$toast.success('Link copied to clipboard!');
        }
        setTimeout(() => {
          this.copied = false;
        }, 2000);
      }
    },
    async copyCode() {
      try {
        await navigator.clipboard.writeText(this.inviteCode);
        this.copiedCode = true;
        if (this.$toast) {
          this.$toast.success('Code copied to clipboard!');
        }
        setTimeout(() => {
          this.copiedCode = false;
        }, 2000);
      } catch (error) {
        // Fallback for older browsers
        const input = document.createElement('input');
        input.value = this.inviteCode;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
        this.copiedCode = true;
        if (this.$toast) {
          this.$toast.success('Code copied to clipboard!');
        }
        setTimeout(() => {
          this.copiedCode = false;
        }, 2000);
      }
    }
  }
};
</script>

<style scoped>
.invite-form {
  padding: var(--spacing-md);
  background-color: var(--color-background);
  border-radius: var(--radius-md);
  margin-bottom: var(--spacing-md);
}

.invite-tabs {
  display: flex;
  gap: var(--spacing-xs);
  margin-bottom: var(--spacing-md);
  border-bottom: 2px solid var(--color-border);
}

.tab {
  padding: var(--spacing-sm) var(--spacing-md);
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  font-family: var(--font-family);
  font-size: var(--font-size-md);
  color: var(--color-text-light);
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: -2px;
}

.tab:hover {
  color: var(--color-primary);
}

.tab.active {
  color: var(--color-primary);
  border-bottom-color: var(--color-primary);
  font-weight: 600;
}

.email-invite,
.code-invite {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.invite-link-display {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  margin-top: var(--spacing-md);
  padding: var(--spacing-md);
  background-color: var(--color-surface);
  border-radius: var(--radius-md);
}

.invite-label,
.invite-code-label {
  font-weight: 500;
  color: var(--color-text);
  margin: 0;
  font-size: var(--font-size-sm);
}

.invite-link-container,
.invite-code-container {
  display: flex;
  gap: var(--spacing-sm);
}

.invite-link-input,
.invite-code-input {
  flex: 1;
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-family: var(--font-family);
  font-size: var(--font-size-sm);
  color: var(--color-text);
  background-color: var(--color-surface);
}

.invite-code-input {
  font-family: monospace;
  font-weight: 600;
  text-align: center;
  letter-spacing: 2px;
}

@media (max-width: 768px) {
  .invite-link-container,
  .invite-code-container {
    flex-direction: column;
  }

  .invite-link-input,
  .invite-code-input {
    width: 100%;
  }
}
</style>

