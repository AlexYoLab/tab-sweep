<template>
  <div class="tab-card" @click="$emit('switch')">
    <div class="card-header">
      <img v-if="tab.favIconUrl" :src="tab.favIconUrl" class="favicon" />
      <div v-else class="favicon-placeholder"></div>
      <span class="tab-title">{{ truncateTitle }}</span>
    </div>
    
    <div class="card-actions">
      <button @click.stop="$emit('save-later')" class="btn-save" title="Save for later">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M12 2l-8 8-4-4" stroke="currentColor" stroke-width="2" fill="none"/>
        </svg>
      </button>
      <button @click.stop="$emit('close')" class="btn-close" title="Close tab">
        ×
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  tab: {
    type: Object,
    required: true
  }
})

defineEmits(['switch', 'close', 'save-later'])

const truncateTitle = computed(() => {
  const title = props.tab.title || 'Untitled'
  return title.length > 50 ? title.substring(0, 50) + '...' : title
})
</script>

<style scoped>
.tab-card {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 12px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100px;
}

.tab-card:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  transform: translateY(-2px);
}

.card-header {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  flex: 1;
  overflow: hidden;
}

.favicon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  margin-top: 2px;
}

.favicon-placeholder {
  width: 16px;
  height: 16px;
  background: #e0e0e0;
  border-radius: 2px;
  flex-shrink: 0;
}

.tab-title {
  font-size: 13px;
  color: #333;
  line-height: 1.4;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}

.card-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 8px;
}

button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-save {
  color: #4CAF50;
}

.btn-save:hover {
  background: #E8F5E9;
}

.btn-close {
  color: #f44336;
  font-size: 18px;
  line-height: 1;
}

.btn-close:hover {
  background: #FFEBEE;
}
</style>
