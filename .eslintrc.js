module.exports = {
  "parser": "babel-eslint",
  "env": {
    "node": true
  },
  "plugins": [
    "flowtype"
  ],
  "extends": [
    "standard",
    "plugin:flowtype/recommended"
  ],
  "rules": {
    "indent": ["error", 2]
  }
};
