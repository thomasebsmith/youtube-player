(function(global) {
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
  }
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

  global.Playlist = Playlist;
  global.PlaylistStatus = PlaylistStatus;
})(this);
