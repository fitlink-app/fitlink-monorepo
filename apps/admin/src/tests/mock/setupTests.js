//import "@testing-library/jest-dom/extend-expect";

global.AppleID = {
  auth: {
    init: function(){}
  }
}

global.console.error = jest.fn().mockImplementation(() => {})

let store = {}

global.localStorage = {
  getItem: function(key) {
    return store[key];
  },
  setItem: function(key, value) {
    store[key] = value.toString();
  },
  clear: function() {
    store = {};
  },
  removeItem: function(key) {
    delete store[key];
  }
}
