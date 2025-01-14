const vue = require("eslint-plugin-vue");
const baseConfig = require("../../eslint.config.cjs");

module.exports = [
  ...baseConfig,
  ...vue.configs["flat/recommended"],
  {
    files: ["**/*.vue"],
    languageOptions: {
      parserOptions: {
        parser: require("@typescript-eslint/parser")
      }
    }
  },
  {
    files: ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx", "**/*.vue"],
    rules: {
      "vue/singleline-html-element-content-newline": "off"
    }
  }
];
