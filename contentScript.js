let nextVideo = null;
let videoDone = false;

const goToNextVideo = () => {
  location.replace(nextVideo);
};

browser.runtime.onMessage.addListener(({playNextURL, forceNow}) => {
  nextVideo = playNextURL;
  if (videoDone || forceNow) {
    goToNextVideo();
  }
});

const videoEl = document.querySelector("video");

if (videoEl !== null) {
  videoEl.addEventListener("ended", () => {
    videoDone = true;
    if (nextVideo !== null) {
      goToNextVideo();
    }
  });
}
