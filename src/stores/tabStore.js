import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useTabStore = defineStore('tabs', () => {
  // State
  const tabs = ref([])
  const windows = ref({})
  const viewMode = ref('all') // 'all' | 'window'
  const currentWindowId = ref(null)
  const readLater = ref([])
  const loading = ref(false)
  
  // Getters
  const groupedTabs = computed(() => {
    if (viewMode.value === 'all') {
      return { all: tabs.value }
    } else {
      return windows.value
    }
  })
  
  const tabCount = computed(() => tabs.value.length)
  
  // Actions
  async function fetchTabs() {
    loading.value = true
    try {
      const allTabs = await chrome.tabs.query({})
      tabs.value = allTabs
      
      // Group by window
      const windowGroups = {}
      allTabs.forEach(tab => {
        if (!windowGroups[tab.windowId]) {
          windowGroups[tab.windowId] = []
        }
        windowGroups[tab.windowId].push(tab)
      })
      windows.value = windowGroups
      
      // Load read later from storage
      const result = await chrome.storage.local.get('readLater')
      if (result.readLater) {
        readLater.value = result.readLater
      }
    } catch (error) {
      console.error('Error fetching tabs:', error)
    } finally {
      loading.value = false
    }
  }
  
  async function switchToTab(tabId, windowId) {
    try {
      await chrome.tabs.update(tabId, { active: true })
      await chrome.windows.update(windowId, { focused: true })
    } catch (error) {
      console.error('Error switching to tab:', error)
    }
  }
  
  async function closeTab(tabId) {
    try {
      await chrome.tabs.remove(tabId)
      await fetchTabs() // Refresh list
    } catch (error) {
      console.error('Error closing tab:', error)
    }
  }
  
  async function saveForLater(tab) {
    const item = {
      id: Date.now(),
      url: tab.url,
      title: tab.title,
      favIconUrl: tab.favIconUrl,
      savedAt: new Date().toISOString(),
      archived: false
    }
    readLater.value.push(item)
    await chrome.storage.local.set({ readLater: readLater.value })
  }
  
  async function archiveReadLater(id) {
    const index = readLater.value.findIndex(item => item.id === id)
    if (index !== -1) {
      readLater.value[index].archived = true
      await chrome.storage.local.set({ readLater: readLater.value })
    }
  }
  
  async function destroyReadLater(id) {
    readLater.value = readLater.value.filter(item => item.id !== id)
    await chrome.storage.local.set({ readLater: readLater.value })
  }
  
  function setViewMode(mode) {
    viewMode.value = mode
  }
  
  return {
    tabs,
    windows,
    viewMode,
    currentWindowId,
    readLater,
    loading,
    groupedTabs,
    tabCount,
    fetchTabs,
    switchToTab,
    closeTab,
    saveForLater,
    archiveReadLater,
    destroyReadLater,
    setViewMode
  }
})
