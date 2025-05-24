const withPoilabsAndroid = require("./withPoilabsNavigationAndroid");
const withPoilabsIOS = require("./withPoilabsNavigationIOS");

function withPoilabsSDK(config, props) {
  config = withPoilabsAndroid(config, props);
  config = withPoilabsIOS(config);
  return config;
}

module.exports = withPoilabsSDK;
