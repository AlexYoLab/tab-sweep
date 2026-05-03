chrome.runtime.onInstalled.addListener(() => {
  console.log('TabSweep extension installed');
});

// Update badge with tab count
function updateBadge() {
  chrome.tabs.query({ currentWindow: true }, (tabs) => {
    const count = tabs.length;
    let color = '#3d7a4a'; // Green - normal
    if (count > 10) color = '#b8892e'; // Amber - busy
    if (count > 20) color = '#b35a5a'; // Red - need cleanup
    chrome.action.setBadgeText({ text: count.toString() });
    chrome.action.setBadgeBackgroundColor({ color });
  });
}

chrome.tabs.onCreated.addListener(updateBadge);
chrome.tabs.onRemoved.addListener(updateBadge);
chrome.tabs.onUpdated.addListener(updateBadge);
