(function(global) {
  const swap = (array, i, j) => {
    const temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  };
  const shuffled = (array) => {
    array = array.slice();
    for (let i = array.length - 1; i >= 1; --i) {
      const randomIndex = Math.floor(Math.random() * (i + 1));
      swap(array, i, randomIndex);
    }
    return array;
  };

  class PlaylistStatus {
    // REQUIRES: indices.length <= playlist.list.length
    //           indices has unique numbers in 0..playlist.list.length - 1
    constructor(playlist, indices) {
      this.playlist = playlist;
      this.indices = indices;
      this.index = 0;
    }
    currentVideo() {
      return this.playlist.videoAt(this.playlist[this.index]);
    }
    nextVideo() {
      this.index = (this.index + 1) % this.indices.length;
    }
  }

  class Playlist {
    // REQUIRES: videoList.length !== 0
    constructor(videoList) {
      this.list = videoList;
    }
    videoAt(index) {
      return this.list[index];
    }
    static fromObject(obj) {
      return new Playlist(obj.list.map(global.Video.fromObject));
    }
    toObject() {
      return {
        list: this.list
      };
    }
    randomShuffle() {
      let ordering = Array(this.list.length).fill(0).map((_, i) => i);
      ordering = shuffled(ordering);
      return new PlaylistStatus(this, ordering);
    }
  }
  
  global.Playlist = Playlist;
  global.PlaylistStatus = PlaylistStatus;
})(this);
