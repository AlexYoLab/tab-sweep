<template>
  <div id="tab-sweep">
    <header>
      <div class="header-content">
        <h1>TabSweep</h1>
        <ViewToggle />
      </div>
    </header>
    
    <main>
      <div v-if="loading" class="loading">Loading tabs...</div>
      
      <div v-else class="tabs-container">
        <div v-for="(tabGroup, groupName) in groupedTabs" :key="groupName" class="tab-group">
          <h2 v-if="viewMode === 'window'" class="group-title">
            Window {{ groupName }} ({{ tabGroup.length }} tabs)
          </h2>
          
          <div class="tabs-grid">
            <TabCard 
              v-for="tab in tabGroup" 
              :key="tab.id" 
              :tab="tab"
              @switch="switchToTab(tab.id, tab.windowId)"
              @close="closeTab(tab.id)"
              @save-later="saveForLater(tab)"
            />
          </div>
        </div>
      </div>
    </main>
    
    <ReadLater />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useTabStore } from './stores/tabStore'
import TabCard from './components/TabCard.vue'
import ViewToggle from './components/ViewToggle.vue'
import ReadLater from './components/ReadLater.vue'

const store = useTabStore()
const loading = ref(true)
const groupedTabs = computed(() => store.groupedTabs)
const viewMode = computed(() => store.viewMode)

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
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: #f5f5f5;
  color: #333;
  min-height: 100vh;
}

#tab-sweep {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

header {
  background: white;
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 20px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

h1 {
  font-size: 24px;
  font-weight: 600;
  color: #1a1a1a;
}

.tabs-container {
  margin-top: 20px;
}

.tab-group {
  margin-bottom: 30px;
}

.group-title {
  font-size: 16px;
  font-weight: 500;
  color: #666;
  margin-bottom: 12px;
}

.tabs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
}

.loading {
  text-align: center;
  padding: 40px;
  color: #666;
}
</style>
