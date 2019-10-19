let nextVideo = null;
let videoDone = false;
const videoEl = document.querySelector("video");

const goToNextVideo = () => {
  location.replace("/watch?v=" + nextVideo);
};

if (videoEl !== null) {
  videoEl.addEventListener("ended", () => {
    videoDone = true;
    if (nextVideo !== null) {
      goToNextVideo();
    }
  });
}

browser.runtime.onMessage.addListener(({playNext, forceNow}) => {
  nextVideo = playNext;
  if (videoDone || forceNow) {
    goToNextVideo();
  }
});
