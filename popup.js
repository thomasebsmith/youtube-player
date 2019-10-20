const videoIDEl = document.getElementById("videoID");
const addEl = document.getElementById("add");

addEl.addEventListener("click", () => {
  const idToAdd = videoIDEl.value;
  storage.addToPlaylist(idToAdd);
  videoEl.value = "";
});
