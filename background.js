// A dictionary of the form [tabId: Playlist] containing Playlists that are
//  currently playing in any tab.
let currentPlaylists = Object.create(null);

const youtubeMatchURL = "https://www.youtube.com/*";


// Sends a message to the tab with the given tabId, telling it to play the
//  video with the given offset, either immediately (when forceNow is true)
//  or when the current video is done playing.
const playInTab = (tabId, offset, forceNow = false) => {
  return browser.tabs.executeScript(tabId, {
    file: "/content/script.js"
  }).then(_ => {
    const playlist = currentPlaylists[tabId];
    browser.tabs.sendMessage(tabId, {
      playNextURL: playlist.videoWithOffset(offset).getURL(),
      forceNow: forceNow,
      playlistStatus: playlist.toObject(),
    });
  });
};

let playlistMenuItems = [];

const playPlaylist = (tabID, playlistID) => {
  return storage.getPlaylists().then((playlists) => {
    const playlist = playlists[playlistID];
    if (playlist.list.length > 0) {
      currentPlaylists[tabID] = playlist.byPreference();
      playInTab(tabID, 0, true);
    }
  });
};

const createContextMenuItem = (playlists, i) => {
  playlistMenuItems[i] = browser.menus.create({
    documentUrlPatterns: [youtubeMatchURL],
    icons: {
      "16": "icons/16.png",
      "32": "icons/32.png"
    },
    onclick: (_, tab) => {
      playPlaylist(tab.id, i);
    },
    title: "Start playlist " + playlists[i].name
  });
};

// Create the context menu items to start Playlists.
storage.getPlaylists().then((playlists) => {
  for (let i = 0; i < playlists.length; ++i) {
    createContextMenuItem(playlists, i);
  }
});
storage.onPlaylistUpdate((playlists) => {
  if (playlists.length > playlistMenuItems.length) {
    for (let i = playlistMenuItems.length; i < playlists.length; ++i) {
      createContextMenuItem(playlists, i);
    }
  }
  while (playlistMenuItems.length > playlists.length) {
    browser.menus.remove(playlistMenuItems[playlistMenuItems.length - 1]);
    playlistMenuItems.pop();
  }
});

// Whenever the URL of a tab with a current Playlist changes, queue up the next
//  video.
browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.url && currentPlaylists[tabId]) {
    const nextURL = currentPlaylists[tabId].videoWithOffset(+1).getURL();
    if (changeInfo.url === nextURL) {
      currentPlaylists[tabId].nextVideo();
    }
    playInTab(tabId, +1, false);
  }
}, {
  urls: [youtubeMatchURL]
});

// Whenever a tab is removed, delete its current playlist (if it exists).
browser.tabs.onRemoved.addListener((tabId, _) => {
  delete currentPlaylists[tabId];
});

browser.runtime.onMessage.addListener(({playlistDelta}, sender) => {
  currentPlaylists[sender.tab.id].goTo(playlistDelta);
  return Promise.resolve();
});

const parseCommand = (name) => {
  if (name.startsWith("playlist-")) {
    const number = parseInt(name.substring("playlist-".length), 10);
    if (!Number.isFinite(number)) {
      return null;
    }
    return {
      type: "play-playlist",
      playlistID: number
    };
  }
  return null;
};

browser.commands.onCommand.addListener((name) => {
  const command = parseCommand(name);
  if (command === null) {
    console.warn("Unknown command " + name);
    return;
  }

  switch (command.type) {
    case "play-playlist":
      browser.tabs.query({
        active: true,
        currentWindow: true,
        url: youtubeMatchURL
      }).then((results) => {
        if (results.length !== 1) {
          return;
        }
        playPlaylist(results[0].id, command.playlistID);
      });
      break;
    default:
      console.warn("Unknown command type " + command.type);
      break;
  }
});
