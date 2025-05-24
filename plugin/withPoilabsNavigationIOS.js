const {
    withDangerousMod,
    withInfoPlist,
  } = require("@expo/config-plugins");
  const fs = require("fs");
  const path = require("path");
  
  function addIOSInfoPlist(config) {
    return withInfoPlist(config, (mod) => {
      const plist = mod.modResults;
      
      // Mapbox settings
      plist.MGLMapboxMetricsEnabledSettingShownInApp = true;
      
      // Location permissions
      plist.NSLocationWhenInUseUsageDescription = "Bu uygulama iç mekan navigasyonu için konum iznine ihtiyaç duyar";
      plist.NSLocationAlwaysUsageDescription = "Bu uygulama arka planda navigasyon için konum iznine ihtiyaç duyar";
      
      // Bluetooth permissions
      plist.NSBluetoothPeripheralUsageDescription = "Beacon tarama için Bluetooth gereklidir";
      plist.NSBluetoothAlwaysUsageDescription = "Beacon tarama için Bluetooth gereklidir";
  
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
  
        // Copy native module files
        const templateDir = path.join(__dirname, "..", "src", "ios");
        const moduleFiles = [
          "PoiMapModule.h",
          "PoiMapModule.m"
        ];
  
        moduleFiles.forEach(file => {
          const srcFile = path.join(templateDir, file);
          const destFile = path.join(iosDir, file);
          
          if (fs.existsSync(srcFile)) {
            let content = fs.readFileSync(srcFile, "utf8");
            content = content.replace(/__PROJECT_NAME__/g, projectName);
            fs.writeFileSync(destFile, content, "utf8");
          }
        });
  
        // Create or update bridging header
        const bridgingHeaderPath = path.join(iosDir, `${projectName}-Bridging-Header.h`);
        const bridgingHeaderContent = `
  //
  //  Use this file to import your target's public headers that you would like to expose to Swift.
  //
  
  #import <React/RCTBridgeModule.h>
  #import <React/RCTViewManager.h>
  #import "PoilabsVdNavigationModule.h"
  `;
  
        if (!fs.existsSync(bridgingHeaderPath)) {
          fs.writeFileSync(bridgingHeaderPath, bridgingHeaderContent, "utf8");
        }
  
        console.log(`iOS native modules added to ${iosDir}`);
        console.log("Please add these files to your Xcode project manually if needed.");
  
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
  
  module.exports = { withPoilabsNavigationIOS };