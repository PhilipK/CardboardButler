module.exports = {
  "roots": [
    "<rootDir>/src",
    "<rootDir>/tests"
  ],
  "moduleNameMapper": {
    "\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$": "<rootDir>/tests/__mocks__/fileMock.js",
    "\\.(css|scss|less)$": "<rootDir>/tests/__mocks__/styleMock.js"
  },
  coverageDirectory: "<rootDir>/tests/__coverage__/",
  "transform": {
    "^.+\\.tsx?$": "ts-jest"
  },
  "reporters": ["default", "jest-junit"]
}