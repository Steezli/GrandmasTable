<template>
  <div class="photo-upload">
    <label class="form-label">Photos</label>
    <div class="photo-upload-area">
      <div
        class="upload-zone"
        :class="{ 'drag-over': isDragOver }"
        @drop="handleDrop"
        @dragover.prevent="isDragOver = true"
        @dragleave="isDragOver = false"
        @click="triggerFileInput"
      >
        <input
          ref="fileInput"
          type="file"
          accept="image/*"
          multiple
          @change="handleFileSelect"
          class="file-input"
        />
        <div class="upload-content">
          <span class="upload-icon">📷</span>
          <p class="upload-text">Drag and drop photos here, or click to select</p>
          <p class="upload-hint">Max 5MB per file</p>
        </div>
      </div>
    </div>

    <div v-if="photos.length > 0" class="photo-preview-list">
      <div
        v-for="(photo, index) in photos"
        :key="photo.id || index"
        class="photo-preview-item"
      >
        <img :src="photo.photo_url" :alt="`Photo ${index + 1}`" class="photo-preview" />
        <div class="photo-actions">
          <Button
            type="button"
            @click="setPrimary(index)"
            :variant="photo.is_primary ? 'primary' : 'outline'"
            size="small"
            class="primary-button"
          >
            {{ photo.is_primary ? 'Primary' : 'Set Primary' }}
          </Button>
          <Button
            type="button"
            @click="removePhoto(index)"
            variant="danger"
            size="small"
            class="remove-button"
          >
            Remove
          </Button>
        </div>
      </div>
    </div>

    <div v-if="uploadError" class="upload-error">
      {{ uploadError }}
    </div>
  </div>
</template>

<script>
import { constants } from '../../utils/constants';
import Button from '../common/Button.vue';

export default {
  name: 'PhotoUpload',
  components: {
    Button
  },
  props: {
    modelValue: {
      type: Array,
      required: true,
      default: () => []
    },
    maxSize: {
      type: Number,
      default: 5 // MB
    }
  },
  emits: ['update:modelValue'],
  data() {
    return {
      photos: [],
      isDragOver: false,
      uploadError: ''
    };
  },
  watch: {
    modelValue: {
      handler(newValue) {
        this.photos = [...newValue];
      },
      immediate: true,
      deep: true
    }
  },
  methods: {
    triggerFileInput() {
      this.$refs.fileInput?.click();
    },
    handleFileSelect(event) {
      const files = Array.from(event.target.files);
      this.processFiles(files);
      // Reset input
      event.target.value = '';
    },
    handleDrop(event) {
      event.preventDefault();
      this.isDragOver = false;
      const files = Array.from(event.dataTransfer.files);
      this.processFiles(files);
    },
    processFiles(files) {
      this.uploadError = '';
      const maxSizeBytes = this.maxSize * 1024 * 1024;

      files.forEach(file => {
        // Validate file type
        if (!constants.ALLOWED_IMAGE_TYPES.includes(file.type)) {
          this.uploadError = `Invalid file type: ${file.name}. Please upload an image.`;
          return;
        }

        // Validate file size
        if (file.size > maxSizeBytes) {
          this.uploadError = `File too large: ${file.name}. Max size is ${this.maxSize}MB.`;
          return;
        }

        // Create preview
        const reader = new FileReader();
        reader.onload = (e) => {
          const photoUrl = e.target.result;
          const photo = {
            id: Date.now() + Math.random(),
            photo_url: photoUrl,
            is_primary: this.photos.length === 0, // First photo is primary by default
            file: file // Keep file reference for upload
          };
          this.photos.push(photo);
          this.updatePhotos();
        };
        reader.readAsDataURL(file);
      });
    },
    setPrimary(index) {
      // Set all photos to not primary
      this.photos.forEach(photo => {
        photo.is_primary = false;
      });
      // Set selected photo as primary
      this.photos[index].is_primary = true;
      this.updatePhotos();
    },
    removePhoto(index) {
      this.photos.splice(index, 1);
      // If we removed the primary photo and there are more photos, set first as primary
      if (this.photos.length > 0 && !this.photos.some(p => p.is_primary)) {
        this.photos[0].is_primary = true;
      }
      this.updatePhotos();
    },
    updatePhotos() {
      this.$emit('update:modelValue', this.photos);
    }
  }
};
</script>

<style scoped>
.photo-upload {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.photo-upload-area {
  width: 100%;
}

.upload-zone {
  border: 2px dashed var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--spacing-xl);
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  background-color: var(--color-background);
}

.upload-zone:hover,
.upload-zone.drag-over {
  border-color: var(--color-primary);
  background-color: rgba(139, 69, 19, 0.05);
}

.file-input {
  display: none;
}

.upload-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-sm);
}

.upload-icon {
  font-size: 48px;
  opacity: 0.5;
}

.upload-text {
  font-size: var(--font-size-md);
  color: var(--color-text);
  margin: 0;
  font-weight: 500;
}

.upload-hint {
  font-size: var(--font-size-sm);
  color: var(--color-text-light);
  margin: 0;
}

.photo-preview-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: var(--spacing-md);
}

.photo-preview-item {
  position: relative;
  border-radius: var(--radius-md);
  overflow: hidden;
  background-color: var(--color-surface);
  box-shadow: var(--shadow-sm);
}

.photo-preview {
  width: 100%;
  height: 200px;
  object-fit: cover;
  display: block;
}

.photo-actions {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  gap: var(--spacing-xs);
  padding: var(--spacing-xs);
  background: linear-gradient(to top, rgba(0, 0, 0, 0.7), transparent);
  opacity: 0;
  transition: opacity 0.2s;
}

.photo-preview-item:hover .photo-actions {
  opacity: 1;
}

.primary-button,
.remove-button {
  flex: 1;
  font-size: var(--font-size-xs);
  padding: var(--spacing-xs);
}

.upload-error {
  padding: var(--spacing-sm);
  background-color: #fee;
  border: 1px solid var(--color-error);
  border-radius: var(--radius-md);
  color: var(--color-error);
  font-size: var(--font-size-sm);
  text-align: center;
}

@media (max-width: 768px) {
  .photo-preview-list {
    grid-template-columns: 1fr;
  }

  .photo-actions {
    opacity: 1;
  }
}
</style>

