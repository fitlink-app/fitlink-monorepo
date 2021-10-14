module.exports = {
  "moduleFileExtensions": ["js", "json", "ts"],
  "rootDir": ".",
  "testEnvironment": "node",
  "testRegex": ".e2e-spec.ts$",
  "transform": {
    "^.+\\.(t|j)s$": "ts-jest",
    "^.+\\.json$": "ts-jest"
  },
  "setupFiles": ["<rootDir>/setup.ts"],
  "globalTeardown": "<rootDir>/teardown.ts"
}
