<template>
  <div class="read-later">
    <!-- 切换按钮 -->
    <button class="toggle-btn" @click="toggle" :title="isOpen ? '关闭稍后阅读' : '打开稍后阅读'">
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.5">
        <path d="M4 2a1 1 0 011-1h8a1 1 0 011 1v14l-5-3-5 3V2z"/>
      </svg>
      <span v-if="activeItems.length > 0" class="badge">{{ activeItems.length }}</span>
    </button>

    <!-- 遮罩层 -->
    <div v-if="isOpen" class="overlay" @click="isOpen = false"></div>

    <!-- 侧边栏内容 -->
    <Transition name="slide">
      <div v-if="isOpen" class="sidebar">
        <div class="sidebar-header">
          <h3>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M3 2a1 1 0 011-1h6a1 1 0 011 1v10l-4-2.5L3 12V2z"/>
            </svg>
            稍后阅读
            <span class="count">({{ activeItems.length }})</span>
          </h3>
          <button class="close-btn" @click="isOpen = false" title="关闭">×</button>
        </div>

        <div class="sidebar-body">
          <div v-if="activeItems.length === 0" class="empty">
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none" stroke="#ddd" stroke-width="1.5">
              <path d="M10 6a2 2 0 012-2h12a2 2 0 012 2v24l-8-5-8 5V6z"/>
            </svg>
            <p>暂无已保存标签页</p>
            <span>点击书签保存</span>
          </div>

          <div v-for="item in activeItems" :key="item.id" class="read-later-item">
            <div class="item-content" @click="openTab(item)">
              <img v-if="item.favIconUrl" :src="item.favIconUrl" class="favicon" @error="handleFaviconError" />
              <div v-else class="favicon-placeholder"></div>
              <div class="item-info">
                <div class="item-title">{{ item.title }}</div>
                <div class="item-url">{{ truncateUrl(item.url) }}</div>
                <div class="item-date">{{ formatDate(item.savedAt) }}</div>
              </div>
            </div>

            <div class="item-actions">
              <button @click="archiveItem(item.id)" class="btn-archive" title="标记为已读">
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" stroke-width="1.3">
                  <path d="M2 1a1 1 0 011-1h6a1 1 0 011 1v9l-4-2.5L2 10V1z"/>
                </svg>
              </button>
              <button @click="destroyItem(item.id)" class="btn-destroy" title="删除">
                ×
              </button>
            </div>
          </div>

          <!-- 已归档区域 -->
          <div v-if="archivedItems.length > 0" class="archived-section">
            <div class="archived-header" @click="showArchived = !showArchived">
              <span>已归档 ({{ archivedItems.length }})</span>
              <svg class="chevron" :class="{ expanded: showArchived }" width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round"/>
              </svg>
            </div>

            <Transition name="expand">
              <div v-if="showArchived" class="archived-list">
                <div v-for="item in archivedItems" :key="item.id" class="read-later-item archived">
                  <div class="item-content" @click="openArchivedTab(item)">
                    <img v-if="item.favIconUrl" :src="item.favIconUrl" class="favicon" @error="handleFaviconError" />
                    <div v-else class="favicon-placeholder"></div>
                    <div class="item-info">
                      <div class="item-title">{{ item.title }}</div>
                      <div class="item-url">{{ truncateUrl(item.url) }}</div>
                      <div class="item-date">{{ formatDate(item.savedAt) }}</div>
                    </div>
                  </div>

                  <div class="item-actions">
                    <button @click="restoreItem(item.id)" class="btn-restore" title="恢复">
                      <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" stroke-width="1.3">
                        <path d="M2 6a4 4 0 108 0 4 4 0 00-4-4"/>
                        <path d="M11 6H7M7 6l2-2M7 6l2 2"/>
                      </svg>
                    </button>
                    <button @click="destroyItem(item.id)" class="btn-destroy" title="永久删除">
                      ×
                    </button>
                  </div>
                </div>
              </div>
            </Transition>
          </div>
        </div>

        <!-- 底部操作栏 -->
        <div v-if="activeItems.length > 0" class="sidebar-footer">
          <button class="clear-btn" @click="clearAll" title="清空所有归档">
            清空归档
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useTabStore } from '../stores/tabStore'

const store = useTabStore()
const isOpen = ref(false)
const showArchived = ref(false)

const readLaterItems = computed(() => {
  const items = Array.isArray(store.readLater) ? store.readLater : []
  console.log('DEBUG ReadLater: store.readLater:', store.readLater, 'items:', items.length)
  return items
})

const activeItems = computed(() => {
  const active = readLaterItems.value.filter(item => !item.archived)
  console.log('DEBUG ReadLater: activeItems:', active.length)
  return active
})

const archivedItems = computed(() =>
  readLaterItems.value.filter(item => item.archived)
)

function toggle() {
  isOpen.value = !isOpen.value
}

function truncateUrl(url) {
  if (!url) return ''
  try {
    const urlObj = new URL(url)
    return urlObj.hostname + urlObj.pathname.slice(0, 30)
  } catch {
    return url.slice(0, 40)
  }
}

function formatDate(dateString) {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now - date

  // 一天内
  if (diff < 86400000) {
    return '今天'
  }
  // 两天内
  if (diff < 172800000) {
    return '昨天'
  }
  // 一周内
  if (diff < 604800000) {
    const days = Math.floor(diff / 86400000)
    return `${days} 天前`
  }

  return date.toLocaleDateString()
}

function openTab(item) {
  chrome.tabs.create({ url: item.url })
  store.archiveReadLater(item.id)
}

function openArchivedTab(item) {
  chrome.tabs.create({ url: item.url })
}

function archiveItem(id) {
  store.archiveReadLater(id)
}

function restoreItem(id) {
  store.restoreFromArchive(id)
}

function destroyItem(id) {
  store.destroyReadLater(id)
}

function clearAll() {
  // 删除所有已归档的
  archivedItems.value.forEach(item => {
    store.destroyReadLater(item.id)
  })
}

function handleFaviconError(e) {
  e.target.style.display = 'none'
  e.target.nextElementSibling?.classList.add('show')
}
</script>

<style scoped>
.read-later {
  position: fixed;
  right: 0;
  top: 0;
  z-index: 1000;
}

.toggle-btn {
  position: fixed;
  right: 20px;
  top: 100px;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 10px;
  padding: 12px;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  color: #FF9800;
  transition: all 0.2s;
  position: relative;
}

.toggle-btn:hover {
  background: #FFF3E0;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.badge {
  position: absolute;
  top: -6px;
  right: -6px;
  background: #f44336;
  color: white;
  font-size: 11px;
  font-weight: 600;
  min-width: 18px;
  height: 18px;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 5px;
}

.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  background: rgba(0,0,0,0.3);
  z-index: 999;
}

.sidebar {
  position: fixed;
  right: 0;
  top: 0;
  width: 340px;
  height: 100vh;
  background: white;
  box-shadow: -4px 0 20px rgba(0,0,0,0.15);
  display: flex;
  flex-direction: column;
  z-index: 1001;
}

.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateX(100%);
}

.sidebar-header {
  padding: 20px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
}

.sidebar-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
  display: flex;
  align-items: center;
  gap: 8px;
}

.sidebar-header h3 svg {
  color: #FF9800;
}

.sidebar-header .count {
  font-weight: 400;
  color: #999;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #999;
  padding: 0 4px;
  line-height: 1;
  transition: color 0.2s;
}

.close-btn:hover {
  color: #333;
}

.sidebar-body {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
}

.empty {
  text-align: center;
  padding: 40px 20px;
  color: #999;
}

.empty svg {
  margin-bottom: 12px;
}

.empty p {
  font-size: 14px;
  font-weight: 500;
  color: #666;
  margin-bottom: 4px;
}

.empty span {
  font-size: 12px;
}

.read-later-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 10px;
  border-radius: 8px;
  margin-bottom: 6px;
  transition: background 0.2s;
}

.read-later-item:hover {
  background: #f8f8f8;
}

.item-content {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  flex: 1;
  cursor: pointer;
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
  margin-top: 2px;
  display: none;
}

.favicon-placeholder.show {
  display: block;
}

.item-info {
  flex: 1;
  overflow: hidden;
}

.item-title {
  font-size: 13px;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-bottom: 2px;
}

.item-url {
  font-size: 11px;
  color: #999;
  font-family: monospace;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-date {
  font-size: 10px;
  color: #bbb;
  margin-top: 4px;
}

.item-actions {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
  margin-left: 8px;
}

button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 6px;
  border-radius: 4px;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.btn-archive {
  color: #FF9800;
}

.btn-archive:hover {
  background: #FFF3E0;
}

.btn-restore {
  color: #4CAF50;
}

.btn-restore:hover {
  background: #E8F5E9;
}

.btn-destroy {
  color: #999;
}

.btn-destroy:hover {
  background: #FFEBEE;
  color: #f44336;
}

.archived-section {
  margin-top: 16px;
  border-top: 1px solid #eee;
  padding-top: 12px;
}

.archived-header {
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  color: #666;
  padding: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: 6px;
  transition: background 0.2s;
}

.archived-header:hover {
  background: #f5f5f5;
}

.chevron {
  transition: transform 0.2s;
}

.chevron.expanded {
  transform: rotate(180deg);
}

.expand-enter-active,
.expand-leave-active {
  transition: all 0.2s ease;
  overflow: hidden;
}

.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  max-height: 0;
}

.expand-enter-to,
.expand-leave-from {
  opacity: 1;
  max-height: 500px;
}

.archived-list {
  margin-top: 8px;
}

.read-later-item.archived {
  opacity: 0.5;
}

.read-later-item.archived:hover {
  opacity: 0.7;
}

.sidebar-footer {
  padding: 12px 20px;
  border-top: 1px solid #eee;
  flex-shrink: 0;
}

.clear-btn {
  width: 100%;
  padding: 10px;
  background: #f5f5f5;
  color: #666;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.2s;
}

.clear-btn:hover {
  background: #e0e0e0;
  color: #333;
}
</style>
