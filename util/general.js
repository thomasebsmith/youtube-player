(function(global) {
  const Object = ({}).constructor;

  // REQUIRES: obj1 and obj2 do not have reference cycles.
  // Returns true iff obj1 and obj2 are primitives with the same value
  // or arrays/objects for which each element/key-value pair is deepEqual.
  //
  // Optionally, `compare` can be provided as a function that takes two values
  // and return true if they are equal, false if they are not equal, or null
  // if they should instead be compared using deep equality.
  const deepEqual = (obj1, obj2, compare = null) => {
    // If a `compare` function is provided, use it.
    // Note: This structure or similar is needed since compare may return null.
    if (typeof compare === "function") {
      switch (compare(obj1, obj2)) {
        case true:
          return true;
        case false:
          return false;
        default:
          break;
      }
    }

    // Equal objects must have the same type.
    if (typeof obj1 !== typeof obj2) {
      return false;
    }

    // Array comparison //
    if (global.Array.isArray(obj1)) {
      if (!global.Array.isArray(obj2) || obj1.length !== obj2.length) {
        return false;
      }
      for (let i = 0; i < obj1.length; ++i) {
        if (!deepEqual(obj1[i], obj2[i], compare)) {
          return false;
        }
      }
      return true;
    }
    // Regular object comparison //
    else if (typeof obj1 === "object") {
      const keysObj1 = Object.keys(obj1);
      const keysObj2 = Object.keys(obj2);
      const keys = new global.Set(keysObj1.concat(keysObj2));

      for (const key of keys) {
        if (!deepEqual(obj1[key], obj2[key], compare)) {
          return false;
        }
      }
      return true;
    }
    // Primitive value comparison //
    else {
      return obj1 === obj2;
    }
  };

  const hasProp = (obj, prop) => {
    return Object.prototype.hasOwnProperty.call(obj, prop);
  };

  // Checks that check is truthy. If it is not, throws an Error. The error
  // contains message.toString() if message is not null.
  const assert = (check, message = null) => {
    if (!check) {
      if (message === null) {
        message = "Assertion failed.";
      }
      else {
        message = "Assertion failed: " + message;
      }
      throw new Error(message);
    }
  };

  const migrationPropName = "__migrationVersion__";
  
  // Migrates obj from its current version to the latest possible version
  // using migrator.
  //
  // migrator should be an object of the form: {
  //   null: (object, version) => [newObject, newVersion],
  //   [oldVersion]: (object, version) => [newObject, newVersion],
  //   ...
  // }
  //
  // migrate will run migrator[version] until migrator does not
  // have a currentVersion property, updating version newVersion as it goes.
  //
  // Note that the version defaults to null, so migrator[null] is always run
  // first for objects that have never been migrated and have no migration
  // version.
  //
  // Migration version is stored as obj[migrationPropName].
  const migrate = (migrator, obj) => {
    let version = null;
    if (hasProp(obj, migrationPropName) &&
        obj[migrationPropName] !== undefined) {
      version = obj[migrationPropName];
    }
    while (hasProp(migrator, version)) {
      [obj, version] = migrator[version](obj, version);
      obj[migrationPropName] = version;
    }
    return [obj, version];
  };
  migrate.propName = migrationPropName;

  global.utils = {
    assert,
    deepEqual,
    hasProp,
    migrate,
  };
})(this);
