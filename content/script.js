// The full URL of the next video to play.
let nextVideo = null;

// Whether the video on this page has finished playing.
let videoDone = false;

// The current PlaylistStatus.
let currentStatus = null;

const goToNextVideo = () => {
  location.replace(nextVideo);
};

const goToPreviousVideo = () => {
  browser.runtime.sendMessage({playlistDelta: -1}).then(() => {
    currentStatus.goTo(-1);
    location.replace(currentStatus.currentVideo().getURL());
  });
};

const showStatus = (playlistStatus) => {
  const currentVideo = playlistStatus.currentVideo();

  const overlay = document.createElement("div");
  overlay.setAttribute("id", "addon-yt-player-overlay");

  const overlayLeft = document.createElement("div");
  overlayLeft.classList.add("left");

  const previousButton = document.createElement("button");
  previousButton.textContent = "◀◀";
  previousButton.addEventListener("click", () => goToPreviousVideo());
  overlayLeft.appendChild(previousButton);

  overlay.appendChild(overlayLeft);

  const overlayMiddle = document.createElement("div");
  overlayMiddle.classList.add("middle");
  overlay.appendChild(overlayMiddle);

  const overlayRight = document.createElement("div");
  overlayRight.classList.add("right");

  const nextButton = document.createElement("button");
  nextButton.textContent = "▶▶";
  nextButton.addEventListener("click", () => goToNextVideo());
  overlayRight.appendChild(nextButton);

  overlay.appendChild(overlayRight);

  let overlayIsDragging = false;
  let dragStart = {x: null, y: null};
  let overlayStart = {x: null, y: null};
  let overlaySize = {w: null, h: null};
  const updatePosition = (x, y) => {
    const newLeft = x - dragStart.x + overlayStart.x;
    const newTop = y - dragStart.y + overlayStart.y;
    const maxRight = window.innerWidth - overlaySize.w - 20;
    const maxBottom = window.innerHeight - overlaySize.h;
    overlay.style.left = `${Math.max(Math.min(newLeft, maxRight), 0)}px`;
    overlay.style.top = `${Math.max(Math.min(newTop, maxBottom), 0)}px`;
  };
  overlayMiddle.addEventListener("pointerdown", (event) => {
    overlayIsDragging = true;
    const overlayStyles = window.getComputedStyle(overlay);
    overlayStart.x = parseInt(overlayStyles.getPropertyValue("left"), 10);
    overlayStart.y = parseInt(overlayStyles.getPropertyValue("top"), 10);
    overlaySize.w = parseInt(overlayStyles.getPropertyValue("width"), 10);
    overlaySize.h = parseInt(overlayStyles.getPropertyValue("height"), 10);
    dragStart.x = event.clientX;
    dragStart.y = event.clientY;
    document.body.style.userSelect = "none";
  });
  document.addEventListener("pointermove", (event) => {
    if (overlayIsDragging) {
      updatePosition(event.clientX, event.clientY);
    }
  });
  document.addEventListener("pointerup", (event) => {
    if (overlayIsDragging) {
      updatePosition(event.clientX, event.clientY);
    }
    overlayIsDragging = false;
    overlayStart.x = null;
    overlayStart.y = null;
    dragStart.x = null;
    dragStart.y = null;
    document.body.style.userSelect = "auto";
  });


  const currentName = document.createElement("p");
  currentName.classList.add("current-name");
  currentName.textContent = currentVideo.name;
  overlayMiddle.appendChild(currentName);

  const position = document.createElement("p");
  position.classList.add("position");
  position.textContent =
    `${playlistStatus.index + 1} / ${playlistStatus.indices.length}`;
  overlayMiddle.appendChild(position);

  document.body.appendChild(overlay);
};

// When a message is received from the background script, set nextVideo
//  accordingly and play the video if the current video is already done or if
//  the video should be force-played now.
browser.runtime.onMessage.addListener(({
    playNextURL,
    forceNow,
    playlistStatus,
  }) => {
  nextVideo = playNextURL;
  if (videoDone || forceNow) {
    goToNextVideo();
  }
  else {
    showStatus(PlaylistStatus.fromObject(playlistStatus));
    currentStatus = PlaylistStatus.fromObject(playlistStatus);
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
else {
  setTimeout(() => {
    goToNextVideo();
  }, 1500);
}
