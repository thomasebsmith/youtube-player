(function(global) {
  // REQUIRES: obj1 and obj2 do not have reference cycles.
  // Returns true iff obj1 and obj2 are primitives with the same value
  // or arrays/objects for which each element/key-value pair is deepEqual.
  const deepEqual = (obj1, obj2) => {
    if (typeof obj1 !== typeof obj2) {
      return false;
    }

    if (global.Array.isArray(obj1)) {
      if (!global.Array.isArray(obj2) || obj1.length !== obj2.length) {
        return false;
      }
      for (let i = 0; i < obj1.length; ++i) {
        if (!deepEqual(obj1[i], obj2[i])) {
          return false;
        }
      }
      return true;
    }
    else if (typeof obj1 === "object") {
      const keysObj1 = global.Object.keys(obj1);
      const keysObj2 = global.Object.keys(obj2);
      const keys = new global.Set(keysObj1.concat(keysObj2));

      for (const key of keys) {
        if (!deepEqual(obj1[key], obj2[key])) {
          return false;
        }
      }
      return true;
    }
    else {
      return obj1 === obj2;
    }
  };

  global.utils = {
    deepEqual,
  };
})(this);
