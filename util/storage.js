// REQUIRES: util/playlist.js is already imported, which in turn requires that
//  util/video.js be already imported.

(function(global) {
  const name = "local";
  const area = browser.storage[name];
  const propName = "playlists";
  const optionsPropName = "options";
  let playlists = null;
  let updateListeners = [];

  const retrievePlaylists = () => {
    return area.get(propName).then(({[propName]: playlists}) => {
      if (Array.isArray(playlists)) {
        return playlists.map(global.Playlist.fromObject);
      }
      return [];
    });
  };
  const retrieveOptions = () => {
    return area.get(optionsPropName).then(({[optionsPropName]: options}) => {
      if (typeof options !== "object") {
        options = {};
      }
      return {
        playback: options.playback || "random"
      };
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
          console.error("Error executing storage listener:", e);
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
      if (index >= playlists.length) {
        throw Error("addToPlaylist index out-of-bounds");
      }
      playlists[index].list.push(video);
      return updateStorage();
    });
  };
  const addToPossiblyNewPlaylist = (index, video) => {
    return Promise.all([getPlaylists(), retrieveOptions()]).then(
      ([playlists, options]) => {
        if (index === playlists.length) {
          playlists.push(new Playlist([], "New playlist", options.playback));
        }
        if (index >= playlists.length) {
          throw Error("addToPossiblyNewPlaylist index out-of-bounds");
        }
        playlists[index].list.push(video);
        return updateStorage();
      }
    );
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
  const getOptions = () => {
    return retrieveOptions();
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
  const setOptions = (options) => {
    return area.set({
      [optionsPropName]: options
    });
  };
  const setPlaylists = (newPlaylists) => {
    playlists = newPlaylists;
    return updateStorage();
  };

  global.storage = {
    addToPlaylist: addToPlaylist,
    addToPossiblyNewPlaylist: addToPossiblyNewPlaylist,
    getOptions: getOptions,
    getPlaylists: getPlaylists,
    onPlaylistUpdate: onPlaylistUpdate,
    removePlaylistUpdateListener: removePlaylistUpdateListener,
    setOptions: setOptions,
    setPlaylists: setPlaylists,
    updatePlaylist: updatePlaylist,
  };
})(this);
