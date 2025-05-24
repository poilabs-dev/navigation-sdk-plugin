const { withDangerousMod, withInfoPlist } = require("@expo/config-plugins");
const fs = require("fs");
const path = require("path");

// iOS module files to copy
const IOS_MODULE_FILES = [
  {
    source: "NavigationView.swift",
    destination: "PoiMapModule/NavigationView.swift",
  },
  { source: "PoiMapModule.h", destination: "PoiMapModule/PoiMapModule.h" },
  { source: "PoiMapModule.m", destination: "PoiMapModule/PoiMapModule.m" },
  {
    source: "PoilabsMapManager.m",
    destination: "PoiMapModule/PoilabsMapManager.m",
  },
  {
    source: "PoilabsNavigationBridge.h",
    destination: "PoiMapModule/PoilabsNavigationBridge.h",
  },
  {
    source: "PoilabsNavigationBridge.m",
    destination: "PoiMapModule/PoilabsNavigationBridge.m",
  },
];

function addIOSInfoPlist(config) {
  return withInfoPlist(config, (mod) => {
    const plist = mod.modResults;

    // Mapbox settings
    plist.MGLMapboxMetricsEnabledSettingShownInApp = true;

    // Location permissions
    plist.NSLocationWhenInUseUsageDescription =
      "Bu uygulama iç mekan navigasyonu için konum iznine ihtiyaç duyar";
    plist.NSLocationAlwaysUsageDescription =
      "Bu uygulama arka planda navigasyon için konum iznine ihtiyaç duyar";

    // Bluetooth permissions
    plist.NSBluetoothPeripheralUsageDescription =
      "Beacon tarama için Bluetooth gereklidir";
    plist.NSBluetoothAlwaysUsageDescription =
      "Beacon tarama için Bluetooth gereklidir";

    return mod;
  });
}

function addIOSPods(config) {
  return withDangerousMod(config, [
    "ios",
    async (modConfig) => {
      const podfilePath = path.join(
        modConfig.modRequest.projectRoot,
        "ios/Podfile"
      );

      if (!fs.existsSync(podfilePath)) {
        console.warn("ios/Podfile not found, skipping pod setup");
        return modConfig;
      }

      let podfileContent = fs.readFileSync(podfilePath, "utf8");

      if (!podfileContent.includes("pod 'PoilabsNavigation'")) {
        podfileContent = podfileContent.replace(
          /target ['"].+['"] do/,
          (match) => `${match}\n  pod 'PoilabsNavigation'`
        );
        fs.writeFileSync(podfilePath, podfileContent, "utf8");
        console.log("Added PoilabsNavigation pod to Podfile");
      }

      return modConfig;
    },
  ]);
}

function addIOSNativeModules(config) {
  return withDangerousMod(config, [
    "ios",
    async (modConfig) => {
      const root = modConfig.modRequest.projectRoot;
      const projectName = modConfig.modRequest.projectName || config.name;
      const iosDir = path.join(root, "ios", projectName);

      if (!fs.existsSync(iosDir)) {
        fs.mkdirSync(iosDir, { recursive: true });
      }

      // Create PoiMapModule directory
      const moduleDir = path.join(iosDir, "PoiMapModule");
      if (!fs.existsSync(moduleDir)) {
        fs.mkdirSync(moduleDir, { recursive: true });
      }

      // Copy native module files
      const templateDir = path.join(__dirname, "..", "src", "ios");

      IOS_MODULE_FILES.forEach((file) => {
        const srcFile = path.join(templateDir, file.source);
        const destFile = path.join(iosDir, file.destination);
        const destDir = path.dirname(destFile);

        // Ensure destination directory exists
        if (!fs.existsSync(destDir)) {
          fs.mkdirSync(destDir, { recursive: true });
        }

        if (fs.existsSync(srcFile)) {
          let content = fs.readFileSync(srcFile, "utf8");
          content = content.replace(/__PROJECT_NAME__/g, projectName);
          fs.writeFileSync(destFile, content, "utf8");
          console.log(`Copied iOS module file: ${destFile}`);
        } else {
          console.warn(`Source file not found: ${srcFile}`);
        }
      });

      // Create or update bridging header
      const bridgingHeaderPath = path.join(
        iosDir,
        `${projectName}-Bridging-Header.h`
      );
      const bridgingHeaderContent = `
  //
  //  Use this file to import your target's public headers that you would like to expose to Swift.
  //
  
  #import <React/RCTBridgeModule.h>
  #import <React/RCTViewManager.h>
  #import "PoiMapModule/PoiMapModule.h"
  #import "PoiMapModule/PoilabsNavigationBridge.h"
  `;

      if (!fs.existsSync(bridgingHeaderPath)) {
        fs.writeFileSync(bridgingHeaderPath, bridgingHeaderContent, "utf8");
        console.log(`Created bridging header: ${bridgingHeaderPath}`);
      } else {
        // Update existing bridging header if it doesn't include our imports
        let existingContent = fs.readFileSync(bridgingHeaderPath, "utf8");
        if (!existingContent.includes("PoiMapModule/PoiMapModule.h")) {
          existingContent += `\n#import "PoiMapModule/PoiMapModule.h"`;
          fs.writeFileSync(bridgingHeaderPath, existingContent, "utf8");
          console.log(`Updated bridging header: ${bridgingHeaderPath}`);
        }
      }

      // Update Xcode project file to add new files
      console.log(`
  iOS files added to ${iosDir}/PoiMapModule/
  You may need to run 'pod install' again and ensure these files are included in your Xcode project.
  `);

      return modConfig;
    },
  ]);
}

function withPoilabsNavigationIOS(config) {
  config = addIOSInfoPlist(config);
  config = addIOSPods(config);
  config = addIOSNativeModules(config);

  return config;
}

module.exports = withPoilabsNavigationIOS;
