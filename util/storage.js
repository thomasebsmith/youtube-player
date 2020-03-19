// REQUIRES: util/playlist.js is already imported, which in turn requires that
//  util/video.js be already imported.

(function(global) {
  const name = "local";
  const area = browser.storage[name];
  const propName = "playlists";
  let playlists = null;
  let updateListeners = [];

  const retrievePlaylists = () => {
    return area.get(propName).then(({playlists}) => {
      if (Array.isArray(playlists)) {
        return playlists.map(global.Playlist.fromObject);
      }
      return [];
    });
  };
  browser.storage.onChanged.addListener((changes, areaName) => {
    if (changes[propName] && areaName === name) {
      playlists = changes[propName].newValue.map(global.Playlist.fromObject);
      for (const listener of updateListeners) {
        try {
          if (listener !== undefined) {
            listener(playlists);
          }
        }
        catch (e) {
          // Listener errors ignored.
        }
      }
    }
  });
  const updateStorage = () => {
    return area.set({
      [propName]: playlists.map(playlist => playlist.toObject())
    });
  };
  const addToPlaylist = (index, video) => {
    return getPlaylists().then((playlists) => {
      playlists[index].list.push(video);
      return updateStorage();
    });
  };
  const getPlaylists = () => {
    if (playlists === null) {
      return retrievePlaylists().then((retrieved) => {
        playlists = retrieved;
        return playlists;
      });
    }
    return Promise.resolve(playlists);
  };
  const updatePlaylist = (index, newPlaylist) => {
    return getPlaylists().then((playlists) => {
      playlists[index] = newPlaylist;
      return updateStorage();
    });
  };
  const onPlaylistUpdate = (listener) => {
    return updateListeners.push(listener) - 1;
  };
  const removePlaylistUpdateListener = (id) => {
    delete updateListeners[id];
  };

  global.storage = {
    addToPlaylist: addToPlaylist,
    getPlaylists: getPlaylists,
    onPlaylistUpdate: onPlaylistUpdate,
    removePlaylistUpdateListener: removePlaylistUpdateListener,
    updatePlaylist: updatePlaylist
  };
})(this);
