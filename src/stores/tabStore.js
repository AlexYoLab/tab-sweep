import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useTabStore = defineStore('tabs', () => {
  const tabs = ref([])
  const windows = ref({})
  const viewMode = ref('all')
  const currentWindowId = ref(null)
  const readLater = ref([])
  const loading = ref(false)

  const HOMEPAGE_PATTERNS = [
    { pattern: 'mail.google.com/mail', name: 'Gmail' },
    { pattern: 'twitter.com/home', name: 'Twitter' },
    { pattern: 'x.com/home', name: 'X' },
    { pattern: 'youtube.com', name: 'YouTube' },
    { pattern: 'linkedin.com/feed', name: 'LinkedIn' },
    { pattern: 'github.com', name: 'GitHub' }
  ]

  const groupedTabs = computed(() => {
    if (viewMode.value === 'all') {
      return groupAllTabs(tabs.value)
    } else {
      return groupByWindow(tabs.value)
    }
  })

  const tabCount = computed(() => tabs.value.length)

  function groupAllTabs(tabList) {
    const groups = {
      homepages: { name: 'Homepages', tabs: [], order: 0 },
      domains: {},
      localhost: { name: 'Localhost', tabs: [], order: 2 },
      others: { name: 'Others', tabs: [], order: 3 }
    }

    if (!tabList || tabList.length === 0) {
      return groups.others.tabs.length > 0 ? { others: groups.others } : {}
    }

    const tabsArray = Array.isArray(tabList) ? tabList : Array.from(tabList)
    const processedTabs = tabsArray.map(tab => ({ ...tab }))
    const urlCount = {}

    processedTabs.forEach(tab => {
      if (!tab.url) {
        groups.others.tabs.push(tab)
        return
      }

      try {
        const urlObj = new URL(tab.url)
        const domain = urlObj.hostname
        const normalizedUrl = tab.url.split('?')[0]

        urlCount[normalizedUrl] = urlCount[normalizedUrl] || []
        urlCount[normalizedUrl].push(tab)

        const isHomepage = HOMEPAGE_PATTERNS.some(p => tab.url.includes(p.pattern))

        if (isHomepage) {
          tab.isHomepage = true
          tab.homepageName = HOMEPAGE_PATTERNS.find(p => tab.url.includes(p.pattern))?.name || 'Homepage'
          groups.homepages.tabs.push(tab)
        } else if (domain && (domain.includes('localhost') || domain.includes('127.0.0.1'))) {
          tab.displayUrl = tab.url
          groups.localhost.tabs.push(tab)
        } else if (domain) {
          if (!groups.domains[domain]) {
            groups.domains[domain] = { name: domain, tabs: [], order: 1 }
          }
          groups.domains[domain].tabs.push(tab)
        } else {
          groups.others.tabs.push(tab)
        }
      } catch (e) {
        if (tab.url && tab.url.startsWith('chrome-extension://')) {
          return
        }
        groups.others.tabs.push(tab)
      }
    })

    Object.keys(urlCount).forEach(normalizedUrl => {
      const tabsWithUrl = urlCount[normalizedUrl]
      if (tabsWithUrl.length > 1) {
        tabsWithUrl.forEach((tab, index) => {
          if (index > 0) {
            tab.isDuplicate = true
            tab.duplicateCount = tabsWithUrl.length
            tab.duplicateUrl = normalizedUrl
          }
        })
      }
    })

    const result = {}

    if (groups.homepages.tabs.length > 0) {
      result['homepages'] = groups.homepages
    }

    const sortedDomains = Object.keys(groups.domains)
      .sort((a, b) => groups.domains[b].tabs.length - groups.domains[a].tabs.length)

    sortedDomains.forEach(domain => {
      result[domain] = groups.domains[domain]
    })

    if (groups.localhost.tabs.length > 0) {
      result['localhost'] = groups.localhost
    }

    if (groups.others.tabs.length > 0) {
      result['others'] = groups.others
    }

    return result
  }

  function detectDuplicates(tabList) {
    const urlCount = {}
    const tabsArray = Array.isArray(tabList) ? tabList : Array.from(tabList)
    const processedTabs = tabsArray.map(tab => ({ ...tab, isDuplicate: false }))
    
    processedTabs.forEach(tab => {
      if (!tab.url) return
      
      if (tab.url.startsWith('chrome-extension://')) return
      
      const normalizedUrl = tab.url.split('?')[0]
      urlCount[normalizedUrl] = urlCount[normalizedUrl] || []
      urlCount[normalizedUrl].push(tab)
    })
    
    Object.keys(urlCount).forEach(normalizedUrl => {
      const tabsWithUrl = urlCount[normalizedUrl]
      if (tabsWithUrl.length > 1) {
        tabsWithUrl.forEach((tab, index) => {
          if (index > 0) {
            tab.isDuplicate = true
            tab.duplicateCount = tabsWithUrl.length
            tab.duplicateUrl = normalizedUrl
          }
        })
      }
    })
    
    return processedTabs
  }

  function groupByWindow(tabList) {
    const windowGroups = {}
    const tabsArray = Array.isArray(tabList) ? tabList : Array.from(tabList)
    
    tabsArray.forEach(tab => {
      const windowId = tab.windowId
      
      if (!windowGroups[windowId]) {
        windowGroups[windowId] = {
          name: `Window ${windowId}`,
          tabs: [],
          order: windowId,
          subGroups: {}
        }
      }
      
      windowGroups[windowId].tabs.push(tab)
    })
    
    Object.keys(windowGroups).forEach(windowId => {
      const windowGroup = windowGroups[windowId]
      const subGroups = {
        homepages: { name: 'Homepages', tabs: [], order: 0 },
        domains: {},
        localhost: { name: 'Localhost', tabs: [], order: 2 },
        others: { name: 'Others', tabs: [], order: 3 }
      }
      const urlCount = {}
      
      windowGroup.tabs.forEach(tab => {
        if (!tab.url) {
          subGroups.others.tabs.push(tab)
          return
        }
        
        try {
          const urlObj = new URL(tab.url)
          const domain = urlObj.hostname
          const normalizedUrl = tab.url.split('?')[0]
          
          urlCount[normalizedUrl] = urlCount[normalizedUrl] || []
          urlCount[normalizedUrl].push(tab)
          
          const isHomepage = HOMEPAGE_PATTERNS.some(p => tab.url.includes(p.pattern))
          
          if (isHomepage) {
            tab.isHomepage = true
            tab.homepageName = HOMEPAGE_PATTERNS.find(p => tab.url.includes(p.pattern))?.name || 'Homepage'
            subGroups.homepages.tabs.push(tab)
          } else if (domain && (domain.includes('localhost') || domain.includes('127.0.0.1'))) {
            tab.displayUrl = tab.url
            subGroups.localhost.tabs.push(tab)
          } else if (domain) {
            if (!subGroups.domains[domain]) {
              subGroups.domains[domain] = { name: domain, tabs: [], order: 1 }
            }
            subGroups.domains[domain].tabs.push(tab)
          } else {
            subGroups.others.tabs.push(tab)
          }
        } catch (e) {
          if (tab.url && tab.url.startsWith('chrome-extension://')) {
            return
          }
          subGroups.others.tabs.push(tab)
        }
      })
      
      Object.keys(urlCount).forEach(normalizedUrl => {
        const tabsWithUrl = urlCount[normalizedUrl]
        if (tabsWithUrl.length > 1) {
          tabsWithUrl.forEach((tab, index) => {
            if (index > 0) {
              tab.isDuplicate = true
              tab.duplicateCount = tabsWithUrl.length
              tab.duplicateUrl = normalizedUrl
            }
          })
        }
      })
      
      const result = {}
      if (subGroups.homepages.tabs.length > 0) result['homepages'] = subGroups.homepages
      
      const sortedDomains = Object.keys(subGroups.domains)
        .sort((a, b) => subGroups.domains[b].tabs.length - subGroups.domains[a].tabs.length)
      sortedDomains.forEach(domain => {
        result[domain] = subGroups.domains[domain]
      })
      
      if (subGroups.localhost.tabs.length > 0) result['localhost'] = subGroups.localhost
      if (subGroups.others.tabs.length > 0) result['others'] = subGroups.others
      
      windowGroup.subGroups = result
    })
    
    return windowGroups
  }

  async function fetchTabs() {
    loading.value = true
    try {
      const allTabs = await chrome.tabs.query({})
      tabs.value = Array.from(allTabs)
      
      console.log('DEBUG fetchTabs: Before getting readLater from storage')
      const result = await chrome.storage.local.get('readLater')
      console.log('DEBUG fetchTabs: Result from storage:', result)
      console.log('DEBUG fetchTabs: readLater exists:', result && 'readLater' in result)
      
      if (result && 'readLater' in result) {
        console.log('DEBUG fetchTabs: readLater value:', result.readLater)
        console.log('DEBUG fetchTabs: readLater type:', typeof result.readLater)
        console.log('DEBUG fetchTabs: readLater is array:', Array.isArray(result.readLater))
        
        if (Array.isArray(result.readLater)) {
          readLater.value = [...result.readLater]
          console.log('DEBUG fetchTabs: Loaded as array:', readLater.value.length, 'items')
        } else if (typeof result.readLater === 'string') {
          try {
            readLater.value = JSON.parse(result.readLater)
            console.log('DEBUG fetchTabs: Parsed from string:', readLater.value.length, 'items')
          } catch (e) {
            console.error('DEBUG fetchTabs: Failed to parse readLater string:', e)
            readLater.value = []
          }
        } else if (typeof result.readLater === 'object' && result.readLater !== null) {
          // 处理类数组对象（chrome.storage.local有时会将数组转换为对象）
          const values = Object.values(result.readLater)
          if (values.length > 0 && typeof values[0] === 'object') {
            readLater.value = values
            console.log('DEBUG fetchTabs: Converted from object to array:', readLater.value.length, 'items')
          } else {
            console.log('DEBUG fetchTabs: Object is not array-like, setting to empty array')
            readLater.value = []
          }
        } else {
          console.log('DEBUG fetchTabs: Unknown type, setting to empty array')
          readLater.value = []
        }
      } else {
        console.log('DEBUG fetchTabs: readLater not in storage, setting to empty array')
        readLater.value = []
      }
      console.log('DEBUG fetchTabs: Final readLater.value:', readLater.value)
      console.log('DEBUG fetchTabs: Final readLater.value length:', readLater.value.length)
      
      const currentWindow = await chrome.windows.getCurrent()
      currentWindowId.value = currentWindow.id
    } catch (error) {
      console.error('Error fetching tabs:', error)
      readLater.value = []
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
      await fetchTabs()
    } catch (error) {
      console.error('Error closing tab:', error)
    }
  }

  async function closeDuplicateTabs(url) {
    try {
      const tabsToClose = tabs.value.filter(tab => {
        const normalized = tab.url?.split('?')[0]
        return normalized === url.split('?')[0]
      })
      const idsToClose = tabsToClose.slice(1).map(t => t.id)
      if (idsToClose.length > 0) {
        await chrome.tabs.remove(idsToClose)
        await fetchTabs()
      }
    } catch (error) {
      console.error('Error closing duplicate tabs:', error)
    }
  }

  async function saveForLater(tab) {
    if (!tab.url) {
      console.log('DEBUG saveForLater: tab has no URL, skipping')
      return
    }
    
    const currentArray = Array.isArray(readLater.value) ? readLater.value : []
    console.log('DEBUG saveForLater: current readLater array:', currentArray.length, 'items')
    
    const exists = currentArray.some(item => item.url === tab.url && !item.archived)
    if (exists) {
      console.log('DEBUG saveForLater: item already exists, skipping')
      return
    }

    const item = {
      id: Date.now(),
      url: tab.url,
      title: tab.title,
      favIconUrl: tab.favIconUrl,
      savedAt: new Date().toISOString(),
      archived: false
    }
    
    console.log('DEBUG saveForLater: adding item:', item)
    readLater.value = [...currentArray, item]
    console.log('DEBUG saveForLater: new readLater array:', readLater.value.length, 'items')
    
    try {
      await chrome.storage.local.set({ readLater: readLater.value })
      console.log('DEBUG saveForLater: saved to storage successfully')
    } catch (error) {
      console.error('DEBUG saveForLater: error saving to storage:', error)
    }

    // 保存后自动关闭该tab（从列表移除）
    // 注意：不能调用 closeTab()，因为它会触发 fetchTabs()，可能导致刚保存的数据丢失
    if (tab.id) {
      try {
        await chrome.tabs.remove(tab.id)
        // 只刷新 tabs，不刷新 readLater
        const allTabs = await chrome.tabs.query({})
        tabs.value = Array.from(allTabs)
      } catch (error) {
        console.error('Error closing tab after saving for later:', error)
      }
    }
  }

  async function archiveReadLater(id) {
    const index = readLater.value.findIndex(item => item.id === id)
    if (index !== -1) {
      readLater.value[index].archived = true
      await chrome.storage.local.set({ readLater: readLater.value })
    }
  }

  async function restoreFromArchive(id) {
    const index = readLater.value.findIndex(item => item.id === id)
    if (index !== -1) {
      readLater.value[index].archived = false
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

  function isTabSaved(url) {
    return readLater.value.some(item => item.url === url && !item.archived)
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
    closeDuplicateTabs,
    saveForLater,
    archiveReadLater,
    restoreFromArchive,
    destroyReadLater,
    setViewMode,
    isTabSaved
  }
})
