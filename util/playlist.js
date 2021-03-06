// REQUIRES: util/video.js and util/general.js are already imported.
(function(global) {
  // REQUIRES: i < array.length
  //           j < array.length
  // Swaps array[i] and array[j].
  const swap = (array, i, j) => {
    const temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  };

  // Creates and returns a shuffled copy of array.
  const shuffled = (array) => {
    array = array.slice();
    for (let i = array.length - 1; i >= 1; --i) {
      const randomIndex = Math.floor(Math.random() * (i + 1));
      swap(array, i, randomIndex);
    }
    return array;
  };

  // Needed so that Playlist can be referenced before it is defined.
  let PlaylistClass;

  class PlaylistStatus {
    // REQUIRES: indices.length <= playlist.list.length
    //           indices has unique numbers in 0..playlist.list.length - 1
    constructor(playlist, indices) {
      this.playlist = playlist;
      this.indices = indices;
      this.index = 0;
    }
    set playlist(newPlaylist) {
      if (!(newPlaylist instanceof PlaylistClass)) {
        throw "Invalid playlist \"" + newPlaylist + "\"";
      }
      this._playlist = newPlaylist;
    }
    get playlist() {
      return this._playlist;
    }
    set indices(newIndices) {
      newIndices = global.Array.from(newIndices);
      if (newIndices.length > this.playlist.list.length) {
        throw "Invalid indices \"" + newIndices + "\" (too many)";
      }
      this._indices = newIndices;
    }
    get indices() {
      return this._indices;
    }
    set index(newIndex) {
      newIndex = newIndex | 0;
      if (newIndex >= this.indices.length || newIndex < 0) {
        throw "Invalid index \"" + newIndex + "\" (out of range)";
      }
      this._index = newIndex;
    }
    get index() {
      return this._index;
    }
    currentVideo() {
      return this.playlist.videoAt(this.indices[this.index]);
    }
    videoWithOffset(offset) {
      const index = this.indices[(this.index + offset + this.indices.length) %
        this.indices.length];
      return this.playlist.videoAt(index);
    }
    goTo(offset) {
      this.index = (this.index + offset + this.indices.length) %
        this.indices.length;
    }
    nextVideo() {
      this.goTo(+1);
    }
    toObject() {
      return {
        playlist: this.playlist.toObject(),
        indices: this.indices.slice(),
        index: this.index,
        __migrationVersion__: this.__migrationVersion__,
      };
    }
    static fromObject(obj) {
      const result =
        new PlaylistStatus(Playlist.fromObject(obj.playlist), obj.indices);
      result.index = obj.index;
      result.__migrationVersion__ = obj.__migrationVersion__;
      return result;
    }
  }

  class Playlist {
    // REQUIRES: videoList.length !== 0
    //  preference can be "random" or "inOrder"
    constructor(videoList, name, preference = "random") {
      this.list = videoList;
      this.name = name;
      this.preference = preference;
    }
    set list(newList) {
      this._list = global.Array.from(newList);
    }
    get list() {
      return this._list;
    }
    set name(newName) {
      this._name = newName ? newName + "" : Playlist.defaultName;
    }
    get name() {
      return this._name;
    }
    set preference(newPreference) {
      this._preference = newPreference ? newPreference + "" :
        Playlist.defaultPreference;
    }
    get preference() {
      return this._preference;
    }
    videoAt(index) {
      return this.list[index];
    }
    static fromObject(obj) {
      const result = new Playlist(
        obj.list.map(global.Video.fromObject),
        obj.name || Playlist.defaultName,
        obj.preference || Playlist.defaultPreference,
      );
      result.__migrationVersion__ = obj.__migrationVersion__;
      return result;
    }
    toObject() {
      return {
        list: this.list.map(video => video.toObject()),
        name: this.name,
        preference: this.preference,
        __migrationVersion__: this.__migrationVersion__,
      };
    }
    byPreference() {
      switch (this.preference) {
        case "random":
          return this.randomShuffle();
        case "inOrder":
        default:
          return this.inOrder();
      }
    }
    inOrder() {
      let ordering = Array(this.list.length).fill(0).map((_, i) => i);
      return new PlaylistStatus(this, ordering);
    }
    randomShuffle() {
      let ordering = Array(this.list.length).fill(0).map((_, i) => i);
      ordering = shuffled(ordering);
      return new PlaylistStatus(this, ordering);
    }
    equals(otherPlaylist) {
      const listsTheSame = global.utils.deepEqual(
        this.list, otherPlaylist.list, (v1, v2) => {
          if (v1 instanceof global.Video && v2 instanceof global.Video) {
            return v1.equals(v2);
          }
          return null;
        }
      );
      return listsTheSame &&
             this.name === otherPlaylist.name &&
             this.preference === otherPlaylist.preference;
    }
  }
  PlaylistClass = Playlist;
  Playlist.defaultName = "<name>";
  Playlist.defaultPreference = "random";
  
  global.Playlist = Playlist;
  global.PlaylistStatus = PlaylistStatus;
})(this);
