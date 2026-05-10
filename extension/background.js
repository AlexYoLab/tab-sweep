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

