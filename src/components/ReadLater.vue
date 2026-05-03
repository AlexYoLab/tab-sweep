<template>
  <div class="read-later">
    <div class="read-later-header" @click="isOpen = !isOpen">
      <h3>Read Later ({{ activeItems.length }})</h3>
      <span class="toggle">{{ isOpen ? '▼' : '▶' }}</span>
    </div>
    
    <div v-if="isOpen" class="read-later-content">
      <div v-if="activeItems.length === 0" class="empty">
        No saved tabs
      </div>
      
      <div v-for="(item, index) in activeItems" :key="item.id" class="read-later-item">
        <div class="item-content" @click="openTab(item)">
          <img v-if="item.favIconUrl" :src="item.favIconUrl" class="favicon" />
          <div v-else class="favicon-placeholder"></div>
          <div class="item-info">
            <div class="item-title">{{ item.title }}</div>
            <div class="item-date">{{ formatDate(item.savedAt) }}</div>
          </div>
        </div>
        
        <div class="item-actions">
          <button @click="archiveItem(item.id)" class="btn-archive" title="Archive">
            ✓
          </button>
        </div>
      </div>
      
      <div v-if="archivedItems.length > 0" class="archived-section">
        <div class="archived-header" @click="showArchived = !showArchived">
          Archived ({{ archivedItems.length }})
          <span class="toggle">{{ showArchived ? '▼' : '▶' }}</span>
        </div>
        
        <div v-if="showArchived">
          <div v-for="item in archivedItems" :key="item.id" class="read-later-item archived">
            <div class="item-content">
              <div class="item-info">
                <div class="item-title">{{ item.title }}</div>
                <div class="item-date">{{ formatDate(item.savedAt) }}</div>
              </div>
            </div>
            
            <div class="item-actions">
              <button @click="destroyItem(item.id)" class="btn-destroy" title="Delete permanently">
                ×
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useTabStore } from '../stores/tabStore'

const store = useTabStore()
const isOpen = ref(true)
const showArchived = ref(false)

const activeItems = computed(() => 
  store.readLater.filter(item => !item.archived)
)

const archivedItems = computed(() => 
  store.readLater.filter(item => item.archived)
)

function formatDate(dateString) {
  const date = new Date(dateString)
  return date.toLocaleDateString()
}

function openTab(item) {
  chrome.tabs.create({ url: item.url })
  store.archiveReadLater(item.id)
}

function archiveItem(id) {
  store.archiveReadLater(id)
}

function destroyItem(id) {
  store.destroyReadLater(id)
}
</script>

<style scoped>
.read-later {
  position: fixed;
  right: 20px;
  top: 100px;
  width: 300px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  z-index: 1000;
}

.read-later-header {
  padding: 16px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e0e0e0;
}

.read-later-header h3 {
  margin: 0;
  font-size: 14px;
  font-weight: 500;
}

.toggle {
  font-size: 10px;
  color: #666;
}

.read-later-content {
  max-height: 400px;
  overflow-y: auto;
  padding: 8px;
}

.empty {
  text-align: center;
  padding: 20px;
  color: #666;
  font-size: 13px;
}

.read-later-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px;
  border-radius: 6px;
  margin-bottom: 4px;
  transition: background 0.2s;
}

.read-later-item:hover {
  background: #f5f5f5;
}

.item-content {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  cursor: pointer;
  overflow: hidden;
}

.favicon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.favicon-placeholder {
  width: 16px;
  height: 16px;
  background: #e0e0e0;
  border-radius: 2px;
  flex-shrink: 0;
}

.item-info {
  overflow: hidden;
}

.item-title {
  font-size: 12px;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-date {
  font-size: 10px;
  color: #666;
  margin-top: 2px;
}

.item-actions {
  display: flex;
  gap: 4px;
}

button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 14px;
}

.btn-archive {
  color: #4CAF50;
}

.btn-archive:hover {
  background: #E8F5E9;
}

.btn-destroy {
  color: #f44336;
}

.btn-destroy:hover {
  background: #FFEBEE;
}

.archived-section {
  margin-top: 8px;
  border-top: 1px solid #e0e0e0;
  padding-top: 8px;
}

.archived-header {
  cursor: pointer;
  font-size: 12px;
  color: #666;
  padding: 4px 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.read-later-item.archived {
  opacity: 0.6;
}
</style>
