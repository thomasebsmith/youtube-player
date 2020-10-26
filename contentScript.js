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
  const id = "addon-yt-player-overlay";
  const currentVideo = playlistStatus.currentVideo();

  const overlay = document.createElement("div");
  overlay.setAttribute("id", id);

  const overlayLeft = document.createElement("div");
  overlayLeft.style.display = "inline-block";

  const previousButton = document.createElement("button");
  previousButton.style.background = "none";
  previousButton.style.border = "none";
  previousButton.style.fontSize = "24pt";
  previousButton.style.letterSpacing = "-5pt";
  previousButton.style.cursor = "pointer";
  previousButton.textContent = "◀◀";
  previousButton.addEventListener("click", () => goToPreviousVideo());
  overlayLeft.appendChild(previousButton);

  overlay.appendChild(overlayLeft);

  const overlayMiddle = document.createElement("div");
  overlayMiddle.style.display = "inline-block";
  overlay.appendChild(overlayMiddle);

  const overlayRight = document.createElement("div");
  overlayRight.style.display = "inline-block";

  const nextButton = document.createElement("button");
  nextButton.style.background = "none";
  nextButton.style.border = "none";
  nextButton.style.fontSize = "24pt";
  nextButton.style.letterSpacing = "-5pt";
  nextButton.style.cursor = "pointer";
  nextButton.textContent = "▶▶";
  nextButton.addEventListener("click", () => goToNextVideo());
  overlayRight.appendChild(nextButton);

  overlay.appendChild(overlayRight);

  let overlayIsDragging = false;
  let dragStart = {x: null, y: null};
  let overlayStart = {x: null, y: null};
  const updatePosition = (x, y) => {
    overlay.style.left = `${x - dragStart.x + overlayStart.x}px`;
    overlay.style.top = `${y - dragStart.y + overlayStart.y}px`;
  };
  overlayMiddle.addEventListener("pointerdown", (event) => {
    overlayIsDragging = true;
    overlayStart.x = parseInt(overlay.style.left, 10),
    overlayStart.y = parseInt(overlay.style.top, 10),
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

  overlay.style.backgroundColor = "white";
  overlay.style.border = "1px solid lightgray";
  overlay.style.boxShadow = "3px 3px 3px rgb(30, 30, 30, 0.8)";

  if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
    overlay.style.backgroundColor = "#333333";
    overlay.style.borderColor = "white";
    overlay.style.boxShadow = "3px 3px 3px rgb(100, 100, 100, 0.8)";
    overlay.style.color = "#EEEEEE";
    previousButton.style.color = "#EEEEEE";
    nextButton.style.color = "#EEEEEE";
  }

  overlay.style.padding = "4px";

  overlay.style.position = "fixed";
  overlay.style.left = "20px";
  overlay.style.top = "75px";
  overlay.style.zIndex = "999999";

  overlay.style.cursor = "move";

  const currentName = document.createElement("p");
  currentName.textContent = currentVideo.name;
  currentName.style.fontSize = "16pt";
  overlayMiddle.appendChild(currentName);

  const position = document.createElement("p");
  position.textContent =
    `${playlistStatus.index + 1} / ${playlistStatus.indices.length}`;
  position.style.fontSize = "12pt";
  overlayMiddle.appendChild(position);

  const stylesEl = document.createElement("style");
  document.head.appendChild(stylesEl);
  const styles = stylesEl.sheet;
  styles.insertRule(`:fullscreen #${id} {
    display: none;
  }`);

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
