const { createRunOncePlugin } = require("@expo/config-plugins");
const { withPoilabsVdNavigationAndroid } = require("./plugin/withPoilabsVdNavigationAndroid");
const { withPoilabsVdNavigationIOS } = require("./plugin/withPoilabsVdNavigationIOS");

const withPoilabsVdNavigation = (config, props = {}) => {
  const { mapboxToken = "MAPBOX_TOKEN", jitpackToken = "JITPACK_TOKEN" } = props;

  config = withPoilabsVdNavigationAndroid(config, { mapboxToken, jitpackToken });
  
  config = withPoilabsVdNavigationIOS(config);

  return config;
};

const pkg = { name: "@poilabs-dev/navigation-sdk-plugin", version: "1.0.12" };

module.exports = createRunOncePlugin(withPoilabsVdNavigation, pkg.name, pkg.version);