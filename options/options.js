const formEl = document.getElementById("options-form");
const inOrderRadioEl = document.getElementById("inOrderRadio");
const playlistsEl = document.getElementById("playlists");
const randomRadioEl = document.getElementById("randomRadio");
const saveButton = document.getElementById("saveButton");

const createPlaylistEl = (playlist, id) => {
  const el = document.createElement("div");
  el.classList.add("playlist");

  const nameEl = document.createElement("input");
  nameEl.setAttribute("type", "text");
  nameEl.value = playlist.name;
  nameEl.setAttribute("placeholder", "name");
  el.appendChild(nameEl);

  const randomOrderEl = document.createElement("input");
  randomOrderEl.setAttribute("type", "radio");
  randomOrderEl.setAttribute("name", "ordering-" + id);
  randomOrderEl.setAttribute("value", "random");
  randomOrderEl.setAttribute("id", "randomRadio-" + id);
  el.appendChild(randomOrderEl);
  const randomOrderLabelEl = document.createElement("label");
  randomOrderLabelEl.setAttribute("for", "randomRadio-" + id);
  randomOrderLabelEl.textContent = "Random order";
  el.appendChild(randomOrderLabelEl);

  const inOrderEl = document.createElement("input");
  inOrderEl.setAttribute("type", "radio");
  inOrderEl.setAttribute("name", "ordering-" + id);
  inOrderEl.setAttribute("value", "inOrder");
  inOrderEl.setAttribute("id", "inOrderRadio-" + id);
  el.appendChild(inOrderEl);
  const inOrderLabelEl = document.createElement("label");
  inOrderLabelEl.setAttribute("for", "inOrderRadio-" + id);
  inOrderLabelEl.textContent = "In order";
  el.appendChild(inOrderLabelEl);

  (playlist.preference === "random" ? randomOrderEl : inOrderEl).checked = true;

  const listEl = document.createElement("ol");
  for (const video of playlist.list) {
    const videoEl = document.createElement("li");
    videoEl.textContent = video.name;
    videoEl.title = video.description;
    listEl.appendChild(videoEl);
  }
  el.appendChild(listEl);

  // TODO

  formEl.insertBefore(el, saveButton);
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
