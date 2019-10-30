(function(global) {
  const enforceID = (id) => {
    if ((/[^a-zA-Z0-9\-_]/).test(id)) {
      throw "Invalid video id \"" + id + "\"";
    }
  };

  class Video {
    constructor(name, description, id) {
      this.name = name + "";
      this.description = description + "";
      this.id = enforceID(id + "");
    }
    getURL() {
      return "https://www.youtube.com/watch?v=" + this.id;
    }
    static fromObject(obj) {
      return new Video(obj.name, obj.description, obj.id);
    }
  }

  global.Video = Video;
})(this);
