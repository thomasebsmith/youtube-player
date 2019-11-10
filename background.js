// A dictionary of the form [tabId: Playlist] containing Playlists that are
//  currently playing in any tab.
let currentPlaylists = Object.create(null);

// Sends a message to the tab with the given tabId, telling it to play the
//  next video, either immediately (when forceNow is true) or when the current
//  video is done playing.
const nextInPlaylist = (tabId, forceNow = false) => {
  return browser.tabs.executeScript(tabId, {
    file: "/contentScript.js"
  }).then(_ => {
    const playlist = currentPlaylists[tabId];
    browser.tabs.sendMessage(tabId, {
      playNextURL: playlist.currentVideo().getURL(),
      forceNow: forceNow
    });
    playlist.nextVideo();
  });
};

// Create the context menu item to start a Playlist.
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

// Whenever the URL of a tab with a current Playlist changes, queue up the next
//  video.
browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.url && currentPlaylists[tabId]) {
    nextInPlaylist(tabId);
  }
}, {
  urls: ["https://www.youtube.com/*"]
});

// Whenever a tab is removed, delete its current playlist (if it exists).
browser.tabs.onRemoved.addListener((tabId, _) => {
  delete currentPlaylists[tabId];
});
