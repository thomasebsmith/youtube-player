const formEl = document.getElementById("options-form");
const inOrderRadioEl = document.getElementById("inOrderRadio");
const playlistsEl = document.getElementById("playlists");
const randomRadioEl = document.getElementById("randomRadio");

let areUnsavedEdits = false;

// Creates a div that contains the information (title, songs, etc.) for one
//  playlist in editable HTML. Appends this div to #playlists.
const createPlaylistEl = (playlist, id) => {
  const el = document.createElement("div");
  el.classList.add("playlist");

  const nameEl = document.createElement("input");
  nameEl.setAttribute("type", "text");
  nameEl.value = playlist.name;
  nameEl.setAttribute("placeholder", "Name");
  nameEl.classList.add("playlist-name");
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

    let linkEl = document.createElement("a");
    linkEl.textContent = video.name;
    linkEl.setAttribute("href", video.getURL());
    linkEl.setAttribute("target", "_blank");
    linkEl.setAttribute("title", video.description);

    const editButtonEl = document.createElement("button");
    editButtonEl.textContent = "Edit";
    editButtonEl.setAttribute("type", "button");

    let editingEnabled = false;
    editButtonEl.addEventListener("click", () => {
      if (editingEnabled) {
        linkEl = finishEditing(linkEl);
        editButtonEl.textContent = "Edit";
      }
      else {
        linkEl = editElement(linkEl, {"title": true});
        editButtonEl.textContent = "Done";
      }
      editingEnabled = !editingEnabled;
    });

    videoEl.appendChild(linkEl);
    videoEl.appendChild(editButtonEl);
    videoEl.dataset.id = video.id;
    listEl.appendChild(videoEl);
  }
  el.appendChild(listEl);

  playlistsEl.appendChild(el);
};

// Creates the HTML elements for a given set of options and playlists. Also
//  clears any prior elements.
const loadOptions = (options, playlists) => {
  playlistsEl.textContent = "";
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

const updateUnsavedEdits = () => {
  return checkAreUnsavedEdits().then(areUnsaved => {
    areUnsavedEdits = areUnsaved;
  });
};

const attributeDataKey  = "data-former-attribute-";

// Replaces `element` with an <input> element containing `element`'s text.
// All attributes (except those in attributesToEdit or attributesToKeep)
// are stored as data- attributes for restoring later.
// All attributes in attributesToEdit are added as extra <input> elements.
const editElement = (element,
                     attributesToEdit = Object.create(null),
                     attributesToKeep = Object.create(null)
                    ) => {
  const container = document.createElement("div");
  container.classList.add("editing");

  const newInput = document.createElement("input");
  newInput.value = element.textContent;
  container.appendChild(newInput);

  newInput.dataset.formerTagName = element.tagName;
  for (const attribute of element.attributes) {
    if (attributesToEdit[attribute.name]) {
      const newAttributeInput = document.createElement("input");
      newAttributeInput.dataset.formerAttributeName = attribute.name;
      newAttributeInput.value = attribute.value;
      container.appendChild(newAttributeInput);
    }
    else if (attributesToKeep[attribute.name]) {
      newInput.setAttribute(attribute.name, attribute.value);
    }
    else {
      newInput.setAttribute(
        attributeDataKey + attribute.name,
        attribute.value
      );
    }
  }

  const deleteButton = document.createElement("button");
  deleteButton.textContent = "Delete";
  deleteButton.addEventListener("click", () => {
    const listElement = container.parentElement;
    listElement.parentElement.removeChild(listElement);
    updateUnsavedEdits();
  });
  container.appendChild(deleteButton);

  element.parentElement.replaceChild(container, element);
  return container;
};

// Replaces `containerEl` with its original element (performs the inverse of
// `editElement`).
const finishEditing = (
      containerEl,
      attributesToKeep = Object.create(null),
      dontCheckUnsaved = false
    ) => {
  const inputEl = [...containerEl.children]
                    .filter(x => utils.hasProp(x.dataset, "formerTagName"))[0]
  const newElement = document.createElement(inputEl.dataset.formerTagName);
  newElement.textContent = inputEl.value;

  for (const attribute of inputEl.attributes) {
    if (attributesToKeep[attribute.name]) {
      newElement.setAttribute(attribute.name, attribute.value);
    }
    else if (attribute.name.startsWith(attributeDataKey)) {
      newElement.setAttribute(
        attribute.name.substring(attributeDataKey.length),
        attribute.value
      );
    }
  }

  for (const el of containerEl.children) {
    if (!utils.hasProp(el.dataset, "formerAttributeName")) {
      continue;
    }
    newElement.setAttribute(el.dataset.formerAttributeName, el.value);
  }

  containerEl.parentElement.replaceChild(newElement, containerEl);
  
  if (!dontCheckUnsaved) {
    updateUnsavedEdits();
  }

  return newElement;
};

const finishEditingAll = (dontCheckUnsaved = false) => {
  const editingElements = [...document.querySelectorAll(".editing")];
  for (const element of editingElements) {
    finishEditing(element, Object.create(null), true);
  }

  if (!dontCheckUnsaved) {
    updateUnsavedEdits();
  }
};

// Retrieves the modified playlists and options based on the current state
//  of the form. Note that this data may not reflect the actual playlists or
//  options if the save button has not yet been clicked.
const retrieveOptions = () => {
  const data = new FormData(formEl);
  let playlists = [];
  for (let i = 0; i < playlistsEl.children.length; ++i) {
    const el = playlistsEl.children[i];
    let videos = [];
    const playlistListEl = el.querySelector("ol");
    if (playlistListEl !== null) {
      for (const li of playlistListEl.children) {
        const link = li.querySelector(":scope > a");
        videos.push(new Video(
          link.textContent, // name
          link.getAttribute("title"), // description
          li.dataset.id // id
        ));
      }
    }
    const playlist = new Playlist(
      videos, // list
      el.querySelector("input.playlist-name").value, // name
      data.get("ordering-" + i) // preference
    );
    playlists.push(playlist);
  }

  let options = {};
  options.playback = randomRadioEl.checked ? "random" : "inOrder";

  return { playlists, options };
};

const getBackup = () => {
  finishEditingAll();
  return Promise.all([
    storage.getOptions(),
    storage.getPlaylists()
  ]).then(([options, playlists]) => {
    return JSON.stringify({
      options,
      playlists: playlists.map(p =>  p.toObject())
    });
  });
};

const useBackup = (backup) => {
  const { options, playlists } = JSON.parse(backup);
  return getBackup().then((backup) => {
    console.warn("Evicting backup: " + backup);
    return Promise.all([
      storage.setOptions(options),
      storage.setPlaylists(playlists.map(Playlist.fromObject))
    ]);
  });
};

const checkAreUnsavedEdits = async () => {
  const [savedPlaylists, savedOptions] = await Promise.all([
    storage.getPlaylists(),
    storage.getOptions()
  ]);

  const {
    playlists: editedPlaylists,
    options: editedOptions
  } = retrieveOptions();

  return !utils.deepEqual(savedOptions, editedOptions) ||
         !utils.deepEqual(savedPlaylists, editedPlaylists, (p1, p2) => {
           if (p1 instanceof Playlist && p2 instanceof Playlist) {
             return p1.equals(p2);
           }
           return null;
         });
};

// Initialize the page based on the options and playlists from storage.
Promise.all([
  storage.getOptions(),
  storage.getPlaylists()
]).then(([options, playlists]) => {
  loadOptions(options, playlists);
  formEl.addEventListener("submit", (event) => {
    event.preventDefault();

    finishEditingAll();

    const { options, playlists } = retrieveOptions();
    Promise.all([
      storage.setOptions(options),
      storage.setPlaylists(playlists)
    ]).then(() => {
      return updateUnsavedEdits();
    });
  });
});

window.addEventListener("beforeunload", (event) => {
  if (areUnsavedEdits) {
    event.preventDefault();
  }
});
