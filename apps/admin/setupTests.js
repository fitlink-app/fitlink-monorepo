import "@testing-library/jest-dom/extend-expect";

global.AppleID = {
  auth: {
    init: function(){}
  }
}

global.console = {
  error: jest.fn().mockImplementation(() => {})
}
