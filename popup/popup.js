const playlistIDEl = document.getElementById("playlistID");
const videoNameEl = document.getElementById("videoName");
const videoDescEl = document.getElementById("videoDesc");
const videoIDEl = document.getElementById("videoID");
const addEl = document.getElementById("add");

const showInputError = () => {
  videoNameEl.setCustomValidity("There was an error adding the video");
  videoDescEl.setCustomValidity("There was an error adding the video");
  videoIDEl.setCustomValidity("There was an error adding the video");
};

addEl.addEventListener("click", () => {
  let playlistToAddTo = playlistIDEl.value.trim();
  const nameToAdd = videoNameEl.value;
  const descToAdd = videoDescEl.value;
  const idToAdd = videoIDEl.value.trim();
  if (idToAdd === "" || playlistToAddTo === "") {
    showInputError();
    return;
  }
  playlistToAddTo = parseInt(playlistToAddTo, 10);
  if (!Number.isFinite(playlistToAddTo)) {
    showInputError();
    return;
  }

  storage.addToPossiblyNewPlaylist(
    playlistToAddTo,
    new Video(nameToAdd, descToAdd, idToAdd)
  ).then(() => {
    videoNameEl.value = "";
    videoDescEl.value = "";
    videoIDEl.value = "";
  }).catch(() => {
    showInputError();
  });
});
