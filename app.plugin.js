const { createRunOncePlugin } = require("@expo/config-plugins");
const withPoilabsSDK = require("./plugin");

const pkg = { name: "@poilabs-dev/navigation-sdk-plugin", version: "1.0.43" };
module.exports = createRunOncePlugin(
  withPoilabsSDK,
  pkg.name,
  pkg.version
);
