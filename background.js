let playlist = [];

let currentPlaylists = Object.create(null);

const nextInPlaylist = (tabId, forceNow = false) => {
  return browser.tabs.executeScript(tabId, {
    file: "/contentScript.js"
  }).then(_ => {
    browser.tabs.sendMessage(tabId, {
      playNext: playlist[currentPlaylists[tabId]++],
      forceNow: forceNow
    });
    currentPlaylists[tabId] %= playlist.length;
  });
};

browser.browserAction.onClicked.addListener((tab) => {
  const url = new URL(tab.url);
  if (url.origin === "https://www.youtube.com") {
    currentPlaylists[tab.id] = 0;
    nextInPlaylist(tab.id, true);
  }
});

browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.url && currentPlaylists[tabId] !== undefined) {
    nextInPlaylist(tabId);
  }
}, {
  urls: ["https://www.youtube.com/*"]
});

browser.tabs.onRemoved.addListener((tabId, _) => {
  delete currentPlaylists[tabId];
});
