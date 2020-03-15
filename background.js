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

const createContextMenuItem = (playlists, i) => {
  browser.menus.create({
    documentUrlPatterns: ["https://www.youtube.com/*"],
    icons: {
      "16": "icons/16.png",
      "32": "icons/32.png"
    },
    onclick: (_, tab) => {
      storage.getPlaylists().then((playlists) => {
        const playlist = playlists[i];
        if (playlist.list.length > 0) {
          currentPlaylists[tab.id] = playlist.byPreference();
          nextInPlaylist(tab.id, true);
        }
      });
    },
    title: "Start playlist " + playlists[i].name
  });
};

// Create the context menu items to start Playlists.
let numPlaylists;
storage.getPlaylists().then((playlists) => {
  for (let i = 0; i < playlists.length; ++i) {
    createContextMenuItem(playlists, i);
  }
  numPlaylists = playlists.length;
});
// FIXME: What if playlists are removed??
storage.onPlaylistUpdate((playlists) => {
  if (playlists.length > numPlaylists) {
    for (let i = numPlaylists; i < playlists.length; ++i) {
      createContextMenuItem(playlists, i);
    }
    numPlaylists = playlists.length;
  }
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
