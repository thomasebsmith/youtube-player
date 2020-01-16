// REQUIRES: util/playlist.js is already imported, which in turn requires that
//  util/video.js be already imported.

(function(global) {
  const name = "local";
  const area = browser.storage[name];
  const propName = "playlist";
  let playlist = null;

  const retrievePlaylist = () => {
    return area.get(propName).then(({playlist}) => {
      if (playlist) {
        return global.Playlist.fromObject(playlist);
      }
      return new global.Playlist([]);
    });
  };
  browser.storage.onChanged.addListener((changes, areaName) => {
    if (changes[propName] && areaName === name) {
      playlist = Playlist.fromObject(changes[propName].newValue);
    }
  });
  const updateStorage = () => {
    return area.set({
      playlist: playlist.toObject()
    });
  };
  const addToPlaylist = (video) => {
    return getPlaylist().then((playlist) => {
      playlist.list.push(video);
      return updateStorage();
    });
  };
  const getPlaylist = () => {
    if (playlist === null) {
      return retrievePlaylist().then((retrieved) => {
        playlist = retrieved;
        return playlist;
      });
    }
    return Promise.resolve(playlist);
  };

  global.storage = {
    addToPlaylist: addToPlaylist,
    getPlaylist: getPlaylist
  };
})(this);
