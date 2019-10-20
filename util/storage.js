(function(global) {
  const area = browser.storage.local;
  let playlist = null;

  const swap = (array, i, j) => {
    const temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  };
  const shuffled = (array) => {
    array = array.slice();
    for (let i = array.length - 1; i >= 1; --i) {
      const randomIndex = Math.floor(Math.random() * (i + 1));
      swap(array, i, randomIndex);
    }
  };

  const retrievePlaylist = () => {
    return area.get("playlist").then(({playlist}) => {
      playlist || []
    });
  };

  const updateStorage = () => {
    return area.set({
      playlist: playlist
    });
  };
  const addToPlaylist = (youtubeID) => {
    playlist.push(youtubeID);
    return updateStorage();
  };
  const getPlaylist = () => {
    if (playlist === null) {
      return retrivePlaylist().then((retrived) => {
        playlist = retrieved;
        return playlist;
      });
    }
    return Promise.resolve(playlist);
  };
  const getShuffledPlaylist = () => {
    return shuffled(getPlaylist());
  };

  global.storage = {
    addToPlaylist: addToPlaylist,
    getPlaylist: getPlaylist,
    getShuffledPlaylist: getShuffledPlaylist
  };
})(this);
