<template>
  <div class="tab-card" @click="$emit('switch')">
    <div class="card-header">
      <img v-if="tab.favIconUrl" :src="tab.favIconUrl" class="favicon" @error="handleFaviconError" />
      <div v-else class="favicon-placeholder"></div>
      <div class="title-wrapper">
        <span class="tab-title">{{ truncateTitle }}</span>
        <span class="display-url">{{ displayUrl }}</span>
        <span v-if="tab.isDuplicate" class="duplicate-badge" @click.stop="$emit('close-duplicates', tab.duplicateUrl)">
          Duplicate ({{ tab.duplicateCount }}) ×
        </span>
      </div>
    </div>

    <div class="card-actions">
      <button @click.stop="$emit('save-later')" class="btn-save" :class="{ saved: isSaved }" :title="isSaved ? 'Already saved' : 'Save for later'">
        <!-- 书签图标 -->
        <svg v-if="!isSaved" width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M4 2a1 1 0 011-1h6a1 1 0 011 1v12l-4-2.5L4 14V2z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
        </svg>
        <svg v-else width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <path d="M4 2a1 1 0 011-1h6a1 1 0 011 1v12l-4-2.5L4 14V2z"/>
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
import { useTabStore } from '../stores/tabStore'

const props = defineProps({
  tab: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['switch', 'close', 'save-later', 'close-duplicates'])
const store = useTabStore()

const truncateTitle = computed(() => {
  const title = props.tab.title || 'Untitled'
  return title.length > 40 ? title.substring(0, 40) + '...' : title
})

const displayUrl = computed(() => {
  if (!props.tab.url) return ''
  // 如果已经设置了displayUrl（如localhost），直接使用
  if (props.tab.displayUrl) return props.tab.displayUrl
  try {
    const urlObj = new URL(props.tab.url)
    let display = urlObj.hostname
    if (urlObj.pathname !== '/') {
      display += urlObj.pathname.length > 30
        ? urlObj.pathname.slice(0, 30) + '...'
        : urlObj.pathname
    }
    return display
  } catch {
    return props.tab.url.length > 50 ? props.tab.url.slice(0, 50) + '...' : props.tab.url
  }
})

// 检查是否已保存到稍后阅读
const isSaved = computed(() => {
  return store.isTabSaved(props.tab.url)
})

function handleFaviconError(e) {
  e.target.style.display = 'none'
  e.target.nextElementSibling?.classList.add('show')
}
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
  position: relative;
}

.tab-card:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  transform: translateY(-2px);
  border-color: #ccc;
}

.card-header {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  flex: 1;
  overflow: hidden;
}

.title-wrapper {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
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
  display: none;
}

.favicon-placeholder.show {
  display: block;
}

.tab-title {
  font-size: 13px;
  color: #333;
  line-height: 1.4;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.display-url {
  font-size: 10px;
  color: #999;
  margin-top: 2px;
  font-family: monospace;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.duplicate-badge {
  display: inline-block;
  background: #FF9800;
  color: white;
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 10px;
  margin-top: 4px;
  cursor: pointer;
  width: fit-content;
}

.duplicate-badge:hover {
  background: #F57C00;
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
  transition: all 0.2s;
}

.btn-save {
  color: #9E9E9E;
}

.btn-save:hover {
  background: #FFF3E0;
  color: #FF9800;
}

.btn-save.saved {
  color: #FF9800;
}

.btn-save.saved:hover {
  background: #FFE0B2;
}

.btn-close {
  color: #BDBDBD;
  font-size: 18px;
  line-height: 1;
}

.btn-close:hover {
  background: #FFEBEE;
  color: #f44336;
}
</style>
