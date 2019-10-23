const videoIDEl = document.getElementById("videoID");
const addEl = document.getElementById("add");

const showInputError = () => {
  videoIDEl.setCustomValidity("There was an error adding the video");
};

addEl.addEventListener("click", () => {
  const idToAdd = videoIDEl.value.trim();
  if (idToAdd === "") {
    showInputError();
  }
  else {
    storage.addToPlaylist(idToAdd).then(() => {
      videoIDEl.value = "";
    }).catch(() => {
      showInputError();
    });
  }
});
