// The full URL of the next video to play.
let nextVideo = null;

// Whether the video on this page has finished playing.
let videoDone = false;

const goToNextVideo = () => {
  location.replace(nextVideo);
};

// When a message is received from the background script, set nextVideo
//  accordingly and play the video if the current video is already done or if
//  the video should be force-played now.
browser.runtime.onMessage.addListener(({playNextURL, forceNow}) => {
  nextVideo = playNextURL;
  if (videoDone || forceNow) {
    goToNextVideo();
  }
});

// If a <video> element exists on the page, go to the next video when it ends.
const videoEl = document.querySelector("video");

const handleVideoMaybeDone = () => {
  const endScreen = document.querySelector(".html5-endscreen");
  if (endScreen !== null && endScreen.style.display !== "none") {
    handleVideoDone();
  }
};

const handleVideoDone = () => {
  videoDone = true;
  if (nextVideo !== null) {
    goToNextVideo();
  }
};

if (videoEl !== null) {
  videoEl.addEventListener("ended", handleVideoDone);
  videoEl.addEventListener("pause", handleVideoMaybeDone);
}
