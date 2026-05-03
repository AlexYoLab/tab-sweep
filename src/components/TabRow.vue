<template>
  <div
    class="tab-row"
    :class="{ 'has-dupes': tab.isDuplicate }"
    @click="$emit('switch')"
  >
    <img v-if="tab.favIconUrl" :src="tab.favIconUrl" class="row-favicon" @error="onFaviconError" />
    <div v-else class="favicon-placeholder"></div>

    <div class="row-content">
      <span class="row-title">{{ tab.title || 'Untitled' }}</span>
      <span class="row-url">{{ getDisplayUrl(tab.url) }}</span>
    </div>

    <span v-if="tab.isDuplicate" class="dupe-badge" @click.stop="$emit('close-duplicates', tab.duplicateUrl)">
      ×{{ tab.duplicateCount }}
    </span>

    <div class="row-actions">
      <button class="row-action save" @click.stop="$emit('save-later')" :title="isSaved ? 'Saved' : 'Save for later'">
        <svg v-if="!isSaved" width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" stroke-width="1.3">
          <path d="M2 1a1 1 0 011-1h6a1 1 0 011 1v10l-4-2.5L2 11V1z"/>
        </svg>
        <svg v-else width="13" height="13" viewBox="0 0 13 13" fill="currentColor">
          <path d="M2 1a1 1 0 011-1h6a1 1 0 011 1v10l-4-2.5L2 11V1z"/>
        </svg>
      </button>
      <button class="row-action close" @click.stop="$emit('close')" title="Close tab">
        ×
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useTabStore } from '../stores/tabStore'

const props = defineProps({
  tab: { type: Object, required: true }
})

defineEmits(['switch', 'close', 'save-later', 'close-duplicates'])

function getDisplayUrl(url) {
  if (!url) return ''
  try {
    const urlObj = new URL(url)
    let display = urlObj.hostname
    if (urlObj.pathname !== '/') {
      display += urlObj.pathname.length > 30
        ? urlObj.pathname.slice(0, 30) + '...'
        : urlObj.pathname
    }
    return display
  } catch {
    return url.length > 50 ? url.slice(0, 50) + '...' : url
  }
}

const store = useTabStore()
const isSaved = computed(() => store.isTabSaved(props.tab.url))

function onFaviconError(e) {
  e.target.style.display = 'none'
}
</script>

<style scoped>
.tab-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 4px;
  font-size: 13px;
  color: #333;
  border-bottom: 1px solid rgba(0,0,0,0.06);
  cursor: pointer;
  transition: background 0.15s;
  line-height: 1.4;
}

.tab-row:last-child {
  border-bottom: none;
}

.tab-row:hover {
  background: rgba(255, 152, 0, 0.04);
}

.tab-row.has-dupes {
  border-left: 2px solid #FF9800;
  padding-left: 2px;
}

.row-favicon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  border-radius: 2px;
  margin-top: 2px;
}

.favicon-placeholder {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  background: #e0e0e0;
  border-radius: 2px;
  margin-top: 2px;
}

.row-content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.row-title {
  font-size: 13px;
  color: #333;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  line-height: 1.4;
}

.row-url {
  font-size: 11px;
  color: #999;
  font-family: monospace;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dupe-badge {
  font-size: 10px;
  font-weight: 600;
  color: #FF9800;
  background: rgba(255, 152, 0, 0.08);
  padding: 1px 5px;
  border-radius: 3px;
  cursor: pointer;
  flex-shrink: 0;
}

.dupe-badge:hover {
  background: rgba(255, 152, 0, 0.18);
}

.row-actions {
  display: flex;
  align-items: center;
  gap: 2px;
  margin-left: auto;
  flex-shrink: 0;
}

.row-action {
  background: none;
  border: none;
  cursor: pointer;
  padding: 3px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.35;
  transition: opacity 0.15s, background 0.15s, color 0.15s;
  color: #999;
}

.tab-row:hover .row-action {
  opacity: 1;
}

.row-action:hover {
  background: rgba(0,0,0,0.06);
}

.row-action.save:hover {
  color: #FF9800;
}

.row-action.close:hover {
  color: #f44336;
}
</style>
