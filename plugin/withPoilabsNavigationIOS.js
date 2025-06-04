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

// MapboxMobileEvents.xcframework otomatik indirme ve ekleme
function addMapboxMobileEventsFramework(config) {
  return withDangerousMod(config, [
    "ios",
    async (modConfig) => {
      const root = modConfig.modRequest.projectRoot;
      const projectName = modConfig.modRequest.projectName || config.name;
      const iosDir = path.join(root, "ios");
      const frameworksDir = path.join(iosDir, "Frameworks");
      const frameworkPath = path.join(frameworksDir, "MapboxMobileEvents.xcframework");

      // Framework zaten varsa skip et
      if (fs.existsSync(frameworkPath)) {
        console.log("✅ MapboxMobileEvents.xcframework already exists");
        return modConfig;
      }

      // Frameworks klasörü oluştur
      if (!fs.existsSync(frameworksDir)) {
        fs.mkdirSync(frameworksDir, { recursive: true });
      }

              console.log("🔽 Downloading MapboxMobileEvents.xcframework from Poilabs repository...");

      try {
        // Download framework from GitHub repository
        await downloadMapboxFramework(frameworksDir);
        console.log("✅ MapboxMobileEvents.xcframework downloaded successfully!");

        // Automatically add to Xcode project
        await addFrameworkToXcodeProject(root, projectName);
        
      } catch (error) {
        console.warn("⚠️ Could not download MapboxMobileEvents automatically:", error.message);
        console.log("📝 Please add MapboxMobileEvents.xcframework manually");
        
        // Create manual installation instructions file
        createManualInstructions(iosDir);
      }

      return modConfig;
    },
  ]);
}

// Download framework from GitHub
async function downloadMapboxFramework(frameworksDir) {
  const repoUrl = "https://github.com/poiteam/react-native-ios-poilabs-navigation-integration";
  const archiveUrl = `${repoUrl}/archive/refs/heads/main.zip`;
  
  return new Promise((resolve, reject) => {
    console.log("📦 Downloading repository archive...");
    
    // Download zip file
    const zipPath = path.join(frameworksDir, "repo.zip");
    const file = fs.createWriteStream(zipPath);
    
    https.get(archiveUrl, (response) => {
      if (response.statusCode === 302 || response.statusCode === 301) {
        // Follow redirect
        https.get(response.headers.location, (finalResponse) => {
          finalResponse.pipe(file);
          file.on('finish', () => {
            file.close();
            extractFramework(zipPath, frameworksDir).then(resolve).catch(reject);
          });
        }).on('error', reject);
      } else {
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          extractFramework(zipPath, frameworksDir).then(resolve).catch(reject);
        });
      }
    }).on('error', reject);
  });
}

// Zip'den framework'ü çıkar
async function extractFramework(zipPath, frameworksDir) {
  try {
    console.log("📂 Extracting framework...");
    
    // Zip'i geçici klasöre aç
    const tempDir = path.join(frameworksDir, "temp");
    execSync(`unzip -q "${zipPath}" -d "${tempDir}"`);
    
    // Framework'ü bul ve kopyala
    const extractedRepo = path.join(tempDir, "react-native-ios-poilabs-navigation-integration-main");
    const frameworkSource = path.join(extractedRepo, "ios", "MapboxMobileEvents.xcframework");
    const frameworkDest = path.join(frameworksDir, "MapboxMobileEvents.xcframework");
    
    if (fs.existsSync(frameworkSource)) {
      // Framework'ü kopyala
      execSync(`cp -R "${frameworkSource}" "${frameworkDest}"`);
      console.log("✅ Framework copied successfully!");
    } else {
      throw new Error("Framework not found in downloaded repository");
    }
    
    // Temizlik
    execSync(`rm -rf "${tempDir}" "${zipPath}"`);
    
  } catch (error) {
    throw new Error(`Extraction failed: ${error.message}`);
  }
}

// Add framework to Xcode project
async function addFrameworkToXcodeProject(root, projectName) {
  try {
    console.log("🔧 Adding framework to Xcode project...");
    
    const pbxprojPath = path.join(root, "ios", `${projectName}.xcodeproj`, "project.pbxproj");
    
    if (fs.existsSync(pbxprojPath)) {
      let pbxContent = fs.readFileSync(pbxprojPath, "utf8");
      
      // Add framework reference (simple string replacement)
      if (!pbxContent.includes("MapboxMobileEvents.xcframework")) {
        // This is a complex operation, pbxproj file is in binary format
        // Safer approach: use ruby script with xcodeproj gem
        console.log("📝 Framework reference needs to be added manually in Xcode");
        console.log("   1. Open Xcode project");
        console.log("   2. Add ios/Frameworks/MapboxMobileEvents.xcframework");
        console.log("   3. Select 'Embed & Sign'");
      }
    }
    
  } catch (error) {
    console.warn("⚠️ Could not automatically add to Xcode project:", error.message);
  }
}

// Manual installation instructions
function createManualInstructions(iosDir) {
  const instructionsPath = path.join(iosDir, "MAPBOX_SETUP_INSTRUCTIONS.md");
  const instructions = `# MapboxMobileEvents Framework Setup

## Automatic download failed. Please add manually:

### Method 1: Download with script
\`\`\`bash
# Run in iOS directory
curl -L -o mapbox_framework.zip https://github.com/poiteam/react-native-ios-poilabs-navigation-integration/archive/refs/heads/main.zip
unzip mapbox_framework.zip
cp -R react-native-ios-poilabs-navigation-integration-main/ios/MapboxMobileEvents.xcframework ./Frameworks/
rm -rf react-native-ios-poilabs-navigation-integration-main mapbox_framework.zip
\`\`\`

### Method 2: Manual download and copy
1. Go to: https://github.com/poiteam/react-native-ios-poilabs-navigation-integration/tree/main/ios/MapboxMobileEvents.xcframework
2. Download the entire framework folder
3. Copy to your project's ios/Frameworks/ directory

### Method 3: Git clone
\`\`\`bash
git clone https://github.com/poiteam/react-native-ios-poilabs-navigation-integration.git temp_repo
cp -R temp_repo/ios/MapboxMobileEvents.xcframework ./Frameworks/
rm -rf temp_repo
\`\`\`

## Adding to Xcode:
1. Open project in Xcode
2. Drag Frameworks/MapboxMobileEvents.xcframework into project
3. Select "Embed & Sign" option
4. Clean & Build
`;

  fs.writeFileSync(instructionsPath, instructions, "utf8");
  console.log(`📝 Manual instructions created: ${instructionsPath}`);
}

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