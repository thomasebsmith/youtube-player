let currentPlaylists = Object.create(null);

const nextInPlaylist = (tabId, forceNow = false) => {
  return browser.tabs.executeScript(tabId, {
    file: "/contentScript.js"
  }).then(_ => {
    const playlist = currentPlaylists[tabId];
    browser.tabs.sendMessage(tabId, {
      playNext: playlist.currentVideo(),
      forceNow: forceNow
    });
    playlist.nextVideo();
  });
};

browser.menus.create({
  documentUrlPatterns: ["https://www.youtube.com/*"],
  icons: {
    "16": "icons/16.png",
    "32": "icons/32.png"
  },
  onclick: (_, tab) => {
    storage.getPlaylist().then((playlist) => {
      if (playlist.list.length > 0) {
        currentPlaylists[tab.id] = playlist.randomShuffle();
        nextInPlaylist(tab.id, true);
      }
    });
  },
  title: "Start playlist"
});

browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.url && currentPlaylists[tabId]) {
    nextInPlaylist(tabId);
  }
}, {
  urls: ["https://www.youtube.com/*"]
});

browser.tabs.onRemoved.addListener((tabId, _) => {
  delete currentPlaylists[tabId];
});
