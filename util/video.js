(function(global) {
  const enforceID = (id) => {
    // YouTube IDs must contain only alphanumeric characters, hyphens, and
    //  underscores.
    if ((/[^a-zA-Z0-9\-_]/).test(id)) {
      throw "Invalid video id \"" + id + "\"";
    }
    return id;
  };

  const youTubeWatchURL = "https://www.youtube.com/watch?v=";

  class Video {
    constructor(name, description, id) {
      this.name = name + "";
      this.description = description + "";
      this.id = enforceID(id + "");
    }
    getURL() {
      return youTubeWatchURL + this.id;
    }
    static fromObject(obj) {
      return new Video(obj.name, obj.description, obj.id);
    }
    toObject() {
      return {
        name: this.name,
        description: this.description,
        id: this.id
      };
    }
  }

  global.Video = Video;
})(this);
