<template>
  <div id="tab-sweep">
    <header>
      <div class="header-left">
        <h1>TabSweep</h1>
        <span class="tab-count">{{ tabCount }} tabs open</span>
      </div>
      <ViewToggle v-model="viewMode" />
    </header>

    <!-- 清理提示横幅 -->
    <div v-if="hasDupes" class="cleanup-banner">
      <div class="cleanup-left">
        <div class="cleanup-icon">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M2 2h12v12H2z" stroke="currentColor" stroke-width="1.5"/>
            <path d="M5 8h6M8 5v6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
        </div>
        <span class="cleanup-text">
          You have <strong>{{ dupeCount }} duplicate tabs</strong>
        </span>
      </div>
      <button class="cleanup-btn" @click="fixAllDupes">Fix all</button>
    </div>

    <main>
      <div v-if="loading" class="loading">
        <div class="spinner"></div>
        <span>Loading tabs...</span>
      </div>

      <div v-else>
        <!-- 分组卡片瀑布流 -->
        <Transition name="view-transition" mode="out-in">
          <!-- All Tabs view - flat grouping with CSS columns -->
          <div v-if="viewMode === 'all'" key="all-tabs" class="group-cards">
            <GroupCard
              v-for="(group, groupKey) in groupedTabs"
              :key="groupKey"
              :group="group"
              @switch-to-tab="(tab) => switchToTab(tab.id, tab.windowId)"
              @close-tab="(id) => closeTab(id)"
              @save-later="(tab) => saveForLater(tab)"
              @close-all="() => closeGroup(group)"
              @fix-dupes="() => fixGroupDupes(group)"
              @close-dupes-by-url="(url) => closeDuplicateTabs(url)"
            />
          </div>
          
          <!-- By Window view - vertical layout with window groups -->
          <div v-else key="by-window" class="window-view">
            <div v-for="(windowGroup, windowKey) in groupedTabs" :key="windowKey" class="window-container">
              <div class="window-header">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <rect x="1" y="1" width="14" height="10" rx="1" stroke="currentColor" fill="none" stroke-width="1.5"/>
                  <line x1="1" y1="5" x2="15" y2="5" stroke="currentColor" stroke-width="1.5"/>
                  <rect x="3" y="13" width="10" height="2" rx="1"/>
                </svg>
                <span class="window-name">{{ windowGroup.name }}</span>
                <span class="window-tab-count">{{ windowGroup.tabs.length }} tabs</span>
              </div>
              <div class="window-content">
                <GroupCard
                  v-for="(subGroup, subGroupKey) in windowGroup.subGroups"
                  :key="subGroupKey"
                  :group="subGroup"
                  @switch-to-tab="(tab) => switchToTab(tab.id, tab.windowId)"
                  @close-tab="(id) => closeTab(id)"
                  @save-later="(tab) => saveForLater(tab)"
                  @close-all="() => closeGroup(subGroup)"
                  @fix-dupes="() => fixGroupDupes(subGroup)"
                  @close-dupes-by-url="(url) => closeDuplicateTabs(url)"
                />
              </div>
            </div>
          </div>
        </Transition>

        <div v-if="Object.keys(groupedTabs).length === 0" class="empty-state">
          <div class="empty-icon">📭</div>
          <p>No tabs open</p>
        </div>
      </div>
    </main>

    <ReadLater />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useTabStore } from './stores/tabStore'
import GroupCard from './components/GroupCard.vue'
import ViewToggle from './components/ViewToggle.vue'
import ReadLater from './components/ReadLater.vue'

const store = useTabStore()

const groupedTabs = computed(() => store.groupedTabs)
const tabCount = computed(() => store.tabCount)
const loading = ref(true)

const viewMode = computed({
  get: () => store.viewMode,
  set: (val) => store.setViewMode(val)
})

const hasDupes = computed(() =>
  Object.values(store.groupedTabs).some(g => g.tabs.some(t => t.isDuplicate))
)

const dupeCount = computed(() => {
  const seen = new Set()
  Object.values(store.groupedTabs).forEach(g => {
    g.tabs.forEach(t => {
      if (t.isDuplicate && !seen.has(t.url)) {
        seen.add(t.url)
      }
    })
  })
  return seen.size
})

onMounted(async () => {
  await store.fetchTabs()
  loading.value = false
})

function switchToTab(tabId, windowId) {
  store.switchToTab(tabId, windowId)
}

function closeTab(tabId) {
  store.closeTab(tabId)
}

function saveForLater(tab) {
  store.saveForLater(tab)
}

async function closeGroup(group) {
  const ids = group.tabs.map(t => t.id)
  await chrome.tabs.remove(ids)
  await store.fetchTabs()
}

async function fixGroupDupes(group) {
  const tabsToRemove = []
  group.tabs.forEach(t => {
    if (t.isDuplicate && t.id) {
      tabsToRemove.push(t.id)
    }
  })
  if (tabsToRemove.length > 0) {
    try {
      await chrome.tabs.remove(tabsToRemove)
      await store.fetchTabs()
    } catch (error) {
      console.error('Error fixing dupes:', error)
    }
  }
}

async function fixAllDupes() {
  const allTabs = store.tabs
  const seen = new Map()

  allTabs.forEach(t => {
    const key = t.url?.split('?')[0]
    if (!key) return
    if (!seen.has(key)) {
      seen.set(key, [])
    }
    seen.get(key).push(t.id)
  })

  const idsToClose = []
  seen.forEach(ids => {
    if (ids.length > 1) {
      idsToClose.push(...ids.slice(1))
    }
  })

  if (idsToClose.length > 0) {
    await chrome.tabs.remove(idsToClose)
    await store.fetchTabs()
  }
}
</script>

<style>
* { margin: 0; padding: 0; box-sizing: border-box; }

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: #f8f5f0;
  color: #1a1613;
  min-height: 100vh;
  -webkit-font-smoothing: antialiased;
}

#tab-sweep {
  max-width: 960px;
  margin: 0 auto;
  padding: 32px 24px 80px;
}

header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e8e2da;
}

.header-left h1 {
  font-size: 26px;
  font-weight: 300;
  letter-spacing: -0.5px;
  color: #1a1613;
  margin-bottom: 2px;
}

.tab-count {
  font-size: 12px;
  color: #9a918a;
  font-weight: 400;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* 清理横幅 */
.cleanup-banner {
  background: linear-gradient(135deg, rgba(200,113,58,0.04), rgba(200,113,58,0.09));
  border: 1px solid rgba(200,113,58,0.18);
  border-radius: 8px;
  padding: 12px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.cleanup-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.cleanup-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(200,113,58,0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: #c8713a;
}

.cleanup-text {
  font-size: 13px;
  color: #1a1613;
}

.cleanup-text strong {
  font-weight: 600;
}

.cleanup-btn {
  font-family: inherit;
  font-size: 12px;
  font-weight: 600;
  padding: 6px 16px;
  border-radius: 6px;
  border: none;
  background: #c8713a;
  color: white;
  cursor: pointer;
  transition: opacity 0.2s;
  white-space: nowrap;
}

.cleanup-btn:hover {
  opacity: 0.85;
}

/* 分组卡片瀑布流 */
.group-cards {
  columns: 280px;
  column-gap: 12px;
  min-height: 200px;
}

/* Window view - vertical layout */
.window-view {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* 视图切换过渡动画 - 使用 opacity 避免重排 */
.view-transition-enter-active,
.view-transition-leave-active {
  transition: opacity 0.2s ease;
}

.view-transition-enter-from,
.view-transition-leave-to {
  opacity: 0;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #9a918a;
  gap: 16px;
}

.spinner {
  width: 28px;
  height: 28px;
  border: 3px solid #e8e2da;
  border-top-color: #c8713a;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.empty-state {
  text-align: center;
  padding: 80px 20px;
  color: #9a918a;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

/* Window view styles */
.window-container {
  margin-bottom: 16px;
}

.window-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: #fffdf9;
  border: 1px solid #e8e2da;
  border-radius: 8px 8px 0 0;
  color: #9a918a;
  font-size: 13px;
}

.window-name {
  font-weight: 600;
  color: #1a1613;
}

.window-tab-count {
  margin-left: auto;
  font-size: 11px;
  background: rgba(200, 113, 58, 0.08);
  color: #c8713a;
  padding: 2px 8px;
  border-radius: 3px;
}

.window-content {
  border: 1px solid #e8e2da;
  border-top: none;
  border-radius: 0 0 8px 8px;
  padding: 12px;
  columns: 280px;
  column-gap: 12px;
}

.empty-state p {
  font-size: 16px;
  font-weight: 500;
  color: #666;
}
</style>
