chrome.runtime.onInstalled.addListener(() => {
  console.log('TabSweep extension installed');
});

chrome.action.onClicked.addListener(() => {
  chrome.tabs.create({ url: chrome.runtime.getURL('dist/index.html') });
});

function updateBadge() {
  chrome.tabs.query({ currentWindow: true }, (tabs) => {
    const count = tabs.length;
    let color = '#3d7a4a';
    if (count > 10) color = '#b8892e';
    if (count > 20) color = '#b35a5a';
    chrome.action.setBadgeText({ text: count.toString() });
    chrome.action.setBadgeBackgroundColor({ color });
  });
}

chrome.tabs.onCreated.addListener(updateBadge);
chrome.tabs.onRemoved.addListener(updateBadge);
chrome.tabs.onUpdated.addListener(updateBadge);

chrome.tabs.onCreated.addListener((tab) => {
  console.log('[TabSweep] New tab created:', tab);
  console.log('[TabSweep] Tab URL:', tab.url);
  
  const isNewTab = !tab.url || 
                   tab.url === 'about:blank' || 
                   tab.url === 'chrome://newtab' ||
                   tab.url.startsWith('chrome-search://');
  
  console.log('[TabSweep] Is new tab:', isNewTab);
  
  if (isNewTab) {
    chrome.storage.local.get(['newTabChoiceMade', 'useDefaultNewTab'], (result) => {
      console.log('[TabSweep] Storage result:', result);
      
      if (!result.newTabChoiceMade) {
        console.log('[TabSweep] User not made choice yet, redirecting to TabSweep');
        chrome.tabs.update(tab.id, { url: chrome.runtime.getURL('dist/index.html') });
        return;
      }
      
      if (result.useDefaultNewTab) {
        console.log('[TabSweep] User chose default new tab, doing nothing');
        return;
      } else {
        console.log('[TabSweep] User chose TabSweep, redirecting');
        chrome.tabs.update(tab.id, { url: chrome.runtime.getURL('dist/index.html') });
      }
    });
  } else {
    console.log('[TabSweep] Not a new tab, skipping');
  }
});

// 监听存储变化，用于调试
chrome.storage.onChanged.addListener((changes, namespace) => {
  console.log('[TabSweep] Storage changed:', changes, namespace);
});