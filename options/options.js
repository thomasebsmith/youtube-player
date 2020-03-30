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
  nameEl.setAttribute("placeholder", "Name");
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
    const linkEl = document.createElement("a");
    linkEl.textContent = video.name;
    linkEl.setAttribute("href", video.getURL());
    linkEl.setAttribute("target", "_blank");
    videoEl.appendChild(linkEl);
    videoEl.setAttribute("title", video.description);
    videoEl.dataset.id = video.id;
    listEl.appendChild(videoEl);
  }
  el.appendChild(listEl);

  // TODO

  playlistsEl.appendChild(el);
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

const retrieveOptions = () => {
  let playlists = [];
  for (const el of playlistsEl.children) {
    let videos = [];
    for (const li of el.querySelector("ul").children) {
      videos.push(new global.Video(
        li.textContent, // name
        li.getAttribute("title"), // description
        li.dataset.id // id
      ));
    }
    let playlist = new global.Playlist(
      // TODO: get list, name, preference
    );
  }

  let options = {};
  options.playback === randomRadioEl.checked ? "random" : "inOrder";

  return { playlists, options };
};

Promise.all([
  storage.getOptions(),
  storage.getPlaylists()
]).then(([options, playlists]) => {
  loadOptions(options, playlists);
});
