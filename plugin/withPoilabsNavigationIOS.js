const { withDangerousMod, withInfoPlist } = require("@expo/config-plugins");
const fs = require("fs");
const path = require("path");
const https = require("https");
const { execSync } = require('child_process');

// iOS module files to copy
const IOS_MODULE_FILES = [
  {
    source: "NavigationView.swift",
    destination: "NavigationView.swift",
  },
  {
    source: "PoilabsMapManager.m",
    destination: "PoilabsMapManager.m",
  },
  {
    source: "PoilabsNavigationBridge.h",
    destination: "PoilabsNavigationBridge.h",
  },
  {
    source: "PoilabsNavigationBridge.m",
    destination: "PoilabsNavigationBridge.m",
  },
];

// Main iOS plugin function - updated
function withPoilabsNavigationIOS(config) {
  console.log("🍎 Configuring iOS for PoilabsNavigation...");
  
  config = addIOSInfoPlist(config);
  config = addIOSPods(config);
  config = addIOSNativeModules(config);
  config = addMapboxMobileEventsFramework(config); // 🆕 Newly added
  
  console.log("✅ iOS configuration completed!");
  
  return config;
}

// Other functions remain the same...
function addIOSInfoPlist(config) {
  return withInfoPlist(config, (mod) => {
    const plist = mod.modResults;
    
    plist.MGLMapboxMetricsEnabledSettingShownInApp = true;
    
    plist.NSLocationWhenInUseUsageDescription =
      "This app needs location permission for indoor navigation.";
    plist.NSLocationAlwaysAndWhenInUseUsageDescription =
      "This app needs location permission for background navigation.";
    plist.NSLocationAlwaysUsageDescription =
      "This app needs location permission for background navigation.";
    plist.NSLocationUsageDescription =
      "This app needs location permission for indoor navigation.";
    plist.NSBluetoothPeripheralUsageDescription =
      "Bluetooth is required for beacon scanning.";
    plist.NSBluetoothAlwaysUsageDescription =
      "Bluetooth is required for beacon scanning.";

    if (!plist.UIBackgroundModes) {
      plist.UIBackgroundModes = [];
    }
    
    if (!plist.UIBackgroundModes.includes("bluetooth-central")) {
      plist.UIBackgroundModes.push("bluetooth-central");
    }
    
    if (!plist.UIBackgroundModes.includes("location")) {
      plist.UIBackgroundModes.push("location");
    }

    if (!plist.NSAppTransportSecurity) {
      plist.NSAppTransportSecurity = {};
    }
    plist.NSAppTransportSecurity.NSAllowsArbitraryLoads = false;
    plist.NSAppTransportSecurity.NSAllowsLocalNetworking = true;

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
        const targetMatch = podfileContent.match(/target\s+['"].+['"]\s+do/);
        if (targetMatch) {
          const insertIndex = podfileContent.indexOf(targetMatch[0]) + targetMatch[0].length;
          podfileContent = 
            podfileContent.slice(0, insertIndex) +
            "\n  pod 'PoilabsNavigation'" +
            podfileContent.slice(insertIndex);
        }
        
        fs.writeFileSync(podfilePath, podfileContent, "utf8");
        console.log("✅ Added PoilabsNavigation pod to Podfile");
      }

      return modConfig;
    },
  ]);
}

function addIOSInfoPlist(config) {
  return withInfoPlist(config, (mod) => {
    const plist = mod.modResults;

    // Mapbox settings
    plist.MGLMapboxMetricsEnabledSettingShownInApp = true;

    // Location permissions
    plist.NSLocationWhenInUseUsageDescription =
      "AVM içerisinde kampanyalardan anlık haberdar olmak ve mağazalara yönlendirme almak için konum servisleri ayarını açık tutman gerekiyor.";
    plist.NSLocationAlwaysAndWhenInUseUsageDescription =
      "AVM içerisinde kampanyalardan anlık haberdar olmak ve mağazalara yönlendirme almak için konum servisleri ayarını açık tutman gerekiyor.";
    plist.NSLocationAlwaysUsageDescription =
      "AVM içerisinde kampanyalardan anlık haberdar olmak ve mağazalara yönlendirme almak için konum servisleri ayarını açık tutman gerekiyor.";
    plist.NSLocationUsageDescription =
      "AVM içerisinde kampanyalardan anlık haberdar olmak ve mağazalara yönlendirme almak için konum servisleri ayarını açık tutman gerekiyor.";

    // Bluetooth permissions
    plist.NSBluetoothPeripheralUsageDescription =
      "AVM içerisinde kampanyalardan anlık haberdar olmak ve mağazalara yönlendirme almak için bluetooth servisleri ayarını açık tutman gerekiyor.";
    plist.NSBluetoothAlwaysUsageDescription =
      "AVM içerisinde kampanyalardan anlık haberdar olmak ve mağazalara yönlendirme almak için bluetooth servisleri ayarını açık tutman gerekiyor.";

    // Background modes
    if (!plist.UIBackgroundModes) {
      plist.UIBackgroundModes = [];
    }
    
    if (!plist.UIBackgroundModes.includes("bluetooth-central")) {
      plist.UIBackgroundModes.push("bluetooth-central");
    }
    
    if (!plist.UIBackgroundModes.includes("location")) {
      plist.UIBackgroundModes.push("location");
    }

    // App Transport Security
    if (!plist.NSAppTransportSecurity) {
      plist.NSAppTransportSecurity = {};
    }
    plist.NSAppTransportSecurity.NSAllowsArbitraryLoads = false;
    plist.NSAppTransportSecurity.NSAllowsLocalNetworking = true;

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

      // Add PoilabsNavigation pod if not exists
      if (!podfileContent.includes("pod 'PoilabsNavigation'")) {
        const targetMatch = podfileContent.match(/target\s+['"].+['"]\s+do/);
        if (targetMatch) {
          const insertIndex = podfileContent.indexOf(targetMatch[0]) + targetMatch[0].length;
          podfileContent = 
            podfileContent.slice(0, insertIndex) +
            "\n  pod 'PoilabsNavigation', '4.4.1'" +
            podfileContent.slice(insertIndex);
        }
        
        fs.writeFileSync(podfilePath, podfileContent, "utf8");
        console.log("✅ Added PoilabsNavigation pod to Podfile");
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
        console.warn(`iOS directory not found: ${iosDir}`);
        return modConfig;
      }

      const templateDir = path.join(__dirname, "..", "src", "ios");

      IOS_MODULE_FILES.forEach((file) => {
        const srcFile = path.join(templateDir, file.source);
        const destFile = path.join(iosDir, file.destination);

        if (fs.existsSync(srcFile)) {
          let content = fs.readFileSync(srcFile, "utf8");
          content = content.replace(/__PROJECT_NAME__/g, projectName);
          fs.writeFileSync(destFile, content, "utf8");
          console.log(`✅ Copied iOS module file: ${file.destination}`);
        } else {
          console.warn(`❌ Source file not found: ${srcFile}`);
        }
      });

      // Create or update bridging header
      const bridgingHeaderPath = path.join(iosDir, `${projectName}-Bridging-Header.h`);
      const bridgingHeaderContent = `//
//  Use this file to import your target's public headers that you would like to expose to Swift.
//

#import <React/RCTBridgeModule.h>
#import <React/RCTViewManager.h>
#import "PoilabsNavigationBridge.h"
`;

      if (!fs.existsSync(bridgingHeaderPath)) {
        fs.writeFileSync(bridgingHeaderPath, bridgingHeaderContent, "utf8");
        console.log(`✅ Created bridging header: ${projectName}-Bridging-Header.h`);
      } else {
        let existingContent = fs.readFileSync(bridgingHeaderPath, "utf8");
        if (!existingContent.includes("PoilabsNavigationBridge.h")) {
          existingContent += '\n#import "PoilabsNavigationBridge.h"\n';
          fs.writeFileSync(bridgingHeaderPath, existingContent, "utf8");
          console.log(`✅ Updated bridging header: ${projectName}-Bridging-Header.h`);
        }
      }

      return modConfig;
    },
  ]);
}

function addMapboxFramework(config) {
  return withDangerousMod(config, [
    "ios",
    async (modConfig) => {
      const root = modConfig.modRequest.projectRoot;
      const projectName = modConfig.modRequest.projectName || config.name;
      const iosDir = path.join(root, "ios");
      
      // Create a note file about MapboxMobileEvents requirement
      const noteFilePath = path.join(iosDir, "MAPBOX_FRAMEWORK_REQUIRED.md");
      const noteContent = `# MapboxMobileEvents Framework Requirement

⚠️ **IMPORTANT**: You need to manually add MapboxMobileEvents.xcframework to your project.

## Steps:

1. Download MapboxMobileEvents.xcframework from Mapbox
2. Drag and drop it into your Xcode project
3. Make sure it's added to:
   - Frameworks, Libraries, and Embedded Content
   - Embed & Sign option is selected

## Why Manual?

The MapboxMobileEvents.xcframework file is quite large (~50MB+) and cannot be included in the plugin package. It must be added manually to each project.

## Download Link:

You can get the framework from Mapbox's official releases or through their SDK.

---
Generated by @poilabs-dev/navigation-sdk-plugin
`;

      fs.writeFileSync(noteFilePath, noteContent, "utf8");
      console.log("📝 Created MapboxMobileEvents requirement note");

      return modConfig;
    },
  ]);
}

function withPoilabsNavigationIOS(config) {
  console.log("🍎 Configuring iOS for PoilabsNavigation...");
  
  config = addIOSInfoPlist(config);
  config = addIOSPods(config);
  config = addIOSNativeModules(config);
  config = addMapboxFramework(config);

  console.log("✅ iOS configuration completed!");
  
  return config;
}

module.exports = withPoilabsNavigationIOS;