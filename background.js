// Open the app when the extension icon is clicked
chrome.browserAction.onClicked.addListener(() => {
  chrome.tabs.create({
    url: chrome.runtime.getURL('index.html')
  });
});