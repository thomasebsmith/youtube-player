const formEl = document.getElementById("options-form");
const inOrderRadioEl = document.getElementById("inOrderRadio");
const playlistsEl = document.getElementById("playlists");
const randomRadioEl = document.getElementById("randomRadio");

const createPlaylistEl = (playlist, id) => {
  const el = document.createElement("div");
  el.classList.append("playlist");
  // TODO
};

const loadOptions = (options, playlists) => {
  for (let i = 0; i < playlists.length; ++i) {
    createPlaylistEl(playlists[i], i);
  }
  if (options.playback === "random") {
    inOrderRadioEl.checked = false;
    randomRadioEl.checked = true;
  }
  else {
    randomRadioEl.checked = false;
    inOrderRadioEl.checked = true;
  }
};

Promise.all([
  storage.getOptions(),
  storage.getPlaylists()
]).then(([options, playlists]) => {
  loadOptions(options, playlists);
});
