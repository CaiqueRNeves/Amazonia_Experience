module.exports = {
  "env": {
    "node": true,
    "commonjs": true,
    "es2021": true,
    "jest": true
  },
  "extends": [
    "eslint:recommended",
    "prettier"
  ],
  "parserOptions": {
    "ecmaVersion": 12
  },
  "rules": {
    "indent": [
      "error",
      2
    ],
    "linebreak-style": [
      "error",
      "unix"
    ],
    "quotes": [
      "error",
      "single",
      { "avoidEscape": true }
    ],
    "semi": [
      "error",
      "always"
    ],
    "no-unused-vars": [
      "warn",
      { 
        "args": "none",
        "ignoreRestSiblings": true
      }
    ],
    "no-console": [
      "warn",
      { "allow": ["warn", "error", "info"] }
    ],
    "no-var": "error",
    "prefer-const": "warn",
    "eqeqeq": ["error", "always"],
    "curly": ["error", "all"],
    "max-len": ["warn", { "code": 120 }]
  }
}