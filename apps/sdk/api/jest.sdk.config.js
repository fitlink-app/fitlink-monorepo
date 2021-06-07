module.exports = {
  "moduleFileExtensions": ["js", "json", "ts"],
  "rootDir": __dirname,
  "testEnvironment": "node",
  "testRegex": ".spec.ts$",
  "transform": {
    "^.+\\.(t|j)s$": "ts-jest",
    "^.+\\.json$": "ts-jest"
  },
  "globalSetup": "<rootDir>/test/setup.ts",
  // "globalTeardown": "<rootDir>/teardown.ts",
}
